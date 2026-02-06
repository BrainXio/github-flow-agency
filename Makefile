# Makefile for github-flow-agency (Node.js GitHub Action)

ACT_VERSION ?= latest
ACT_BIN     := ./bin/act
ACT_ARGS    ?= --quiet --container-architecture linux/amd64

.PHONY: help clean setup lint test test-dispatch test-matrix

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

clean: ## Remove downloaded binaries and node_modules
	rm -rf bin/ node_modules/

setup: ## Install act, shellcheck (if missing), and npm dependencies
	@if [ ! -f "$(ACT_BIN)" ]; then \
		echo "Downloading act ($(ACT_VERSION))..."; \
		mkdir -p bin; \
		curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash -s -- -b ./bin $(ACT_VERSION); \
	fi
	@if ! command -v shellcheck >/dev/null; then \
		echo "shellcheck not found — installing... (may require sudo)"; \
		if [ "$$(uname)" = "Linux" ]; then sudo apt-get update && sudo apt-get install -y shellcheck; \
		elif [ "$$(uname)" = "Darwin" ]; then brew install shellcheck; \
		else echo "Unsupported OS for auto-install"; fi; \
	fi
	@if [ -f package.json ]; then npm ci || npm install; fi

lint: ## Lint placeholders (shell + future eslint)
	@shellcheck --shell=bash scripts/*.sh 2>/dev/null || true
	@if [ -f package.json ]; then npm run lint 2>/dev/null || echo "No eslint configured yet"; fi

test: test-matrix ## Default: full matrix test (all job-types + variants)

test-dispatch: setup ## Interactive workflow_dispatch (override inputs manually)
	$(ACT_BIN) workflow_dispatch -W .github/workflows/test-agency.yml $(ACT_ARGS)

test-matrix: setup ## Run matrix tests for all job-types and key variants
	$(ACT_BIN) push -W .github/workflows/test-agency.yml $(ACT_ARGS)
