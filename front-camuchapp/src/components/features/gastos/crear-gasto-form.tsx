'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Proveedor } from '@/types';
import { proveedoresService } from '@/services/proveedores.service';
import { gastosService } from '@/services/gastos.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { ProveedoresDialog } from '../proveedores/ProveedoresDialog';

interface ItemGasto {
  id: string;
  descripcion: string;
  costo: number;
}

export function CrearGastoForm() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<number | undefined>();
  
  const [items, setItems] = useState<ItemGasto[]>([]);
  
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    proveedoresService.obtenerTodos().then(setProveedores).catch(console.error);
  }, []);

  const agregarItem = () => {
    if (!descripcion || !costo || Number(costo) <= 0) {
      setError('La descripción y el costo son obligatorios.');
      return;
    }
    const nuevoItem: ItemGasto = {
      id: `gasto-${Date.now()}`,
      descripcion,
      costo: Number(costo),
    };
    setItems((prev) => [...prev, nuevoItem]);
    setDescripcion('');
    setCosto('');
    setError(null);
  };

  const removerItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalGasto = items.reduce((acc, item) => acc + item.costo, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Debe agregar al menos un item de gasto.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const gastoData = {
      proveedorId: proveedorSeleccionado,
      items: items.map(({ descripcion, costo }) => ({ descripcion, costo })),
    };

    try {
      await gastosService.crear(gastoData);
      router.push('/dashboard/reportes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al crear el gasto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Añadir Item de Gasto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="desc-gasto">Descripción</Label>
                <Input id="desc-gasto" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Renta, Luz, Mercancía" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costo-gasto">Costo</Label>
                <Input id="costo-gasto" type="number" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="0.00" />
              </div>
              <Button onClick={agregarItem} className="w-full">Añadir Gasto</Button>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="proveedor">
              <AccordionTrigger>Proveedor (Opcional)</AccordionTrigger>
              <AccordionContent>
                <div className="flex gap-2 pt-2">
                  <Select value={proveedorSeleccionado?.toString()} onValueChange={(value) => setProveedorSeleccionado(Number(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {proveedores.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ProveedoresDialog 
                    trigger={<Button variant="outline" size="icon" title="Crear Nuevo Proveedor"><PlusCircle className="h-4 w-4" /></Button>}
                    onProveedorCreado={(nuevo) => {
                        setProveedores(prev => [...prev, nuevo]);
                        setProveedorSeleccionado(nuevo.id);
                    }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6">
            <Button onClick={handleSubmit} disabled={isLoading || items.length === 0} className="w-full">
              {isLoading ? 'Procesando...' : 'Finalizar Gasto'}
            </Button>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Items de Gasto</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[150px]">Costo</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No hay items de gasto</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell>S/{item.costo.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removerItem(item.id)}>
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
          <span className="text-2xl font-bold">Total Gasto: S/{totalGasto.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
