# Library Management System API

Base URL: `http://localhost:3000`

## Authentication
- `POST /auth/register` — create a PATRON account; body: `{ "name": "...", "email": "...", "password": "at-least-8-chars" }`.
- `POST /auth/login` — body: `{ "email": "...", "password": "..." }`; returns `access_token`.
- `GET /users/profile` — authenticated user's profile. Send `Authorization: Bearer <token>`.

Registration intentionally does not accept a role. New accounts are PATRON by default. Assign LIBRARIAN through a trusted administrative process, never through public registration.

## Genres
- `POST /genres` — create: `{ "name": "Fantasy", "description": "..." }`
- `GET /genres` — list
- `GET /genres/:id` — detail
- `PATCH /genres/:id` — partial update
- `DELETE /genres/:id` — delete (returns conflict if books still reference the genre)

## Books
- `GET /books?genreId=1&search=tolkien&page=1&limit=10` — filter, search title/author, paginate
- `GET /books/:id` — detail
- `POST /books` — LIBRARIAN only; body includes `title`, `author`, `isbn`, `totalCopies`, `genreId`
- `PATCH /books/:id` — LIBRARIAN only
- `DELETE /books/:id` — LIBRARIAN only

## Authorization
Send a valid JWT as a Bearer token. Book writes require the authenticated user's database role to be LIBRARIAN. Public registration always creates PATRON accounts. The API reads `JWT_SECRET` and `DATABASE_URL` from the environment.

Import `postman_collection.json` from this directory into Postman. Set its `baseUrl` variable, log in, and copy the returned token into the `token` collection variable. To test librarian-only routes, use an account whose role has been granted LIBRARIAN by a trusted administrator.
