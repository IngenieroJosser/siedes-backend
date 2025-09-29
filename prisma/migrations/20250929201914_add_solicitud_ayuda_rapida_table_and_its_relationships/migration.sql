/*
  Warnings:

  - Added the required column `institucionId` to the `FactorRiesgo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FactorRiesgo" ADD COLUMN     "institucionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."SolicitudAyudaRapida" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "SolicitudAyudaRapida_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SolicitudAyudaRapida" ADD CONSTRAINT "SolicitudAyudaRapida_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "public"."Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolicitudAyudaRapida" ADD CONSTRAINT "SolicitudAyudaRapida_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
