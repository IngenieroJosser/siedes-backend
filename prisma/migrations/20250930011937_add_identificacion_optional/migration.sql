/*
  Warnings:

  - A unique constraint covering the columns `[identificacion]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Usuario" ADD COLUMN     "identificacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_identificacion_key" ON "public"."Usuario"("identificacion");
