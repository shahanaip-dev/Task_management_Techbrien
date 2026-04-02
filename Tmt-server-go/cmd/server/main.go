package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"tmt-server-go/internal/config"
	"tmt-server-go/internal/db"
	httpserver "tmt-server-go/internal/http"
	"tmt-server-go/internal/repositories"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}

	pool, err := db.Connect(cfg.DB)
	if err != nil {
		fmt.Println("DB connection error:", err.Error())
		os.Exit(1)
	}
	defer pool.Close()

	userRepo := repositories.NewUserRepository(pool)
	handler := httpserver.NewRouter(cfg, userRepo, pool)
	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", cfg.App.Port),
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		fmt.Printf("\nTMT Go Server running on http://localhost:%d\n", cfg.App.Port)
		fmt.Printf("   Env    : %s\n", cfg.App.Env)
		fmt.Printf("   DB     : %s:%d/%s\n", cfg.DB.Host, cfg.DB.Port, cfg.DB.Name)
		fmt.Printf("   API    : http://localhost:%d/api/v1\n\n", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Println("Server error:", err.Error())
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}
