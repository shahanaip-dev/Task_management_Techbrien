package httpserver

import (
	"net/http"

	"tmt-server-go/internal/config"
	appErrors "tmt-server-go/internal/errors"
	"tmt-server-go/internal/http/handlers"
	"tmt-server-go/internal/http/middleware"
	"tmt-server-go/internal/repositories"
	"tmt-server-go/internal/services"
	"tmt-server-go/internal/types"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewRouter(cfg config.Config, users *repositories.UserRepository, db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()

	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.Cors.Origin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api/v1", func(api chi.Router) {
		// Auth
		authSvc := services.NewAuthService(users, cfg.JWT.Secret, cfg.JWT.ExpiresIn)
		authHandler := handlers.NewAuthHandler(authSvc)

		api.Route("/auth", func(ar chi.Router) {
			ar.Post("/login", middleware.Wrap(authHandler.Login))
			ar.With(middleware.Authenticate(cfg.JWT.Secret)).Get("/me", middleware.Wrap(authHandler.Me))
		})

		// Users
		userSvc := services.NewUserService(users)
		userHandler := handlers.NewUserHandler(userSvc)
		api.Route("/users", func(ur chi.Router) {
			ur.With(middleware.Authenticate(cfg.JWT.Secret)).Patch("/me/password", middleware.Wrap(userHandler.ChangePassword))

			ur.Group(func(admin chi.Router) {
				admin.Use(middleware.Authenticate(cfg.JWT.Secret))
				admin.Use(middleware.Authorize(types.RoleAdmin))

				admin.Post("/", middleware.Wrap(userHandler.CreateUser))
				admin.Get("/", middleware.Wrap(userHandler.ListUsers))
				admin.Get("/{id}", middleware.Wrap(userHandler.GetUser))
				admin.Put("/{id}", middleware.Wrap(userHandler.UpdateUser))
				admin.Delete("/{id}", middleware.Wrap(userHandler.DeleteUser))
			})
		})

		// Projects
		projectRepo := repositories.NewProjectRepository(db)
		projectSvc := services.NewProjectService(projectRepo)
		projectHandler := handlers.NewProjectHandler(projectSvc)
		api.Route("/projects", func(pr chi.Router) {
			pr.Use(middleware.Authenticate(cfg.JWT.Secret))
			pr.With(middleware.Authorize(types.RoleAdmin)).Post("/", middleware.Wrap(projectHandler.CreateProject))
			pr.Get("/", middleware.Wrap(projectHandler.ListProjects))
			pr.Get("/{id}", middleware.Wrap(projectHandler.GetProject))
			pr.With(middleware.Authorize(types.RoleAdmin)).Put("/{id}", middleware.Wrap(projectHandler.UpdateProject))
			pr.With(middleware.Authorize(types.RoleAdmin)).Delete("/{id}", middleware.Wrap(projectHandler.DeleteProject))
		})

		// Tasks
		taskRepo := repositories.NewTaskRepository(db)
		taskSvc := services.NewTaskService(taskRepo, projectRepo, users)
		taskHandler := handlers.NewTaskHandler(taskSvc)
		api.Route("/tasks", func(tr chi.Router) {
			tr.Use(middleware.Authenticate(cfg.JWT.Secret))
			tr.Post("/", middleware.Wrap(taskHandler.CreateTask))
			tr.Get("/", middleware.Wrap(taskHandler.ListTasks))
			tr.Get("/{id}", middleware.Wrap(taskHandler.GetTask))
			tr.Put("/{id}", middleware.Wrap(taskHandler.UpdateTask))
			tr.Patch("/{id}/assign", middleware.Wrap(taskHandler.AssignTask))
			tr.Delete("/{id}", middleware.Wrap(taskHandler.DeleteTask))
		})

		// Dashboard
		dashboardSvc := services.NewDashboardService(db)
		dashboardHandler := handlers.NewDashboardHandler(dashboardSvc)
		api.Route("/dashboard", func(dr chi.Router) {
			dr.Use(middleware.Authenticate(cfg.JWT.Secret))
			dr.Get("/summary", middleware.Wrap(dashboardHandler.Summary))
		})

		// Health
		api.Get("/health", middleware.Wrap(handlers.Health))
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		middleware.HandleError(w, appErrors.AppError{StatusCode: http.StatusNotFound, Message: "Route not found"})
	})

	return r
}
