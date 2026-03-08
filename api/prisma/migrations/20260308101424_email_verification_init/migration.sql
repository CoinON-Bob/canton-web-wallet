/*
  Warnings:

  - Added the required column `updated_at` to the `email_verifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `email_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_verifications" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications"("user_id");

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
