-- CreateTable
CREATE TABLE `gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `total` DECIMAL(10, 2) NOT NULL,
    `proveedor_id` INTEGER NULL,
    `usuario_id` INTEGER NOT NULL,
    `esta_activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_eliminado` DATETIME(3) NULL,
    `eliminado_por` INTEGER NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL,
    `creado_por` INTEGER NULL,
    `actualizado_por` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(255) NOT NULL,
    `costo` DECIMAL(10, 2) NOT NULL,
    `gasto_id` INTEGER NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gasto` ADD CONSTRAINT `gasto_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gasto` ADD CONSTRAINT `gasto_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_gasto` ADD CONSTRAINT `detalle_gasto_gasto_id_fkey` FOREIGN KEY (`gasto_id`) REFERENCES `gasto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
