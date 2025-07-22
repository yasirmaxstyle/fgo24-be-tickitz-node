const { body, param } = require('express-validator');

const createMovieValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('poster_path')
    .optional()
    .isURL()
    .withMessage('Poster path must be a valid URL'),

  body('backdrop_path')
    .optional()
    .isURL()
    .withMessage('Backdrop path must be a valid URL'),

  body('overview')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Overview must not exceed 5000 characters'),

  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),

  body('release_date')
    .isDate()
    .withMessage('Release date must be a valid date (YYYY-MM-DD)'),

  body('rating')
    .isIn(['G', 'PG', 'PG-13', 'R'])
    .withMessage('Rating must be one of: G, PG, PG-13, R'),

  body('director_id')
    .isInt({ min: 1 })
    .withMessage('Director ID must be a positive integer'),

  body('actor_ids')
    .optional()
    .isArray()
    .withMessage('Actor IDs must be an array')
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (let actor of value) {
          if (!actor.actor_id || !Number.isInteger(actor.actor_id) || actor.actor_id < 1) {
            throw new Error('Each actor must have a valid actor_id');
          }
        }
      }
      return true;
    }),

  body('genre_ids')
    .optional()
    .isArray()
    .withMessage('Genre IDs must be an array')
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (let genreId of value) {
          if (!Number.isInteger(genreId) || genreId < 1) {
            throw new Error('Each genre ID must be a positive integer');
          }
        }
      }
      return true;
    })
];

const updateMovieValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Movie ID must be a positive integer'),

  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),

  body('poster_path')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== '' && !validator.isURL(value)) {
        throw new Error('Poster path must be a valid URL');
      }
      return true;
    }),

  body('backdrop_path')
    .optional({ nullable: true })
    .custom((value) => {
      if (value !== null && value !== '' && !validator.isURL(value)) {
        throw new Error('Backdrop path must be a valid URL');
      }
      return true;
    }),

  body('overview')
    .optional({ nullable: true })
    .isLength({ max: 5000 })
    .withMessage('Overview must not exceed 5000 characters'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in minutes)'),

  body('release_date')
    .optional()
    .isDate()
    .withMessage('Release date must be a valid date (YYYY-MM-DD)'),

  body('rating')
    .optional()
    .isIn(['G', 'PG', 'PG-13', 'R'])
    .withMessage('Rating must be one of: G, PG, PG-13, R'),

  body('director_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Director ID must be a positive integer'),

  body('actor_ids')
    .optional()
    .isArray()
    .withMessage('Actor IDs must be an array')
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (let actor of value) {
          if (!actor.actor_id || !Number.isInteger(actor.actor_id) || actor.actor_id < 1) {
            throw new Error('Each actor must have a valid actor_id');
          }
        }
      }
      return true;
    }),

  body('genre_ids')
    .optional()
    .isArray()
    .withMessage('Genre IDs must be an array')
    .custom((value) => {
      if (value && Array.isArray(value)) {
        for (let genreId of value) {
          if (!Number.isInteger(genreId) || genreId < 1) {
            throw new Error('Each genre ID must be a positive integer');
          }
        }
      }
      return true;
    })
];

const getMovieValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Movie ID must be a positive integer')
];

const deleteMovieValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Movie ID must be a positive integer')
];

module.exports = {
  createMovieValidation,
  updateMovieValidation,
  getMovieValidation,
  deleteMovieValidation
};