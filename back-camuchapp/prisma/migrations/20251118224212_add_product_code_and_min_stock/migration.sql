/*
  Warnings:

  - You are about to drop the column `codigo_barras` on the `producto` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo_producto]` on the table `producto` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `producto_codigo_barras_key` ON `producto`;

-- AlterTable
ALTER TABLE `producto` DROP COLUMN `codigo_barras`,
    ADD COLUMN `codigo_producto` VARCHAR(50) NULL,
    ADD COLUMN `stock_minimo` INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE UNIQUE INDEX `producto_codigo_producto_key` ON `producto`(`codigo_producto`);
