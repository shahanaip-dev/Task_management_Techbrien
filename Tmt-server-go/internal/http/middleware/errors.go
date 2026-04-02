package middleware

import (
	"errors"
	"net/http"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/response"

	"github.com/jackc/pgx/v5/pgconn"
)

type AppHandler func(w http.ResponseWriter, r *http.Request) error

func Wrap(h AppHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := h(w, r); err != nil {
			HandleError(w, err)
		}
	}
}

func HandleError(w http.ResponseWriter, err error) {
	var appErr appErrors.AppError
	if errors.As(err, &appErr) {
		response.SendError(w, appErr.Message, appErr.StatusCode, nil)
		return
	}

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505":
			response.SendError(w, "Duplicate value: "+pgErr.Detail, http.StatusConflict, nil)
			return
		case "23503":
			response.SendError(w, "Referenced record does not exist", http.StatusBadRequest, nil)
			return
		}
	}

	response.SendError(w, "Internal server error", http.StatusInternalServerError, nil)
}
