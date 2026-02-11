# ディレクトリ定義
BASE_DIR := ${CURDIR}
VIEW_DIR := ${BASE_DIR}/view
CDK_DIR  := ${BASE_DIR}/cdk

.PHONY: dev-api dev-view dev watch-view build-lambda build-view build build-deploy deploy destroy gen test-api test-view test setup-view storybook deadcode vulncheck upgrade-tools upgrade-go upgrade-view %

# ===== 開発サーバー =====
dev-api:
	go tool air -c .air.toml

dev-view: setup-view
	cd ${VIEW_DIR} && npm run dev --mode=dev

dev-commentgen:
	cd ${BASE_DIR}/cmd/comment-generation/dev && AWS_PROFILE=${STAGE} go run .

dev:
	npx concurrently --kill-others --prefix "[{name}]" -n "api,view,commentgen" -c "blue,cyan,magenta" "make dev-api" "make dev-view" "make dev-commentgen"

watch-view:
	cd ${VIEW_DIR} && npm run watch:all

# ===== ビルド =====
build-lambda:
	cd ${BASE_DIR}/cmd/api/lambda && GOOS=linux GOARCH=arm64 go build -o build/bootstrap
	cd ${BASE_DIR}/cmd/comment-generation/lambda && GOOS=linux GOARCH=arm64 go build -o build/bootstrap

build-view: view/env setup-view
	cd ${VIEW_DIR} && npm run build --mode=${STAGE}

build: deadcode vulncheck test-api build-lambda test-view build-view

# ===== デプロイ =====
build-deploy: build deploy

deploy:
	cd ${CDK_DIR} && AWS_PROFILE=${STAGE} npx cdk deploy ${APP_NAME}

destroy:
	cd ${CDK_DIR} && AWS_PROFILE=${STAGE} npx cdk destroy ${APP_NAME}

# ===== コード生成 =====
gen:
	cd ${VIEW_DIR} && npm run gen
	go generate ./...

# ===== テスト =====
test-api:
	mkdir -p tmp/test
	go test -race -shuffle=on -cover -coverprofile=tmp/test/cover.out ./...
	go tool cover -html=tmp/test/cover.out -o=tmp/test/cover.html

test-view:
	cd ${VIEW_DIR} && npx playwright install --with-deps && npm run test

test: test-api test-view

# ===== ユーティリティ =====
setup-view:
	cd ${VIEW_DIR} && npm install && npm audit fix && npm run localize:extract && npm run localize:build 

storybook:
	cd ${VIEW_DIR} && npm run storybook -- -p $${PORT:-6006}

deadcode:
	go tool deadcode ./...

vulncheck:
	go tool govulncheck ./...

# ===== アップグレード =====
upgrade-tools:
	go get tool

upgrade-go:
	go get -u ./...

upgrade-view:
	cd ${VIEW_DIR} && npx npm-check-updates -u && npm install

# ===== 汎用コマンド実行 =====
%:
	cd ${BASE_DIR}/cmd/${@} && AWS_PROFILE=${STAGE} go run .