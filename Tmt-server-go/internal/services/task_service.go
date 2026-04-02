package services

import (
	"context"
	"errors"
	"strings"
	"time"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/repositories"
	"tmt-server-go/internal/types"
)

type TaskService struct {
	tasks    *repositories.TaskRepository
	projects *repositories.ProjectRepository
	users    *repositories.UserRepository
}

func NewTaskService(tasks *repositories.TaskRepository, projects *repositories.ProjectRepository, users *repositories.UserRepository) *TaskService {
	return &TaskService{tasks: tasks, projects: projects, users: users}
}

type CreateTaskInput struct {
	Title       string  `json:"title"`
	Description *string `json:"description"`
	ProjectID   string  `json:"projectId"`
	AssignedTo  *string `json:"assignedTo"`
	DueDate     *string `json:"dueDate"`
}

type UpdateTaskInput struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	AssignedTo  *string `json:"assignedTo"`
	DueDate     *string `json:"dueDate"`
}

type AssignTaskInput struct {
	AssignedTo string `json:"assignedTo"`
}

func (s *TaskService) CreateTask(ctx context.Context, input CreateTaskInput, user types.JwtUser) (types.Task, error) {
	if strings.TrimSpace(input.Title) == "" {
		return types.Task{}, appErrors.AppError{StatusCode: 422, Message: "title: Title is required"}
	}
	if strings.TrimSpace(input.ProjectID) == "" {
		return types.Task{}, appErrors.AppError{StatusCode: 422, Message: "projectId: Project is required"}
	}

	project, err := s.projects.FindByID(ctx, input.ProjectID)
	if err != nil {
		return types.Task{}, err
	}
	if project == nil {
		return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Project not found"}
	}

	finalAssigned := input.AssignedTo
	if finalAssigned == nil || strings.TrimSpace(*finalAssigned) == "" {
		finalAssigned = &user.ID
	}

	if finalAssigned != nil && strings.TrimSpace(*finalAssigned) != "" {
		assignee, err := s.users.FindById(ctx, *finalAssigned)
		if err != nil {
			return types.Task{}, err
		}
		if assignee == nil {
			return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Assigned user not found"}
		}
	}

	var due *time.Time
	if input.DueDate != nil && strings.TrimSpace(*input.DueDate) != "" {
		parsed, err := parseDate(*input.DueDate)
		if err != nil {
			return types.Task{}, appErrors.AppError{StatusCode: 422, Message: "dueDate: Invalid date format"}
		}
		due = &parsed
	}

	return s.tasks.Create(ctx, struct {
		Title       string
		Description *string
		ProjectID   string
		AssignedTo  *string
		DueDate     *time.Time
	}{
		Title:       input.Title,
		Description: input.Description,
		ProjectID:   input.ProjectID,
		AssignedTo:  finalAssigned,
		DueDate:     due,
	})
}

func (s *TaskService) ListTasks(ctx context.Context, params pagination.CursorParams, user types.JwtUser, filters types.TaskFilters) (types.CursorResult[types.Task], error) {
	return s.tasks.FindMany(ctx, filters, params)
}

func (s *TaskService) GetTask(ctx context.Context, id string, user types.JwtUser) (types.Task, error) {
	task, err := s.tasks.FindByIDWithRelations(ctx, id)
	if err != nil {
		return types.Task{}, err
	}
	if task == nil {
		return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Task not found"}
	}
	return *task, nil
}

func (s *TaskService) UpdateTask(ctx context.Context, id string, input UpdateTaskInput) (types.Task, error) {
	task, err := s.tasks.FindByID(ctx, id)
	if err != nil {
		return types.Task{}, err
	}
	if task == nil {
		return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Task not found"}
	}

	var status *types.TaskStatus
	if input.Status != nil && strings.TrimSpace(*input.Status) != "" {
		sv := types.TaskStatus(strings.TrimSpace(*input.Status))
		if sv != types.TaskTodo && sv != types.TaskInProgress && sv != types.TaskDone {
			return types.Task{}, appErrors.AppError{StatusCode: 422, Message: "status: Invalid status"}
		}
		status = &sv
	}

	if input.AssignedTo != nil && strings.TrimSpace(*input.AssignedTo) != "" {
		user, err := s.users.FindById(ctx, *input.AssignedTo)
		if err != nil {
			return types.Task{}, err
		}
		if user == nil {
			return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Assigned user not found"}
		}
	}

	var due **time.Time
	if input.DueDate != nil {
		if strings.TrimSpace(*input.DueDate) == "" {
			empty := (*time.Time)(nil)
			due = &empty
		} else {
			parsed, err := parseDate(*input.DueDate)
			if err != nil {
				return types.Task{}, appErrors.AppError{StatusCode: 422, Message: "dueDate: Invalid date format"}
			}
			parsedPtr := &parsed
			due = &parsedPtr
		}
	}

	return s.tasks.Update(ctx, id, struct {
		Title       *string
		Description *string
		Status      *types.TaskStatus
		AssignedTo  *string
		DueDate     **time.Time
	}{
		Title:       input.Title,
		Description: input.Description,
		Status:      status,
		AssignedTo:  input.AssignedTo,
		DueDate:     due,
	})
}

func (s *TaskService) AssignTask(ctx context.Context, id string, input AssignTaskInput) (types.Task, error) {
	task, err := s.tasks.FindByID(ctx, id)
	if err != nil {
		return types.Task{}, err
	}
	if task == nil {
		return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "Task not found"}
	}

	assignee, err := s.users.FindById(ctx, input.AssignedTo)
	if err != nil {
		return types.Task{}, err
	}
	if assignee == nil {
		return types.Task{}, appErrors.AppError{StatusCode: 404, Message: "User not found"}
	}

	return s.tasks.Update(ctx, id, struct {
		Title       *string
		Description *string
		Status      *types.TaskStatus
		AssignedTo  *string
		DueDate     **time.Time
	}{
		AssignedTo: &input.AssignedTo,
	})
}

func (s *TaskService) DeleteTask(ctx context.Context, id string) error {
	task, err := s.tasks.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if task == nil {
		return appErrors.AppError{StatusCode: 404, Message: "Task not found"}
	}
	return s.tasks.Delete(ctx, id)
}

func parseDate(s string) (time.Time, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return time.Time{}, errors.New("empty date")
	}
	if t, err := time.Parse(time.RFC3339, s); err == nil {
		return t, nil
	}
	if t, err := time.Parse("2006-01-02", s); err == nil {
		return t, nil
	}
	return time.Time{}, errors.New("invalid date")
}
