# Makefile for github-flow-agency (Node.js GitHub Action)

ACT_VERSION ?= latest
ACT_BIN     := ./bin/act
ACT_ARGS    ?= --quiet

.PHONY: clean help lint setup test test-dispatch test-issues test-main test-pr test-push test-release test-schedule test-tag-push tests

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

clean: ## Remove downloaded binaries and node_modules
	rm -rf bin/ node_modules/

lint: ## Lint code (shell + future eslint / action-validator)
	@command -v shellcheck >/dev/null || echo "shellcheck not found — install for better linting"
	@shellcheck --shell=bash scripts/*.sh 2>/dev/null || true
	@if [ -f package.json ]; then npm run lint 2>/dev/null || echo "npm run lint not configured yet"; fi
	@echo "Consider running 'action-validator action.yml' manually"

setup: ## Install act, shellcheck (if missing), and npm dependencies
	@if [ ! -f "$(ACT_BIN)" ]; then \
		echo "Downloading act ($(ACT_VERSION))..."; \
		mkdir -p bin; \
		curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash -s -- -b ./bin $(ACT_VERSION); \
	else \
		echo "act already exists at $(ACT_BIN)"; \
	fi
	@if ! command -v shellcheck >/dev/null; then \
		echo "shellcheck not found — installing... (may require sudo)"; \
		if [ "$$(uname)" = "Linux" ]; then \
			sudo apt-get update && sudo apt-get install -y shellcheck; \
		elif [ "$$(uname)" = "Darwin" ]; then \
			brew install shellcheck; \
		else \
			echo "Unsupported OS for auto shellcheck install: $$(uname)"; \
		fi; \
	fi
	@if [ -f package.json ]; then \
		echo "Running npm install..."; \
		npm ci || npm install; \
	else \
		echo "No package.json found yet — skipping npm install"; \
	fi

test: test-push ## Default test (push event)

test-dispatch: setup ## Test workflow_dispatch
	$(ACT_BIN) workflow_dispatch -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-issues: setup ## Test issues event
	$(ACT_BIN) issues -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-main: setup ## Test push to main branch
	$(ACT_BIN) push --eventpath .github/events/push-main.json -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-pr: setup ## Test pull_request event
	$(ACT_BIN) pull_request --eventpath .github/events/pull-request-local.json -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-push: setup ## Test generic push event
	$(ACT_BIN) push -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-release: setup ## Test release published event
	$(ACT_BIN) release -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-schedule: setup ## Test scheduled (cron) event
	$(ACT_BIN) schedule -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-tag-push: setup ## Test tag push event
	$(ACT_BIN) push --eventpath .github/events/push-tag.json -W .github/workflows/test-agency.yml $(ACT_ARGS)

tests: test-dispatch test-issues test-main test-pr test-push test-release test-schedule test-tag-push ## Run most common test variants
