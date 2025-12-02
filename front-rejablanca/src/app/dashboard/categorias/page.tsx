"use client";

import { useState, useEffect, useCallback } from 'react';
import { CategoryForm } from '@/components/features/categorias/CategoryForm';
import { CategoryList } from '@/components/features/categorias/CategoryList';
import { categoriasService } from '@/services/categorias.service';
import { Categoria } from '@/types';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoriasService.obtenerTodas();
      setCategorias(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleEdit = (categoria: Categoria) => {
    setEditingCategory(categoria);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await categoriasService.eliminar(id);
        fetchCategorias();
      } catch (error) {
        console.error('Error al eliminar la categoría', error);
        setError('No se pudo eliminar la categoría.');
      }
    }
  };

  const handleSuccess = () => {
    fetchCategorias();
    setEditingCategory(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
        </h2>
        <CategoryForm
          onSuccess={handleSuccess}
          editingCategory={editingCategory}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Lista de Categorías</h2>
        {isLoading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <CategoryList
            categorias={categorias}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
