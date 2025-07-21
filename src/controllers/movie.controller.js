const { Movie, Director, Actor, Genre, MovieCast, MovieGenre } = require("../models");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { constants: http } = require("http2");

class MovieController {
  // GET /admin/movies - Get all movies with pagination and filters
  static async getAllMovies(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        rating = "",
        sortBy = "created_at",
        sortOrder = "DESC"
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const whereClause = {};

      // Search filter
      if (search) {
        whereClause.title = {
          [Op.iLike]: `%${search}%`
        };
      }

      const { count, rows: movies } = await Movie.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Director,
            as: "director",
            attributes: ["director_id", "first_name", "last_name"]
          },
          {
            model: Actor,
            as: "actors",
            through: {
              model: MovieCast,
              attributes: ["role"]
            },
            attributes: ["actor_id", "first_name", "last_name"]
          },
          {
            model: Genre,
            as: "movieGenres",
            through: {
              model: MovieGenre,
              attributes: []
            },
            attributes: ["genre_id", "name"]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        distinct: true
      });

      const totalPages = Math.ceil(count / parseInt(limit));

      res.status(http.HTTP_STATUS_OK).json({
        success: true,
        message: "Movies retrieved successfully",
        data: {
          movies,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // GET /admin/movies/:id - Get movie by ID
  static async getMovieById(req, res) {
    try {
      const { id } = req.params;

      const movie = await Movie.findByPk(id, {
        include: [
          {
            model: Director,
            as: "director",
            attributes: ["director_id", "first_name", "last_name"]
          },
          {
            model: Actor,
            as: "actors",
            through: {
              model: MovieCast,
              attributes: ["role"]
            },
            attributes: ["actor_id", "first_name", "last_name"]
          },
          {
            model: Genre,
            as: "movieGenres",
            through: {
              model: MovieGenre,
              attributes: []
            },
            attributes: ["genre_id", "name"]
          }
        ]
      });

      if (!movie) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Movie not found"
        });
      }

      res.status(http.HTTP_STATUS_OK).json({
        success: true,
        message: "Movie retrieved successfully",
        data: movie
      });
    } catch (error) {
      console.error("Error fetching movie:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // POST /admin/movies - Create new movie
  static async createMovie(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(http.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const {
        title,
        poster_path,
        backdrop_path,
        overview,
        duration,
        release_date,
        rating,
        director_id,
        actor_ids = [],
        genre_ids = []
      } = req.body;

      const director = await Director.findByPk(director_id);
      if (!director) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Director not found"
        });
      }

      const movie = await Movie.create({
        title,
        poster_path,
        backdrop_path,
        overview,
        duration,
        release_date,
        rating,
        director_id
      });

      if (actor_ids && actor_ids.length > 0) {
        const castData = actor_ids.map(actorData => ({
          movie_id: movie.movie_id,
          actor_id: actorData.actor_id,
          role: actorData.role || "Actor"
        }));
        await MovieCast.bulkCreate(castData);
      }

      if (genre_ids && genre_ids.length > 0) {
        const genreData = genre_ids.map(genre_id => ({
          movie_id: movie.movie_id,
          genre_id
        }));
        await MovieGenre.bulkCreate(genreData);
      }

      const createdMovie = await Movie.findByPk(movie.movie_id, {
        include: [
          {
            model: Director,
            as: "director",
            attributes: ["director_id", "first_name", "last_name"]
          },
          {
            model: Actor,
            as: "actors",
            through: {
              model: MovieCast,
              attributes: ["role"]
            },
            attributes: ["actor_id", "first_name", "last_name"]
          },
          {
            model: Genre,
            as: "movieGenres",
            through: {
              model: MovieGenre,
              attributes: []
            },
            attributes: ["genre_id", "name"]
          }
        ]
      });

      res.status(http.HTTP_STATUS_CREATED).json({
        success: true,
        message: "Movie created successfully",
        data: createdMovie
      });
    } catch (error) {
      console.error("Error creating movie:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // PATCH /admin/movies/:id - Update movie
  static async updateMovie(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(http.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const {
        title,
        poster_path,
        backdrop_path,
        overview,
        duration,
        release_date,
        rating,
        director_id,
        actor_ids,
        genre_ids
      } = req.body;

      const movie = await Movie.findByPk(id);
      if (!movie) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Movie not found"
        });
      }

      if (director_id) {
        const director = await Director.findByPk(director_id);
        if (!director) {
          return res.status(http.HTTP_STATUS_NOT_FOUND).json({
            success: false,
            message: "Director not found"
          });
        }
      }

      await movie.update({
        title: title || movie.title,
        poster_path: poster_path !== undefined ? poster_path : movie.poster_path,
        backdrop_path: backdrop_path !== undefined ? backdrop_path : movie.backdrop_path,
        overview: overview !== undefined ? overview : movie.overview,
        duration: duration || movie.duration,
        release_date: release_date || movie.release_date,
        rating: rating || movie.rating,
        director_id: director_id || movie.director_id
      });

      if (actor_ids !== undefined) {
        await MovieCast.destroy({ where: { movie_id: id } });
        if (actor_ids.length > 0) {
          const castData = actor_ids.map(actorData => ({
            movie_id: id,
            actor_id: actorData.actor_id,
            role: actorData.role || "Actor"
          }));
          await MovieCast.bulkCreate(castData);
        }
      }

      if (genre_ids !== undefined) {
        await MovieGenre.destroy({ where: { movie_id: id } });
        if (genre_ids.length > 0) {
          const genreData = genre_ids.map(genre_id => ({
            movie_id: id,
            genre_id
          }));
          await MovieGenre.bulkCreate(genreData);
        }
      }

      const updatedMovie = await Movie.findByPk(id, {
        include: [
          {
            model: Director,
            as: "director",
            attributes: ["director_id", "first_name", "last_name"]
          },
          {
            model: Actor,
            as: "actors",
            through: {
              model: MovieCast,
              attributes: ["role"]
            },
            attributes: ["actor_id", "first_name", "last_name"]
          },
          {
            model: Genre,
            as: "movieGenres",
            through: {
              model: MovieGenre,
              attributes: []
            },
            attributes: ["genre_id", "name"]
          }
        ]
      });

      res.status(http.HTTP_STATUS_OK).json({
        success: true,
        message: "Movie updated successfully",
        data: updatedMovie
      });
    } catch (error) {
      console.error("Error updating movie:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // DELETE /admin/movies/:id - Delete movie
  static async deleteMovie(req, res) {
    try {
      const { id } = req.params;

      const movie = await Movie.findByPk(id);
      if (!movie) {
        return res.status(http.HTTP_STATUS_NOT_FOUND).json({
          success: false,
          message: "Movie not found"
        });
      }

      await MovieCast.destroy({ where: { movie_id: id } });
      await MovieGenre.destroy({ where: { movie_id: id } });

      await movie.destroy();

      res.status(http.HTTP_STATUS_OK).json({
        success: true,
        message: "Movie deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting movie:", error);

      if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Cannot delete movie. It has associated showtimes or other dependencies."
        });
      }

      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }

  // GET /admin/movies/stats - Get movie statistics
  static async getMovieStats(req, res) {
    try {
      const totalMovies = await Movie.count();

      const moviesByRating = await Movie.findAll({
        attributes: [
          "rating",
          [Movie.sequelize.fn("COUNT", "*"), "count"]
        ],
        group: ["rating"],
        raw: true
      });

      const recentMovies = await Movie.count({
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      res.status(http.HTTP_STATUS_OK).json({
        success: true,
        message: "Movie statistics retrieved successfully",
        data: {
          totalMovies,
          moviesByRating,
          recentMovies
        }
      });
    } catch (error) {
      console.error("Error fetching movie stats:", error);
      res.status(http.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = MovieController;