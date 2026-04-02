package handlers

import (
	"net/http"

	"tmt-server-go/internal/response"
)

func CreateUser(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func ListUsers(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func GetUser(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func UpdateUser(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func DeleteUser(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func ChangePassword(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}
