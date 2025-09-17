/*
  Warnings:

  - Changed the type of `nivelRiesgo` on the `AlertaDesercion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `Beneficio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `materiasAprobadas` to the `RegistroAcademico` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materiasReprobadas` to the `RegistroAcademico` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `SolicitudAyuda` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."NivelRiesgo" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "public"."TipoSolicitud" AS ENUM ('PSICOLOGICA', 'ECONOMICA', 'ACADEMICA', 'ALIMENTARIA', 'TRANSPORTE', 'OTRA');

-- CreateEnum
CREATE TYPE "public"."PrioridadSolicitud" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "public"."TipoBeneficio" AS ENUM ('BECA', 'ALIMENTACION', 'TRANSPORTE', 'UNIFORME', 'UTILES', 'PSICOLOGICA', 'OTRO');

-- CreateEnum
CREATE TYPE "public"."EstadoAsignacion" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "public"."TipoIntervencion" AS ENUM ('ACADEMICA', 'PSICOLOGICA', 'ECONOMICA', 'FAMILIAR', 'COMUNITARIA', 'CULTURAL', 'TUTORIA', 'OTRA');

-- CreateEnum
CREATE TYPE "public"."EstadoIntervencion" AS ENUM ('ACTIVA', 'COMPLETADA', 'SUSPENDIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."CategoriaIndicador" AS ENUM ('ACADEMICA', 'SOCIOECONOMICA', 'CULTURAL', 'CONTEXTUAL', 'INSTITUCIONAL');

-- CreateEnum
CREATE TYPE "public"."CategoriaFactor" AS ENUM ('ACADEMICO', 'ECONOMICO', 'FAMILIAR', 'PERSONAL', 'INSTITUCIONAL', 'COMUNITARIO', 'CULTURAL');

-- CreateEnum
CREATE TYPE "public"."TipoInstitucion" AS ENUM ('PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'MEDIA', 'TECNICA', 'TECNOLOGICA', 'UNIVERSIDAD', 'INSTITUTO', 'OTRO');

-- AlterEnum
ALTER TYPE "public"."EstadoSolicitud" ADD VALUE 'RECHAZADA';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Rol" ADD VALUE 'COORDINADOR';
ALTER TYPE "public"."Rol" ADD VALUE 'LIDER_COMUNITARIO';

-- AlterTable
ALTER TABLE "public"."AlertaDesercion" ADD COLUMN     "factores" TEXT[],
ADD COLUMN     "fechaRevision" TIMESTAMP(3),
ADD COLUMN     "revisada" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "nivelRiesgo",
ADD COLUMN     "nivelRiesgo" "public"."NivelRiesgo" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Beneficio" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "criteriosElegibilidad" TEXT[],
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "public"."TipoBeneficio" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Institucion" ADD COLUMN     "codigoDANE" TEXT,
ADD COLUMN     "tipo" "public"."TipoInstitucion" NOT NULL DEFAULT 'UNIVERSIDAD';

-- AlterTable
ALTER TABLE "public"."RegistroAcademico" ADD COLUMN     "comportamiento" INTEGER,
ADD COLUMN     "materiasAprobadas" INTEGER NOT NULL,
ADD COLUMN     "materiasReprobadas" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."SolicitudAyuda" ADD COLUMN     "prioridad" "public"."PrioridadSolicitud" NOT NULL DEFAULT 'MEDIA',
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "public"."TipoSolicitud" NOT NULL;

-- CreateTable
CREATE TABLE "public"."AsignacionBeneficio" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "estado" "public"."EstadoAsignacion" NOT NULL DEFAULT 'ACTIVA',
    "comentarios" TEXT,

    CONSTRAINT "AsignacionBeneficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContextoEstudiante" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "distanciaEscuela" DOUBLE PRECISION NOT NULL,
    "tiempoDesplazamiento" INTEGER NOT NULL,
    "trabaja" BOOLEAN NOT NULL DEFAULT false,
    "horasTrabajo" INTEGER,
    "ingresosFamiliares" INTEGER,
    "personasHogar" INTEGER NOT NULL,
    "apoyoFamiliar" BOOLEAN NOT NULL DEFAULT true,
    "accesoInternet" BOOLEAN NOT NULL DEFAULT false,
    "dispositivoElectronico" BOOLEAN NOT NULL DEFAULT false,
    "participacionComunitaria" BOOLEAN NOT NULL DEFAULT false,
    "conocimientosAncestrales" BOOLEAN NOT NULL DEFAULT false,
    "situacionesEspeciales" TEXT,
    "necesidadesEspeciales" TEXT,

    CONSTRAINT "ContextoEstudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Intervencion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "tipo" "public"."TipoIntervencion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" "public"."EstadoIntervencion" NOT NULL DEFAULT 'ACTIVA',
    "efectividad" DOUBLE PRECISION,
    "recursosUtilizados" TEXT[],
    "participantes" TEXT[],
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intervencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IndicadorEtnico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "categoria" "public"."CategoriaIndicador" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndicadorEtnico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FactorRiesgo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "public"."CategoriaFactor" NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactorRiesgo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContextoEstudiante_estudianteId_key" ON "public"."ContextoEstudiante"("estudianteId");

-- AddForeignKey
ALTER TABLE "public"."AsignacionBeneficio" ADD CONSTRAINT "AsignacionBeneficio_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AsignacionBeneficio" ADD CONSTRAINT "AsignacionBeneficio_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "public"."Beneficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContextoEstudiante" ADD CONSTRAINT "ContextoEstudiante_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Intervencion" ADD CONSTRAINT "Intervencion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
