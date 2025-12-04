"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { proveedoresService } from '@/services/proveedores.service';
import { Proveedor } from '@/types';

interface ProveedorFormProps {
  onSuccess: (nuevoProveedor?: Proveedor) => void;
  editingProveedor?: Proveedor | null;
  onCancel?: () => void;
}

export function ProveedorForm({ onSuccess, editingProveedor, onCancel }: ProveedorFormProps) {
  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProveedor) {
      setNombre(editingProveedor.nombre);
      setRuc(editingProveedor.ruc || '');
      setContacto(editingProveedor.contacto || '');
      setTelefono(editingProveedor.telefono || '');
      setEmail(editingProveedor.email || '');
    } else {
      setNombre('');
      setRuc('');
      setContacto('');
      setTelefono('');
      setEmail('');
    }
  }, [editingProveedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = { nombre, ruc, contacto, telefono, email };

    try {
      let result;
      if (editingProveedor) {
        result = await proveedoresService.actualizar(editingProveedor.id, data);
      } else {
        result = await proveedoresService.crear(data);
      }
      onSuccess(result);
    } catch (err: any) {
      console.error('Error guardando proveedor', err);
      setError(err.response?.data?.message || 'No se pudo guardar el proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre Empresa *</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="ruc">RUC</Label>
            <Input
            id="ruc"
            value={ruc}
            onChange={(e) => setRuc(e.target.value)}
            maxLength={20}
            />
        </div>
        <div>
            <Label htmlFor="telefono">Celular</Label>
            <Input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            />
        </div>
      </div>
      
      <div>
        <Label htmlFor="contacto">Persona de Contacto</Label>
        <Input
          id="contacto"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : (editingProveedor ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
}
