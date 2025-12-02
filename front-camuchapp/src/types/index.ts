// Tipos para la autenticación

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

// Puedes agregar más tipos aquí a medida que la aplicación crece
export enum RolUsuario {
  Administrador = 'Administrador',
  Colaborador = 'Colaborador',
}

export interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  rol: RolUsuario;
  creado_en: string;
  actualizado_en: string;
}

export type CrearUsuarioDto = Omit<Usuario, 'id' | 'creado_en' | 'actualizado_en'> & {
  password: string;
};

export type ActualizarUsuarioDto = Partial<CrearUsuarioDto>;

// --- Tipos para Módulo de Productos ---

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  emoji?: string | null;
}

export interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
  stock_minimo: number;
  fecha_vencimiento?: string | null;
  codigo_producto?: string | null;
  foto_url?: string | null;
  emoji_url?: string | null;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
  
  // Relaciones anidadas
  categoria: Categoria;
  proveedor?: Proveedor | null;
  categoria_id: number;
}

// --- Tipos para Módulo de Clientes ---

export interface Cliente {
  id: number;
  nombre: string;
  apellido?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

// --- Tipos para Módulo de Ventas ---

export interface DetalleVenta {
  id: number;
  cantidad: number;
  precio_unitario: number;
  producto?: Producto; // Un detalle puede no tener un producto de inventario (venta libre)
  descripcion_libre?: string; // Descripción para ventas que no son de stock
}

export interface Venta {
  id: number;
  fecha: string;
  total: number;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;

  // Relaciones anidadas
  cliente?: Cliente | null;
  usuario: Pick<Usuario, 'id' | 'nombre_completo' | 'email'>;
  detalles_venta: DetalleVenta[];
}

// --- Tipos para Módulo de Gastos ---

export interface DetalleGasto {
  id: number;
  descripcion: string;
  costo: number;
}

export interface Gasto {
  id: number;
  fecha: string;
  total: number;
  esta_activo: boolean;
  creado_en: string;
  actualizado_en: string;

  // Relaciones anidadas
  proveedor?: Proveedor | null;
  usuario: Pick<Usuario, 'id' | 'nombre_completo'>;
  detalles_gasto: DetalleGasto[];
}

// --- Tipos para Módulo de Dashboard ---

export interface DashboardSummary {
  totalVentas: number;
  totalGastos: number;
  balance: number;
}

export interface SalesOverTime {
  name: string;
  total: number;
}

export interface TopSellingProduct {
  name: string;
  value: number;
}

export type LowStockProduct = Producto;

export type ExpiringProduct = Producto;

// --- Tipos para Historial de Productos ---

export interface HistorialProducto {
  id: number;
  fecha: string;
  tipo_evento: 'CREACION' | 'AUMENTO_STOCK' | 'ELIMINACION';
  cantidad: number;
  usuario: {
    nombre_completo: string;
  };
  producto: Producto;
}
