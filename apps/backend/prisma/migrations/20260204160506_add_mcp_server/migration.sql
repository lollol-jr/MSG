-- CreateTable
CREATE TABLE "McpServer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "args" JSONB,
    "envVars" JSONB,
    "status" TEXT NOT NULL DEFAULT 'INSTALLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McpServer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "McpServer" ADD CONSTRAINT "McpServer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
