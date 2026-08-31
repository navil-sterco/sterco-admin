const User = require("../models/User");
const { sendTokenResponse } = require("../utils/generateToken");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    const invalidCredentialsResponse = () =>
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    if (!user) return invalidCredentialsResponse();

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to repeated failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        user.loginAttempts = 0;
      }

      await user.save();
      return invalidCredentialsResponse();
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    sendTokenResponse(user.toJSON(), 200, res);
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user.toJSON() });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, getMe };
