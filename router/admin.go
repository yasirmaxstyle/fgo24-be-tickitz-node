package router

import (
	"noir-backend/controllers"

	"github.com/gin-gonic/gin"
)

func adminRouter(r *gin.RouterGroup) {
	r.POST("/user")                                 //add admin
	r.POST("/movie", controllers.AddMovie)          //add movie by admin
	r.PATCH("/movie/:id", controllers.UpdateMovie)  //edit movie by admin
	r.DELETE("/movie/:id", controllers.DeleteMovie) //edit movie by admin
}
