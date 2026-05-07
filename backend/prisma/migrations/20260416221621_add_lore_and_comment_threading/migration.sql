-- AlterTable
ALTER TABLE "Jogo" ADD COLUMN     "lore" TEXT;

-- CreateTable
CREATE TABLE "Comentario" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jogoId" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "adminId" INTEGER,
    "parentId" INTEGER,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comentario_jogoId_idx" ON "Comentario"("jogoId");

-- CreateIndex
CREATE INDEX "Comentario_parentId_idx" ON "Comentario"("parentId");

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comentario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
