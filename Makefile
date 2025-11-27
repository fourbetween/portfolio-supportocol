# ディレクトリ定義
BASE_DIR := ${CURDIR}
VIEW_DIR := ${BASE_DIR}/view
CDK_DIR  := ${BASE_DIR}/cdk

# CDKスタック名（キャメルケースに変換）
STACK_NAME := $(shell echo ${PROJECT_NAME}-${STAGE}-stack | sed -E 's/-(.)/\U\1/g; s/^(.)/\U\1/')

.PHONY: dev-api dev-view build-api build-view build build-deploy deploy destroy gen test-api test-view setup-view import storybook upgrade-tools upgrade-go upgrade-view %

# ===== 開発サーバー =====
dev-api:
	go tool air -c .air.toml

dev-view: setup-view
	cd ${VIEW_DIR} && npm run dev --mode=${STAGE}

# ===== ビルド =====
build-api:
	cd ${BASE_DIR}/cmd/lambda/api && GOOS=linux GOARCH=arm64 go build -o build/bootstrap

build-view: view/env setup-view
	cd ${VIEW_DIR} && npm run build --mode=${STAGE}

build: test-api build-api test-view build-view

# ===== デプロイ =====
build-deploy: build deploy

deploy:
	cd ${CDK_DIR} && npx cdk deploy ${STACK_NAME}

destroy:
	cd ${CDK_DIR} && npx cdk destroy ${STACK_NAME}

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

# ===== ユーティリティ =====
setup-view:
	cd ${VIEW_DIR} && npm install && npm audit fix

import:
	go tool import --importfile=${VIEW_DIR}/src/import.ts --targetdir=${VIEW_DIR}/src/component --watch

storybook:
	cd ${VIEW_DIR} && npm run storybook -- -p $${PORT:-6006}

# ===== アップグレード =====
upgrade-tools:
	go get tool

upgrade-go:
	go get -u ./...

upgrade-view:
	cd ${VIEW_DIR} && npx npm-check-updates -u && npm install

# ===== 汎用コマンド実行 =====
%:
	cd ${BASE_DIR}/cmd/${@} && go run .