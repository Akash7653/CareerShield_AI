/**
 * CareerShield AI — Smart Database Layer
 * 
 * AUTO-MODE: Tries MongoDB first → falls back to JSON file DB automatically.
 * No config needed to get started. Add MONGODB_URI later for production.
 */

const fs   = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════
// JSON FILE DATABASE (works with zero setup)
// ═══════════════════════════════════════════════════
const DB_PATH = path.join(__dirname, 'careershield_data.json');

const DEFAULT_DB = {
  users: [], sessions: [], tool_history: [],
  _meta: { nextUserId: 1, nextHistoryId: 1, nextSessionId: 1 }
};

class JsonDB {
  constructor() { this.data = this._load(); }

  _load() {
    try {
      if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) { console.error('JSON DB load error:', e.message); }
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  _save() {
    try { fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2)); }
    catch (e) { console.error('JSON DB save error:', e.message); }
  }

  // ── Users ──
  async createUser({ firstName, lastName, email, password, avatar, careerGoal }) {
    const id = String(this.data._meta.nextUserId++);
    const now = new Date().toISOString();
    const user = {
      _id: id, id,
      firstName, lastName: lastName || '', email: email.toLowerCase(),
      password, avatar: avatar || '🦊', careerGoal: careerGoal || 'Career Explorer',
      shieldScore:0, resumeScore:0, interviewScore:0, scamScore:0, onlineScore:0,
      toolsUsed:0, scansDone:0, roadmapsCreated:0,
      createdAt: now, updatedAt: now
    };
    this.data.users.push(user);
    this._save();
    return user;
  }
  async getUserByEmail(email) {
    return this.data.users.find(u => u.email === email.toLowerCase()) || null;
  }
  async getUserById(id) {
    return this.data.users.find(u => u._id === String(id) || u.id === String(id)) || null;
  }
  async updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u._id === String(id) || u.id === String(id));
    if (idx === -1) return null;
    Object.assign(this.data.users[idx], updates, { updatedAt: new Date().toISOString() });
    this._save();
    return this.data.users[idx];
  }
  async updateScore(userId, field, score) {
    const map = { resume_score:'resumeScore', interview_score:'interviewScore', scam_score:'scamScore', online_score:'onlineScore' };
    const f = map[field] || field;
    await this.updateUser(userId, { [f]: score });
    const user = await this.getUserById(userId);
    const vals = [user.resumeScore, user.interviewScore, user.scamScore, user.onlineScore].filter(s => s > 0);
    const avg  = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    await this.updateUser(userId, { shieldScore: avg });
  }
  async incrementToolUsage(userId) {
    const u = await this.getUserById(userId);
    if (u) await this.updateUser(userId, { toolsUsed:(u.toolsUsed||0)+1, scansDone:(u.scansDone||0)+1 });
  }
  async incrementRoadmaps(userId) {
    const u = await this.getUserById(userId);
    if (u) await this.updateUser(userId, { roadmapsCreated:(u.roadmapsCreated||0)+1 });
  }

  // ── Sessions ──
  async createSession(userId, token, expiresAt) {
    const id = String(this.data._meta.nextSessionId++);
    const session = { id, userId: String(userId), token, expiresAt, createdAt: new Date().toISOString() };
    this.data.sessions.push(session);
    this._save();
    return session;
  }
  async getValidSession(token, userId) {
    const now = new Date().toISOString();
    return this.data.sessions.find(
      s => s.token === token && String(s.userId) === String(userId) && s.expiresAt > now
    ) || null;
  }
  async deleteSession(token) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this._save();
  }

  // ── Tool History ──
  async addHistory(userId, toolType, inputSummary, resultSummary, fullResult) {
    const id = String(this.data._meta.nextHistoryId++);
    const entry = {
      id, _id: id, userId: String(userId), toolType,
      inputSummary, resultSummary, fullResult,
      createdAt: new Date().toISOString()
    };
    this.data.tool_history.push(entry);
    // Keep max 500 entries to avoid file bloat
    if (this.data.tool_history.length > 500) {
      this.data.tool_history = this.data.tool_history.slice(-500);
    }
    this._save();
    return entry;
  }
  async getHistory(userId, { limit=20, offset=0, toolType=null }={}) {
    let items = this.data.tool_history
      .filter(h => String(h.userId)===String(userId) && (!toolType || h.toolType===toolType))
      .sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    const total = items.length;
    items = items.slice(offset, offset+limit).map(({ fullResult, ...rest }) => rest);
    return { history: items, total, limit, offset };
  }
}

