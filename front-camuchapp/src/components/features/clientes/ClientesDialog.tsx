"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClienteForm } from './ClienteForm';
import { Cliente } from '@/types';
import { Plus } from 'lucide-react';

interface ClientesDialogProps {
  trigger?: React.ReactNode;
  onClienteCreado?: (cliente: Cliente) => void;
}

export function ClientesDialog({ trigger, onClienteCreado }: ClientesDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (cliente?: Cliente) => {
    setOpen(false);
    if (onClienteCreado && cliente) {
        onClienteCreado(cliente);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Ingrese los datos del cliente para registrarlo en el sistema.
          </DialogDescription>
        </DialogHeader>
        <ClienteForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
