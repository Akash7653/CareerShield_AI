const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
    email: user.email,
    avatar: user.avatar,
    goal: user.careerGoal,
    shieldScore: user.shieldScore,
    resumeScore: user.resumeScore,
    interviewScore: user.interviewScore,
    scamScore: user.scamScore,
    onlineScore: user.onlineScore,
    toolsUsed: user.toolsUsed,
    scansDone: user.scansDone,
    roadmapsCreated: user.roadmapsCreated,
    createdAt: user.createdAt,
  };
}

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, careerGoal } = req.body;
    if (!firstName || !email || !password) return res.status(400).json({ error: 'First name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

    const existing = await db.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.createUser({ firstName, lastName: lastName || '', email, password: hashedPassword, avatar: avatar || '🦊', careerGoal: careerGoal || 'Career Explorer' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.createSession(user._id, token, expiresAt);

    res.status(201).json({ message: 'Account created!', token, user: sanitizeUser(user), isNew: true });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered.' });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await db.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn });
    const days = rememberMe ? 30 : 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    await db.createSession(user._id, token, expiresAt);

    res.json({ message: 'Welcome back!', token, user: sanitizeUser(user), isNew: false });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// LOGOUT
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await db.deleteSession(req.token);
    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// VERIFY
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: sanitizeUser(req.user), isNew: false });
});

module.exports = router;
