# Production Deployment Checklist

## Branding and Domain

- Confirm the public product name is `POSCO Forged AI` in the admin system settings page.
- Set the public domain and, if used, the MCP subdomain prefix.
- Upload the production logo and social sharing images.
- Verify homepage title, headline, subheadline, and metadata text.
- Keep `is_showcased` disabled unless external reporting is explicitly approved.

## Secrets and Environment

- Copy `.env.production.example` to `.env` on the backend host and replace every `CHANGE_ME_*` value.
- Copy `frontend/.env.production.example` to the frontend deployment environment and set the real production URLs.
- Store secrets in a secret manager or protected CI/CD variables, not in git.
- Generate a new `PAYMENT_CONFIG_SECRET_KEY` for production and record its key ID.
- Restrict `ALLOWED_ORIGINS` to the exact production domains.

## Infrastructure

- Provision MySQL, Redis, and RabbitMQ with backups and monitoring enabled.
- Enforce private network access between application services and middleware.
- Enable TLS at the reverse proxy or load balancer.
- Configure persistent storage for MySQL and RabbitMQ.
- Ensure outbound access is allowed only to approved third-party services.

## Database

- Run the database initialization and migration script before first startup.
- Confirm the `version` value in `sys_config` is `1.3.1` after deployment.
- Change the default admin password immediately after first login.
- Take a database snapshot before each production upgrade.

## Backend Release

- Create and activate a Python 3.11+ virtual environment.
- Install dependencies from `requirements.txt`.
- Start both backend services with a process manager such as `systemd`, `supervisord`, or containers.
- Verify `/health` on the API service and `/` on the admin service.
- Confirm logs are written in English and collected centrally.

## Frontend Release

- Install frontend dependencies with `pnpm install`.
- Build with `pnpm build` and run with `pnpm start` behind a reverse proxy.
- Verify the frontend points to the production backend URL.
- Confirm metadata, static assets, and localization files load correctly.
- Check that no port conflict exists with other internal tools such as Flowise.

## Integration Validation

- Confirm email login and SMTP delivery if email sign-in is enabled.
- Confirm Google OAuth redirect URIs are updated if Google sign-in is enabled.
- Verify Stripe, Alipay, or WeChat payment callbacks use production endpoints.
- Confirm Redis caching and RabbitMQ consumers are processing normally.
- Test admin login, user login, service browsing, and a sample MCP call.

## Security and Operations

- Rotate all inherited default passwords from the upstream project.
- Disable debug mode in production.
- Add uptime monitoring and alerting for frontend, admin API, and public API.
- Document rollback steps for both application code and database state.
- Record the exact image tags, package versions, and deployment time for each release.