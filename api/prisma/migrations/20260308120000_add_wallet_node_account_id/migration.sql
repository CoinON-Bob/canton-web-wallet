-- AlterTable
ALTER TABLE "wallets" ADD COLUMN "node_account_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_node_account_id_key" ON "wallets"("node_account_id");
