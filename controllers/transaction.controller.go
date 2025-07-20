package controllers

import (
	"net/http"
	"noir-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateTransaction(c *gin.Context) {
	var req models.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		models.NewError(c, http.StatusUnauthorized, "user not aunthenticated")
		return
	}

	response, err := models.CreateTransaction(req, userID.(int))
	if err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Transaction created successfully",
		Data:    response,
	})
}

func ProcessPayment(c *gin.Context) {
	var req models.ProcessPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	response, err := models.ProcessPayment(req)
	if err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Payment processed successfully",
		Data:    response,
	})
}

func CancelTransaction(c *gin.Context) {
	transactionCode := c.Param("code")
	if transactionCode == "" {
		models.NewError(c, http.StatusBadRequest, "transaction code is required")
		return
	}

	response, err := models.CancelTransaction(transactionCode)
	if err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Transaction cancelled successfully",
		Data:    response,
	})
}

func GetTransaction(c *gin.Context) {
	transactionCode := c.Param("code")
	if transactionCode == "" {
		models.NewError(c, http.StatusBadRequest, "transaction code is required")
		return
	}

	response, err := models.GetTransactionByCode(transactionCode)
	if err != nil {
		models.NewError(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Transaction retrieved successfully",
		Data:    response,
	})
}
