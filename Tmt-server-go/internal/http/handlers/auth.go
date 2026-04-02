package handlers

import (
	"encoding/json"
	"net/http"
	"net/mail"
	"strings"

	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/response"
	"tmt-server-go/internal/services"
)

type AuthHandler struct {
	auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) error {
	var input loginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.SendError(w, "Invalid JSON", http.StatusBadRequest, nil)
		return nil
	}

	if errs := validateLogin(input); len(errs) > 0 {
		response.SendError(w, "", http.StatusUnprocessableEntity, errs)
		return nil
	}

	result, err := h.auth.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		return err
	}

	response.SendSuccess(w, result, "Login successful", http.StatusOK)
	return nil
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}
	response.SendSuccess(w, user, "Authenticated user", http.StatusOK)
	return nil
}

func validateLogin(input loginInput) []string {
	var errs []string

	email := strings.TrimSpace(input.Email)
	if email == "" {
		errs = append(errs, "email: Invalid email address")
	} else if _, err := mail.ParseAddress(email); err != nil {
		errs = append(errs, "email: Invalid email address")
	}

	if strings.TrimSpace(input.Password) == "" {
		errs = append(errs, "password: Password is required")
	}

	return errs
}
