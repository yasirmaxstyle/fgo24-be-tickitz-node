const movieService = require('../services/movieService');
const { formatMovieResponse, getPaginationData } = require('../utils/helpers');

class MovieController {
  async getNowPlayingMovies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { count, rows } = await movieService.getNowPlayingMovies(page, limit);

      res.json({
        success: true,
        data: {
          movies: rows.map(formatMovieResponse),
          pagination: getPaginationData(page, limit, count)
        }
      });
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getUpcomingMovies(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const { count, rows } = await movieService.getUpcomingMovies(page, limit);

      res.json({
        success: true,
        data: {
          movies: rows.map(formatMovieResponse),
          pagination: getPaginationData(page, limit, count)
        }
      });
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getMoviesWithFilters(req, res) {
    try {
      const filters = req.query;

      const { count, rows } = await movieService.getMoviesWithFilters(filters);

      res.json({
        success: true,
        data: {
          movies: rows.map(formatMovieResponse),
          pagination: getPaginationData(filters.page || 1, filters.limit || 10, count),
          filters: {
            genre: filters.genre,
            rating: filters.rating,
            director: filters.director,
            title: filters.title,
            sort: filters.sort || 'created_at',
            order: filters.order || 'DESC'
          }
        }
      });
    } catch (error) {
      console.error('Error fetching movies with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getMovieById(req, res) {
    try {
      const { id } = req.params;

      const movie = await movieService.getMovieById(id);

      if (!movie) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found'
        });
      }

      res.json({
        success: true,
        data: formatMovieResponse(movie)
      });
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new MovieController();