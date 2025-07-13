package controllers

import (
	"net/http"
	"noir-backend/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Add Movie godoc
// @Summary Add new movie
// @Description Add new movie by admin
// @Tags admin
// @Produce json
// @Param request body models.CreateMovieRequest true "Create movie request"
// @Security Token
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Router /admin/movie [post]
func AddMovie(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	if role != "admin" {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	var req models.CreateMovieRequest

	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, "Invalid request data: "+err.Error())
		return
	}

	var posterPath, backdropPath *string

	if poster, err := models.SaveUploadedFile(c, "poster", "uploads/posters"); err == nil {
		posterPath = &poster
	}

	if backdrop, err := models.SaveUploadedFile(c, "backdrop", "uploads/backdrops"); err == nil {
		backdropPath = &backdrop
	}

	movie, err := models.CreateMovie(req, *posterPath, *backdropPath)
	if err != nil {
		models.NewError(c, http.StatusInternalServerError, err.Error())
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Movie created successfully",
		Data:    movie,
	})
}

// Update Movie godoc
// @Summary Update existing movie
// @Description Add existing movie by admin
// @Tags admin
// @Produce json
// @Param request body models.UpdateMovieRequest true "Update movie request"
// @Param id_movie path integer true "Update movie request"
// @Security Token
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Router /admin/movie/:id [patch]
func UpdateMovie(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	if role != "admin" {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid movie ID",
		})
		return
	}

	var req models.UpdateMovieRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid request data",
		})
		return
	}

	if err := models.UpdateMovie(c, id, req); err != nil {
		models.NewError(c, err.Error, err.Message)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Movie updated successfully",
	})
}

// Delete Movie godoc
// @Summary Delete existing movie
// @Description Delete existing movie by admin
// @Tags admin
// @Produce json
// @Param id_movie path integer true "Delete movie request"
// @Security Token
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Router /admin/movie/:id [delete]
func DeleteMovie(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	if role != "admin" {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid movie ID",
		})
		return
	}

	if err := models.DeleteMovie(id); err != nil {
		models.NewError(c, err.Error, err.Message)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Movie deleted successfully",
	})
}