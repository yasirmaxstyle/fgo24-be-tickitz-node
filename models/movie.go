package models

import (
	"context"
	"fmt"
	"net/http"
	"noir-backend/utils"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
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

func CreateMovie(req CreateMovieRequest, posterPath, backdropPath string) (*Movie, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, fmt.Errorf("Database transaction error")
	}
	defer tx.Rollback(context.Background())

	row, err := tx.Query(context.Background(),
		`INSERT INTO movies (title, poster_path, backdrop_path, overview, duration, release_date, directors_id, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		 RETURNING movie_id, title, poster_path, backdrop_path, overview, duration, release_date, directors_id, created_at, updated_at`,
		req.Title, posterPath, backdropPath, req.Overview, req.Duration, req.ReleaseDate, req.DirectorsID)

	if err != nil {
		return nil, fmt.Errorf("Failed to create movie: " + err.Error())
	}

	movie, err := pgx.CollectOneRow[Movie](row, pgx.RowToStructByName)
	if err != nil {
		return nil, fmt.Errorf("Failed to create movie: " + err.Error())
	}

	for _, genre := range req.Genres {
		_, err = tx.Exec(context.Background(),
			"INSERT INTO movies_genres (movie_id, genre) VALUES ($1, $2)",
			movie.MovieID, genre)
		if err != nil {
			return nil, fmt.Errorf("Failed to add genre: " + err.Error())

		}
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("Failed to commit transaction")
	}

	return &movie, nil
}

func UpdateMovie(c *gin.Context, id int, req UpdateMovieRequest) *HTTPError {
	conn, err := utils.ConnectDB()
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to connect to database: " + err.Error(),
		}
	}
	defer utils.CloseDB(conn)

	var exists bool
	err = conn.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM movies WHERE movie_id = $1)", id).Scan(&exists)

	if err != nil || !exists {
		return &HTTPError{
			Error:   http.StatusNotFound,
			Message: "Movie not found",
		}
	}

	// Handle file uploads
	var posterPath, backdropPath *string

	if poster, err := SaveUploadedFile(c, "poster", "uploads/posters"); err == nil {
		posterPath = &poster
	}

	if backdrop, err := SaveUploadedFile(c, "backdrop", "uploads/backdrops"); err == nil {
		backdropPath = &backdrop
	}

	// Start transaction
	tx, err := conn.Begin(context.Background())
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Database transaction error ",
		}
	}
	defer tx.Rollback(context.Background())

	// Build dynamic update query
	setParts := []string{"updated_at = NOW()"}
	args := []interface{}{}
	argIndex := 1

	if req.Title != nil {
		setParts = append(setParts, fmt.Sprintf("title = $%d", argIndex))
		args = append(args, *req.Title)
		argIndex++
	}
	if req.Overview != nil {
		setParts = append(setParts, fmt.Sprintf("overview = $%d", argIndex))
		args = append(args, *req.Overview)
		argIndex++
	}
	if req.Duration != nil {
		setParts = append(setParts, fmt.Sprintf("duration = $%d", argIndex))
		args = append(args, *req.Duration)
		argIndex++
	}
	if req.ReleaseDate != nil {
		setParts = append(setParts, fmt.Sprintf("release_date = $%d", argIndex))
		args = append(args, *req.ReleaseDate)
		argIndex++
	}
	if req.DirectorsID != nil {
		setParts = append(setParts, fmt.Sprintf("directors_id = $%d", argIndex))
		args = append(args, *req.DirectorsID)
		argIndex++
	}
	if posterPath != nil {
		setParts = append(setParts, fmt.Sprintf("poster_path = $%d", argIndex))
		args = append(args, *posterPath)
		argIndex++
	}
	if backdropPath != nil {
		setParts = append(setParts, fmt.Sprintf("backdrop_path = $%d", argIndex))
		args = append(args, *backdropPath)
		argIndex++
	}

	// Add movie ID as last parameter
	args = append(args, id)

	query := fmt.Sprintf("UPDATE movies SET %s WHERE movie_id = $%d",
		fmt.Sprintf(setParts[0]), argIndex)
	for i := 1; i < len(setParts); i++ {
		query = fmt.Sprintf("UPDATE movies SET %s WHERE movie_id = $%d",
			fmt.Sprintf("%s, %s", query[20:len(query)-15], setParts[i]), argIndex)
	}

	// Execute update
	_, err = tx.Exec(context.Background(), query, args...)
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Failed to update movie",
		}
	}

	// Update genres if provided
	if req.Genres != nil {
		// Delete existing genres
		_, err = tx.Exec(context.Background(),
			"DELETE FROM movies_genres WHERE movie_id = $1", id)
		if err != nil {
			return &HTTPError{
				Error:   http.StatusInternalServerError,
				Message: "Failed to update genre",
			}
		}

		// Insert new genres
		for _, genre := range req.Genres {
			_, err = tx.Exec(context.Background(),
				"INSERT INTO movies_genres (movie_id, genre) VALUES ($1, $2)",
				id, genre)
			if err != nil {
				return &HTTPError{
					Error:   http.StatusInternalServerError,
					Message: "Failed to add genre",
				}
			}
		}
	}

	// Commit transaction
	if err = tx.Commit(context.Background()); err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Failed to commit transaction",
		}
	}

	return nil
}

func DeleteMovie(id int) *HTTPError {
	conn, err := utils.ConnectDB()
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to connect to database",
		}
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "database transaction error",
		}
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(context.Background(),
		"DELETE FROM movies_genres WHERE movie_id = $1", id)
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to delete movie genre",
		}
	}

	result, err := tx.Exec(context.Background(),
		"DELETE FROM movies WHERE movie_id = $1", id)
	if err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to delete movie",
		}
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return &HTTPError{
			Error:   http.StatusNotFound,
			Message: "movie not found",
		}
	}

	if err = tx.Commit(context.Background()); err != nil {
		return &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to commit transaction",
		}
	}

	return nil
}

func SaveUploadedFile(c *gin.Context, fieldName string, uploadDir string) (string, error) {
	file, err := c.FormFile(fieldName)
	if err != nil {
		return "", err
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	filepath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		return "", err
	}

	return filename, nil
}
