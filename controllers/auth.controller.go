package controllers

import (
	"net/http"
	"noir-backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email, password, and name
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Registration request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/register [post]

func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user := &models.User{
		Email:     req.Email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := models.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   "failed to create user",
		})
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "user registered successfully",
		Data:    user,
	})
}
