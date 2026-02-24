# NotifyHub — Feature Tracker

## Phase 1 — Core Notification Engine

- [x] REST API to accept notification requests (POST /api/notifications)
- [x] Bulk send endpoint (POST /api/notifications/bulk)
- [x] Store notifications in DB (status = PENDING)
- [x] Idempotency key for deduplication
- [x] Push requests into Kafka queue
- [x] Template system with {{variable}} rendering
- [x] Template CRUD (Create, List, Get, Update, Delete)
- [x] Get notification list with filters (status, channel, date, pagination)
- [x] Get single notification by ID
- [x] Kafka consumer / worker service
- [x] Send via providers (Email — Mailgun, SMS — Twilio, Push — FCM)
- [x] Status updates in DB after delivery (SENT / DELIVERED / FAILED)
- [x] Exponential retry with backoff + Dead Letter Queue
- [x] Delivery logs endpoint (GET /api/notifications/:id/logs)

## Phase 2 — Scalability for Millions of Users

- [x] Kafka for high-throughput queue
- [x] Kafka in docker-compose (bitnami/kafka, KRaft mode)
- [ ] Multiple Kafka consumer/worker instances
- [ ] DB partitioning (by date or tenant)
- [ ] Read replicas for reporting
- [ ] Rate limiting per channel
- [ ] Backpressure handling

## Phase 3 — Multi-Tenant SaaS Architecture

- [x] Tenant registration (POST /api/tenants)
- [x] Tenant list per owner (GET /api/tenants)
- [x] Tenant get by ID (GET /api/tenants/:id)
- [x] Tenant update (PUT /api/tenants/:id) ⚠️ has bug — uses old values
- [x] Tenant delete ⚠️ has bug — function named DETELE (typo)
- [x] API key auto-generation on tenant creation
- [x] API key validation (status, expiry, scope)
- [x] tenantId in all core tables
- [x] Tenant-based data isolation in all queries
- [ ] Rate limiting per tenant (schema ready, no enforcement)
- [ ] Tenant plan limits enforcement (FREE/STARTER/BUSINESS/ENTERPRISE)

## Phase 4 — User (Recipient) Management

- [x] Add recipients (POST /api/recipients) with duplicate checks
- [x] Store email, phone, device tokens
- [x] Get recipient by ID
- [x] Update recipient (PATCH)
- [x] Delete recipient with cascade
- [x] Notification preferences checked during send
- [x] Quiet hours support with timezone
- [ ] List all recipients (GET — endpoint started but empty)
- [ ] Preferences CRUD API (create/update/delete preferences)
- [ ] Device token management API (add/remove/list tokens)

## Phase 5 — Reporting & Analytics

- [x] DeliveryLog model in schema
- [x] DeliveryAggregate model in schema (daily per tenant + channel)
- [ ] Write delivery events to DeliveryLog
- [ ] Aggregate delivery statistics (cron/event processor)
- [ ] Dashboard metrics API (success rate, failure rate, usage)
- [ ] Event stream → Analytics processor pipeline

## Phase 6 — Reliability & Production Hardening

- [x] DeadLetterQueue model in schema
- [x] Provider model with circuit breaker fields in schema
- [ ] Dead Letter Queue logic (move permanently failed notifications)
- [ ] Circuit breaker implementation around provider calls
- [ ] Backup/fallback provider selection
- [ ] Webhook delivery to tenant callback URLs
- [ ] At-least-once delivery with acknowledgment
- [ ] Monitoring & alerting setup

## Known Bugs

- [ ] `tenants/[tenantId]/route.ts` — PUT updates with old values instead of request body
- [ ] `tenants/[tenantId]/route.ts` — DELETE function named `DETELE` (typo, Next.js won't route it)
- [ ] `signup/route.ts` — Creates user without tenantId (now required in schema)
- [ ] `utilis.ts` — NotificationStatus and NotificationChannel interfaces are empty
- [ ] `recipients/route.ts` — GET list endpoint has empty body
- [ ] `profile/route.ts` — Entire file is commented out
