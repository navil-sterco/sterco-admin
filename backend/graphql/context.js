const jwt = require('jsonwebtoken');
const User = require('../models/User');

const buildGraphQLContext = async ({ req }) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    return { user };
  } catch (error) {
    return { user: null };
  }
};

module.exports = { buildGraphQLContext };
