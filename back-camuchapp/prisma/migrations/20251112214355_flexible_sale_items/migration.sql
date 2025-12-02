-- DropForeignKey
ALTER TABLE `detalle_venta` DROP FOREIGN KEY `detalle_venta_producto_id_fkey`;

-- DropIndex
DROP INDEX `detalle_venta_producto_id_fkey` ON `detalle_venta`;

-- AlterTable
ALTER TABLE `detalle_venta` ADD COLUMN `descripcion_libre` VARCHAR(200) NULL,
    MODIFY `producto_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `detalle_venta` ADD CONSTRAINT `detalle_venta_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
