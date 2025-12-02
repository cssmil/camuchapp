import { CrearVentaForm } from "@/components/features/ventas/crear-venta-form";

export default function PaginaVentas() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Registrar Venta</h1>
      <p className="text-muted-foreground">
        Busque productos, agréguelos al carrito y registre una nueva venta.
      </p>
      <div className="mt-4">
        <CrearVentaForm />
      </div>
    </div>
  );
}
