const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { passwordProblem } = require('../utils/passwordRules');

// Logins last 7 days, then the user signs in again
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Always treat these as plain text. Stops tricks like sending {"$ne": null} as an email
// to make a database query match someone else (a "NoSQL injection").
const text = (value) => (typeof value === 'string' ? value.trim() : '');

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const name = text(req.body.name);
    const email = text(req.body.email).toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const problem = passwordProblem(password);
    if (problem) {
      res.status(400);
      throw new Error(problem);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const email = text(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });
    // Same message whether the email or the password is wrong, so attackers can't tell which
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({ success: true, data: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpire');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgotpassword
// Always gives the same answer, so nobody can use this page to find out who has an account.
const forgotPassword = async (req, res, next) => {
  const genericReply = () =>
    res.status(200).json({ success: true, data: 'If that email has an account, a reset link is on its way.' });

  try {
    const email = text(req.body.email).toLowerCase();
    const user = email ? await User.findOne({ email }) : null;
    if (!user) return genericReply();

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // The link points at the website (CLIENT_URL), not at this API server
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0].replace(/\/$/, '');
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;
    const message = `Someone (hopefully you) asked to reset your Bagsy password.\n\nSet a new one here (the link works for 10 minutes):\n${resetLink}\n\nIf this wasn't you, you can ignore this email.`;

    try {
      await sendEmail({ email: user.email, subject: 'Reset your Bagsy password', message });
    } catch (err) {
      console.error(`Reset email failed: ${err.message}`);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    return genericReply();
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/resetpassword/:resettoken
const resetPassword = async (req, res, next) => {
  try {
    const problem = passwordProblem(req.body.password);
    if (problem) {
      res.status(400);
      throw new Error(problem);
    }

    const resetPasswordToken = crypto.createHash('sha256').update(String(req.params.resettoken)).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
      res.status(400);
      throw new Error('This reset link has expired or is invalid. Ask for a new one.');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, data: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword };
