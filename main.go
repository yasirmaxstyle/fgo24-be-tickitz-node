package main

import (
	"noir-backend/router"
	"noir-backend/utils"

	"github.com/gin-gonic/gin"
)

//@title NOIR RESTful API
//@version 1.0
//@description backend server of movie ticketing NOIR Project
//@BasePath /

//@securitydefinitions.apikey Token
//@in header
//@name	Authorization

func main() {
	r := gin.Default()

	router.CombineRouter(r)

	utils.SeedAdminUser()

	r.Run(":8080")
}
