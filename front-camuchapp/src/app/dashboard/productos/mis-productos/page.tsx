"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productosService } from '@/services/productos.service';
import { Producto } from '@/types';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { CategoryCarousel } from '@/components/features/productos/CategoryCarousel';
import { ENV } from '@/config/environments';

export default function MisProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
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
    };
    fetchProductos();
  }, []);

  const filteredProductos = useMemo(() => {
    return productos.filter(producto => {
      const matchesCategory = selectedCategory ? producto.categoria_id === selectedCategory : true;
      const matchesSearch = searchTerm ? producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });
  }, [productos, selectedCategory, searchTerm]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Asegurar que no haya doble slash
    const baseUrl = ENV.API_BASE_URL.replace('/api', '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Buscar producto por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CategoryCarousel onSelectCategory={setSelectedCategory} />
      </div>

      {isLoading && <p>Cargando productos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProductos.map((producto) => (
            <Card key={producto.id}>
              <CardHeader className="p-0">
                <div className="relative w-full h-48">
                  {producto.foto_url ? (
                    <Image
                      src={getImageUrl(producto.foto_url)}
                      alt={producto.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-t-lg object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-t-lg">
                      <span className="text-6xl">{producto.categoria.emoji}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-base font-bold mb-1">{producto.nombre}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline">{producto.categoria.nombre}</Badge>
                  {producto.codigo_producto && (
                    <Badge variant="secondary">{producto.codigo_producto}</Badge>
                  )}
                </div>
                <CardDescription className="text-sm truncate">
                  {producto.descripcion || 'Sin descripción.'}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center p-4 pt-0">
                <p className="font-semibold">{formatCurrency(producto.precio)}</p>
                <div className="flex items-center gap-2">
                  {producto.stock <= producto.stock_minimo && (
                    <Badge variant="destructive">Stock bajo</Badge>
                  )}
                  <p className={`text-sm ${producto.stock <= producto.stock_minimo ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Stock: {producto.stock}
                  </p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
       {!isLoading && !error && filteredProductos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron productos que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
}
