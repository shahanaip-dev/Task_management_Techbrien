package services

import (
	"context"
	"strings"

	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/repositories"
	"tmt-server-go/internal/types"
)

type ProjectService struct {
	projects *repositories.ProjectRepository
}

func NewProjectService(projects *repositories.ProjectRepository) *ProjectService {
	return &ProjectService{projects: projects}
}

type CreateProjectInput struct {
	Name        string   `json:"name"`
	Description *string  `json:"description"`
	MemberIDs   []string `json:"memberIds"`
}

type UpdateProjectInput struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	MemberIDs   *[]string `json:"memberIds"`
}

func (s *ProjectService) CreateProject(ctx context.Context, input CreateProjectInput, createdBy string) (types.Project, error) {
	if strings.TrimSpace(input.Name) == "" {
		return types.Project{}, appErrors.AppError{StatusCode: 422, Message: "name: Project name is required"}
	}
	return s.projects.Create(ctx, struct {
		Name        string
		Description *string
		CreatedBy   string
		MemberIDs   []string
	}{
		Name:        input.Name,
		Description: input.Description,
		CreatedBy:   createdBy,
		MemberIDs:   input.MemberIDs,
	})
}

func (s *ProjectService) ListProjects(ctx context.Context, params pagination.CursorParams, user types.JwtUser, name string) (types.CursorResult[types.Project], error) {
	if user.Role == types.RoleAdmin {
		return s.projects.FindMany(ctx, params, name)
	}
	return s.projects.FindManyForUser(ctx, user.ID, params, name)
}

func (s *ProjectService) GetProject(ctx context.Context, id string, user types.JwtUser) (types.Project, error) {
	var project *types.Project
	var err error
	if user.Role == types.RoleAdmin {
		project, err = s.projects.FindByIDWithCreator(ctx, id)
	} else {
		project, err = s.projects.FindByIDWithCreatorForUser(ctx, id, user.ID)
	}
	if err != nil {
		return types.Project{}, err
	}
	if project == nil {
		return types.Project{}, appErrors.AppError{StatusCode: 404, Message: "Project not found"}
	}
	return *project, nil
}

func (s *ProjectService) UpdateProject(ctx context.Context, id string, input UpdateProjectInput) (types.Project, error) {
	existing, err := s.projects.FindByID(ctx, id)
	if err != nil {
		return types.Project{}, err
	}
	if existing == nil {
		return types.Project{}, appErrors.AppError{StatusCode: 404, Message: "Project not found"}
	}
	return s.projects.Update(ctx, id, struct {
		Name        *string
		Description *string
		MemberIDs   *[]string
	}{
		Name:        input.Name,
		Description: input.Description,
		MemberIDs:   input.MemberIDs,
	})
}

func (s *ProjectService) DeleteProject(ctx context.Context, id string) error {
	existing, err := s.projects.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return appErrors.AppError{StatusCode: 404, Message: "Project not found"}
	}
	return s.projects.Delete(ctx, id)
}
