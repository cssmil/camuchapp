-- AlterTable
ALTER TABLE `historial_producto` MODIFY `tipo_evento` ENUM('CREACION', 'AUMENTO_STOCK', 'ELIMINACION') NOT NULL;
