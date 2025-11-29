package main

import (
	"bufio"
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"

	conf "github.com/fourbetween/pkg-conf"
)

// envConfig represents the environment configuration for the view.
type envConfig struct {
	Stage                string
	APIURL               string
	SiteDescription      string
	SiteTitle            string
	SiteURL              string
	SiteLogo             string
	SiteFavicon          string
	AuthRedirectInURL    string
	AuthRedirectOutURL   string
	AuthDomain           string
	AuthUserpoolID       string
	AuthUserpoolClientID string
}

// requiredPaths represents the configuration paths that must be validated.
type requiredPaths struct {
	shared        []string
	stageSpecific []string
}

const (
	siteName    = "Supportocol"
	siteDesc    = "論理的な議論を支援するプラットフォームです。"
	siteHost    = "https://app-supportocol.hick-r.com"
	viewEnvPath = "view/.env"
)

func main() {
	if err := run(); err != nil {
		slog.Error("failed to run viewenv", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx := context.Background()

	// Validate required configuration paths
	if err := validatePaths(ctx); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Fetch configuration values
	cfg, err := fetchConfig(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch config: %w", err)
	}

	// Write environment file
	if err := writeEnvFile(cfg); err != nil {
		return fmt.Errorf("failed to write env file: %w", err)
	}

	slog.Info("environment file generated successfully", "path", buildEnvFilePath(cfg.Stage))
	return nil
}

func validatePaths(ctx context.Context) error {
	paths := requiredPaths{
		shared: []string{
			"/share/cognito/userpool/domain",
			"/share/cognito/userpool/id",
		},
		stageSpecific: []string{
			"/app-supportocol/domain",
			"/app-supportocol/cognito/userpool/clientid",
		},
	}

	return conf.ValidateAll(ctx, paths.shared, paths.stageSpecific)
}

func fetchConfig(ctx context.Context) (*envConfig, error) {
	domain, err := conf.GetStringWithStage(ctx, "/app-supportocol/domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get domain: %w", err)
	}

	poolDomain, err := conf.GetString(ctx, "/share/cognito/userpool/domain")
	if err != nil {
		return nil, fmt.Errorf("failed to get pool domain: %w", err)
	}

	poolID, err := conf.GetString(ctx, "/share/cognito/userpool/id")
	if err != nil {
		return nil, fmt.Errorf("failed to get pool ID: %w", err)
	}

	clientID, err := conf.GetStringWithStage(ctx, "/app-supportocol/cognito/userpool/clientid")
	if err != nil {
		return nil, fmt.Errorf("failed to get client ID: %w", err)
	}

	stage := conf.Stage()
	return &envConfig{
		Stage:                stage,
		APIURL:               "https://" + domain + "/api",
		SiteDescription:      siteDesc,
		SiteTitle:            siteName,
		SiteURL:              siteHost,
		SiteLogo:             "/images/logo.webp",
		SiteFavicon:          "/images/favicon.ico",
		AuthRedirectInURL:    "https://" + domain,
		AuthRedirectOutURL:   "https://" + domain,
		AuthDomain:           poolDomain,
		AuthUserpoolID:       poolID,
		AuthUserpoolClientID: clientID,
	}, nil
}

func buildEnvData(cfg *envConfig) map[string]string {
	return map[string]string{
		"VITE_STAGE":                   cfg.Stage,
		"VITE_API_URL":                 cfg.APIURL,
		"VITE_SITE_DESCRIPTION":        cfg.SiteDescription,
		"VITE_SITE_TITLE":              cfg.SiteTitle,
		"VITE_SITE_URL":                cfg.SiteURL,
		"VITE_SITE_LOGO":               cfg.SiteLogo,
		"VITE_SITE_FAVICON":            cfg.SiteFavicon,
		"VITE_AUTH_REDIRECT_SIGN_IN":   cfg.AuthRedirectInURL,
		"VITE_AUTH_REDIRECT_SIGN_OUT":  cfg.AuthRedirectOutURL,
		"VITE_AUTH_DOMAIN":             cfg.AuthDomain,
		"VITE_AUTH_USERPOOL_ID":        cfg.AuthUserpoolID,
		"VITE_AUTH_USERPOOL_CLIENT_ID": cfg.AuthUserpoolClientID,
	}
}

func buildEnvFilePath(stage string) string {
	return filepath.Join("/sources/app-supportocol", viewEnvPath+"."+stage)
}

func writeEnvFile(cfg *envConfig) error {
	filePath := buildEnvFilePath(cfg.Stage)
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
