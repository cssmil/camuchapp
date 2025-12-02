"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Categoria } from '@/types';

interface CategoryListProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export function CategoryList({ categorias, onEdit, onDelete }: CategoryListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Emoji</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categorias.map((categoria) => (
          <TableRow key={categoria.id}>
            <TableCell>{categoria.emoji}</TableCell>
            <TableCell>{categoria.nombre}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(categoria)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(categoria.id)}>
                  Eliminar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
