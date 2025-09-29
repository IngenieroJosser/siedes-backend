/*
  Warnings:

  - The `ciudad` column on the `Institucion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."CiudadesUIUB" AS ENUM ('ACANDI', 'ALTO_BAUDO', 'ATRATO', 'BAGADO', 'BAHIA_SOLANO', 'BAJO_BAUDO', 'BOJAYA', 'CANTON_DE_SAN_PABLO', 'CARMEN_DEL_DARIEN', 'CERTEGUI', 'CONDOTO', 'EL_CARMEN_DE_ATRATO', 'ISTMINA', 'JURADO', 'LLORO', 'MEDIO_ATRATO', 'MEDIO_BAUDO', 'MEDIO_SAN_JUAN', 'NOVITA', 'NUQUI', 'QUIBDO', 'RIO_IRE', 'RIO_QUITO', 'RIODOCES', 'SAN_JOSE_DEL_PALMAR', 'SIPI', 'TADO', 'UNGUIA', 'UNION_PANAMERICANA', 'OTRA_CIUDAD');

-- AlterTable
ALTER TABLE "public"."Institucion" DROP COLUMN "ciudad",
ADD COLUMN     "ciudad" "public"."CiudadesUIUB" NOT NULL DEFAULT 'OTRA_CIUDAD';