// ═══════════════════════════════════════════════════
// MONGODB DATABASE (optional — for production)
// ═══════════════════════════════════════════════════
class MongoDBAdapter {
  constructor(mongoose) {
    const { Schema, model, Types } = mongoose;

    const userSchema = new Schema({
      firstName:String, lastName:{type:String,default:''},
      email:{type:String,required:true,unique:true,lowercase:true},
      password:{type:String,required:true},
      avatar:{type:String,default:'🦊'},
      careerGoal:{type:String,default:'Career Explorer'},
      shieldScore:{type:Number,default:0}, resumeScore:{type:Number,default:0},
      interviewScore:{type:Number,default:0}, scamScore:{type:Number,default:0},
      onlineScore:{type:Number,default:0},
      toolsUsed:{type:Number,default:0}, scansDone:{type:Number,default:0},
      roadmapsCreated:{type:Number,default:0},
    },{ timestamps:true });

    const sessionSchema = new Schema({
      userId:{type:Types.ObjectId,ref:'User',required:true},
      token:{type:String,required:true,unique:true},
      expiresAt:{type:Date,required:true},
    },{ timestamps:true });
    sessionSchema.index({ expiresAt:1 },{ expireAfterSeconds:0 });

    const historySchema = new Schema({
      userId:{type:Types.ObjectId,ref:'User',required:true},
      toolType:String, inputSummary:String, resultSummary:String,
      fullResult:{type:Schema.Types.Mixed,default:{}},
    },{ timestamps:true });
    historySchema.index({ userId:1, createdAt:-1 });

    this.User    = model('User',    userSchema);
    this.Session = model('Session', sessionSchema);
    this.History = model('ToolHistory', historySchema);
  }

  async createUser(data) {
    const u = new this.User({ ...data, email: data.email.toLowerCase() });
    await u.save(); return u;
  }
  async getUserByEmail(email) { return this.User.findOne({ email:email.toLowerCase() }); }
  async getUserById(id)       { try { return await this.User.findById(id); } catch { return null; } }
  async updateUser(id, updates) { return this.User.findByIdAndUpdate(id, updates, { new:true }); }
  async updateScore(userId, field, score) {
    const map = { resume_score:'resumeScore', interview_score:'interviewScore', scam_score:'scamScore', online_score:'onlineScore' };
    const f = map[field] || field;
    await this.User.findByIdAndUpdate(userId, { [f]: score });
    const user = await this.User.findById(userId);
    const vals = [user.resumeScore,user.interviewScore,user.scamScore,user.onlineScore].filter(s=>s>0);
    const avg  = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    await this.User.findByIdAndUpdate(userId, { shieldScore: avg });
  }
  async incrementToolUsage(userId) { await this.User.findByIdAndUpdate(userId,{ $inc:{toolsUsed:1,scansDone:1} }); }
  async incrementRoadmaps(userId)  { await this.User.findByIdAndUpdate(userId,{ $inc:{roadmapsCreated:1} }); }

  async createSession(userId, token, expiresAt) {
    const s = new this.Session({ userId, token, expiresAt:new Date(expiresAt) });
    await s.save(); return s;
  }
  async getValidSession(token, userId) {
    return this.Session.findOne({ token, userId, expiresAt:{ $gt:new Date() } });
  }
  async deleteSession(token) { await this.Session.deleteOne({ token }); }

  async addHistory(userId, toolType, inputSummary, resultSummary, fullResult) {
    const e = new this.History({ userId, toolType, inputSummary, resultSummary, fullResult });
    await e.save(); return e;
  }
  async getHistory(userId, { limit=20, offset=0, toolType=null }={}) {
    const q = { userId };
    if (toolType) q.toolType = toolType;
    const total   = await this.History.countDocuments(q);
    const history = await this.History.find(q, { fullResult:0 }).sort({ createdAt:-1 }).skip(offset).limit(limit);
    return { history, total, limit, offset };
  }
}

// ═══════════════════════════════════════════════════
// SMART INIT — try Mongo, fall back to JSON
// ═══════════════════════════════════════════════════
let db = null;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  // Skip MongoDB if URI not set or is placeholder
  const skipMongo = !mongoUri
    || mongoUri.includes('your_mongodb')
    || mongoUri.includes('localhost') === false && !mongoUri.startsWith('mongodb');

  if (mongoUri && !mongoUri.includes('your_mongodb')) {
    try {
      const mongoose = require('mongoose');
      // Short timeout so we fail fast and fall back
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      db = new MongoDBAdapter(mongoose);
      console.log('✅ MongoDB connected:', mongoUri.includes('atlas') || mongoUri.includes('mongodb.net') ? 'Atlas Cloud' : 'Local');
      return;
    } catch (err) {
      console.warn('⚠️  MongoDB unavailable:', err.message.split('\n')[0]);
      console.warn('   → Falling back to local JSON database (fully functional)');
    }
  }

  // JSON fallback
  db = new JsonDB();
  console.log('✅ JSON database ready:', DB_PATH);
  console.log('   ℹ️  To use MongoDB, set a valid MONGODB_URI in backend/.env');
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call connectDB() first.');
  return db;
}

// Proxy object — automatically uses whichever DB was initialized
const dbProxy = new Proxy({}, {
  get(_, prop) {
    return (...args) => getDb()[prop](...args);
  }
});

module.exports = { connectDB, db: dbProxy };
