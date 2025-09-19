/*
  Warnings:

  - You are about to drop the column `activo` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Estudiante" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Usuario" DROP COLUMN "activo";
