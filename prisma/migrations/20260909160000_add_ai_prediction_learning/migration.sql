-- CreateEnum
CREATE TYPE "EstadoPermanencia" AS ENUM ('ACTIVO', 'PROMOVIDO', 'REPROBADO', 'TRANSFERIDO', 'GRADUADO', 'DESERTO');

-- CreateTable
CREATE TABLE "PrediccionRiesgo" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "nivelRiesgo" "NivelRiesgo" NOT NULL,
    "modelType" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "institutionalPrior" DOUBLE PRECISION,
    "factores" JSONB,
    "warnings" JSONB,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrediccionRiesgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutcomeEstudiantePeriodo" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "periodoObservacion" TEXT NOT NULL,
    "periodoResultado" TEXT NOT NULL,
    "estadoResultado" "EstadoPermanencia" NOT NULL,
    "desertoSiguientePeriodo" BOOLEAN NOT NULL,
    "registradoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutcomeEstudiantePeriodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrediccionRiesgo_estudianteId_creadaEn_idx" ON "PrediccionRiesgo"("estudianteId", "creadaEn");

-- CreateIndex
CREATE INDEX "PrediccionRiesgo_modelVersion_idx" ON "PrediccionRiesgo"("modelVersion");

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeEstudiantePeriodo_estudianteId_periodoObservacion_periodoResultado_key"
ON "OutcomeEstudiantePeriodo"("estudianteId", "periodoObservacion", "periodoResultado");

-- CreateIndex
CREATE INDEX "OutcomeEstudiantePeriodo_periodoResultado_desertoSiguientePeriodo_idx"
ON "OutcomeEstudiantePeriodo"("periodoResultado", "desertoSiguientePeriodo");

-- AddForeignKey
ALTER TABLE "PrediccionRiesgo"
ADD CONSTRAINT "PrediccionRiesgo_estudianteId_fkey"
FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeEstudiantePeriodo"
ADD CONSTRAINT "OutcomeEstudiantePeriodo_estudianteId_fkey"
FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
