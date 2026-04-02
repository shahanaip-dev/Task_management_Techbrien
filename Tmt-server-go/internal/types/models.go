package types

import "time"

type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	Password  string    `json:"-"`
}

type Project struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	CreatedBy   string     `json:"createdBy"`
	CreatedAt   time.Time  `json:"createdAt"`
	Creator     *UserBrief `json:"creator,omitempty"`
	TaskCount   int        `json:"taskCount,omitempty"`
	MemberIDs   []string   `json:"memberIds,omitempty"`
}

type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Status      TaskStatus `json:"status"`
	ProjectID   string     `json:"projectId"`
	AssignedTo  *string    `json:"assignedTo"`
	DueDate     *time.Time `json:"dueDate"`
	CreatedAt   time.Time  `json:"createdAt"`
	Project     *ProjectBrief `json:"project,omitempty"`
	Assignee    *UserBrief    `json:"assignee,omitempty"`
}

type UserBrief struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type ProjectBrief struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CursorMeta struct {
	Limit      int     `json:"limit"`
	HasMore    bool    `json:"hasMore"`
	NextCursor *string `json:"nextCursor,omitempty"`
}

type CursorResult[T any] struct {
	Data []T       `json:"data"`
	Meta CursorMeta `json:"meta"`
}

type TaskFilters struct {
	ProjectID   string
	Status      TaskStatus
	AssignedTo  string
	Title       string
	Description string
	DueDate      string
}
