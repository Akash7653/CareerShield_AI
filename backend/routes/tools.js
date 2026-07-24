const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { db }  = require('../db/database');
const authMiddleware = require('../middleware/auth');
const claude  = require('../services/claude');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    allowed.includes(path.extname(file.originalname).toLowerCase()) ? cb(null, true) : cb(new Error('Only PDF, DOCX, DOC, TXT allowed.'));
  }
});

async function extractTextFromFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.txt') return fs.readFileSync(file.path, 'utf-8');
  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(fs.readFileSync(file.path));
    if (!data.text || data.text.trim().length < 50) throw new Error('Could not extract text from PDF. Please paste your resume text instead.');
    return data.text;
  }
  if (ext === '.doc' || ext === '.docx') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: file.path });
    if (!result.value || result.value.trim().length < 50) throw new Error('Could not extract text from Word doc. Please paste text instead.');
    return result.value;
  }
  throw new Error(`Unsupported file: ${ext}`);
}

async function saveUsage(userId, toolType, inputSummary, resultSummary, fullResult) {
  await db.addHistory(userId, toolType, inputSummary, resultSummary, fullResult);
  await db.incrementToolUsage(userId);
}

// ── Helper: build FormData handler for resume tools ──
function resumeRoute(endpoint, handler) {
  router.post(`/${endpoint}`, authMiddleware, upload.single('resume'), async (req, res) => {
    let filePath = null;
    try {
      let resumeText = req.body.resumeText || '';
      if (req.file) { filePath = req.file.path; resumeText = await extractTextFromFile(req.file); }
      if (!resumeText.trim() || resumeText.trim().length < 50) return res.status(400).json({ error: 'Please upload a valid resume file or paste your resume text.' });
      await handler(req, res, resumeText);
    } catch (err) {
      console.error(`${endpoint} error:`, err.message);
      res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' });
    } finally {
      if (filePath) try { fs.unlinkSync(filePath); } catch {}
    }
  });
}

// 1. RESUME ANALYZER
resumeRoute('resume', async (req, res, resumeText) => {
  const result = await claude.analyzeResume(resumeText, req.body.jobDescription || '');
  if (result.overallScore) await db.updateScore(req.user._id, 'resume_score', result.overallScore);
  await saveUsage(req.user._id, 'resume', `Resume analysis`, `Score: ${result.overallScore}/100`, result);
  res.json({ success: true, result });
});

// 2. ROAST MY RESUME
resumeRoute('roast', async (req, res, resumeText) => {
  const result = await claude.roastResume(resumeText);
  await saveUsage(req.user._id, 'roast', 'Resume roast', `Roast score: ${result.roastScore}/100`, result);
  res.json({ success: true, result });
});

// 3. COVER LETTER
resumeRoute('cover-letter', async (req, res, resumeText) => {
  const { jobDescription, tone } = req.body;
  if (!jobDescription?.trim()) return res.status(400).json({ error: 'Job description is required.' });
  const result = await claude.generateCoverLetter(resumeText, jobDescription, tone || 'professional');
  await saveUsage(req.user._id, 'cover-letter', `Cover letter (${tone||'professional'})`, 'Generated', result);
  res.json({ success: true, result });
});

