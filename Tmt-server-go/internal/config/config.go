package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	Env   string
	Port  int
	IsDev bool
}

type DBConfig struct {
	User     string
	Host     string
	Name     string
	Password string
	Port     int
}

type JWTConfig struct {
	Secret    string
	ExpiresIn string
}

type CorsConfig struct {
	Origin string
}

type Config struct {
	App  AppConfig
	DB   DBConfig
	JWT  JWTConfig
	Cors CorsConfig
}

func Load() (Config, error) {
	_ = godotenv.Load()

	required := []string{"DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "JWT_SECRET"}
	for _, key := range required {
		if os.Getenv(key) == "" {
			return Config{}, fmt.Errorf("[Config] Missing required environment variable: %q", key)
		}
	}

	port := getInt("PORT", 5000)
	dbPort := getInt("DB_PORT", 5432)
	env := getString("NODE_ENV", "development")

	cfg := Config{
		App: AppConfig{
			Env:   env,
			Port:  port,
			IsDev: env != "production",
		},
		DB: DBConfig{
			User:     os.Getenv("DB_USER"),
			Host:     os.Getenv("DB_HOST"),
			Name:     os.Getenv("DB_NAME"),
			Password: os.Getenv("DB_PASSWORD"),
			Port:     dbPort,
		},
		JWT: JWTConfig{
			Secret:    os.Getenv("JWT_SECRET"),
			ExpiresIn: getString("JWT_EXPIRES_IN", "8h"),
		},
		Cors: CorsConfig{
			Origin: getString("FRONTEND_URL", "http://localhost:3000"),
		},
	}

	return cfg, nil
}

func getString(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}
