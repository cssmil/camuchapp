"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Proveedor } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

interface ProveedorListProps {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (id: number) => void;
}

export function ProveedorList({ proveedores, onEdit, onDelete }: ProveedorListProps) {
  return (
    <div className="border rounded-lg">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {proveedores.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No hay proveedores registrados.
                    </TableCell>
                </TableRow>
            ) : (
                proveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                    <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                    <TableCell>{proveedor.contacto || '-'}</TableCell>
                    <TableCell>{proveedor.telefono || '-'}</TableCell>
                    <TableCell>{proveedor.email || '-'}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(proveedor)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(proveedor.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))
            )}
        </TableBody>
        </Table>
    </div>
  );
}
