/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ruc]` on the table `proveedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "dni" VARCHAR(20);

-- AlterTable
ALTER TABLE "proveedor" ADD COLUMN     "ruc" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_dni_key" ON "cliente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "proveedor_ruc_key" ON "proveedor"("ruc");
