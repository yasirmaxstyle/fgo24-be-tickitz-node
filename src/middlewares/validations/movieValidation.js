const { body, query, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt()
];

const movieFilterValidation = [
  ...paginationValidation,
  query('genre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Genre must be between 1 and 50 characters'),
  query('rating')
    .optional()
    .isIn(['G', 'PG', 'PG-13', 'R'])
    .withMessage('Rating must be one of: G, PG, PG-13, R'),
  query('director')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Director name must be between 1 and 100 characters'),
  query('title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  query('sort')
    .optional()
    .isIn(['title', 'release_date', 'duration', 'created_at'])
    .withMessage('Sort must be one of: title, release_date, duration, created_at'),
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC')
];

const movieIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Movie ID must be a positive integer')
    .toInt()
];

module.exports = {
  handleValidationErrors,
  paginationValidation,
  movieFilterValidation,
  movieIdValidation
};