# NotifyHub — Multi-Tenant SaaS Notification Platform

A production-grade, multi-tenant notification engine that lets businesses send **Email**, **SMS**, and **Push** notifications to their users at scale — with retry logic, deduplication, analytics, and circuit-breaker resilience built in.

Built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, **Redis**, and a queue-driven worker architecture.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Phases](#project-phases)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  Tenant App  │────▶│  REST API    │────▶│  PostgreSQL   │
│  (API Key)   │     │  (Next.js)   │     │  (Prisma ORM) │
└─────────────┘     └──────┬───────┘     └───────────────┘
                           │
                    ┌──────▼───────┐
                    │  Redis Queue │
                    │  (BullMQ)    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Email    │ │  SMS     │ │  Push    │
        │ Worker   │ │  Worker  │ │  Worker  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        SendGrid      Twilio       Firebase
        (Backup:      (Backup:     (Backup:
         SES)          SNS)         APNs)
```

### Request Flow

1. Tenant sends `POST /api/notifications` with API key
2. API validates key, checks rate limits & recipient preferences
3. Notification stored in DB with `status = PENDING`
4. Job pushed to Redis queue (channel-specific)
5. Worker picks up job, selects best provider (circuit-breaker aware)
6. Provider sends the message
7. Status updated: `SENT → DELIVERED` or `FAILED` (with retry)
8. Delivery events logged; daily aggregates updated
9. Webhook fired to tenant callback URL (if configured)

---

## Tech Stack

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| **Framework**   | Next.js 16 (App Router)           |
| **Language**    | TypeScript 5                      |
| **ORM**         | Prisma 7 (PostgreSQL adapter)     |
| **Database**    | PostgreSQL 16                     |
| **Cache/Queue** | Redis (BullMQ)                    |
| **Email**       | SendGrid / Amazon SES             |
| **SMS**         | Twilio / Amazon SNS               |
| **Push**        | Firebase Cloud Messaging (FCM)    |
| **Validation**  | Zod 4                             |
| **Styling**     | Tailwind CSS 4                    |
| **Containers**  | Docker Compose                    |

---

## Project Phases

### Phase 1 — Core Notification Engine (Single Tenant)

Build a reliable backend that sends notifications with retry, deduplication, and status tracking.

- REST API to accept notification requests
- Notifications stored in DB (`status = PENDING`)
- Requests pushed to a message queue
- Worker services consume from queue and send via providers
- Delivery state machine: `PENDING → QUEUED → PROCESSING → SENT → DELIVERED | FAILED`
- Exponential retry with backoff
- Idempotency key for deduplication

**Outcome:** Reliable, fault-tolerant core engine.

---

### Phase 2 — Scalability for Millions of Users

Ensure the system handles millions of notifications.

- Stateless API servers for horizontal scaling
- Redis / Kafka for high-throughput queuing
- Multiple worker instances
- DB indexes optimised for partitioning by date & tenant
- Rate limiting per channel
- Backpressure handling

**Outcome:** System scales to millions of notifications.

---

### Phase 3 — Multi-Tenant SaaS Architecture

Allow multiple businesses to use the platform.

- Tenant registration & management
- API key generation with scopes
- `tenantId` column in all core tables
- Per-tenant rate limiting
- Logical data isolation
- Webhook callbacks for delivery events

**Outcome:** Platform becomes SaaS-ready.

---

### Phase 4 — User Management System

Let businesses manage their end-users (recipients).

- Add / update / delete recipients
- Store: email, phone, device tokens, timezone, locale
- Notification preferences per channel
- Opt-in / opt-out handling
- Quiet hours support

**Outcome:** Tenants can target their users properly.

---

### Phase 5 — Reporting & Analytics

Provide delivery reports and usage analytics to tenants.

- Granular delivery event logs (`DeliveryLog`)
- Pre-computed daily aggregates (`DeliveryAggregate`)
- Dashboard metrics: success rate, failure rate, channel performance, daily usage
- Event-driven architecture: events → analytics processor → aggregated tables

**Outcome:** Businesses can monitor performance and costs.

---

### Phase 6 — Reliability & Production Hardening

Make the system production-grade and resilient.

- Dead Letter Queue for permanently failed notifications
- Circuit breaker per provider (CLOSED → OPEN → HALF_OPEN)
- Backup / fallback providers
- At-least-once delivery guarantee
- Idempotent processing
- Webhook retry with exponential backoff
- Monitoring & alerting hooks

**Outcome:** System is enterprise-grade and production-ready.

---

## Database Schema

### Entity Relationship Diagram

```
Tenant ──┬── ApiKey
         ├── Recipient ──┬── DeviceToken
         │               ├── NotificationPreference
         │               └── Notification
         ├── Notification ──┬── DeliveryLog
         │                  ├── DeadLetterQueue
         │                  └── WebhookEvent
         ├── NotificationTemplate
         ├── RateLimitLog
         └── DeliveryAggregate

Provider ── Notification
User (platform admins)
```

### Key Models

| Model                    | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `Tenant`                 | Business account with plan & rate limits        |
| `ApiKey`                 | Hashed API keys with scopes & expiry            |
| `Recipient`              | End-user managed by a tenant                    |
| `DeviceToken`            | Push notification tokens (iOS/Android/Web)      |
| `NotificationPreference` | Per-channel opt-in/out & quiet hours            |
| `NotificationTemplate`   | Reusable message templates                      |
| `Notification`           | Core notification with full state machine       |
| `DeliveryLog`            | Granular delivery event trail                   |
| `DeliveryAggregate`      | Pre-computed daily analytics per tenant+channel |
| `DeadLetterQueue`        | Failed notifications for manual review          |
| `Provider`               | External providers with circuit breaker state   |
| `RateLimitLog`           | Sliding-window rate limit counters              |
| `WebhookEvent`           | Delivery webhook attempts to tenant URLs        |
| `User`                   | Platform admin accounts                         |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose**
- **npm** or **pnpm**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/notification.git
cd notification
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start infrastructure (PostgreSQL + Redis + pgAdmin)

```bash
docker compose up -d
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mydatabase"
POSTGRES_PASSWORD="your_password"

# pgAdmin
PGADMIN_DEFAULT_EMAIL="admin@example.com"
PGADMIN_DEFAULT_PASSWORD="admin"

# Redis
REDIS_URL="redis://localhost:6379"

# Providers (add as needed)
SENDGRID_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
FIREBASE_PROJECT_ID=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_SECRET="your-api-secret-for-signing"
```

### 5. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 6. Generate Prisma client

```bash
npx prisma generate
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### 8. (Optional) Open pgAdmin

Navigate to [http://localhost:5050](http://localhost:5050) and connect to your PostgreSQL instance.

---

## Environment Variables

| Variable                 | Description                    | Required |
| ------------------------ | ------------------------------ | -------- |
| `DATABASE_URL`           | PostgreSQL connection string   | Yes      |
| `REDIS_URL`              | Redis connection string        | Yes      |
| `SENDGRID_API_KEY`       | SendGrid API key               | No*      |
| `TWILIO_ACCOUNT_SID`     | Twilio account SID             | No*      |
| `TWILIO_AUTH_TOKEN`      | Twilio auth token              | No*      |
| `TWILIO_PHONE_NUMBER`    | Twilio sender phone number     | No*      |
| `FIREBASE_PROJECT_ID`    | Firebase project ID            | No*      |
| `FIREBASE_PRIVATE_KEY`   | Firebase service account key   | No*      |
| `FIREBASE_CLIENT_EMAIL`  | Firebase service account email | No*      |
| `API_SECRET`             | Secret for signing tokens      | Yes      |

\* Required depending on which channels you enable.

---

## API Reference

### Authentication

All tenant-facing API endpoints require an `x-api-key` header:

```
x-api-key: nk_live_abc123...
```

### Endpoints

#### Notifications

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/api/notifications`            | Send a notification            |
| GET    | `/api/notifications`            | List notifications (paginated) |
| GET    | `/api/notifications/:id`        | Get notification details       |
| GET    | `/api/notifications/:id/logs`   | Get delivery logs              |

#### Recipients

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/api/recipients`               | Create a recipient             |
| GET    | `/api/recipients`               | List recipients                |
| PATCH  | `/api/recipients/:id`           | Update a recipient             |
| DELETE | `/api/recipients/:id`           | Delete a recipient             |

#### Templates

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/api/templates`                | Create a template              |
| GET    | `/api/templates`                | List templates                 |
| PATCH  | `/api/templates/:id`            | Update a template              |
| DELETE | `/api/templates/:id`            | Delete a template              |

#### Analytics

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/api/analytics/summary`        | Delivery summary (date range)  |
| GET    | `/api/analytics/channels`       | Per-channel breakdown          |

### Send Notification — Example Request

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "x-api-key: nk_live_abc123..." \
  -d '{
    "recipientId": "uuid-of-recipient",
    "channel": "EMAIL",
    "subject": "Welcome!",
    "body": "Hello {{name}}, welcome to our platform.",
    "priority": "HIGH",
    "idempotencyKey": "welcome-email-user123",
    "metadata": {
      "name": "Atul"
    }
  }'
```

### Response

```json
{
  "id": "notif-uuid",
  "status": "PENDING",
  "channel": "EMAIL",
  "createdAt": "2026-02-22T10:00:00.000Z"
}
```

---

## Project Structure

```
notification/
├── app/
│   ├── api/
│   │   ├── notifications/       # Notification CRUD + send
│   │   ├── recipients/          # Recipient management
│   │   ├── templates/           # Template management
│   │   └── analytics/           # Reporting endpoints
│   ├── generated/prisma/        # Generated Prisma client
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── prisma.ts                # Prisma client singleton
│   ├── redis.ts                 # Redis / BullMQ client
│   ├── queue/                   # Queue producers & consumers
│   ├── providers/               # Email, SMS, Push provider adapters
│   ├── services/                # Business logic layer
│   ├── middleware/               # Auth, rate-limit, validation
│   └── utils/                   # Helpers (retry, circuit-breaker, etc.)
├── prisma/
│   ├── schema.prisma            # Database schema (all phases)
│   └── migrations/              # Migration history
├── docker-compose.yaml          # PostgreSQL + Redis + pgAdmin
├── prisma.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Roadmap

- [x] **Phase 1** — Core Notification Engine (state machine, retry, dedup)
- [x] **Phase 2** — Scalability (indexes, rate limiting, queue architecture)
- [x] **Phase 3** — Multi-Tenant SaaS (tenants, API keys, isolation)
- [x] **Phase 4** — User Management (recipients, preferences, device tokens)
- [x] **Phase 5** — Reporting & Analytics (delivery logs, aggregates)
- [x] **Phase 6** — Reliability (DLQ, circuit breaker, backup providers)
- [ ] Admin dashboard UI
- [ ] Tenant self-service portal
- [ ] Batch / bulk notification API
- [ ] Template variable interpolation engine
- [ ] Scheduled notification cron worker
- [ ] Multi-region deployment guide
- [ ] Kubernetes Helm chart
- [ ] OpenAPI / Swagger documentation
- [ ] SDKs (Node.js, Python, Go)

---

## License

This project is private and proprietary.

---

Built with care for scale, resilience, and simplicity.
