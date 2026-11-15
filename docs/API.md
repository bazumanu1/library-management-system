# Library Management System API

Base URL: `http://localhost:3000`

## Environment setup

1. Copy `api/.env.example` to `api/.env`.
2. Set a valid `DATABASE_URL` for your PostgreSQL instance.
3. Set `JWT_SECRET` to a strong random value and optionally `JWT_EXPIRES_IN` (default: `1h`).
4. Set `PORT` if you want a custom app port.

Example:

```bash
cp api/.env.example api/.env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/library_db?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1h"
PORT=3000
```

## Installation

```bash
cd api
npm install
npx prisma generate
npm run build
```

## Database configuration and Prisma

- Prisma configuration is in `api/prisma/schema.prisma`.
- The project uses PostgreSQL via `DATABASE_URL`.
- Do not run `prisma migrate reset` against a live Neon database.
- If the live database already contains the initial schema and migration history, validate the current database state before running any additional migration.
- A migration should only be applied when the actual schema and migration history are confirmed to match the intended changes.

## Authentication

- `POST /auth/register` — creates a user with default role `PATRON`.
- `POST /auth/login` — returns `{ user, access_token }`.
- `GET /users/profile` — protected route returning the authenticated user without the password hash.
- `Authorization: Bearer <token>` is required for protected endpoints.

## Roles

- `PATRON` can register, log in, browse genres and books, and view their own profile.
- `LIBRARIAN` can create, update, and delete books and genres.

## Endpoints

### Genres

- `POST /genres` — librarian only
- `GET /genres`
- `GET /genres/:id`
- `PATCH /genres/:id` — librarian only
- `DELETE /genres/:id` — librarian only

### Books

- `GET /books?genreId=1&search=tolkien&page=1&limit=10`
- `GET /books/:id`
- `POST /books` — librarian only
- `PATCH /books/:id` — librarian only
- `DELETE /books/:id` — librarian only

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` — protected route returning the authenticated user

## Example requests

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Password123!"}'
```

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'
```

```bash
curl http://localhost:3000/books?genreId=1&search=fiction&page=1&limit=10
```

## Error response examples

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 409,
  "message": "A book with this ISBN already exists",
  "error": "Conflict"
}
```

```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

## Postman

Import `docs/postman_collection.json` and set the `baseUrl` and `token` variables before testing protected routes.
