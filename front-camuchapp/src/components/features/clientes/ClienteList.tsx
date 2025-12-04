"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cliente } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

interface ClienteListProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export function ClienteList({ clientes, onEdit, onDelete }: ClienteListProps) {
  return (
    <div className="border rounded-lg">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {clientes.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No hay clientes registrados.
                    </TableCell>
                 </TableRow>
            ) : (
                clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                    <TableCell className="font-medium">
                        {cliente.nombre} {cliente.apellido}
                    </TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{cliente.telefono || '-'}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{cliente.direccion || '-'}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(cliente)}>
                        <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(cliente.id)}>
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
