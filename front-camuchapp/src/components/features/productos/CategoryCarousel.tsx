"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (categoryId === 0) {
       setSelectedCategory(null);
       onSelectCategory(null);
       return;
    }
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      onSelectCategory(null);
    } else {
      setSelectedCategory(categoryId);
      onSelectCategory(categoryId);
    }
  };

  const handleSelectChange = (value: string) => {
      if (value === 'all') {
          setSelectedCategory(null);
          onSelectCategory(null);
      } else {
          const id = parseInt(value);
          setSelectedCategory(id);
          onSelectCategory(id);
      }
  }

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="md:hidden w-full">
        <Select 
            value={selectedCategory?.toString() || "all"} 
            onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id.toString()}>
                {categoria.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex gap-2 max-w-[calc(100vw-354px)] overflow-x-scroll auto pb-2">
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
    </div>
  );
}
