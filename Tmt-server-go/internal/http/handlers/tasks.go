package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/response"
	"tmt-server-go/internal/services"
	"tmt-server-go/internal/types"

	"github.com/go-chi/chi/v5"
)

type TaskHandler struct {
	tasks *services.TaskService
}

func NewTaskHandler(tasks *services.TaskService) *TaskHandler {
	return &TaskHandler{tasks: tasks}
}

func (h *TaskHandler) CreateTask(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	var input services.CreateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	task, err := h.tasks.CreateTask(r.Context(), input, user)
	if err != nil {
		return err
	}

	response.SendCreated(w, task, "Task created")
	return nil
}

func (h *TaskHandler) ListTasks(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	q := r.URL.Query()
	params := pagination.ParseCursorParams(q.Get("limit"), q.Get("cursor"))

	filters := types.TaskFilters{
		ProjectID:   strings.TrimSpace(q.Get("projectId")),
		Status:      types.TaskStatus(strings.TrimSpace(q.Get("status"))),
		AssignedTo:  strings.TrimSpace(q.Get("assignedTo")),
		Title:       strings.TrimSpace(q.Get("title")),
		Description: strings.TrimSpace(q.Get("description")),
		DueDate:     strings.TrimSpace(q.Get("dueDate")),
	}

	result, err := h.tasks.ListTasks(r.Context(), params, user, filters)
	if err != nil {
		return err
	}

	response.SendSuccess(w, result, "", http.StatusOK)
	return nil
}

func (h *TaskHandler) GetTask(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	task, err := h.tasks.GetTask(r.Context(), id, user)
	if err != nil {
		return err
	}

	response.SendSuccess(w, task, "", http.StatusOK)
	return nil
}

func (h *TaskHandler) UpdateTask(w http.ResponseWriter, r *http.Request) error {
	var input services.UpdateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	task, err := h.tasks.UpdateTask(r.Context(), id, input)
	if err != nil {
		return err
	}

	response.SendSuccess(w, task, "Task updated", http.StatusOK)
	return nil
}

func (h *TaskHandler) AssignTask(w http.ResponseWriter, r *http.Request) error {
	var input services.AssignTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	if strings.TrimSpace(input.AssignedTo) == "" {
		response.SendError(w, "assignedTo: User is required", http.StatusUnprocessableEntity, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	task, err := h.tasks.AssignTask(r.Context(), id, input)
	if err != nil {
		return err
	}

	response.SendSuccess(w, task, "Task assigned", http.StatusOK)
	return nil
}

func (h *TaskHandler) DeleteTask(w http.ResponseWriter, r *http.Request) error {
	id := chi.URLParam(r, "id")
	if err := h.tasks.DeleteTask(r.Context(), id); err != nil {
		return err
	}

	response.SendSuccess[any](w, nil, "Task deleted", http.StatusOK)
	return nil
}
