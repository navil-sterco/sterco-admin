const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = {};
    errors.array().forEach((err) => {
      if (!formatted[err.path]) {
        formatted[err.path] = err.msg;
      }
    });

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
    });
  }

  next();
};

module.exports = handleValidation;
