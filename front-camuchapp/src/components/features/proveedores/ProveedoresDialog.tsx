"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProveedorForm } from './ProveedorForm';
import { Proveedor } from '@/types';
import { Plus } from 'lucide-react';

interface ProveedoresDialogProps {
  trigger?: React.ReactNode;
  onProveedorCreado?: (proveedor: Proveedor) => void;
}

export function ProveedoresDialog({ trigger, onProveedorCreado }: ProveedoresDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (proveedor?: Proveedor) => {
    setOpen(false);
    if (onProveedorCreado && proveedor) {
      onProveedorCreado(proveedor);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Proveedor</DialogTitle>
        </DialogHeader>
        <ProveedorForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
