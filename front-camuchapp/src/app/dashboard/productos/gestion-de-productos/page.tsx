"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { productosService } from '@/services/productos.service';
import { Producto } from '@/types';
import { AddProductModal } from '@/components/features/productos/add-product-modal';
import { EditProductModal } from '@/components/features/productos/EditarProductoModal';
import { AddStockModal } from '@/components/features/productos/AddStockModal';
import { CategoryCarousel } from '@/components/features/productos/CategoryCarousel';
import { format } from 'date-fns';

export default function GestionProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productosService.obtenerTodos();
      setProductos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const filteredProductos = useMemo(() => {
    return productos.filter(producto => {
      const matchesCategory = selectedCategory ? producto.categoria.id === selectedCategory : true;
      const matchesSearch = searchTerm ? producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || producto.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });
  }, [productos, selectedCategory, searchTerm]);

  const handleEditClick = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsEditModalOpen(true);
  };

  const handleAddStockClick = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsAddStockModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productosService.eliminar(id);
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar el producto', error);
        setError('No se pudo eliminar el producto.');
      }
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión de Productos</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          Agregar Producto
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CategoryCarousel onSelectCategory={setSelectedCategory} />
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={fetchProductos}
      />

      {selectedProduct && (
        <>
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onProductUpdated={fetchProductos}
            producto={selectedProduct}
          />
          <AddStockModal
            isOpen={isAddStockModalOpen}
            onClose={() => setIsAddStockModalOpen(false)}
            onStockAdded={fetchProductos}
            producto={selectedProduct}
          />
        </>
      )}

      {isLoading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Fecha de Vencimiento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.codigo_producto}</TableCell>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>{producto.categoria.nombre}</TableCell>
                <TableCell>{producto.precio}</TableCell>
                <TableCell>{producto.stock}</TableCell>
                <TableCell>{formatDate(producto.fecha_vencimiento)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddStockClick(producto)}>
                      Agregar Stock
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(producto)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(producto.id)}>
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
