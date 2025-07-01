package controllers

import (
	"net/http"
	"noir-backend/dto"
	"noir-backend/models"
	"noir-backend/utils"
	"time"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, utils.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	user := &models.User{
		FullName:  req.FullName,
		Email:     req.Email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := models.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, utils.APIResponse{
			Success: false,
			Error:   "failed to create user",
		})
	}

	c.JSON(http.StatusCreated, utils.APIResponse{
		Success: true,
		Message: "user registered successfully",
		Data:    user,
	})
}