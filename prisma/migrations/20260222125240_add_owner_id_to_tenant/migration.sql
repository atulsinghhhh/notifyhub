-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Tenant_ownerId_idx" ON "Tenant"("ownerId");
