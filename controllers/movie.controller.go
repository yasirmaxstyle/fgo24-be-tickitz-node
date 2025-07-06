package controllers

import (
	"net/http"
	"noir-backend/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AddMovie(c *gin.Context) {
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

func UpdateMovie(c *gin.Context) {
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

func DeleteMovie(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Message: "Invalid movie ID",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Movie deleted successfully",
	})

	if err := models.DeleteMovie(id); err != nil {
		models.NewError(c, err.Error, err.Message)
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Movie deleted successfully",
	})
}
