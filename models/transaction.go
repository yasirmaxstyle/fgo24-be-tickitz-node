package models

import (
	"context"
	"fmt"
	"log"
	"noir-backend/utils"
	"time"
)

// Models
type Transaction struct {
	TransactionID     int        `json:"transaction_id" db:"transaction_id"`
	TransactionCode   string     `json:"transaction_code" db:"transaction_code"`
	RecipientEmail    string     `json:"recipient_email" db:"recipient_email"`
	RecipientFullName string     `json:"recipient_full_name" db:"recipient_full_name"`
	RecipientPhone    string     `json:"recipient_phone_number" db:"recipient_phone_number"`
	TotalSeats        int        `json:"total_seats" db:"total_seats"`
	TotalAmount       float64    `json:"total_amount" db:"total_amount"`
	Status            string     `json:"status" db:"status"`
	CreatedAt         time.Time  `json:"created_at" db:"created_at"`
	ExpiresAt         time.Time  `json:"expires_at" db:"expires_at"`
	PaidAt            *time.Time `json:"paid_at" db:"paid_at"`
	CreatedBy         int        `json:"created_by" db:"created_by"`
	PaymentMethodID   int        `json:"payment_method_id" db:"payment_method_id"`
}

type Ticket struct {
	TicketID      int       `json:"ticket_id" db:"ticket_id"`
	TicketCode    string    `json:"ticket_code" db:"ticket_code"`
	ShowtimeID    int       `json:"showtime_id" db:"showtime_id"`
	SeatNumber    string    `json:"seat_number" db:"seat_number"`
	Status        string    `json:"status" db:"status"`
	TransactionID int       `json:"transaction_id" db:"transaction_id"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

type Showtime struct {
	ShowtimeID     int       `json:"showtime_id" db:"showtime_id"`
	MovieID        int       `json:"movie_id" db:"movie_id"`
	CinemaID       int       `json:"cinema_id" db:"cinema_id"`
	ShowDatetime   time.Time `json:"show_datetime" db:"show_datetime"`
	Price          float64   `json:"price" db:"price"`
	AvailableSeats int       `json:"available_seats" db:"available_seats"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type PaymentMethod struct {
	PaymentMethodID int    `json:"payment_method_id" db:"payment_method_id"`
	Name            string `json:"name" db:"name"`
	Code            string `json:"code" db:"code"`
	IsActive        bool   `json:"is_active" db:"is_active"`
}

func CreateTransaction(req CreateTransactionRequest, userID int) (*TransactionResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	var showtime Showtime
	err = tx.QueryRow(context.Background(), `
		SELECT showtime_id, movie_id, cinema_id, show_datetime, price, available_seats, created_at 
		FROM showtimes 
		WHERE showtime_id = $1`,
		req.ShowtimeID).Scan(
		&showtime.ShowtimeID, &showtime.MovieID, &showtime.CinemaID,
		&showtime.ShowDatetime, &showtime.Price, &showtime.AvailableSeats, &showtime.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("showtime not found: %w", err)
	}

	if len(req.SeatNumbers) > showtime.AvailableSeats {
		return nil, fmt.Errorf("not enough available seats")
	}

	bookedSeats := make([]string, 0)
	rows, err := tx.Query(context.Background(), `
		SELECT seat_number FROM tickets 
		WHERE showtime_id = $1 AND seat_number = ANY($2) AND status != 'cancelled'`,
		req.ShowtimeID, req.SeatNumbers)
	if err != nil {
		return nil, fmt.Errorf("failed to check seat availability: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var seat string
		if err := rows.Scan(&seat); err != nil {
			return nil, fmt.Errorf("failed to scan booked seat: %w", err)
		}
		bookedSeats = append(bookedSeats, seat)
	}

	if len(bookedSeats) > 0 {
		return nil, fmt.Errorf("seats already booked: %v", bookedSeats)
	}

	var paymentMethod PaymentMethod
	err = tx.QueryRow(context.Background(), `
		SELECT payment_method_id, name, code, is_active
		FROM payment_method
		WHERE payment_method_id = $1 AND is_active = true`,
		req.PaymentMethodID).Scan(
		&paymentMethod.PaymentMethodID, &paymentMethod.Name,
		&paymentMethod.Code, &paymentMethod.IsActive)
	if err != nil {
		return nil, fmt.Errorf("payment method not found or inactive: %w", err)
	}

	transactionCode := utils.GenerateTransactionCode()
	totalAmount := showtime.Price * float64(len(req.SeatNumbers))
	expiresAt := time.Now().Add(15 * time.Minute) // 15 minutes to complete payment

	var transaction Transaction
	err = tx.QueryRow(context.Background(), `
		INSERT INTO transactions (
			transaction_code, recipient_email, recipient_full_name, 
			recipient_phone_number, total_seats, total_amount, status, 
			created_at, expires_at, created_by, payment_method_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING transaction_id, transaction_code, recipient_email, recipient_full_name, 
		          recipient_phone_number, total_seats, total_amount, status, 
		          created_at, expires_at, created_by, payment_method_id`,
		transactionCode, req.RecipientEmail, req.RecipientFullName,
		req.RecipientPhone, len(req.SeatNumbers), totalAmount, "pending",
		time.Now(), expiresAt, userID, req.PaymentMethodID).Scan(
		&transaction.TransactionID, &transaction.TransactionCode, &transaction.RecipientEmail,
		&transaction.RecipientFullName, &transaction.RecipientPhone, &transaction.TotalSeats,
		&transaction.TotalAmount, &transaction.Status, &transaction.CreatedAt,
		&transaction.ExpiresAt, &transaction.CreatedBy, &transaction.PaymentMethodID)
	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	tickets := make([]Ticket, 0, len(req.SeatNumbers))
	for _, seatNumber := range req.SeatNumbers {
		ticketCode := utils.GenerateTicketCode()
		var ticket Ticket
		err = tx.QueryRow(context.Background(), `
			INSERT INTO tickets (ticket_code, showtime_id, seat_number, status, transaction_id, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING ticket_id, ticket_code, showtime_id, seat_number, status, transaction_id, created_at`,
			ticketCode, req.ShowtimeID, seatNumber, "booked", transaction.TransactionID, time.Now()).Scan(
			&ticket.TicketID, &ticket.TicketCode, &ticket.ShowtimeID, &ticket.SeatNumber,
			&ticket.Status, &ticket.TransactionID, &ticket.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to create ticket for seat %s: %w", seatNumber, err)
		}
		tickets = append(tickets, ticket)
	}

	_, err = tx.Exec(context.Background(), `
		UPDATE showtimes 
		SET available_seats = available_seats - $1 
		WHERE showtime_id = $2`,
		len(req.SeatNumbers), req.ShowtimeID)
	if err != nil {
		return nil, fmt.Errorf("failed to update available seats: %w", err)
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &TransactionResponse{
		Transaction: transaction,
		Tickets:     tickets,
	}, nil
}

func ProcessPayment(req ProcessPaymentRequest) (*TransactionResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	var transaction Transaction
	err = tx.QueryRow(context.Background(), `
		SELECT transaction_id, transaction_code, recipient_email, recipient_full_name, 
		       recipient_phone_number, total_seats, total_amount, status, 
		       created_at, expires_at, paid_at, created_by, payment_method_id
		FROM transactions 
		WHERE transaction_code = $1`,
		req.TransactionCode).Scan(
		&transaction.TransactionID, &transaction.TransactionCode, &transaction.RecipientEmail,
		&transaction.RecipientFullName, &transaction.RecipientPhone, &transaction.TotalSeats,
		&transaction.TotalAmount, &transaction.Status, &transaction.CreatedAt,
		&transaction.ExpiresAt, &transaction.PaidAt, &transaction.CreatedBy, &transaction.PaymentMethodID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	if transaction.Status != "pending" {
		return nil, fmt.Errorf("transaction is not pending")
	}

	if time.Now().After(transaction.ExpiresAt) {
		_, err = CancelTransaction(req.TransactionCode)
		if err != nil {
			return nil, fmt.Errorf("transaction expired and failed to cancel: %w", err)
		}
		return nil, fmt.Errorf("transaction has expired")
	}

	now := time.Now()
	_, err = tx.Exec(context.Background(), `
		UPDATE transactions 
		SET status = 'paid', paid_at = $1 
		WHERE transaction_id = $2`,
		now, transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to update transaction status: %w", err)
	}

	transaction.Status = "paid"
	transaction.PaidAt = &now

	tickets := make([]Ticket, 0)
	rows, err := tx.Query(context.Background(), `
		SELECT ticket_id, ticket_code, showtime_id, seat_number, status, transaction_id, created_at
		FROM tickets 
		WHERE transaction_id = $1`,
		transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tickets: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ticket Ticket
		if err := rows.Scan(&ticket.TicketID, &ticket.TicketCode, &ticket.ShowtimeID,
			&ticket.SeatNumber, &ticket.Status, &ticket.TransactionID, &ticket.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, ticket)
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &TransactionResponse{
		Transaction: transaction,
		Tickets:     tickets,
	}, nil
}

func CancelTransaction(transactionCode string) (*TransactionResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	var transaction Transaction
	err = tx.QueryRow(context.Background(), `
		SELECT transaction_id, transaction_code, recipient_email, recipient_full_name, 
		       recipient_phone_number, total_seats, total_amount, status, 
		       created_at, expires_at, paid_at, created_by, payment_method_id
		FROM transactions 
		WHERE transaction_code = $1`,
		transactionCode).Scan(
		&transaction.TransactionID, &transaction.TransactionCode, &transaction.RecipientEmail,
		&transaction.RecipientFullName, &transaction.RecipientPhone, &transaction.TotalSeats,
		&transaction.TotalAmount, &transaction.Status, &transaction.CreatedAt,
		&transaction.ExpiresAt, &transaction.PaidAt, &transaction.CreatedBy, &transaction.PaymentMethodID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	if transaction.Status == "paid" {
		return nil, fmt.Errorf("cannot cancel paid transaction")
	}

	if transaction.Status == "cancelled" {
		return nil, fmt.Errorf("transaction already cancelled")
	}

	var showtimeID int
	err = tx.QueryRow(context.Background(), `
		SELECT showtime_id FROM tickets 
		WHERE transaction_id = $1 LIMIT 1`,
		transaction.TransactionID).Scan(&showtimeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get showtime: %w", err)
	}

	_, err = tx.Exec(context.Background(), `
		UPDATE transactions 
		SET status = 'cancelled' 
		WHERE transaction_id = $1`,
		transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel transaction: %w", err)
	}

	_, err = tx.Exec(context.Background(), `
		UPDATE tickets 
		SET status = 'cancelled' 
		WHERE transaction_id = $1`,
		transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to cancel tickets: %w", err)
	}

	_, err = tx.Exec(context.Background(), `
		UPDATE showtimes 
		SET available_seats = available_seats + $1 
		WHERE showtime_id = $2`,
		transaction.TotalSeats, showtimeID)
	if err != nil {
		return nil, fmt.Errorf("failed to release seats: %w", err)
	}

	transaction.Status = "cancelled"

	tickets := make([]Ticket, 0)
	rows, err := tx.Query(context.Background(), `
		SELECT ticket_id, ticket_code, showtime_id, seat_number, status, transaction_id, created_at
		FROM tickets 
		WHERE transaction_id = $1`,
		transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tickets: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ticket Ticket
		if err := rows.Scan(&ticket.TicketID, &ticket.TicketCode, &ticket.ShowtimeID,
			&ticket.SeatNumber, &ticket.Status, &ticket.TransactionID, &ticket.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, ticket)
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &TransactionResponse{
		Transaction: transaction,
		Tickets:     tickets,
	}, nil
}

func GetTransactionByCode(transactionCode string) (*TransactionResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	var transaction Transaction
	err = conn.QueryRow(context.Background(), `
		SELECT transaction_id, transaction_code, recipient_email, recipient_full_name, 
		       recipient_phone_number, total_seats, total_amount, status, 
		       created_at, expires_at, paid_at, created_by, payment_method_id
		FROM transactions 
		WHERE transaction_code = $1`,
		transactionCode).Scan(
		&transaction.TransactionID, &transaction.TransactionCode, &transaction.RecipientEmail,
		&transaction.RecipientFullName, &transaction.RecipientPhone, &transaction.TotalSeats,
		&transaction.TotalAmount, &transaction.Status, &transaction.CreatedAt,
		&transaction.ExpiresAt, &transaction.PaidAt, &transaction.CreatedBy, &transaction.PaymentMethodID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	// Get tickets
	tickets := make([]Ticket, 0)
	rows, err := conn.Query(context.Background(), `
		SELECT ticket_id, ticket_code, showtime_id, seat_number, status, transaction_id, created_at
		FROM tickets 
		WHERE transaction_id = $1`,
		transaction.TransactionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tickets: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var ticket Ticket
		if err := rows.Scan(&ticket.TicketID, &ticket.TicketCode, &ticket.ShowtimeID,
			&ticket.SeatNumber, &ticket.Status, &ticket.TransactionID, &ticket.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan ticket: %w", err)
		}
		tickets = append(tickets, ticket)
	}

	return &TransactionResponse{
		Transaction: transaction,
		Tickets:     tickets,
	}, nil
}

func CancelExpiredTransactions() error {
	conn, err := utils.ConnectDB()
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	rows, err := tx.Query(context.Background(), `
		SELECT transaction_code, total_seats, 
		       (SELECT showtime_id FROM tickets WHERE transaction_id = t.transaction_id LIMIT 1) as showtime_id
		FROM transactions t
		WHERE status = 'pending' AND expires_at < NOW()`)
	if err != nil {
		return fmt.Errorf("failed to get expired transactions: %w", err)
	}
	defer rows.Close()

	expiredTransactions := make([]struct {
		Code       string
		TotalSeats int
		ShowtimeID int
	}, 0)

	for rows.Next() {
		var exp struct {
			Code       string
			TotalSeats int
			ShowtimeID int
		}
		if err := rows.Scan(&exp.Code, &exp.TotalSeats, &exp.ShowtimeID); err != nil {
			return fmt.Errorf("failed to scan expired transaction: %w", err)
		}
		expiredTransactions = append(expiredTransactions, exp)
	}

	for _, exp := range expiredTransactions {
		_, err = tx.Exec(context.Background(), `
			UPDATE transactions 
			SET status = 'cancelled' 
			WHERE transaction_code = $1`,
			exp.Code)
		if err != nil {
			log.Printf("Failed to cancel expired transaction %s: %v", exp.Code, err)
			continue
		}

		_, err = tx.Exec(context.Background(), `
			UPDATE tickets 
			SET status = 'cancelled' 
			WHERE transaction_id = (SELECT transaction_id FROM transactions WHERE transaction_code = $1)`,
			exp.Code)
		if err != nil {
			log.Printf("Failed to cancel tickets for transaction %s: %v", exp.Code, err)
			continue
		}

		_, err = tx.Exec(context.Background(), `
			UPDATE showtimes 
			SET available_seats = available_seats + $1 
			WHERE showtime_id = $2`,
			exp.TotalSeats, exp.ShowtimeID)
		if err != nil {
			log.Printf("Failed to release seats for transaction %s: %v", exp.Code, err)
			continue
		}

		log.Printf("Successfully cancelled expired transaction: %s", exp.Code)
	}

	return tx.Commit(context.Background())
}
