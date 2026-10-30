.PHONY: env up setup down reset logs frontend

env:
	@test -f .env || (cp .env.example .env && sed -i.bak "s/change-me-to-a-long-random-string/$$(openssl rand -hex 24)/" .env && rm -f .env.bak && echo "Created .env with a random shared secret")

up: env
	docker compose up -d

setup: up
	docker compose run --rm wpcli bash /scripts/setup.sh
	@test ! -d frontend || test -f frontend/.env.local || (printf "WORDPRESS_URL=%s\nSITE_URL=%s\nCONTENT_SOURCE=wordpress\nFORECOURT_SHARED_SECRET=%s\n" "$$(grep ^WP_URL= .env | cut -d= -f2)" "$$(grep ^FORECOURT_FRONTEND_URL= .env | cut -d= -f2)" "$$(grep ^FORECOURT_SHARED_SECRET= .env | cut -d= -f2)" > frontend/.env.local && echo "Created frontend/.env.local")

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f wordpress

frontend:
	cd frontend && npm install && npm run dev
