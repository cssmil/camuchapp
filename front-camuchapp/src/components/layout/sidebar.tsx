'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { RolUsuario } from "@/types";
import {
BarChart,
CreditCard,
Home,
Package,
ShoppingCart,
Users,
Bot,
Truck,
Contact,
} from "lucide-react";
export function Sidebar() {
  const { user } = useSession();
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-all hover:text-primary-foreground"
      : "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  };

  return (
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Farmacia RejaBlanca</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link href="/dashboard" className={getLinkClass("/dashboard")}>
              <Home className="h-4 w-4" />
              Panel
            </Link>
            <Link
              href="/dashboard/ventas"
              className={getLinkClass("/dashboard/ventas")}
            >
              <ShoppingCart className="h-4 w-4" />
              Registrar Ventas
            </Link>
            <Link
              href="/dashboard/gastos"
              className={getLinkClass("/dashboard/gastos")}
            >
              <CreditCard className="h-4 w-4" />
              Registrar Gastos
            </Link>
            <Link
              href="/dashboard/productos"
              className={getLinkClass("/dashboard/productos")}
            >
              <Package className="h-4 w-4" />
              Productos
            </Link>
            {user?.rol === RolUsuario.Administrador && (
              <Link
                href="/dashboard/categorias"
                className={getLinkClass("/dashboard/categorias")}
              >
                <Users className="h-4 w-4" />
                Categorías
              </Link>
            )}
            <Link
              href="/dashboard/clientes"
              className={getLinkClass("/dashboard/clientes")}
            >
              <Contact className="h-4 w-4" />
              Clientes
            </Link>
            <Link
              href="/dashboard/proveedores"
              className={getLinkClass("/dashboard/proveedores")}
            >
              <Truck className="h-4 w-4" />
              Proveedores
            </Link>
            <Link
              href="/dashboard/reportes"
              className={getLinkClass("/dashboard/reportes")}
            >
              <BarChart className="h-4 w-4" />
              Reportes
            </Link>
            <Link
              href="/dashboard/agente-ia"
              className={getLinkClass("/dashboard/agente-ia")}
            >
              <Bot className="h-4 w-4" />
              Agente IA
            </Link>
            {user?.rol === RolUsuario.Administrador && (
              <Link
                href="/dashboard/usuarios"
                className={getLinkClass("/dashboard/usuarios")}
              >
                <Users className="h-4 w-4" />
                Usuarios
              </Link>
            )}
          </nav>
        </div>
      </div>
  );
}
