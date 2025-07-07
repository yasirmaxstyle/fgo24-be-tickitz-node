package utils

import (
	"context"
	"fmt"
	"log"
)

func SeedAdminUser() {
	ctx := context.Background()

	conn, err := ConnectDB()
	if err != nil {
		log.Fatal("failed to connect to database: ", err)
		return
	}
	defer CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		log.Fatal("failed to begin transaction: ", err)
		return
	}
	defer tx.Rollback(context.Background())

	adminEmail := Load().Admin.Email
	adminPassword := Load().Admin.Password

	var count int
	query := `SELECT COUNT(*) FROM users WHERE email = $1 AND role = 'admin'`

	err = conn.QueryRow(ctx, query, adminEmail).Scan(&count)
	if err != nil {
		log.Fatal("failed to check admin existence: ", err)
		return
	}

	if count > 0 {
		log.Printf("Admin '%s' already exists", adminEmail)
		return
	}

	hashedPassword, err := HashPassword(adminPassword)
	if err != nil {
		log.Fatal("failed to hash password: ", err)
		return
	}

	var userID int

	err = tx.QueryRow(context.Background(), `
		INSERT INTO users (email, password_hash, role)
		VALUES ($1, $2, 'admin')
		RETURNING user_id`,
		adminEmail, hashedPassword).
		Scan(&userID)
	if err != nil {
		log.Fatal("failed to create admin user: ", err)
		return
	}

	result, err := tx.Exec(context.Background(), `
		INSERT INTO profile (user_id) 
		VALUES ($1)
		RETURNING user_id`,
		userID)
	if err != nil {
		log.Fatal("failed to create admin user: ", err)
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		log.Fatal("no rows were inserted")
	}

	err = tx.Commit(ctx)
	if err != nil {
		log.Fatal("failed to commit transaction: ", err)
	}

	log.Printf("Admin '%s' created successfully", adminEmail)
	fmt.Println(userID)
}
