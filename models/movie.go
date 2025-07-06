package models

import (
	"time"
)

type Movie struct {
	MovieID      int       `json:"movieId" db:"movie_id"`
	Title        string    `json:"title" db:"title"`
	PosterPath   *string   `json:"posterPath" db:"poster_path"`
	BackdropPath *string   `json:"backdropPath" db:"backdrop_path"`
	Overview     string    `json:"overview" db:"overview"`
	Duration     int       `json:"duration" db:"duration"`
	ReleaseDate  time.Time `json:"releaseDate" db:"release_date"`
	DirectorsID  *int      `json:"directorsId" db:"directors_id"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type Actors struct {
	FirstName string `json:"firstName" db:"first_name"`
	LastName  string `json:"lastName" db:"last_name"`
	MovieID   int    `json:"movieId" db:"movie_id"`
}

type Director struct {
	DirectorsID int    `json:"directorsId" db:"directors_id"`
	FirstName   string `json:"firstName" db:"first_name"`
	LastName    string `json:"lastName" db:"last_name"`
}

type MovieGenre struct {
	MoviesGenresID int    `json:"genreId" db:"movies_genres_id"`
	MovieID        int    `json:"movieId" db:"movie_id"`
	Genre          string `json:"genre" db:"genre"`
}
