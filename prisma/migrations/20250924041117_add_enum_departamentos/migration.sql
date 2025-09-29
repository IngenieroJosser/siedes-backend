/*
  Warnings:

  - The `departamento` column on the `Institucion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Departamento" AS ENUM ('AMAZONAS', 'ANTIOQUIA', 'ARAUCA', 'ATLANTICO', 'BOLIVAR', 'BOYACA', 'CALDAS', 'CAQUETA', 'CASANARE', 'CAUCA', 'CESAR', 'CHOCÓ', 'CORDOBA', 'CUNDINAMARCA', 'GUAINIA', 'GUAJIRA', 'GUAVIARE', 'HUILA', 'MAGDALENA', 'META', 'NARIÑO', 'NORTE_DE_SANTANDER', 'PUTUMAYO', 'QUINDIO', 'RISARALDA', 'SAN_ANDRES', 'SANTANDER', 'SUCRE', 'TOLIMA', 'VALLE_DEL_CAUCA', 'VAUPES', 'VICHADA', 'OTRO');

-- AlterTable
ALTER TABLE "public"."Institucion" DROP COLUMN "departamento",
ADD COLUMN     "departamento" "public"."Departamento" NOT NULL DEFAULT 'OTRO';
