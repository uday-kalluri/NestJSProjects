# Copilot Instructions for AI Agents

## Project Overview
- **Type:** NestJS (Node.js, TypeScript) API for user authentication, loyalty points, and admin management.
- **Major modules:**
  - `auth/`: Handles registration, login (email/password, Firebase, OTP), JWT, and Firebase integration.
  - `users/`: User profile, registration, and repository logic.
  - `loyalities/`: Loyalty points, admin adjustments, and user-linked loyalty records.
  - `health/`: Health checks for MongoDB, Firebase, and external services.
  - `common/`: Guards, decorators, enums for roles and authorization.
  - `config/`: Environment/config validation and loading.

## Architecture & Patterns
- **Monolithic NestJS app**: Modules for `auth`, `users`, `loyalities`, and `health` are composed in `app.module.ts`.
- **MongoDB via Mongoose**: Models in `schemas/`, repositories abstract DB logic.
- **Authentication**: Supports JWT (local) and Firebase (admin SDK, emulator support). Guards and strategies in `auth/` and `common/`.
- **Role-based access**: Use `@Roles()` decorator and `RolesGuard` for admin/user separation.
- **DTOs**: All request/response validation via DTOs in `dto/` folders, using `class-validator` and `@nestjs/swagger`.
- **Swagger**: API docs at `/docs` (see `main.ts`).

## Developer Workflows
- **Install:** `npm install`
- **Run (dev):** `npm run start:dev`
- **Run (prod):** `npm run start:prod`
- **Test (unit):** `npm run test`
- **Test (e2e):** `npm run test:e2e`
- **Lint/Format:** `npm run lint`, `npm run format`
- **Swagger UI:** Visit `/docs` after starting the app.
- **Firebase emulator:** Uses `FIREBASE_AUTH_EMULATOR_HOST` if set in `.env`.

## Conventions & Integration
- **Service boundaries:**
  - `auth` depends on `users` for registration and login.
  - `loyalities` links to `users` via `userId` (ObjectId, not string).
- **Repository pattern:** All DB access via repository classes (not directly in services/controllers).
- **Testing:** All modules have basic `.spec.ts` files using Nest's testing utilities.
- **Environment:** Secrets/config in `.env` (never commit service account keys).
- **Custom health checks:** See `health/` for Firebase and MongoDB readiness endpoints.
- **Admin endpoints:** Use `@Roles(Role.ADMIN)` and `RolesGuard` for admin-only routes (see `loyalities.controller.ts`).

## Examples
- **Add a new protected route:**
  - Use `@UseGuards(JwtAuthGuard)` and optionally `@Roles(Role.ADMIN)`.
- **Add a new DTO:**
  - Place in `dto/`, use `class-validator` decorators, and document with `@ApiProperty`.
- **Add a new Mongoose model:**
  - Define in `schemas/`, register in module with `MongooseModule.forFeature`.

## Key Files
- `src/app.module.ts`: Main module composition.
- `src/main.ts`: App bootstrap, global pipes, Swagger setup.
- `src/auth/auth.service.ts`: Auth logic, Firebase integration.
- `src/loyalities/loyalties.repository.ts`: Loyalty-user aggregation logic.
- `src/common/guards/roles.guard.ts`: Role-based access control.

---

**For any unclear patterns or missing documentation, ask for clarification or check module-level comments.**
