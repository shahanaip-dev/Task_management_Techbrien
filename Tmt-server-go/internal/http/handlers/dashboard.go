package handlers

import (
	"net/http"

	"tmt-server-go/internal/response"
)

func DashboardSummary(w http.ResponseWriter, r *http.Request) error {
	response.SendError(w, "Not implemented", http.StatusNotImplemented, nil)
	return nil
}
