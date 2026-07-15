# FSRE Timetable Notify Backend (TypeScript)

TypeScript/Bun rewrite of the FSRE Timetable Notify backend using **Elysia**,
**Kysely**, and **SQLite**.

## Stack

- **Runtime:** Bun
- **HTTP:** Elysia + OpenAPI (`/docs`)
- **Database:** Kysely + SQLite (`SQLITE_PATH`)
- **Notifications:** Firebase Admin (FCM) + Nodemailer (Gmail SMTP)
- **Upstream:** Edupage reverse-engineered RPC

## Getting started

```bash
cp .env.example .env   # fill in values
bun install
bun run dev
```

Migrations run automatically on startup (`dev` / `start`). You can still apply
them manually with `bun run db:migrate`.

API base URL: `http://localhost:5000/api`

## Docker

Build and run with Docker Compose:

```bash
docker compose build
docker compose up -d
```

The container runs migrations on startup (`entrypoint.sh`), then starts the
server. SQLite data is persisted in `./data` on the host. Mount your Firebase
service account at `./service_account_key.json` (see `docker-compose.yml`).

Production expects an external Docker network named `nginx-proxy` (same as other
services on the host). Create it once if needed:
`docker network create nginx-proxy`.

Health check: `GET /health` (liveness only; does not probe Edupage or FCM).

## Scripts

| Script               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `bun run arch:check` | dependency-cruiser VSA layer rules                |
| `bun run db:migrate` | Apply pending Kysely migrations (also on startup) |
| `bun run dev`        | Start server with watch mode                      |
| `bun run start`      | Start server                                      |
| `bun run test`       | Run tests (`test/` mirrors `src/`)                |
| `bun run typecheck`  | TypeScript check                                  |
| `bun run lint`       | ESLint                                            |
| `bun run format`     | Prettier                                          |

## API endpoints

| Method | Path                                    | Description                                   |
| ------ | --------------------------------------- | --------------------------------------------- |
| `GET`  | `/api/timetable-database`               | Reference data (programs, teachers, rooms, …) |
| `GET`  | `/api/timetable?studyProgram=&isoWeek=` | Weekly timetable                              |
| `POST` | `/api/messaging/subscribe`              | Subscribe to change notifications             |
| `POST` | `/api/messaging/unsubscribe`            | Unsubscribe                                   |

OpenAPI UI: `/docs`

## Environment variables

See `.env.example`.

| Variable                         | Required | Description                                          |
| -------------------------------- | -------- | ---------------------------------------------------- |
| `SQLITE_PATH`                    | No       | SQLite file path (default `./data/fsre-sync.db`)     |
| `PORT`                           | No       | HTTP port (default `5000`)                           |
| `MAIL_USERNAME`                  | No       | SMTP username (Gmail) for email notifications        |
| `MAIL_PASSWORD`                  | No       | SMTP password / app password                         |
| `GOOGLE_APPLICATION_CREDENTIALS` | No       | Path to Firebase service account JSON                |
| `EDUPAGE_TIMETABLE_URI`          | No       | Edupage timetable RPC URL (has default)              |
| `EDUPAGE_TIMETABLE_DB_URI`       | No       | Edupage database RPC URL (has default)               |
| `LOG_LEVEL`                      | No       | `debug`, `info`, `warn`, or `error` (default `info`) |

Mail and Firebase are optional; without them, subscriptions still work but
notifications are skipped or fail gracefully.

## TODO

- [ ] Fix all `TODO` code comments
