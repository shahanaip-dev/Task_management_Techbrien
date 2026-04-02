package types

type Role string

const (
	RoleAdmin    Role = "ADMIN"
	RoleEmployee Role = "EMPLOYEE"
)

type TaskStatus string

const (
	TaskTodo       TaskStatus = "TODO"
	TaskInProgress TaskStatus = "IN_PROGRESS"
	TaskDone       TaskStatus = "DONE"
)

type JwtUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  Role   `json:"role"`
}

type JwtClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Role  Role   `json:"role"`
}

type ApiResponse[T any] struct {
	Success bool     `json:"success"`
	Message string   `json:"message,omitempty"`
	Data    T        `json:"data,omitempty"`
	Errors  []string `json:"errors,omitempty"`
}
