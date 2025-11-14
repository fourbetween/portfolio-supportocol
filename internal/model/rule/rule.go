package rule

import "time"

type Rule struct {
	ID          string
	Name        string
	Description string
	CreatedBy   string
	CreatedAt   time.Time
}
