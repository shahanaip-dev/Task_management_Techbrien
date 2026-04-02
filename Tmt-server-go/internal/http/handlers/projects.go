package handlers

import (
	"encoding/json"
	"net/http"

	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/response"
	"tmt-server-go/internal/services"
	"tmt-server-go/internal/types"

	"github.com/go-chi/chi/v5"
)

type ProjectHandler struct {
	projects *services.ProjectService
}

func NewProjectHandler(projects *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{projects: projects}
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	var input services.CreateProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	project, err := h.projects.CreateProject(r.Context(), input, user.ID)
	if err != nil {
		return err
	}

	response.SendCreated(w, project, "Project created")
	return nil
}

func (h *ProjectHandler) ListProjects(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	q := r.URL.Query()
	params := pagination.ParseCursorParams(q.Get("limit"), q.Get("cursor"))

	result, err := h.projects.ListProjects(r.Context(), params, user, "")
	if err != nil {
		return err
	}

	response.SendSuccess(w, result, "", http.StatusOK)
	return nil
}

func (h *ProjectHandler) GetProject(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}
	id := chi.URLParam(r, "id")

	project, err := h.projects.GetProject(r.Context(), id, user)
	if err != nil {
		return err
	}

	response.SendSuccess(w, project, "", http.StatusOK)
	return nil
}

func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}
	if user.Role != types.RoleAdmin {
		response.SendError(w, "Forbidden: insufficient permissions", http.StatusForbidden, nil)
		return nil
	}

	var input services.UpdateProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	project, err := h.projects.UpdateProject(r.Context(), id, input)
	if err != nil {
		return err
	}

	response.SendSuccess(w, project, "Project updated", http.StatusOK)
	return nil
}

func (h *ProjectHandler) DeleteProject(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}
	if user.Role != types.RoleAdmin {
		response.SendError(w, "Forbidden: insufficient permissions", http.StatusForbidden, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	if err := h.projects.DeleteProject(r.Context(), id); err != nil {
		return err
	}

	response.SendSuccess[any](w, nil, "Project deleted", http.StatusOK)
	return nil
}
