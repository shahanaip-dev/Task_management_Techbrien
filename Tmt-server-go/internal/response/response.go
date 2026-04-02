package response

import (
	"encoding/json"
	"net/http"

	"tmt-server-go/internal/types"
)

func SendSuccess[T any](w http.ResponseWriter, data T, message string, status int) {
	if message == "" {
		message = "Success"
	}
	body := types.ApiResponse[T]{Success: true, Message: message, Data: data}
	writeJSON(w, status, body)
}

func SendCreated[T any](w http.ResponseWriter, data T, message string) {
	if message == "" {
		message = "Created"
	}
	SendSuccess(w, data, message, http.StatusCreated)
}

func SendError(w http.ResponseWriter, message string, status int, errors []string) {
	if status == 0 {
		status = http.StatusBadRequest
	}
	body := types.ApiResponse[any]{Success: false, Message: message, Errors: errors}
	writeJSON(w, status, body)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
