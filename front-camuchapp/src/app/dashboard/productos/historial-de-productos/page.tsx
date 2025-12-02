"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { productosService } from '@/services/productos.service';
import { HistorialProducto, Producto } from '@/types';
import { CategoryCarousel } from '@/components/features/productos/CategoryCarousel';

export default function HistorialProductosPage() {
  const [history, setHistory] = useState<HistorialProducto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchAllHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productosService.getAllHistory();
      setHistory(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el historial.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllHistory();
  }, [fetchAllHistory]);

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const product = entry.producto;
      if (!product) return false;
      const matchesCategory = selectedCategory ? product.categoria.id === selectedCategory : true;
      const matchesSearch = searchTerm ? product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || product.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });
  }, [history, selectedCategory, searchTerm]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Historial de Productos</h1>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o código de producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CategoryCarousel onSelectCategory={setSelectedCategory} />
      </div>

      {isLoading && <p>Cargando historial...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Tipo de Evento</TableHead>
              <TableHead>Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.producto.nombre}</TableCell>
                <TableCell>{entry.producto.codigo_producto}</TableCell>
                <TableCell>{new Date(entry.fecha).toLocaleString()}</TableCell>
                <TableCell>{entry.usuario.nombre_completo}</TableCell>
                <TableCell>{entry.tipo_evento}</TableCell>
                <TableCell>{entry.cantidad}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
