package services

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	users      *repositories.UserRepository
	jwtSecret  string
	expiresIn  string
}

type AuthUser struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
}

type LoginResult struct {
	Token string   `json:"token"`
	User  AuthUser `json:"user"`
}

func NewAuthService(users *repositories.UserRepository, jwtSecret, expiresIn string) *AuthService {
	return &AuthService{users: users, jwtSecret: jwtSecret, expiresIn: expiresIn}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (LoginResult, error) {
	const invalid = "Invalid email or password"

	user, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return LoginResult{}, err
	}
	if user == nil || user.Password == "" {
		return LoginResult{}, appErrors.AppError{StatusCode: 401, Message: invalid}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return LoginResult{}, appErrors.AppError{StatusCode: 401, Message: invalid}
	}

	token, err := signToken(s.jwtSecret, s.expiresIn, user.ID, user.Email, string(user.Role))
	if err != nil {
		return LoginResult{}, err
	}

	return LoginResult{
		Token: token,
		User: AuthUser{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      string(user.Role),
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func signToken(secret, expiresIn, userID, email, role string) (string, error) {
	dur, err := parseDuration(expiresIn)
	if err != nil {
		return "", err
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"sub":   userID,
		"email": email,
		"role":  role,
		"iat":   now.Unix(),
		"exp":   now.Add(dur).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func parseDuration(s string) (time.Duration, error) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 8 * time.Hour, nil
	}
	if d, err := time.ParseDuration(s); err == nil {
		return d, nil
	}
	if strings.HasSuffix(s, "d") {
		n, err := strconv.Atoi(strings.TrimSuffix(s, "d"))
		if err != nil {
			return 0, err
		}
		return time.Duration(n) * 24 * time.Hour, nil
	}
	return 0, errors.New("invalid JWT_EXPIRES_IN")
}
