-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'DEGRADED', 'DOWN');

-- CreateEnum
CREATE TYPE "CircuitBreakerState" AS ENUM ('CLOSED', 'OPEN', 'HALF_OPEN');

-- CreateEnum
CREATE TYPE "DeliveryEventType" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'OPENED', 'CLICKED', 'FAILED', 'RETRIED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "settings" JSONB,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 60,
    "rateLimitPerDay" INTEGER NOT NULL DEFAULT 100000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopes" TEXT[] DEFAULT ARRAY['notifications:send']::TEXT[],
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "locale" TEXT DEFAULT 'en',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recipientId" TEXT,
    "templateId" TEXT,
    "idempotencyKey" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "queuedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" TIMESTAMP(3),
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLog" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "eventType" "DeliveryEventType" NOT NULL,
    "provider" TEXT,
    "statusCode" INTEGER,
    "response" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAggregate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "date" DATE NOT NULL,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "totalBounced" INTEGER NOT NULL DEFAULT 0,
    "totalOpened" INTEGER NOT NULL DEFAULT 0,
    "totalClicked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadLetterQueue" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadLetterQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBackup" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "circuitState" "CircuitBreakerState" NOT NULL DEFAULT 'CLOSED',
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "failureThreshold" INTEGER NOT NULL DEFAULT 5,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "circuitOpenedAt" TIMESTAMP(3),
    "cooldownMs" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "notificationId" TEXT,
    "eventType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "lastAttemptAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),
    "responseCode" INTEGER,
    "responseBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_prefix_idx" ON "ApiKey"("prefix");

-- CreateIndex
CREATE INDEX "Recipient_tenantId_idx" ON "Recipient"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_tenantId_externalId_key" ON "Recipient"("tenantId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_tenantId_email_key" ON "Recipient"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_tenantId_phone_key" ON "Recipient"("tenantId", "phone");

-- CreateIndex
CREATE INDEX "DeviceToken_recipientId_idx" ON "DeviceToken"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceToken_recipientId_token_key" ON "DeviceToken"("recipientId", "token");

-- CreateIndex
CREATE INDEX "NotificationPreference_recipientId_idx" ON "NotificationPreference"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_recipientId_channel_key" ON "NotificationPreference"("recipientId", "channel");

-- CreateIndex
CREATE INDEX "NotificationTemplate_tenantId_idx" ON "NotificationTemplate"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_tenantId_name_channel_key" ON "NotificationTemplate"("tenantId", "name", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "Notification"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Notification_tenantId_status_idx" ON "Notification"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Notification_tenantId_channel_idx" ON "Notification"("tenantId", "channel");

-- CreateIndex
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_status_nextRetryAt_idx" ON "Notification"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_idx" ON "Notification"("scheduledAt");

-- CreateIndex
CREATE INDEX "Notification_idempotencyKey_idx" ON "Notification"("idempotencyKey");

-- CreateIndex
CREATE INDEX "DeliveryLog_notificationId_idx" ON "DeliveryLog"("notificationId");

-- CreateIndex
CREATE INDEX "DeliveryLog_timestamp_idx" ON "DeliveryLog"("timestamp");

-- CreateIndex
CREATE INDEX "DeliveryLog_eventType_idx" ON "DeliveryLog"("eventType");

-- CreateIndex
CREATE INDEX "DeliveryAggregate_tenantId_date_idx" ON "DeliveryAggregate"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAggregate_tenantId_channel_date_key" ON "DeliveryAggregate"("tenantId", "channel", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DeadLetterQueue_notificationId_key" ON "DeadLetterQueue"("notificationId");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_retryable_processedAt_idx" ON "DeadLetterQueue"("retryable", "processedAt");

-- CreateIndex
CREATE INDEX "DeadLetterQueue_createdAt_idx" ON "DeadLetterQueue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE INDEX "Provider_channel_isActive_priority_idx" ON "Provider"("channel", "isActive", "priority");

-- CreateIndex
CREATE INDEX "RateLimitLog_tenantId_windowStart_idx" ON "RateLimitLog"("tenantId", "windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitLog_tenantId_channel_windowStart_key" ON "RateLimitLog"("tenantId", "channel", "windowStart");

-- CreateIndex
CREATE INDEX "WebhookEvent_tenantId_idx" ON "WebhookEvent"("tenantId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_nextRetryAt_idx" ON "WebhookEvent"("status", "nextRetryAt");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "NotificationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAggregate" ADD CONSTRAINT "DeliveryAggregate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadLetterQueue" ADD CONSTRAINT "DeadLetterQueue_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateLimitLog" ADD CONSTRAINT "RateLimitLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;
