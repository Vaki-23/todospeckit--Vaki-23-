# API Reference

**Status:** Feature 1 — User Authentication

Base path: `/todo/`. Authenticated routes require `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/todo/health` | No | Process health check |
| `POST` | `/todo/register` | No | Create a user account and session |
| `POST` | `/todo/login` | No | Authenticate and return (or reuse) a session |
| `POST` | `/todo/logout` | Yes | Invalidate the current session token |
| `GET` | `/todo/lists` | Yes | Return lists owned by `req.user.id` (empty until Feature 2 creates lists) |

## Auth success payload (`201` register, `200` login)

```json
{
  "userId": 1,
  "username": "jdoe",
  "email": "jdoe@example.com",
  "fName": "Jane",
  "lName": "Doe",
  "role": "worker",
  "token": "<jwt>"
}
```

Password hashes are never included.

## Errors

`{ "message": "Human-readable explanation." }`

| Situation | Status | Message |
|----------|--------|---------|
| Duplicate username | `400` | `Username is already taken.` |
| Duplicate email | `400` | `Email is already registered.` |
| Invalid credentials | `401` | `Invalid username or password.` |
| Missing/expired token | `401` | `Unauthorized! …` |

## Feature provenance

| Area | Introduced |
|------|-------------|
| Auth register / login / logout | Feature 1 |
| `GET /todo/lists` (session-scoped) | Feature 1 |
