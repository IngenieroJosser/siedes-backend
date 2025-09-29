/*
  Warnings:

  - Added the required column `tipoSolicitante` to the `SolicitudAyudaRapida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SolicitudAyudaRapida" ADD COLUMN     "tipoSolicitante" "public"."TipoSolicitante" NOT NULL;
