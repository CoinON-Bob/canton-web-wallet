# Canton Wallet API - Database Schema

## Overview

PostgreSQL schema managed by Prisma. All tables use `snake_case` column names and explicit `@@map` to table names.

## Tables

### users

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| email | string | Unique |
| password_hash | string | Hashed only |
| email_verified | boolean | Default false |
| created_at | timestamp | |
| updated_at | timestamp | |

### user_sessions

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| token_hash | string | Hashed JWT/session token |
| expires_at | timestamp | |
| created_at | timestamp | |

### email_verifications

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| email | string | |
| code_hash | string | No plaintext code |
| expires_at | timestamp | |
| used_at | timestamp? | Null until used |
| created_at | timestamp | |

### wallets

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| label | string? | User-facing name |
| created_at | timestamp | |
| updated_at | timestamp | |

### wallet_keystores

Stores **encrypted key material only**. No plaintext private keys.

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| wallet_id | uuid | FK → wallets |
| key_id | string | e.g. Canton key identifier |
| encrypted_payload | string | Ciphertext only |
| key_version | int | Default 1 |
| created_at | timestamp | |
| updated_at | timestamp | |

Unique on `(wallet_id, key_id)`.

### address_book

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| label | string | |
| address | string | Canton public address |
| created_at | timestamp | |
| updated_at | timestamp | |

### notifications

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| title | string | |
| body | text? | |
| read | boolean | Default false |
| created_at | timestamp | |

### audit_logs

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| user_id | uuid? | FK → users, nullable |
| action | string | |
| resource | string? | |
| details | text? | |
| ip | string? | |
| user_agent | string? | |
| created_at | timestamp | |

### system_settings

Key-value store for app config.

| Column | Type | Notes |
|--------|------|--------|
| id | string | PK (key name) |
| value | text | |
| updated_at | timestamp | |

## ER (high level)

- **User** 1 → N **UserSession**, **Wallet**, **AddressBookEntry**, **Notification**, **AuditLog**
- **Wallet** 1 → N **WalletKeystore**
- **EmailVerification**, **SystemSetting** are standalone

## Migrations

From `/api`:

```bash
npx prisma migrate dev --name init
npx prisma generate
```
