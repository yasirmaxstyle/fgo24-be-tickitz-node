const { Director, Genre, Actor } = require('../models');

const getMovieIncludes = () => [
  {
    model: Director,
    as: 'director',
    attributes: ['director_id', 'first_name', 'last_name']
  },
  {
    model: Genre,
    as: 'genres',
    attributes: ['genre_id', 'name'],
    through: { attributes: [] }
  },
  {
    model: Actor,
    as: 'actors',
    attributes: ['actor_id', 'first_name', 'last_name'],
    through: {
      attributes: ['role'],
      as: 'movieCast'
    }
  }
];

const formatMovieResponse = (movie) => {
  const movieData = movie.toJSON();
  return {
    ...movieData,
    director: movieData.director ?
      `${movieData.director.first_name} ${movieData.director.last_name}`.trim() : null,
    genres: movieData.genres?.map(genre => genre.name) || [],
    cast_members: movieData.actors?.map(actor => ({
      name: `${actor.first_name} ${actor.last_name}`.trim(),
      role: actor.movieCast?.role || null
    })) || []
  };
};

const getPaginationData = (page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    current_page: parseInt(page),
    total_pages: totalPages,
    total_items: totalItems,
    limit: parseInt(limit),
    has_next: page < totalPages,
    has_prev: page > 1
  };
};

module.exports = {
  getMovieIncludes,
  formatMovieResponse,
  getPaginationData
};