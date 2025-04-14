const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;
    if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else {
      user = await User.findOne({ email, role });
    }
    
    if (!user) {
      return res.status(400).send({ error: 'Invalid email or role' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'superSecretJWTKey12345', { expiresIn: '24h' });
    res.send({ token, role: user.role });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
});

module.exports = router;
