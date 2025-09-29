/*
  Warnings:

  - Changed the type of `motivo` on the `SolicitudAyudaRapida` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."SolicitudAyudaRapida" DROP COLUMN "motivo",
ADD COLUMN     "motivo" "public"."MotivoSolicitud" NOT NULL;
