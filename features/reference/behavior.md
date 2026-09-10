# Behavior & Rules Reference

**Living snapshot** of product rules currently in force.

These files answer: *"What rules does the app enforce right now?"*  
They do **not** authorize new scope — implement only from `features/feature-*.md`.

| Rule | Enforcement | Introduced |
|------|-------------|------------|
| Login uses **username + password** (username `trim().toLowerCase()`) | `POST /todo/login` | Feature 1; ADR-0002 |
| New users get role `worker` | `User.create` | Feature 1 |
| Passwords hashed with bcrypt, `SALT_ROUNDS = 10`; hashes never returned | Auth controller + User `defaultScope` | Feature 1; ADR-0002 |
| Session TTL **24 hours**; JWT stored in `sessions`; reuse non-expired session for the same user | Auth controller | Feature 1 |
| Client stores the auth payload in `localStorage` key `user` | `Utils.setStore("user", …)` | Feature 1 |
| Logout clears the session token server-side and removes `localStorage` `user` | `POST /todo/logout` + Home **Sign out** | Feature 1 |
| Missing/expired Bearer token → `401`; frontend clears `user` and routes to login | `authenticate` + axios interceptor | Feature 1 |
| Unauthenticated UI → login; signed-in user hitting login/register → home | `router.beforeEach` | Feature 1 |
| Registration email: required + `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; invalid format **"Enter a valid email address."** | `emailRules` + register controller | Feature 1 |
| Password minimum **8** characters | Register form + controller | Feature 1 |
| `GET /todo/lists` returns only rows where `userId = req.user.id` | List `findAll` | Feature 1 |
| No `MenuBar` yet; auth pages and home use full-screen layout; **Sign out** on home | Vue views | Feature 1 |

| File | Role |
|------|------|
| [api.md](./api.md) | Routes / payloads |
| [data-model.md](./data-model.md) | Tables / columns |
| **This file** | Ownership, sort, validation, UI rules |
