# 🦉 CareerShield AI v2.0

## ✅ Quick Start (2 minutes)

### Step 1 — Install backend
```bash
cd backend
npm install
```

### Step 2 — Add your Claude API key
Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get a free key at → **https://console.anthropic.com**
(No credit card needed — comes with free credits)

### Step 3 — Start backend
```bash
npm start
```
You'll see:
```
✅ JSON database ready   ← works instantly, no DB setup needed!
✅ Claude AI initialized
🦉 CareerShield AI v2.0 running on http://localhost:3001
```

### Step 4 — Start frontend
```bash
cd frontend
npm install
npm start
```
App opens at **http://localhost:3000** ✨

---

## 🗄️ Database Options

| Mode | Setup | Best For |
|------|-------|----------|
| **JSON File** (default) | Zero — works instantly | Development, personal use |
| **MongoDB Local** | Install MongoDB community | Team dev |
| **MongoDB Atlas** | Free cloud account | Production |

To use MongoDB, just add the URI to `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/careershield
# or for Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/careershield
```
The app automatically uses MongoDB if the URI works, otherwise falls back to JSON.

---

## 🛠️ All 8 AI Tools

| Tool | Accepts |
|------|---------|
| **Resume Analyzer** | Upload PDF/DOCX/TXT **or** paste text + optional job description |
| **Cover Letter** | Resume file/text + job description + tone selector |
| **LinkedIn Optimizer** | Headline + About + experience |
| **Salary Coach** | Role + location + experience level |
| **Interview Prep** | Role + company + level → 8-10 questions with STAR guides |
| **Career Roadmap** | Dream role + current skills + timeline |
| **Cold Email** | Company + context → Email + LinkedIn + follow-up versions |
| **Scam Checker** | Paste job offer text → safety score + red flags |

---

## 🔑 Free API Limits (Claude Haiku)
- 5 requests/minute
- 25,000 tokens/minute
- Perfect for personal/small team use
- Upgrade anytime at console.anthropic.com

## Tech Stack
- **Frontend** React (Create React App)
- **Backend** Node.js + Express  
- **AI** Claude Haiku (`@anthropic-ai/sdk`)
- **DB** JSON file (default) or MongoDB + Mongoose
- **File Parsing** pdf-parse (PDF) + mammoth (DOCX/DOC)
- **Auth** JWT + bcrypt
