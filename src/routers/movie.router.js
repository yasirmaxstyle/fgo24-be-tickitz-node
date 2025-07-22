const express = require('express');
const movieController = require('../controllers/movie.controller');
const {
  paginationValidation,
  movieFilterValidation,
  movieIdValidation,
  handleValidationErrors
} = require('../middlewares/validations/movieValidation');

const router = express.Router();

router.get('/now-playing',
  paginationValidation,
  handleValidationErrors,
  movieController.getNowPlayingMovies
);

router.get('/upcoming',
  paginationValidation,
  handleValidationErrors,
  movieController.getUpcomingMovies
);

router.get('/:id',
  movieIdValidation,
  handleValidationErrors,
  movieController.getMovieById
);

router.get('/',
  movieFilterValidation,
  handleValidationErrors,
  movieController.getMoviesWithFilters
);

module.exports = router;