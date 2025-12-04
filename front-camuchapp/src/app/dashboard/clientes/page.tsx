"use client";

import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '@/types';
import { clientesService } from '@/services/clientes.service';
import { ClienteList } from '@/components/features/clientes/ClienteList';
import { ClientesDialog } from '@/components/features/clientes/ClientesDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClienteForm } from '@/components/features/clientes/ClienteForm';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const loadClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientesService.obtenerTodos();
      setClientes(data);
    } catch (error) {
      console.error('Error cargando clientes', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await clientesService.eliminar(id);
        setClientes(clientes.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error eliminando cliente', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestione su base de datos de clientes.</p>
        </div>
        <ClientesDialog onClienteCreado={loadClientes} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ClienteList 
            clientes={clientes} 
            onEdit={setEditingCliente} 
            onDelete={handleDelete} 
        />
      )}

      {/* Modal de Edición separado para mejor control */}
      <Dialog open={!!editingCliente} onOpenChange={(open) => !open && setEditingCliente(null)}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <ClienteForm 
                editingCliente={editingCliente} 
                onSuccess={() => {
                    setEditingCliente(null);
                    loadClientes();
                }} 
                onCancel={() => setEditingCliente(null)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
