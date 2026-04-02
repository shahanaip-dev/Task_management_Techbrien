package handlers

import (
	"net/http"

	"tmt-server-go/internal/response"
)

func CreateProject(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func ListProjects(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func GetProject(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func UpdateProject(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}

func DeleteProject(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}
