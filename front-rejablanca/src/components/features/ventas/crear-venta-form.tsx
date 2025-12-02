'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cliente, Producto } from '@/types';
import { clientesService } from '@/services/clientes.service';
import { productosService } from '@/services/productos.service';
import { ventasService } from '@/services/ventas.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Trash2, PlusCircle, MinusCircle } from 'lucide-react';

// Estructura unificada para cualquier item en el carrito
interface ItemEnCarrito {
  id: number | string; // number para productos, string para items libres
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  stock?: number;
  productoId?: number; // Solo para productos de inventario
}

export function CrearVentaForm() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | undefined>();
  
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemEnCarrito[]>([]);
  
  // Estado para el formulario de item libre
  const [descripcionLibre, setDescripcionLibre] = useState('');
  const [precioLibre, setPrecioLibre] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientesService.obtenerTodos().then(setClientes).catch(console.error);
  }, []);

  useEffect(() => {
    if (terminoBusqueda.length > 2) {
      const timer = setTimeout(() => {
        productosService.buscar(terminoBusqueda).then(setProductosEncontrados).catch(console.error);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProductosEncontrados([]);
    }
  }, [terminoBusqueda]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((p) => p.id === producto.id);
      if (existente) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: 1,
          precioUnitario: Number(producto.precio),
          stock: producto.stock,
        },
      ];
    });
    setTerminoBusqueda('');
    setProductosEncontrados([]);
  };

  const agregarItemLibre = () => {
    if (!descripcionLibre || !precioLibre || Number(precioLibre) <= 0) {
      setError('La descripción y el precio del item libre son obligatorios.');
      return;
    }
    const nuevoItem: ItemEnCarrito = {
      id: `libre-${Date.now()}`,
      nombre: descripcionLibre,
      cantidad: 1,
      precioUnitario: Number(precioLibre),
    };
    setCarrito((prev) => [...prev, nuevoItem]);
    setDescripcionLibre('');
    setPrecioLibre('');
    setError(null);
  };

  const actualizarCantidad = (itemId: number | string, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito((prev) => prev.filter((p) => p.id !== itemId));
    } else {
      setCarrito((prev) =>
        prev.map((p) => (p.id === itemId ? { ...p, cantidad } : p))
      );
    }
  };

  const actualizarPrecio = (itemId: number | string, precio: number) => {
    setCarrito((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, precioUnitario: precio } : p))
    );
  };

  const totalVenta = carrito.reduce(
    (acc, item) => acc + item.precioUnitario * item.cantidad,
    0
  );

  const handleSubmit = async () => {
    if (carrito.length === 0) {
      setError('El carrito no puede estar vacío.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const ventaData = {
      clienteId: clienteSeleccionado,
      items: carrito.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descripcionLibre: item.productoId ? undefined : item.nombre,
      })),
    };

    try {
      await ventasService.crear(ventaData);
      router.push('/dashboard/reportes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al crear la venta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Buscar Producto</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre o código..."
                className="pl-8"
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
              />
            </div>
            {productosEncontrados.length > 0 && (
              <div className="border rounded-md mt-2 max-h-60 overflow-y-auto">
                {productosEncontrados.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => agregarAlCarrito(p)}
                  >
                    {p.nombre} <span className="text-sm text-muted-foreground">(S/{Number(p.precio).toFixed(2)}) - Stock: {p.stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Añadir Venta Libre</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="desc-libre">Descripción</Label>
                      <Input id="desc-libre" value={descripcionLibre} onChange={(e) => setDescripcionLibre(e.target.value)} placeholder="Ej: Consulta, Servicio, etc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precio-libre">Precio</Label>
                      <Input id="precio-libre" type="number" value={precioLibre} onChange={(e) => setPrecioLibre(e.target.value)} placeholder="0.00" />
                    </div>
                    <Button onClick={agregarItemLibre} className="w-full">Añadir Item</Button>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="hidden">
            <h3 className="text-lg font-semibold mb-2">Asignar Cliente (Opcional)</h3>
            <Select onValueChange={(value) => setClienteSeleccionado(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre} {c.apellido || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6">
            <Button onClick={handleSubmit} disabled={isLoading || carrito.length === 0} className="w-full">
              {isLoading ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Carrito de Compras</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="w-[130px]">Precio Unit.</TableHead>
                <TableHead className="w-[150px]">Cantidad</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carrito.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">El carrito está vacío</TableCell>
                </TableRow>
              ) : (
                carrito.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarPrecio(item.id, Number(e.target.value))}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value, 10) || 0)}
                          className="h-8 w-16 text-center"
                        />
                        <Button variant="ghost" size="icon" onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>S/{(item.precioUnitario * item.cantidad).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => actualizarCantidad(item.id, 0)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end items-center">
          <span className="text-2xl font-bold">Total: S/{totalVenta.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
