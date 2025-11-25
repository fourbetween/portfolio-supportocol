# ディレクトリ定義
BASE_DIR := ${CURDIR}
VIEW_DIR := ${BASE_DIR}/view
CDK_DIR  := ${BASE_DIR}/cdk

# CDKスタック名（キャメルケースに変換）
STACK_NAME := $(shell echo ${PROJECT_NAME}-${STAGE}-stack | sed -E 's/-(.)/\U\1/g; s/^(.)/\U\1/')

.PHONY: run-api run-view api view build-deploy build deploy destroy fix-view gen test-api test-view import story upgrade-tools upgrade-go-pkgs upgrade-view-pkgs %

# ===== 開発サーバー =====
run-api:
	go tool air -c .air.toml

run-view: fix-view
	cd ${VIEW_DIR} && npm run dev --mode=${STAGE}

# ===== ビルド =====
api:
	cd ${BASE_DIR}/cmd/lambda/api && GOOS=linux GOARCH=arm64 go build -o build/bootstrap

view: view/env fix-view
	cd ${VIEW_DIR} && npm run build --mode=${STAGE}

build: test-api api test-view view

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
fix-view:
	cd ${VIEW_DIR} && npm install && npm audit fix

import:
	go tool import --importfile=${VIEW_DIR}/src/import.ts --targetdir=${VIEW_DIR}/src/component --watch

story:
	cd ${VIEW_DIR} && npm run storybook -- -p $${PORT:-6006}

# ===== アップグレード =====
upgrade-tools:
	go get tool

upgrade-go-pkgs:
	go get -u ./...

upgrade-view-pkgs:
	cd ${VIEW_DIR} && npx npm-check-updates -u && npm install

# ===== 汎用コマンド実行 =====
%:
	cd ${BASE_DIR}/cmd/${@} && go run .