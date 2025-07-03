package utils

import (
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

func InitRedis() *redis.Client {
	addr := fmt.Sprintf("%s:%s",
		Load().RedisHost,
		Load().RedisPort,
	)

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: Load().RedisPassword,
		DB:       0,
	})

	log.Println("Redis connected successfully")
	return client
}
