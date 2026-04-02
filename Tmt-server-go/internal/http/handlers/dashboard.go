package handlers

import (
	"net/http"

	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/response"
	"tmt-server-go/internal/services"
)

type DashboardHandler struct {
	dashboard *services.DashboardService
}

func NewDashboardHandler(dashboard *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboard: dashboard}
}

func (h *DashboardHandler) Summary(w http.ResponseWriter, r *http.Request) error {
	user, ok := middleware.GetUser(r)
	if !ok {
		response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
		return nil
	}

	data, err := h.dashboard.Summary(r.Context(), user)
	if err != nil {
		return err
	}

	response.SendSuccess(w, data, "Dashboard summary", http.StatusOK)
	return nil
}
