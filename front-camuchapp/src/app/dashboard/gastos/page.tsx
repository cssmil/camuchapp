import { CrearGastoForm } from "@/components/features/gastos/crear-gasto-form";

export default function PaginaGastos() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Registrar Gasto</h1>
      <p className="text-muted-foreground">
        Añada uno o más gastos a la vez y asígnelos a un proveedor si es necesario.
      </p>
      <div className="mt-4">
        <CrearGastoForm />
      </div>
    </div>
  );
}
