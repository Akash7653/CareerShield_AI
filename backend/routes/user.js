const express = require('express');
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

router.get('/profile', authMiddleware, (req, res) => {
  res.json(sanitizeUser(req.user));
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, avatar, careerGoal } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (avatar) updates.avatar = avatar;
    if (careerGoal) updates.careerGoal = careerGoal;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'No fields to update.' });
    const updated = await db.updateUser(req.user._id, updates);
    res.json({ message: 'Profile updated!', user: sanitizeUser(updated) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await db.getHistory(req.user._id, {
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
      toolType: req.query.tool || null,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

module.exports = router;
