package services

import (
	"context"
	"net/mail"
	"strings"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/repositories"
	"tmt-server-go/internal/types"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	users *repositories.UserRepository
}

func NewUserService(users *repositories.UserRepository) *UserService {
	return &UserService{users: users}
}

type CreateUserInput struct {
	Name     string
	Email    string
	Password string
}

type UpdateUserInput struct {
	Name     *string
	Email    *string
	Password *string
}

type ChangePasswordInput struct {
	CurrentPassword string
	NewPassword     string
}

func (s *UserService) CreateUser(ctx context.Context, input CreateUserInput) (types.User, error) {
	if err := validateUserEmail(input.Email); err != nil {
		return types.User{}, err
	}
	exists, err := s.users.ExistsByEmail(ctx, input.Email)
	if err != nil {
		return types.User{}, err
	}
	if exists {
		return types.User{}, appErrors.AppError{StatusCode: 409, Message: `Email "` + input.Email + `" is already registered`}
	}

	hashed, err := hashPassword(input.Password)
	if err != nil {
		return types.User{}, err
	}

	return s.users.Create(ctx, struct {
		Name     string
		Email    string
		Password string
		Role     types.Role
	}{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashed,
		Role:     types.RoleEmployee,
	})
}

func (s *UserService) ListUsers(ctx context.Context, params pagination.CursorParams) (types.CursorResult[types.User], error) {
	return s.users.FindMany(ctx, params)
}

func (s *UserService) GetUser(ctx context.Context, id string) (types.User, error) {
	user, err := s.users.FindPublicById(ctx, id)
	if err != nil {
		return types.User{}, err
	}
	if user == nil {
		return types.User{}, appErrors.AppError{StatusCode: 404, Message: "User not found"}
	}
	return *user, nil
}

func (s *UserService) UpdateUser(ctx context.Context, id string, input UpdateUserInput) (types.User, error) {
	existing, err := s.users.FindById(ctx, id)
	if err != nil {
		return types.User{}, err
	}
	if existing == nil {
		return types.User{}, appErrors.AppError{StatusCode: 404, Message: "User not found"}
	}

	if input.Name == nil && input.Email == nil && input.Password == nil {
		return types.User{}, appErrors.AppError{StatusCode: 400, Message: "At least one field must be provided"}
	}

	if input.Email != nil {
		if err := validateUserEmail(*input.Email); err != nil {
			return types.User{}, err
		}
		ownerID, err := s.users.FindIDByEmail(ctx, *input.Email)
		if err != nil {
			return types.User{}, err
		}
		if ownerID != "" && ownerID != id {
			return types.User{}, appErrors.AppError{StatusCode: 409, Message: `Email "` + *input.Email + `" is already registered`}
		}
	}

	var hashed *string
	if input.Password != nil {
		h, err := hashPassword(*input.Password)
		if err != nil {
			return types.User{}, err
		}
		hashed = &h
	}

	return s.users.Update(ctx, id, struct {
		Name     *string
		Email    *string
		Password *string
		Role     *types.Role
	}{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashed,
		Role:     nil,
	})
}

func (s *UserService) DeleteUser(ctx context.Context, id string) error {
	user, err := s.users.FindById(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return appErrors.AppError{StatusCode: 404, Message: "User not found"}
	}
	if user.Email == "admin@tmt.com" || user.Name == "System Admin" {
		return appErrors.AppError{StatusCode: 403, Message: "System admin cannot be deleted"}
	}
	return s.users.Delete(ctx, id)
}

func (s *UserService) ChangePassword(ctx context.Context, userID string, input ChangePasswordInput) error {
	user, err := s.users.FindById(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil || user.Password == "" {
		return appErrors.AppError{StatusCode: 404, Message: "User not found"}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword)); err != nil {
		return appErrors.AppError{StatusCode: 400, Message: "Current password is incorrect"}
	}

	hashed, err := hashPassword(input.NewPassword)
	if err != nil {
		return err
	}
	_, err = s.users.Update(ctx, userID, struct {
		Name     *string
		Email    *string
		Password *string
		Role     *types.Role
	}{
		Password: &hashed,
	})
	return err
}

func hashPassword(pw string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

func validateUserEmail(email string) error {
	email = strings.TrimSpace(email)
	if email == "" {
		return appErrors.AppError{StatusCode: 422, Message: "email: Invalid email address"}
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return appErrors.AppError{StatusCode: 422, Message: "email: Invalid email address"}
	}
	return nil
}
