package middleware

import (
	"net/http"

	"tmt-server-go/internal/response"
	"tmt-server-go/internal/types"
)

func Authorize(allowed ...types.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := GetUser(r)
			if !ok {
				response.SendError(w, "Unauthenticated", http.StatusUnauthorized, nil)
				return
			}

			for _, role := range allowed {
				if user.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			response.SendError(w, "Forbidden: insufficient permissions", http.StatusForbidden, nil)
		})
	}
}
