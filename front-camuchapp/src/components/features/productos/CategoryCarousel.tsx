"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { categoriasService } from '@/services/categorias.service';
import { Categoria } from '@/types';

interface CategoryCarouselProps {
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryCarousel({ onSelectCategory }: CategoryCarouselProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await categoriasService.obtenerTodas();
        setCategorias(data);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategorias();
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      onSelectCategory(null);
    } else {
      setSelectedCategory(categoryId);
      onSelectCategory(categoryId);
    }
  };

  return (
      <div className="flex gap-2 max-w-[calc(100vw-354px)] overflow-x-scroll auto pb-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => handleCategoryClick(0)}
        >
          Todas
        </Button>
        {categorias.map((categoria) => (
          <Button
            key={categoria.id}
            variant={selectedCategory === categoria.id ? 'default' : 'outline'}
            onClick={() => handleCategoryClick(categoria.id)}
          >
            {categoria.nombre}
          </Button>
        ))}
      </div>
  );
}
