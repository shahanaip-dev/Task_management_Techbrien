package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

func Health(w http.ResponseWriter, r *http.Request) error {
	payload := map[string]any{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	return json.NewEncoder(w).Encode(payload)
}
