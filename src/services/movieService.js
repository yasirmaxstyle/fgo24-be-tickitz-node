const { Movie, Director, Actor, Genre, Showtime } = require('../models');
const { Op } = require('sequelize');
const { getMovieIncludes } = require('../utils/helpers');

class MovieService {
  async getNowPlayingMovies(page, limit) {
    const offset = (page - 1) * limit;

    const whereCondition = {
      '$showtimes.show_datetime$': {
        [Op.gte]: new Date()
      },
      '$showtimes.available_seats$': {
        [Op.gt]: 0
      }
    };

    return await Movie.findAndCountAll({
      where: whereCondition,
      include: [
        ...getMovieIncludes(),
        {
          model: Showtime,
          as: 'showtimes',
          attributes: [],
          where: {
            show_datetime: { [Op.gte]: new Date() },
            available_seats: { [Op.gt]: 0 }
          },
          required: true
        }
      ],
      distinct: true,
      col: 'movie_id',
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
  }

  async getUpcomingMovies(page, limit) {
    const offset = (page - 1) * limit;
    const { sequelize } = require('../models');

    const whereCondition = {
      [Op.or]: [
        {
          release_date: {
            [Op.gt]: new Date()
          }
        },
        {
          [Op.not]: {
            [Op.exists]: sequelize.literal(`
              (SELECT 1 FROM showtimes s 
               WHERE s.movie_id = movies.movie_id 
               AND s.show_datetime >= NOW())
            `)
          }
        }
      ]
    };

    return await Movie.findAndCountAll({
      where: whereCondition,
      include: getMovieIncludes(),
      distinct: true,
      col: 'movie_id',
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['release_date', 'ASC']]
    });
  }

  async getMoviesWithFilters(filters) {
    const { genre, rating, director, title, page, limit, sort, order } = filters;
    const offset = (page - 1) * limit;

    const whereConditions = {};
    const includeConditions = [...getMovieIncludes()];

    if (title) {
      whereConditions.title = {
        [Op.iLike]: `%${title}%`
      };
    }

    if (rating) {
      whereConditions.rating = rating;
    }

    if (genre) {
      includeConditions.find(inc => inc.as === 'genres').where = {
        name: { [Op.iLike]: `%${genre}%` }
      };
      includeConditions.find(inc => inc.as === 'genres').required = true;
    }

    if (director) {
      const { sequelize } = require('../models');
      const directorInclude = includeConditions.find(inc => inc.as === 'director');
      directorInclude.where = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${director}%` } },
          { last_name: { [Op.iLike]: `%${director}%` } },
          sequelize.where(
            sequelize.fn('CONCAT',
              sequelize.col('director.first_name'),
              ' ',
              sequelize.col('director.last_name')
            ),
            { [Op.iLike]: `%${director}%` }
          )
        ]
      };
      directorInclude.required = true;
    }

    return await Movie.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      distinct: true,
      col: 'movie_id',
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order]]
    });
  }

  async getMovieById(id) {
    return await Movie.findByPk(id, {
      include: getMovieIncludes()
    });
  }
}

module.exports = new MovieService();