include .env

MIGRATE=migrate -source file://./migrations \
	-database postgres://$(DB_NAME):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=disable up

migration_up:
	$(MIGRATE) up

migration_down:
	$(MIGRATE) down 1

migration_drop:
	$(MIGRATE) drop -f