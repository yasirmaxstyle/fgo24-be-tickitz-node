package controllers

import (
	"net/http"
	"noir-backend/models"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email, password, and and confirm password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Registration request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /auth/register [post]
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	if req.Password != req.ConfirmPassword {
		models.NewError(c, http.StatusBadRequest, "confirm password must match")
		return
	}

	user, err := models.CreateUser(req)
	if err != nil {
		models.NewError(c, http.StatusInternalServerError, "failed to create user")
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "user registered successfully",
		Data:    user,
	})
}

// Login godoc
// @Summary Login user
// @Description Login user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login request"
// @Success 200 {object} models.AuthResponse
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Router /auth/login [post]
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusUnauthorized, err.Error())
		return
	}

	response, err := models.Login(&req)
	if err != nil {
		models.NewError(c, http.StatusUnauthorized, err.Error())
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile
// @Tags profile
// @Produce json
// @Security Token
// @Success 200 {object} models.User
// @Failure 401 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Router /profile [get]
func GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		models.NewError(c, http.StatusUnauthorized, "Status Unauthorized")
		return
	}

	user, err := models.GetUserByID(userID.(int))
	if err != nil {
		models.NewError(c, http.StatusNotFound, "User not found")
		return
	}

	c.JSON(http.StatusOK, user)
}

// Logout godoc
// @Summary Logout user
// @Description Logout user by blacklisting refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RefreshTokenRequest true "Logout request"
// @Security Token
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /auth/logout [post]
func Logout(c *gin.Context) {
	var req models.RefreshTokenRequest
	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := models.Logout(req.RefreshToken); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Logged out successfully",
	})
}

// Forgot Password godoc
// @Summary Request reset password
// @Description Request reset password user with email
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.PasswordResetRequest true "Forgot password request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Router /auth/forgot-password [post]
func ForgotPassword(c *gin.Context) {
	var req models.PasswordResetRequest
	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	res, err := models.ForgotPassword(req.Email)
	if err != nil {
		models.NewError(c, http.StatusInternalServerError, err.Error())
	}

	c.JSON(http.StatusOK, res)
}

// Reset Password godoc
// @Summary Reset password in new link provided
// @Description Reset password user with new password
// @Tags auth
// @Accept json
// @Produce json
// @Param token query string true "token request"
// @Param request body models.ResetPasswordRequest true "Reset password request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Router /auth/reset-password [post]
func ResetPassword(c *gin.Context) {
	token := c.Query("token")
	var req models.ResetPasswordRequest
	if err := c.ShouldBind(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	res, err := models.ResetPassword(req, token)
	if err != nil {
		models.NewError(c, err.Error, err.Message)
	}

	c.JSON(http.StatusOK, res)
}
