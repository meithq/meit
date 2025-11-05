'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  CreditCard,
  BarChart3,
  Settings,
  Gift,
  MapPin,
} from 'lucide-react';
import { Sidebar, SidebarSection } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Use specific Zustand selectors to avoid unnecessary re-renders
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const clearAuthState = useAuthStore((state) => state.logout);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Memoize navigation sections for sidebar
  const sidebarSections: SidebarSection[] = useMemo(() => [
    {
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          href: '/dashboard/customers',
          label: 'Clientes',
          icon: Users,
        },
        {
          href: '/dashboard/branches',
          label: 'Sucursales',
          icon: MapPin,
        },
        {
          href: '/dashboard/pos',
          label: 'Punto de Venta',
          icon: Gift,
        },
        {
          href: '/dashboard/challenges',
          label: 'Retos',
          icon: Target,
        },
        {
          href: '/dashboard/gift-cards',
          label: 'Gift Cards',
          icon: CreditCard,
        },
        {
          href: '/dashboard/analytics',
          label: 'Analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          href: '/dashboard/settings',
          label: 'Ajustes',
          icon: Settings,
        },
      ],
    },
  ], []);

  // Memoize logo component
  const logo = useMemo(() => (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
        <span className="text-lg font-bold text-white">M</span>
      </div>
      {!sidebarCollapsed && (
        <span className="text-xl font-bold text-primary-600">Meit!</span>
      )}
    </div>
  ), [sidebarCollapsed]);

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearAuthState();
      toast.success('Sesión cerrada exitosamente');
      router.push('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      console.error('Logout error:', error);
    }
  }, [clearAuthState, router]);

  // Memoize user data for header
  const headerUser = useMemo(() => user
    ? {
        name: user.name || user.email || 'Usuario',
        email: user.email || '',
        role: role === 'admin' ? 'Administrador' : 'Operador',
      }
    : undefined, [user, role]);

  // Memoize toggle handlers
  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleMenuClick = useCallback(() => {
    setShowMobileMenu(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleNotificationClick = useCallback(() => {
    toast.info('Notificaciones próximamente');
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          sections={sidebarSections}
          logo={logo}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={handleCloseMobileMenu}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              sections={sidebarSections}
              logo={logo}
              collapsed={false}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={headerUser}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
          onNotificationClick={handleNotificationClick}
          notifications={0} // TODO: Get real notification count
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
