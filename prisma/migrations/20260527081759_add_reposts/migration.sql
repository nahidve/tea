-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'REPOST';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "repostOfId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_repostOfId_fkey" FOREIGN KEY ("repostOfId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