// 4. LINKEDIN
router.post('/linkedin', authMiddleware, async (req, res) => {
  try {
    const { headline, about, experience, skills, industry } = req.body;
    if (!headline && !about && !experience) return res.status(400).json({ error: 'Provide at least headline, about, or experience.' });
    const result = await claude.optimizeLinkedIn({ headline, about, experience, skills, industry });
    if (result.profileScore) await db.updateScore(req.user._id, 'online_score', result.profileScore);
    await saveUsage(req.user._id, 'linkedin', 'LinkedIn optimization', `Score: ${result.profileScore}/100`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. SALARY
router.post('/salary', authMiddleware, async (req, res) => {
  try {
    const { role, experience, location, currentSalary, companyType, skills } = req.body;
    if (!role || !location) return res.status(400).json({ error: 'Role and location are required.' });
    const result = await claude.salaryNegotiation({ role, experience: experience||'0', location, currentSalary, companyType, skills });
    await saveUsage(req.user._id, 'salary', `Salary: ${role} in ${location}`, `${result.salaryRange?.min} - ${result.salaryRange?.max}`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. INTERVIEW QUESTIONS
router.post('/interview', authMiddleware, async (req, res) => {
  try {
    const { role, company, experienceLevel, type } = req.body;
    if (!role) return res.status(400).json({ error: 'Please specify the role.' });
    const result = await claude.generateInterviewQuestions({ role, company, experienceLevel, type });
    const user = await db.getUserById(req.user._id);
    await db.updateScore(req.user._id, 'interview_score', Math.min(100, (user.interviewScore||0) + 10));
    await saveUsage(req.user._id, 'interview', `Interview: ${role}`, `${result.questions?.length||0} questions`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. MOCK INTERVIEW
router.post('/mock-interview', authMiddleware, async (req, res) => {
  try {
    const { role, company, level, round } = req.body;
    if (!role) return res.status(400).json({ error: 'Please specify the role.' });
    const result = await claude.mockInterview({ role, company, level, round });
    await saveUsage(req.user._id, 'mock-interview', `Mock interview: ${role}`, 'Completed', result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. CAREER ROADMAP
router.post('/roadmap', authMiddleware, async (req, res) => {
  try {
    const { dreamRole, currentRole, currentSkills, education, timeline } = req.body;
    if (!dreamRole) return res.status(400).json({ error: 'Please specify your dream role.' });
    const result = await claude.generateRoadmap({ dreamRole, currentRole, currentSkills, education, timeline });
    await db.incrementRoadmaps(req.user._id);
    await saveUsage(req.user._id, 'roadmap', `Roadmap: ${dreamRole}`, `${result.phases?.length||0} phases`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. SKILL GAP
router.post('/skill-gap', authMiddleware, async (req, res) => {
  try {
    const { targetRole, currentSkills, experienceLevel, industry } = req.body;
    if (!targetRole) return res.status(400).json({ error: 'Please specify your target role.' });
    const result = await claude.analyzeSkillGap({ targetRole, currentSkills, experienceLevel, industry });
    await saveUsage(req.user._id, 'skill-gap', `Skill gap: ${targetRole}`, `Gap score: ${result.gapScore}/100`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. CAREER PATHS
router.post('/career-paths', authMiddleware, async (req, res) => {
  try {
    const { background, currentSkills, interests, education, experience } = req.body;
    const result = await claude.suggestCareerPaths({ background, currentSkills, interests, education, experience });
    await saveUsage(req.user._id, 'career-paths', 'Career paths', `${result.paths?.length||0} paths found`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 11. COLD EMAIL
router.post('/cold-email', authMiddleware, async (req, res) => {
  try {
    const { targetName, targetCompany, targetRole, yourBackground, messageType } = req.body;
    if (!targetCompany) return res.status(400).json({ error: 'Please specify the target company.' });
    const result = await claude.generateColdEmail({ targetName, targetCompany, targetRole, yourBackground, messageType });
    await saveUsage(req.user._id, 'cold-email', `Email to ${targetCompany}`, 'Generated', result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 12. SCAM CHECKER
router.post('/scam-check', authMiddleware, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) return res.status(400).json({ error: 'Please paste the job posting (at least 20 characters).' });
    const result = await claude.checkScam(jobDescription);
    if (result.safetyScore) await db.updateScore(req.user._id, 'scam_score', result.safetyScore > 70 ? 90 : 65);
    await saveUsage(req.user._id, 'scam-check', `Scam check: ${result.companyName||'Unknown'}`, `Safety: ${result.safetyScore}/100 (${result.verdict})`, result);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 13. ARIA CHAT (real AI with conversation memory)
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Please type a message.' });
    const reply = await claude.chatWithAria(message.trim(), history || []);
    res.json({ success: true, reply, response: reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// History
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const data = await db.getHistory(req.user._id, { limit: parseInt(req.query.limit)||20, offset: parseInt(req.query.offset)||0, toolType: req.query.type });
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Failed to load history.' }); }
});

module.exports = router;

// ═══════════════════════════════════════════
// LIVE INTERVIEW ROUTES
// ═══════════════════════════════════════════

// Generate next interview question
router.post('/interview-question', authMiddleware, async (req, res) => {
  try {
    const { role, company, level, round, questionIndex, totalQuestions, previousQuestions } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required.' });
    const question = await claude.generateInterviewQuestion({ role, company, level, round, questionIndex, totalQuestions, previousQuestions });
    res.json({ success: true, question });
  } catch (err) {
    console.error('Interview question error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Analyze candidate's answer
router.post('/analyze-answer', authMiddleware, async (req, res) => {
  try {
    const { role, company, round, question, answer, timeTaken, idealTime } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer are required.' });
    if (answer.trim().length < 5) return res.status(400).json({ error: 'Answer is too short to analyze.' });
    const result = await claude.analyzeAnswer({ role, company, round, question, answer, timeTaken: timeTaken||30, idealTime: idealTime||90 });
    res.json({ success: true, result });
  } catch (err) {
    console.error('Analyze answer error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generate final interview report
router.post('/interview-report', authMiddleware, async (req, res) => {
  try {
    const { role, company, level, round, qa } = req.body;
    if (!qa || qa.length === 0) return res.status(400).json({ error: 'No interview data to report on.' });
    const result = await claude.generateInterviewReport({ role, company, level, round, qa });
    await saveUsage(req.user._id, 'live-interview', `Live Interview: ${role} at ${company||'company'}`, `Score: ${result.overallScore}/100`, result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Interview report error:', err.message);
    res.status(500).json({ error: err.message });
  }
});
