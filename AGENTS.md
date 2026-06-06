# Agent Instructions

For detailed application concepts and terminology, see `.opencode/instructions/app.instructions.md`.

## Architecture

Fullstack application: Go API backend (AWS Lambda) + Lit/TypeScript SPA frontend. Infrastructure defined in CDK (Go).

- **Backend entrypoints**
  - `cmd/api/dev` — local dev server on `:9000`
  - `cmd/api/lambda` — Lambda bootstrap (`build/bootstrap`)
  - `cmd/db/migrate` — DB migrations (golang-migrate)
  - `cmd/db/seed` — seed scripts
  - `cmd/view/env` — generates `view/.env.{stage}` from AWS SSM

- **Frontend entrypoint**: `view/src/index.ts` → `app/root.ts`
- **Routing**: client-side via `@lit-labs/router`; server routes at `/v1/{identity,workspace,learning,dialogue}/`

## Tech Stack

- **Go**: 1.26, single module. Uses `go tool` for CLI tools.
- **Frontend**: Lit 3.x, Vite, TypeScript (strict, decorators). No React/Vue.
- **Database**: MySQL. `go-jet/jet/v2` for type-safe queries.
- **API codegen**: `ogen` from OpenAPI schemas.
- **I18n**: `@lit/localize`, runtime mode, source `en`, target `ja`. XLIFF in `view/xliff/`.
- **Testing**: Vitest browser mode (Playwright, headless Chromium). Storybook for UI dev.
- **Infra**: AWS CDK (Go), separate module in `cdk/`.

## Developer Commands

```bash
# Start both dev servers
make dev

# API dev only (uses air, rebuilds cmd/api/dev)
make dev-api

# View dev only (MUST run localize first)
make dev-view   # equivalent to: npm run localize:extract && npm run localize:build && npm run dev --mode=dev

# Full build pipeline
deadcode -> test-api -> build-lambda -> build-view
make build

# Lint / analysis
make deadcode          # go tool deadcode ./...
make vulncheck         # go tool govulncheck ./...
cd view && npm run check:lit   # lit-analyzer (Lit template rules)

# Tests
make test-api   # go test -race -shuffle=on -cover ./... (also: make test)
make test-view  # npx playwright install --with-deps && npm run test

# Storybook
make storybook  # cd view && npm run storybook -- -p ${PORT:-6006}

# Code generation (run after OpenAPI or DB schema changes)
make gen        # cd view && npm run gen; go generate ./...

# One-off commands (any cmd/ subdir)
make migrate    # runs cmd/db/migrate with AWS_PROFILE=$STAGE
make seed       # runs cmd/db/seed/* with AWS_PROFILE=$STAGE
```

## Code Generation

**Backend** (`go generate ./...`):

- `internal/{identity,workspace,learning,dialogue}/api/app.go` each contain:
  `//go:generate go tool ogen -package oas -target oas -clean -config ./schema/ogen.yml ./schema/openapi.yml`
- `internal/pkg/{id,clock}/service.go` each contain:
  `//go:generate go tool mockgen -package <pkg> -destination ./service_mock.go . Service`
- `go-jet/jet/v2` schema files under `internal/*/infra/db/schema/` are generated but no `go:generate` directive is checked in.

**Frontend** (`cd view && npm run gen`):

- Generates `openapi-typescript` types from each domain's `../internal/*/api/schema/openapi.yml` into `src/feature/*/api/schema.d.ts`.

## Monorepo / Package Boundaries

- `internal/{identity,workspace,learning,dialogue}/` — domain packages. Each has `domain/`, `usecase/`, `infra/`, `api/`.
- `internal/app/containers.go` — wires all domains together.
- `internal/pkg/` — shared utilities (dbcon, env, httpcookie, httpctx, apperr, clock, id, dbtx).
- `view/src/feature/{identity,workspace,learning,dialogue,marketing}/` — frontend feature folders.
- `view/src/shared/ui/` — reusable Lit components.
- `view/src/app/` — root layout, routing context, path definitions.

## Environment & Config

- `STAGE` controls behavior (`dev`/`demo`/`prod`).
- `APP_NAME` expected to be `app-supportocol`.
- `AWS_PROFILE` is set to `$STAGE` for all deploys and generic `make <cmd>` targets.
- Dev DB DSN is hardcoded to `root:password@tcp(mysql:3306)/app-supportocol` when `STAGE=dev`.
- App config (domain, JWT secret, Google client ID) loaded from AWS SSM Parameter Store.
- `build-view` depends on `view/env` (generates `view/.env.{stage}` from SSM) and `setup-view` (`npm install`).

## Deployment

```bash
# Deploy (requires AWS_PROFILE or STAGE env)
make deploy     # cdk deploy with AWS_PROFILE=$STAGE
make destroy    # cdk destroy with AWS_PROFILE=$STAGE
```

CDK uses two stacks: a cert stack in `us-east-1` and the app stack in the default region. `cdk/` is a separate Go module.

## Important Constraints

- **No Go tests currently exist** in the repo; `make test-api` runs against an empty suite.
- **View dev requires localize first**: `npm run localize:extract && npm run localize:build` before `vite dev`.
- **Frontend tests use Vitest browser mode** (Playwright Chromium), not Node. Setup file: `.storybook/vitest.setup.ts`.
- **TypeScript**: strict mode with `noUnusedLocals` and `noUnusedParameters`. `ts-lit-plugin` enforces Lit template rules.
- **Air** watches `go,tpl,tmpl,html` and excludes `view`, `cdk`, `tmp`, `testdata`.
- **GOPRIVATE**: `github.com/fourbetween` (private org packages).
- **Makefile generic target**: any `make <name>` runs `cd cmd/<name> && AWS_PROFILE=$STAGE go run .`.
