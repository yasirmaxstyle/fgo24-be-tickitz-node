package utils

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

func GenerateTransactionCode() string {
	return fmt.Sprintf("TXN-%d-%s", time.Now().Unix(), uuid.New().String()[:8])
}

func GenerateTicketCode() string {
	return fmt.Sprintf("TKT-%d-%s", time.Now().Unix(), uuid.New().String()[:8])
}
