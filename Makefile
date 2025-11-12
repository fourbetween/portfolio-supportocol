BASE_DIR=/sources/${PROJECT_NAME}
STACK_NAME=$(shell echo ${PROJECT_NAME}-${STAGE}-stack | sed -E 's/-(.)/\U\1/g; s/^(.)/\U\1/')

.PHONY: runapi runview api view builddeploy build deploy destroy fixview gen testapi testview import storybook %

runapi:
	cd ${BASE_DIR} && \
	go tool air -c .air.toml
runview: fixview
	cd ${BASE_DIR}/view && \
	npm run dev --mode=${STAGE}
api:
	cd ${BASE_DIR}/cmd/lambda/api && \
	GOOS=linux GOARCH=arm64 go build -o build/bootstrap
view: view/env fixview
	cd ${BASE_DIR}/view && \
	npm run build --mode=${STAGE}
builddeploy: build deploy
	@:
build: testapi api view
	@:
deploy:
	cd ${BASE_DIR}/cdk && \
	npx cdk deploy ${STACK_NAME}
destroy:
	cd ${BASE_DIR}/cdk && \
	npx cdk destroy ${STACK_NAME}
fixview:
	cd ${BASE_DIR}/view && \
	npm install && \
	npm audit fix
gen:
	cd ${BASE_DIR}/view && \
	npm run gen && \
	cd ${BASE_DIR} && \
	go generate ./...
testapi:
	cd ${BASE_DIR} && \
	mkdir -p tmp/test && \
	go test -race -shuffle=on -cover -coverprofile=tmp/test/cover.out ./... && \
	go tool cover -html=tmp/test/cover.out -o=tmp/test/cover.html
testview:
	cd ${BASE_DIR}/view && \
	npx playwright install --with-deps && \
	npm run test
import:
	go tool import --importfile=${BASE_DIR}/view/src/import.ts --targetdir=${BASE_DIR}/view/src/component --watch
storybook:
	cd ${BASE_DIR}/view && \
	npm run storybook
upgradetools:
	go get tool
upgradegopkgs:
	go get -u ./...
upgradeviewpkgs:
	cd ${BASE_DIR}/view && \
	npx npm-check-updates -u && \
	npm install
%:
	cd ${BASE_DIR}/cmd/${@} && \
	go run .