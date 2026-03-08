-- AlterTable (idempotent: only add if missing)
ALTER TABLE "email_verifications" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "email_verifications" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_verifications_user_id_idx" ON "email_verifications"("user_id");

-- AddForeignKey (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'email_verifications_user_id_fkey') THEN
    ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
