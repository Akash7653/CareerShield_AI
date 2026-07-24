/**
 * CareerShield AI — Multi-Provider AI Service
 * Priority: Groq (free) → Gemini → Claude
 */
const https = require('https');

let provider = null;
let apiKey = null;
let claudeClient = null;

function initClaude() {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_')) {
    apiKey = process.env.GROQ_API_KEY; provider = 'groq';
    console.log('✅ Groq AI initialized (free — llama3-70b)'); return true;
  }
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_')) {
    apiKey = process.env.GEMINI_API_KEY; provider = 'gemini';
    console.log('✅ Gemini AI initialized'); return true;
  }
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('your_')) {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      claudeClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      provider = 'claude'; console.log('✅ Claude AI initialized'); return true;
    } catch (e) { console.error('❌ Claude init failed:', e.message); }
  }
  console.warn('⚠️  No AI key! Add GROQ_API_KEY to .env → free at https://console.groq.com');
  return false;
}

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const s = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(s), ...headers } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch(e) { reject(new Error('Parse error: ' + d.substring(0,200))); } });
    });
    req.on('error', reject); req.write(s); req.end();
  });
}

async function callGroq(prompt, maxTokens = 4096, isChat = false, messages = null) {
  const msgs = messages || [{ role: 'user', content: prompt }];
  const { status, data } = await httpsPost('api.groq.com', '/openai/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    { model: 'llama-3.3-70b-versatile', messages: msgs, max_tokens: maxTokens, temperature: 0.7 }
  );
  if (status !== 200) throw new Error(`Groq error ${status}: ${data?.error?.message || JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt, maxTokens = 4096) {
  const { status, data } = await httpsPost('generativelanguage.googleapis.com',
    `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {},
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens } }
  );
  if (status !== 200) throw new Error(`Gemini error ${status}: ${data?.error?.message}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function getRawText(prompt, maxTokens = 4096) {
  if (!provider) throw new Error('No AI configured. Add GROQ_API_KEY to backend/.env — free at https://console.groq.com');
  if (provider === 'groq') return callGroq(prompt, maxTokens);
  if (provider === 'gemini') return callGemini(prompt, maxTokens);
  if (provider === 'claude') {
    const res = await claudeClient.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] });
    return res.content[0].text.trim();
  }
}

async function callAI(prompt, maxTokens = 4096) {
  const text = await getRawText(prompt, maxTokens);
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.slice(7);
  else if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  clean = clean.trim();
  try { return JSON.parse(clean); }
  catch { const m = clean.match(/\{[\s\S]*\}/); if (m) try { return JSON.parse(m[0]); } catch {} throw new Error('AI returned invalid JSON. Please try again.'); }
}

// ── Real AI Chat (with conversation memory) ──
async function chatWithAria(message, chatHistory = []) {
  if (!provider) throw new Error('No AI configured. Add GROQ_API_KEY to .env');
  const system = `You are Aria 🦉, a warm, smart AI career co-pilot from CareerShield AI.
You help with: resumes, cover letters, interviews, salary negotiation, job scams, career planning, LinkedIn.
Be friendly, encouraging, and genuinely helpful. Give specific actionable advice.
Keep responses to 2-4 short paragraphs. Use 1-2 emojis naturally.
IMPORTANT: Remember context from previous messages and give personalized responses — not generic advice.
Plain text only — no markdown bullets, no JSON.`;

  if (provider === 'groq') {
    const messages = [{ role: 'system', content: system }];
    chatHistory.slice(-12).forEach(m => messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    messages.push({ role: 'user', content: message });
    return callGroq(null, 1024, true, messages);
  }
  // Fallback for other providers
  const history = chatHistory.slice(-8).map(m => `${m.role === 'user' ? 'User' : 'Aria'}: ${m.text}`).join('\n');
  const prompt = `${system}\n\n${history ? 'Previous conversation:\n' + history + '\n\n' : ''}User: ${message}\nAria:`;
  return getRawText(prompt, 1024);
}

// ═══════════════════════════════════════════
// All Tool Functions
// ═══════════════════════════════════════════

async function analyzeResume(resumeText, jobDescription = '') {
  return callAI(`You are an expert ATS resume analyzer. Analyze this resume and return ONLY valid JSON (no markdown).

RESUME: """${resumeText.substring(0, 6000)}"""
${jobDescription ? `\nJOB DESCRIPTION: """${jobDescription.substring(0, 2000)}"""` : ''}

{
  "overallScore": <0-100>,
  "atsCompatibility": <0-100>,
  "sections": {
    "summary": { "score": <0-100>, "feedback": "<feedback>", "suggestion": "<suggestion>" },
    "experience": { "score": <0-100>, "feedback": "<feedback>", "suggestion": "<tip>" },
    "skills": { "score": <0-100>, "feedback": "<feedback>", "missingSkills": ["<skill1>", "<skill2>"] },
    "education": { "score": <0-100>, "feedback": "<feedback>", "suggestion": "<tip>" },
    "formatting": { "score": <0-100>, "feedback": "<feedback>", "issues": ["<issue1>"] }
  },
  "keywordAnalysis": { "found": ["<kw1>", "<kw2>"], "missing": ["<kw1>", "<kw2>"], "matchPercentage": <0-100> },
  "strengths": ["<s1>", "<s2>", "<s3>"],
  "improvements": [
    { "priority": "high", "area": "<area>", "suggestion": "<suggestion>" },
    { "priority": "medium", "area": "<area>", "suggestion": "<suggestion>" },
    { "priority": "low", "area": "<area>", "suggestion": "<suggestion>" }
  ],
  "ariaTip": "<warm 1-2 sentence tip from Aria the owl>"
}`);
}

async function generateCoverLetter(resumeText, jobDescription, tone = 'professional') {
  return callAI(`Expert cover letter writer. Return ONLY valid JSON (no markdown).
RESUME: """${resumeText.substring(0, 4000)}"""
JOB DESCRIPTION: """${jobDescription.substring(0, 2000)}"""
TONE: ${tone}
{ "coverLetter": "<full 3-4 paragraph cover letter>", "highlights": ["<p1>","<p2>","<p3>"], "keywordsUsed": ["<kw1>","<kw2>"], "tips": ["<tip1>","<tip2>"], "ariaTip": "<note from Aria>" }`);
}

async function optimizeLinkedIn(data) {
  return callAI(`LinkedIn optimization expert. Return ONLY valid JSON (no markdown).
Headline: ${data.headline||'Not provided'}, About: ${data.about||'Not provided'}, Experience: ${data.experience||'Not provided'}, Skills: ${data.skills||'Not provided'}, Industry: ${data.industry||'Not provided'}
{ "profileScore": <0-100>, "headline": { "current": "<current>", "suggestions": ["<o1>","<o2>","<o3>"] }, "aboutSection": { "score": <0-100>, "rewrite": "<rewritten about>" }, "keywords": { "recommended": ["<kw1>","<kw2>","<kw3>","<kw4>","<kw5>"], "industry": "<industry>" }, "improvements": [{ "section": "<n>", "tip": "<tip>" }], "recruiterTips": ["<t1>","<t2>","<t3>"], "ariaTip": "<note from Aria>" }`);
}

async function salaryNegotiation(data) {
  return callAI(`Salary negotiation expert. Return ONLY valid JSON (no markdown).
Role: ${data.role}, Experience: ${data.experience} years, Location: ${data.location}, Current Salary: ${data.currentSalary||'Not provided'}, Company: ${data.companyType||'Not specified'}, Skills: ${data.skills||'Not specified'}
{ "salaryRange": { "min": "<e.g. ₹6 LPA>", "median": "<median>", "max": "<max>", "currency": "<INR/USD>" }, "marketAnalysis": "<2-3 sentences>", "negotiationScripts": [ { "scenario": "Initial Offer Response", "script": "<exact script>" }, { "scenario": "Counter Offer", "script": "<exact script>" }, { "scenario": "Discussing Benefits", "script": "<exact script>" } ], "strategies": ["<s1>","<s2>","<s3>"], "benefitsToNegotiate": ["<b1>","<b2>","<b3>"], "ariaTip": "<note from Aria>" }`);
}

async function generateInterviewQuestions(data) {
  return callAI(`Interview preparation expert. Return ONLY valid JSON (no markdown). Generate 8 questions.
Role: ${data.role}, Company: ${data.company||'General'}, Level: ${data.experienceLevel||'Mid-level'}, Type: ${data.type||'Both'}
{ "questions": [ { "id": 1, "category": "behavioral", "question": "<question>", "difficulty": "medium", "frequency": "very common", "starGuide": { "situation": "<what>", "task": "<what>", "action": "<what>", "result": "<what>" }, "tips": "<tip>" } ], "questionsToAsk": ["<q1>","<q2>","<q3>"], "ariaTip": "<note from Aria>" }`, 6000);
}

async function generateRoadmap(data) {
  return callAI(`Career planning expert. Return ONLY valid JSON (no markdown). Create 4 phases.
Dream Role: ${data.dreamRole}, Current: ${data.currentRole||'Fresher'}, Skills: ${data.currentSkills||'Not specified'}, Education: ${data.education||'Not specified'}, Timeline: ${data.timeline||'6 months'}
{ "roadmapTitle": "<catchy title>", "summary": "<2-3 sentences>", "skillsGap": { "have": ["<s1>"], "need": ["<s1>","<s2>"] }, "phases": [ { "phase": 1, "title": "<title>", "duration": "<e.g. Weeks 1-3>", "goals": ["<g1>","<g2>"], "milestone": "<milestone>" } ], "ariaTip": "<note from Aria>" }`, 5000);
}

async function generateColdEmail(data) {
  return callAI(`Professional networking expert. Return ONLY valid JSON (no markdown).
Target: ${data.targetName||'Hiring Manager'} at ${data.targetCompany}, Role: ${data.targetRole||'Not specified'}, Type: ${data.messageType||'cold email'}, Background: ${data.yourBackground||'Not specified'}
{ "subject": "<subject line>", "message": "<full email 3-4 paragraphs>", "linkedinVersion": "<shorter LinkedIn version>", "followUpMessage": "<follow-up after 1 week>", "tips": ["<t1>","<t2>"], "ariaTip": "<note from Aria>" }`);
}

async function checkScam(jobDescription) {
  return callAI(`Job scam detection expert. Return ONLY valid JSON (no markdown).
JOB POSTING: """${jobDescription.substring(0, 4000)}"""
Analyze for: unrealistic salary, upfront payment, vague descriptions, unofficial emails, pressure tactics, MLM.
{ "safetyScore": <0-100>, "verdict": "safe|caution|danger", "companyName": "<name or Unknown>", "roleName": "<role>", "salary": "<salary or Not mentioned>", "redFlags": [ { "flag": "<flag>", "severity": "critical|warning|info", "explanation": "<why>" } ], "greenFlags": [ { "flag": "<flag>", "explanation": "<why good>" } ], "recommendations": ["<a1>","<a2>"], "ariaTip": "<safety assessment from Aria>" }`);
}

async function roastResume(resumeText) {
  return callAI(`You are a brutally honest (but helpful) resume critic. Roast this resume with tough love.
Return ONLY valid JSON (no markdown).
RESUME: """${resumeText.substring(0, 6000)}"""
{ "roastScore": <0-100 lower=needs more roasting>, "overallVerdict": "<one punchy sentence>", "burns": [ { "section": "<section>", "issue": "<what's wrong>", "burn": "<witty but constructive>", "fix": "<exact fix>" } ], "biggestMistake": "<single worst thing>", "quickWins": ["<fix1>","<fix2>","<fix3>"], "ariaTip": "<encouraging note — this feedback makes them stronger>" }`);
}

async function mockInterview(data) {
  return callAI(`Expert interviewer doing a mock interview. Return ONLY valid JSON (no markdown).
Role: ${data.role}, Company: ${data.company||'a top company'}, Level: ${data.level||'mid-level'}, Round: ${data.round||'HR + Technical'}
{ "interviewTitle": "<e.g. Mock Interview: SDE at Google>", "rounds": [ { "roundName": "<e.g. HR Round>", "questions": [ { "q": "<question>", "type": "behavioral|technical|situational", "expectedAnswer": "<what great answer covers>", "followUp": "<follow-up question>", "redFlag": "<what bad answer looks like>" } ] } ], "tips": ["<t1>","<t2>","<t3>"], "ariaTip": "<encouraging note>" }`, 6000);
}

async function analyzeSkillGap(data) {
  return callAI(`Career skills expert. Return ONLY valid JSON (no markdown).
Target Role: ${data.targetRole}, Current Skills: ${data.currentSkills||'Not specified'}, Level: ${data.experienceLevel||'Fresher'}, Industry: ${data.industry||'Tech'}
{ "gapScore": <0-100 higher=smaller gap>, "targetRole": "<role>", "currentLevel": "<assessment>", "skillCategories": [ { "category": "<e.g. Programming>", "have": ["<s1>"], "need": ["<s1>","<s2>"], "priority": "high|medium|low" } ], "learningPath": [ { "skill": "<skill>", "resource": "<best free resource>", "timeToLearn": "<e.g. 2 weeks>", "why": "<why it matters>" } ], "timeToReady": "<e.g. 3-4 months>", "ariaTip": "<encouraging note>" }`);
}

async function suggestCareerPaths(data) {
  return callAI(`Career counselor. Suggest 3 realistic career paths. Return ONLY valid JSON (no markdown).
Background: ${data.background||'Not specified'}, Skills: ${data.currentSkills||'Not specified'}, Interests: ${data.interests||'Not specified'}, Education: ${data.education||'Not specified'}, Experience: ${data.experience||'Fresher'}
{ "paths": [ { "title": "<path title>", "emoji": "<emoji>", "description": "<2-3 sentences>", "avgSalary": "<e.g. ₹8-25 LPA>", "timeToEntry": "<e.g. 3-6 months>", "demandLevel": "high|medium|low", "keySkills": ["<s1>","<s2>","<s3>"], "firstStep": "<first thing to do today>", "companies": ["<c1>","<c2>","<c3>"] } ], "bestFit": "<which path and why, 1-2 sentences>", "ariaTip": "<encouraging note>" }`);
}




// ═══════════════════════════════════════════
// Live Interview AI Functions
// ═══════════════════════════════════════════

async function generateInterviewQuestion(data) {
  // Generate the next question based on role, round, and question index
  const text = await getRawText(`You are a strict professional interviewer at ${data.company||'a top tech company'} interviewing for ${data.role}.
This is question ${data.questionIndex+1} of ${data.totalQuestions} in the ${data.round} round.
Previous questions asked: ${data.previousQuestions?.join('; ')||'None yet'}.

Generate ONE specific interview question appropriate for a ${data.level||'fresher'} level candidate.
${data.questionIndex===0 ? 'Start with a warm opener like "Tell me about yourself" or "Walk me through your background".' : ''}
${data.round==='Technical' ? 'Focus on technical concepts, coding, or system design.' : ''}
${data.round==='HR' ? 'Focus on personality, motivation, and soft skills.' : ''}

Return ONLY the question text. No numbering, no explanation, just the question itself.`, 200);
  return text.trim().replace(/^["']|["']$/g,'');
}

async function analyzeAnswer(data) {
  return callAI(`You are an expert interview coach analyzing a candidate's answer in real-time.

ROLE: ${data.role} at ${data.company||'a top company'}
ROUND: ${data.round}
QUESTION: "${data.question}"
CANDIDATE'S ANSWER: "${data.answer}"
TIME TAKEN: ${data.timeTaken} seconds (ideal: ${data.idealTime} seconds)

Analyze and return ONLY valid JSON:
{
  "score": <0-100>,
  "verdict": "excellent|good|average|poor",
  "strengths": ["<what they did well 1>", "<what they did well 2>"],
  "drawbacks": ["<specific weakness 1>", "<specific weakness 2>"],
  "missedPoints": ["<important point they should have mentioned 1>", "<point 2>"],
  "betterAnswer": "<a 2-3 sentence example of a stronger answer>",
  "confidence": <0-100 based on their language and completeness>,
  "timeAssessment": "${data.timeTaken < data.idealTime*0.4 ? 'Too brief — elaborate more' : data.timeTaken > data.idealTime*1.5 ? 'Too long — be more concise' : 'Good timing'}",
  "quickFeedback": "<one encouraging sentence of immediate feedback>"
}`, 1500);
}

async function generateInterviewReport(data) {
  return callAI(`You are an expert interview coach. Generate a comprehensive post-interview report.

ROLE: ${data.role} at ${data.company||'a top company'}
LEVEL: ${data.level||'Fresher'}
ROUND: ${data.round}

QUESTIONS AND ANSWERS:
${data.qa.map((item,i)=>`Q${i+1}: ${item.question}\nAnswer: ${item.answer}\nScore: ${item.score}/100`).join('\n\n')}

Generate a detailed report. Return ONLY valid JSON:
{
  "overallScore": <0-100>,
  "verdict": "Excellent — Ready to hire|Good — Strong candidate|Average — Needs improvement|Poor — Not ready",
  "hiringRecommendation": "Strong Yes|Yes|Maybe|No",
  "summary": "<2-3 sentence overall performance summary>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalWeaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "skillScores": {
    "communication": <0-100>,
    "technicalKnowledge": <0-100>,
    "problemSolving": <0-100>,
    "confidence": <0-100>,
    "clarity": <0-100>
  },
  "improvementPlan": [
    { "area": "<area>", "action": "<specific action to take>", "resource": "<how to practice>" }
  ],
  "interviewerNotes": "<2-3 sentences written as if by a real interviewer>",
  "nextSteps": ["<what to do next 1>", "<what to do next 2>", "<what to do next 3>"],
  "ariaTip": "<warm encouraging final message from Aria>"
}`, 4096);
}

module.exports = {
  initClaude, analyzeResume, generateCoverLetter, optimizeLinkedIn,
  salaryNegotiation, generateInterviewQuestions, generateRoadmap,
  generateColdEmail, checkScam, chatWithAria,
  roastResume, mockInterview, analyzeSkillGap, suggestCareerPaths,
  generateInterviewQuestion, analyzeAnswer, generateInterviewReport,
};
