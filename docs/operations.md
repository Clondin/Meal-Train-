# Operations

## Staging

- Use separate Postgres, Stripe test keys, SendGrid sandbox credentials, and a staging S3 bucket.
- Build the same Docker images used for production and deploy them with staging-only environment variables.
- Set `FRONTEND_URL`, `API_URL`, `SENTRY_DSN`, and `NEXT_PUBLIC_SENTRY_DSN` to the staging domains before smoke testing.
- Run `npm run test`, `npm run lint`, `npm run build`, and `npm run test:e2e` against staging before promoting.

## Backups

- For managed Postgres, enable daily automated backups with at least 7 days of retention.
- For self-hosted Postgres, schedule `pg_dump` to object storage once per day and encrypt the output at rest.
- Test restores into a disposable database on a recurring schedule so the backup process is verified, not assumed.
