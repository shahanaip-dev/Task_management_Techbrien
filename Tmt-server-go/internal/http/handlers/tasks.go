package handlers

import (
	"net/http"

	"tmt-server-go/internal/response"
)

func CreateTask(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func ListTasks(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func GetTask(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func UpdateTask(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func AssignTask(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func DeleteTask(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}
