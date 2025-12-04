"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clientesService } from '@/services/clientes.service';
import { Cliente } from '@/types';

interface ClienteFormProps {
  onSuccess: (nuevoCliente?: Cliente) => void;
  editingCliente?: Cliente | null;
  onCancel?: () => void;
}

export function ClienteForm({ onSuccess, editingCliente, onCancel }: ClienteFormProps) {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCliente) {
      setDni(editingCliente.dni || '');
      setNombre(editingCliente.nombre);
      setApellido(editingCliente.apellido || '');
      setEmail(editingCliente.email || '');
      setTelefono(editingCliente.telefono || '');
      setDireccion(editingCliente.direccion || '');
    } else {
      setDni('');
      setNombre('');
      setApellido('');
      setEmail('');
      setTelefono('');
      setDireccion('');
    }
  }, [editingCliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = { dni, nombre, apellido, email, telefono, direccion };

    try {
      let result;
      if (editingCliente) {
        result = await clientesService.actualizar(editingCliente.id, data);
      } else {
        result = await clientesService.crear(data);
      }
      onSuccess(result);
    } catch (err: any) {
      console.error('Error guardando cliente', err);
      setError(err.response?.data?.message || 'No se pudo guardar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="dni">DNI *</Label>
        <Input
          id="dni"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
          maxLength={20}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombres *</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="apellido">Apellidos</Label>
          <Input
            id="apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefono">Celular</Label>
          <Input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
      </div>

      <div>
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
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
          {isSubmitting ? 'Guardando...' : (editingCliente ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
}
