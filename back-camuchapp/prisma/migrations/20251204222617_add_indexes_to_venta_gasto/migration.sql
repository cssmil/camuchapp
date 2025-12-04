-- CreateIndex
CREATE INDEX "gasto_creado_en_idx" ON "gasto"("creado_en");

-- CreateIndex
CREATE INDEX "gasto_esta_activo_idx" ON "gasto"("esta_activo");

-- CreateIndex
CREATE INDEX "venta_creado_en_idx" ON "venta"("creado_en");

-- CreateIndex
CREATE INDEX "venta_esta_activo_idx" ON "venta"("esta_activo");
