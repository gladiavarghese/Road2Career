const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstMsg = errorArray[0]?.msg || 'Validation failed';
    return res.status(422).json({
      success: false,
      message: firstMsg,
      errors: errorArray.map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
