"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productosService } from '@/services/productos.service';
import { categoriasService } from '@/services/categorias.service';
import { proveedoresService } from '@/services/proveedores.service';
import { Categoria, Proveedor, Producto } from '@/types';
import { AddStockModal } from './AddStockModal';
import { DatePicker } from '@/components/ui/datepicker';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

export function AddProductModal({ isOpen, onClose, onProductAdded }: AddProductModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [foto, setFoto] = useState<File | null>(null);
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>(undefined);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Producto[]>([]);
  
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Producto | null>(null);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [cats, provs] = await Promise.all([
            categoriasService.obtenerTodas(),
            proveedoresService.obtenerTodos(),
          ]);
          setCategorias(cats);
          setProveedores(provs);
        } catch (error) {
          console.error("Error fetching data for modal", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (nombre.length > 2) {
      const fetchSimilar = async () => {
        try {
          const similar = await productosService.buscar(nombre);
          setSimilarProducts(similar);
        } catch (error) {
          console.error("Error fetching similar products", error);
        }
      };
      fetchSimilar();
    } else {
      setSimilarProducts([]);
    }
  }, [nombre]);

  const handleAddStockClick = (product: Producto) => {
    setSelectedProductForStock(product);
    setIsAddStockModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaId) {
      setError("Por favor, selecciona una categoría.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('precio', String(precio));
    formData.append('stock', String(stock));
    formData.append('categoria_id', String(categoriaId));
    if (proveedorId) {
      formData.append('proveedor_id', String(proveedorId));
    }
    formData.append('stock_minimo', String(stockMinimo));
    if (foto) {
      formData.append('foto', foto);
    }
    if (fechaVencimiento) {
      formData.append('fecha_vencimiento', fechaVencimiento.toISOString());
    }

    try {
      await productosService.crear(formData);
      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error al crear el producto', error);
      setError('No se pudo crear el producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isAddStockModalOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="col-span-3"
                />
              </div>
                            {similarProducts.length > 0 && (
                              <div className="">
                                <DialogDescription>
                                  ¿Quisiste decir uno de estos?
                                </DialogDescription>
                                <ul>
                                  {similarProducts.map(p => (
                                    <li key={p.id}>
                                      {p.nombre} - <Button variant="link" onClick={() => handleAddStockClick(p)}>Añadir stock</Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="descripcion" className="text-right">
                                Descripción
                              </Label>
                              <Textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="precio" className="text-right">
                                Precio
                              </Label>
                              <Input
                                id="precio"
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(Number(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="stock" className="text-right">
                                Stock Inicial
                              </Label>
                              <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="categoria" className="text-right">
                                Categoría
                              </Label>
                              <Select onValueChange={(value) => setCategoriaId(Number(value))}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categorias.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                      {cat.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="proveedor" className="text-right">
                                Proveedor
                              </Label>
                              <Select onValueChange={(value) => setProveedorId(Number(value))}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Selecciona un proveedor (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {proveedores.map((prov) => (
                                    <SelectItem key={prov.id} value={String(prov.id)}>
                                      {prov.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="stockMinimo" className="text-right">
                                Stock Mínimo
                              </Label>
                              <Input
                                id="stockMinimo"
                                type="number"
                                value={stockMinimo}
                                onChange={(e) => setStockMinimo(Number(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="fechaVencimiento" className="text-right">
                                Fecha Vencimiento
                              </Label>
                              <DatePicker
                                date={fechaVencimiento}
                                setDate={setFechaVencimiento}
                                placeholder="Selecciona una fecha (opcional)"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="foto" className="text-right">
                                Foto
                              </Label>
                              <Input
                                id="foto"
                                type="file"
                                onChange={(e) => setFoto(e.target.files ? e.target.files[0] : null)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          {error && <p className="text-red-500 text-sm">{error}</p>}
                          <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? 'Creando...' : 'Crear Producto'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    {selectedProductForStock && (
                      <AddStockModal
                        isOpen={isAddStockModalOpen}
                        onClose={() => setIsAddStockModalOpen(false)}
                        onStockAdded={() => {
                          setIsAddStockModalOpen(false);
                          onProductAdded();
                        }}
                        producto={selectedProductForStock}
                      />
                    )}
                  </>
                );
              }

              