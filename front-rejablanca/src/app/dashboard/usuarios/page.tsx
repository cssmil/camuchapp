'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Usuario, RolUsuario } from '@/types';
import { useSession } from '@/context/SessionContext';
import { obtenerTodosLosUsuarios, eliminarUsuario } from '@/services/usuarios.service';
import { UserTable } from '@/components/features/usuarios/user-table';
import { AddEditUserModal } from '@/components/features/usuarios/add-edit-user-modal';

export default function PaginaUsuarios() {
  const { user: sessionUser, isLoading: isSessionLoading } = useSession();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await obtenerTodosLosUsuarios();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los usuarios. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser?.rol === RolUsuario.Administrador) {
      fetchUsers();
    }
  }, [sessionUser]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: Usuario) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: Usuario) => {
    if (window.confirm(`¿Está seguro que desea eliminar a ${user.nombre_completo}?`)) {
      try {
        await eliminarUsuario(user.id);
        setUsers(users.filter((u) => u.id !== user.id));
      } catch (err) {
        setError('Error al eliminar el usuario.');
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSaved = () => {
    // No need to manually update state, just refetch
    fetchUsers();
    handleCloseModal();
  };

  if (isSessionLoading) {
    return <p>Cargando...</p>;
  }

  if (sessionUser?.rol !== RolUsuario.Administrador) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
        <p>No tiene permisos para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Usuario
        </Button>
      </div>

      {loading && <p>Cargando usuarios...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      )}

      {isModalOpen && (
        <AddEditUserModal
          user={selectedUser}
          onClose={handleCloseModal}
          onSave={handleUserSaved}
        />
      )}
    </div>
  );
}