const express = require('express');
const router = express.Router();
const User = require('../model/user.model.js');

// Отримати користувача
router.get('/get-user', async(req, res) => {
  const uid = req.query.uid;

  try {
    const user = await User.findOne({ uid: uid });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Створити користувача
router.post('/create-user', async(req, res) => {
  const body = req.body;
  try {
    const user = await User.create(body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({message : error.message});
  }
});

module.exports = router;
