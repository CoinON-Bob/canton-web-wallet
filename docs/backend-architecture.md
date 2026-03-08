# Canton Wallet API - Backend Architecture

## Overview

Backend for **Canton Web Wallet**, built with NestJS. Phase 1 is a project skeleton only; no complex business logic.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | NestJS 10 |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache (optional) | Redis (config only, reserved) |
| API Docs | Swagger (OpenAPI) |
| Validation | class-validator + class-transformer |
| Auth | JWT (Passport + @nestjs/jwt) |
| Config | @nestjs/config + Joi env validation |

## Directory Layout (`/api`)

```
api/
├── prisma/
│   └── schema.prisma      # DB schema
├── src/
│   ├── common/            # Filters, middleware
│   ├── config/            # Env schema, Redis config
│   ├── health/
│   ├── auth/
│   ├── users/
│   ├── wallets/
│   ├── wallet-keystores/
│   ├── email-verifications/
│   ├── address-book/
│   ├── notifications/
│   ├── audit-logs/
│   ├── system-settings/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Security Principles

1. **No plaintext private keys**  
   Backend does not store or process private keys in plaintext.

2. **Wallet key material**  
   Only **encrypted payloads** are stored (`wallet_keystores.encrypted_payload`). Key derivation and decryption happen in a secure environment (e.g. HSM or client-side), not in this API.

3. **Backend scope**  
   Account management, config, audit logs, notifications, and storage of **encrypted** key material. No signing or plaintext key handling.

## Request Flow

1. **Request** → RequestLoggerMiddleware (log method, path, status, duration)
2. **Routing** → Guard (JWT when required) → Controller → Service
3. **Validation** → Global ValidationPipe (class-validator)
4. **Errors** → HttpExceptionFilter (uniform JSON error response)
5. **Response** → JSON

## Next Steps (Phase 2)

- Implement auth: login, refresh, session store (e.g. Redis).
- Implement users: registration, profile, email verification.
- Implement wallets: create wallet record, store encrypted keystore payload only.
- Implement address-book, notifications, audit-logs, system-settings CRUD.
- Add rate limiting and CORS for production.
