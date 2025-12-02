
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Usuario, CrearUsuarioDto, RolUsuario } from '@/types';
import { crearUsuario, actualizarUsuario } from '@/services/usuarios.service';

interface AddEditUserModalProps {
  user: Usuario | null;
  onClose: () => void;
  onSave: (user: Usuario) => void;
}

const initialState: CrearUsuarioDto = {
  nombre_completo: '',
  email: '',
  password: '',
  rol: RolUsuario.Colaborador,
};

export function AddEditUserModal({ user, onClose, onSave }: AddEditUserModalProps) {
  const [formData, setFormData] = useState<CrearUsuarioDto>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre_completo: user.nombre_completo,
        email: user.email,
        rol: user.rol,
        password: '', // Password is not sent for editing unless it's being changed
      });
    } else {
      setFormData(initialState);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (value: RolUsuario) => {
    setFormData({ ...formData, rol: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let savedUser: Usuario;
      if (user) {
        // For updates, don't send the password if it's empty
        const { password, ...updateData } = formData;
        const dataToSend = password ? formData : updateData;
        savedUser = await actualizarUsuario(user.id, dataToSend);
      } else {
        // Ensure password has at least 8 characters before sending
        if (!formData.password || formData.password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres.');
          setLoading(false);
          return;
        }
        savedUser = await crearUsuario(formData);
      }
      onSave(savedUser);
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Error al guardar el usuario. Verifique los datos.';
      setError(Array.isArray(apiError) ? apiError.join(', ') : apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Añadir Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre_completo" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="col-span-3"
                placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
                required={!user}
                minLength={8}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rol" className="text-right">
                Rol
              </Label>
              <Select onValueChange={handleRoleChange} value={formData.rol}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RolUsuario.Administrador}>Administrador</SelectItem>
                  <SelectItem value={RolUsuario.Colaborador}>Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
