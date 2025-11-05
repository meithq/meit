'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Coins, MessageSquare, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsTab {
  value: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    value: 'business',
    label: 'Negocio',
    icon: Building2,
    path: '/settings/business',
  },
  {
    value: 'points',
    label: 'Puntos',
    icon: Coins,
    path: '/settings/points',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
    path: '/settings/whatsapp',
  },
  {
    value: 'users',
    label: 'Usuarios',
    icon: Users,
    path: '/settings/users',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab based on current path
  const activeTab = React.useMemo(() => {
    const tab = SETTINGS_TABS.find((tab) => pathname.startsWith(tab.path));
    return tab?.value || 'business';
  }, [pathname]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    const tab = SETTINGS_TABS.find((tab) => tab.value === value);
    if (tab) {
      router.push(tab.path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Configuración"
        subtitle="Gestiona la configuración de tu comercio y programa de fidelización"
      />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2"
                aria-label={`Configuración de ${tab.label}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="pb-12">{children}</div>
    </div>
  );
}
