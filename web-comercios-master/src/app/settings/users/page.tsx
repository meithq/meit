'use client';

import * as React from 'react';
import { UserPlus, Edit2, Ban, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateUserModal } from '@/components/settings/create-user-modal';
import type { CreateUserFormData } from '@meit/shared/validators/settings';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

// Mock data
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    role: 'admin',
    is_active: true,
    last_login: '2025-10-12T10:30:00',
    created_at: '2025-01-01T00:00:00',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@ejemplo.com',
    role: 'operator',
    is_active: true,
    last_login: '2025-10-11T15:20:00',
    created_at: '2025-02-15T00:00:00',
  },
];

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(MOCK_USERS);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [deactivateUserId, setDeactivateUserId] = React.useState<string | null>(null);

  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      // TODO: Call API to create user
      console.log('Creating user:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to list (mock)
      const newUser: User = {
        id: String(users.length + 1),
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: true,
        last_login: null,
        created_at: new Date().toISOString(),
      };
      setUsers([...users, newUser]);

      toast.success('Usuario creado exitosamente');
    } catch (err) {
      toast.error('Error al crear usuario');
      throw err;
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      // Check if only admin
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.is_active);
      if (activeAdmins.length === 1 && activeAdmins[0].id === userId) {
        toast.error('No puedes desactivar el único administrador');
        return;
      }

      // TODO: Call API to deactivate user
      console.log('Deactivating user:', userId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update list (mock)
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );

      toast.success('Usuario desactivado');
      setDeactivateUserId(null);
    } catch {
      toast.error('Error al desactivar usuario');
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      // TODO: Call API to activate user
      console.log('Activating user:', userId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update list (mock)
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: true } : u))
      );

      toast.success('Usuario activado');
    } catch {
      toast.error('Error al activar usuario');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Usuarios</h2>
          <p className="text-sm text-neutral-600">
            Gestiona los usuarios con acceso a tu comercio
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar usuario
        </Button>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No hay usuarios"
              description="Agrega usuarios para que puedan acceder al sistema"
              icon={Users}
              action={{
                label: 'Agregar primer usuario',
                onClick: () => setCreateModalOpen(true),
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-900">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Badge
                        variant={user.role === 'admin' ? 'primary' : 'secondary'}
                      >
                        {user.role === 'admin' ? 'Administrador' : 'Operador'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Badge
                        variant={user.is_active ? 'success' : 'error'}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-600">
                      {user.last_login
                        ? format(new Date(user.last_login), 'dd/MM/yyyy HH:mm')
                        : 'Nunca'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {user.is_active ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement edit modal
                                toast.info('Función en desarrollo');
                              }}
                              aria-label={`Editar ${user.name}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeactivateUserId(user.id)}
                              aria-label={`Desactivar ${user.name}`}
                            >
                              <Ban className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(user.id)}
                            aria-label={`Activar ${user.name}`}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Role Permissions Info */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">
          Permisos por rol
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-primary-50 p-3">
            <p className="font-medium text-primary-900">Administrador</p>
            <ul className="mt-1 space-y-1 text-sm text-primary-700">
              <li>• Acceso completo al sistema</li>
              <li>• Puede gestionar usuarios</li>
              <li>• Puede modificar configuración</li>
              <li>• Acceso a reportes y analytics</li>
            </ul>
          </div>
          <div className="rounded-lg bg-neutral-50 p-3">
            <p className="font-medium text-neutral-900">Operador</p>
            <ul className="mt-1 space-y-1 text-sm text-neutral-700">
              <li>• Acceso solo al POS</li>
              <li>• Puede ver lista de clientes</li>
              <li>• No puede cambiar configuración</li>
              <li>• No puede gestionar usuarios</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Deactivate Confirmation */}
      {deactivateUserId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeactivateUserId(null)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-neutral-900">
              Desactivar usuario
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              ¿Estás seguro de que deseas desactivar este usuario? No podrá
              acceder al sistema.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeactivateUserId(null)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeactivate(deactivateUserId)}
                fullWidth
              >
                Desactivar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
