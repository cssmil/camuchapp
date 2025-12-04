"use client";

import { useState, useEffect, useCallback } from 'react';
import { Proveedor } from '@/types';
import { proveedoresService } from '@/services/proveedores.service';
import { ProveedorList } from '@/components/features/proveedores/ProveedorList';
import { ProveedoresDialog } from '@/components/features/proveedores/ProveedoresDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProveedorForm } from '@/components/features/proveedores/ProveedorForm';
import { Loader2 } from 'lucide-react';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  const loadProveedores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await proveedoresService.obtenerTodos();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        await proveedoresService.eliminar(id);
        setProveedores(proveedores.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error eliminando proveedor', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">Gestione sus proveedores de productos y servicios.</p>
        </div>
        <ProveedoresDialog onProveedorCreado={loadProveedores} />
      </div>

      {loading ? (
         <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ProveedorList 
            proveedores={proveedores} 
            onEdit={setEditingProveedor} 
            onDelete={handleDelete} 
        />
      )}

      <Dialog open={!!editingProveedor} onOpenChange={(open) => !open && setEditingProveedor(null)}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Editar Proveedor</DialogTitle>
            </DialogHeader>
            <ProveedorForm 
                editingProveedor={editingProveedor} 
                onSuccess={() => {
                    setEditingProveedor(null);
                    loadProveedores();
                }}
                onCancel={() => setEditingProveedor(null)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
