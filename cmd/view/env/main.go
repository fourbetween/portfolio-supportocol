package main

import (
	"bufio"
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/fourbetween/app-supportocol/internal/pkg/env"
	"github.com/fourbetween/pkg-conf/conf"
)

// envConfig represents the environment configuration for the view.
type envConfig struct {
	Stage           string
	APIURL          string
	SiteDescription string
	SiteTitle       string
	SiteURL         string
	SiteLogoPath    string
	GoogleClientID  string
}

const (
	siteName    = "Supportocol"
	siteDesc    = "A platform for systematic discussion."
	viewEnvPath = "view/.env"
)

func main() {
	if err := run(); err != nil {
		slog.Error("failed to run viewenv", slog.String("error", err.Error()))
		os.Exit(1)
	}
}

func run() error {
	// Fetch configuration values
	cfg, err := fetchConfig()
	if err != nil {
		return fmt.Errorf("failed to fetch config: %w", err)
	}

	// Write environment file
	if err := writeEnvFile(cfg); err != nil {
		return fmt.Errorf("failed to write env file: %w", err)
	}

	return nil
}

func fetchConfig() (*envConfig, error) {
	awscfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, fmt.Errorf("failed to load aws config for ses: %w", err)
	}

	appConf, err := conf.NewSSMService(env.AppName(), awscfg)
	if err != nil {
		return nil, fmt.Errorf("failed to load app config: %w", err)
	}

	stage, err := appConf.Get("stage")
	if err != nil {
		return nil, fmt.Errorf("failed to get stage: %w", err)
	}

	domain, err := appConf.Get("domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get domain: %w", err)
	}

	googleClientID, err := appConf.Get("google/client/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get google client id: %w", err)
	}

	return &envConfig{
		Stage:           stage,
		APIURL:          "https://api." + domain,
		SiteDescription: siteDesc,
		SiteTitle:       siteName,
		SiteURL:         "https://" + domain,
		SiteLogoPath:    "/images/logo.webp",
		GoogleClientID:  googleClientID,
	}, nil
}

func writeEnvFile(cfg *envConfig) error {
	filePath := "/" + filepath.Join("sources", env.AppName(), viewEnvPath+"."+cfg.Stage)
	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", filePath, err)
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	defer writer.Flush()

	data := buildEnvData(cfg)

	// Sort keys alphabetically
	keys := make([]string, 0, len(data))
	for key := range data {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	// Write sorted data
	for _, key := range keys {
		if _, err := writer.WriteString(key + "=" + data[key] + "\n"); err != nil {
			return fmt.Errorf("failed to write to file: %w", err)
		}
	}

	return nil
}

func buildEnvData(cfg *envConfig) map[string]string {
	return map[string]string{
		"VITE_API_URL":          cfg.APIURL,
		"VITE_SITE_DESCRIPTION": cfg.SiteDescription,
		"VITE_SITE_TITLE":       cfg.SiteTitle,
		"VITE_SITE_URL":         cfg.SiteURL,
		"VITE_SITE_LOGO_PATH":   cfg.SiteLogoPath,
		"VITE_GOOGLE_CLIENT_ID": cfg.GoogleClientID,
	}
}
