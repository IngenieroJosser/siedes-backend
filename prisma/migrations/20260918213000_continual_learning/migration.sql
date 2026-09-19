-- Continual learning / reentrenamiento gobernado SIEDES
CREATE TABLE "ReporteInstitucional" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "fechaCorte" TIMESTAMP(3) NOT NULL,
    "matriculaCorte" INTEGER NOT NULL,
    "desertoresConfirmados" INTEGER NOT NULL,
    "tasaDesercion" DOUBLE PRECISION NOT NULL,
    "nivelRiesgoObservado" "NivelRiesgo" NOT NULL,
    "finalizado" BOOLEAN NOT NULL DEFAULT false,
    "fuente" TEXT NOT NULL DEFAULT 'OPERACIONAL',
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "finalizadoEn" TIMESTAMP(3),
    CONSTRAINT "ReporteInstitucional_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ReporteInstitucional_institucionId_anio_periodo_key" ON "ReporteInstitucional"("institucionId", "anio", "periodo");
CREATE INDEX "ReporteInstitucional_anio_periodo_idx" ON "ReporteInstitucional"("anio", "periodo");
ALTER TABLE "ReporteInstitucional" ADD CONSTRAINT "ReporteInstitucional_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "MlOutboxEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "institutionId" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MlOutboxEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MlOutboxEvent_status_nextAttemptAt_idx" ON "MlOutboxEvent"("status", "nextAttemptAt");
CREATE INDEX "MlOutboxEvent_institutionId_createdAt_idx" ON "MlOutboxEvent"("institutionId", "createdAt");
