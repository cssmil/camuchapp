"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MisProductosPage from "./mis-productos/page";
import GestionProductosPage from "./gestion-de-productos/page";
import HistorialProductosPage from "./historial-de-productos/page";

export default function ProductosPage() {
  return (
    <Tabs defaultValue="mis-productos">
      <div>
          <h1 className="text-2xl font-bold tracking-tight pb-2">Mis productos</h1>
      </div>
      <TabsList>
        <TabsTrigger value="mis-productos">Ver Productos</TabsTrigger>
        <TabsTrigger value="gestion-de-productos">Gestión de Productos</TabsTrigger>
        <TabsTrigger value="historial-de-productos">Historial de Productos</TabsTrigger>
      </TabsList>
      <TabsContent value="mis-productos">
        <MisProductosPage />
      </TabsContent>
      <TabsContent value="gestion-de-productos">
        <GestionProductosPage />
      </TabsContent>
      <TabsContent value="historial-de-productos">
        <HistorialProductosPage />
      </TabsContent>
    </Tabs>
  );
}
