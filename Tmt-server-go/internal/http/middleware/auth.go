package middleware

import (
	"context"
	"net/http"
	"strings"

	"tmt-server-go/internal/response"
	"tmt-server-go/internal/types"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const userKey contextKey = "authUser"

func Authenticate(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				response.SendError(w, "Authentication required", http.StatusUnauthorized, nil)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			claims := jwt.MapClaims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				response.SendError(w, "Invalid or expired token", http.StatusUnauthorized, nil)
				return
			}

			user := types.JwtUser{
				ID:    toString(claims["sub"]),
				Email: toString(claims["email"]),
				Role:  types.Role(toString(claims["role"])),
			}

			ctx := context.WithValue(r.Context(), userKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUser(r *http.Request) (types.JwtUser, bool) {
	u, ok := r.Context().Value(userKey).(types.JwtUser)
	return u, ok
}

func toString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
