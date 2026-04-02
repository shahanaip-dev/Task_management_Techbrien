package handlers

import (
	"encoding/json"
	"net/http"
	"net/mail"
	"strings"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/response"
	"tmt-server-go/internal/services"

	"github.com/go-chi/chi/v5"
)

type UserHandler struct {
	users *services.UserService
}

func NewUserHandler(users *services.UserService) *UserHandler {
	return &UserHandler{users: users}
}

type createUserInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) error {
	var input createUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	var errs []string
	if strings.TrimSpace(input.Name) == "" {
		errs = append(errs, "name: Name is required")
	}
	email := strings.TrimSpace(input.Email)
	if email == "" {
		errs = append(errs, "email: Invalid email address")
	} else if _, err := mail.ParseAddress(email); err != nil {
		errs = append(errs, "email: Invalid email address")
	}
	if strings.TrimSpace(input.Password) == "" {
		errs = append(errs, "password: Password is required")
	}
	if len(errs) > 0 {
		response.SendError(w, "", http.StatusUnprocessableEntity, errs)
		return nil
	}

	user, err := h.users.CreateUser(r.Context(), services.CreateUserInput{
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		return err
	}

	response.SendCreated(w, user, "User created successfully")
	return nil
}

func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) error {
	q := r.URL.Query()
	params := pagination.ParseCursorParams(q.Get("limit"), q.Get("cursor"))

	result, err := h.users.ListUsers(r.Context(), params)
	if err != nil {
		return err
	}

	response.SendSuccess(w, result, "", http.StatusOK)
	return nil
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) error {
	id := chi.URLParam(r, "id")
	user, err := h.users.GetUser(r.Context(), id)
	if err != nil {
		return err
	}
	response.SendSuccess(w, user, "", http.StatusOK)
	return nil
}

type updateUserInput struct {
	Name     *string `json:"name"`
	Email    *string `json:"email"`
	Password *string `json:"password"`
}

func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) error {
	var input updateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	if input.Name == nil && input.Email == nil && input.Password == nil {
		return appErrors.AppError{StatusCode: 400, Message: "At least one field must be provided"}
	}

	if input.Email != nil {
		email := strings.TrimSpace(*input.Email)
		if email == "" {
			return appErrors.AppError{StatusCode: 422, Message: "email: Invalid email address"}
		}
		if _, err := mail.ParseAddress(email); err != nil {
			return appErrors.AppError{StatusCode: 422, Message: "email: Invalid email address"}
		}
	}

	id := chi.URLParam(r, "id")
	user, err := h.users.UpdateUser(r.Context(), id, services.UpdateUserInput{
		Name:     input.Name,
		Email:    input.Email,
		Password: input.Password,
	})
	if err != nil {
		return err
	}

	response.SendSuccess(w, user, "User updated successfully", http.StatusOK)
	return nil
}

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	id := chi.URLParam(r, "id")
	if user.ID == id {
		return appErrors.AppError{StatusCode: 400, Message: "You cannot delete your own account"}
	}

	if err := h.users.DeleteUser(r.Context(), id); err != nil {
		return err
	}

	response.SendSuccess[any](w, nil, "User deleted successfully", http.StatusOK)
	return nil
}

type changePasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	var input changePasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	var errs []string
	if strings.TrimSpace(input.CurrentPassword) == "" {
		errs = append(errs, "currentPassword: Current password is required")
	}
	if strings.TrimSpace(input.NewPassword) == "" {
		errs = append(errs, "newPassword: New password is required")
	}
	if len(errs) > 0 {
		response.SendError(w, "", http.StatusUnprocessableEntity, errs)
		return nil
	}

	if err := h.users.ChangePassword(r.Context(), user.ID, services.ChangePasswordInput{
		CurrentPassword: input.CurrentPassword,
		NewPassword:     input.NewPassword,
	}); err != nil {
		return err
	}

	response.SendSuccess[any](w, nil, "Password updated", http.StatusOK)
	return nil
}
