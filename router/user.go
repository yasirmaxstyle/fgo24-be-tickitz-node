package router

import (
	"noir-backend/controllers"

	"github.com/gin-gonic/gin"
)

func userRouter(r *gin.RouterGroup) {
	r.GET("/:id", controllers.GetProfile)
	r.PATCH("/:id") //edit profile
}
