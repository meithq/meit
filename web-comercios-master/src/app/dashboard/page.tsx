'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Gift, TrendingUp, CreditCard } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/use-analytics-query';
import { useAuthStore } from '@/store/auth-store';
import { formatDate } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants';
import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ActivityItem } from '@/components/dashboard/ActivityItem';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardHomeContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: metrics, isLoading: loading, error, refetch } = useDashboardMetrics();

  // Mock recent activity data (will be replaced with real API call)
  const recentActivity = [
    {
      id: '1',
      type: 'points' as const,
      customerName: 'María García',
      amount: 25,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'gift_card' as const,
      customerName: 'Carlos Martínez',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'redemption' as const,
      customerName: 'Ana Rodríguez',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'points' as const,
      customerName: 'Luis Pérez',
      amount: 15,
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'checkin' as const,
      customerName: 'Carmen Silva',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];

  // Generate contextual alerts based on data
  const generateAlerts = () => {
    const alerts = [];

    if (metrics) {
      // No check-ins today warning
      if (metrics.today_visits === 0) {
        alerts.push({
          type: 'warning' as const,
          title: 'Sin actividad hoy',
          message: 'Aún no has registrado check-ins hoy. Recuerda compartir tu código QR con los clientes.',
        });
      }

      // Low customer engagement info
      if (metrics.active_customers < 10 && metrics.total_customers >= 10) {
        alerts.push({
          type: 'info' as const,
          title: 'Baja participación',
          message: `Solo ${metrics.active_customers} de ${metrics.total_customers} clientes han visitado en los últimos 30 días. Considera crear un nuevo reto.`,
        });
      }

      // Active challenges success
      if (metrics.active_challenges > 0) {
        alerts.push({
          type: 'success' as const,
          title: 'Retos activos',
          message: `Tienes ${metrics.active_challenges} ${metrics.active_challenges === 1 ? 'reto activo' : 'retos activos'} en ejecución. Los clientes están ganando puntos extra.`,
        });
      }

      // Good performance
      if (metrics.today_visits >= 10) {
        alerts.push({
          type: 'success' as const,
          title: '¡Excelente día!',
          message: `Ya has registrado ${metrics.today_visits} check-ins hoy. ¡Sigue así!`,
        });
      }
    }

    return alerts;
  };

  const alerts = generateAlerts();
  const currentDate = new Date();
  const greeting = user?.name ? `Hola, ${user.name}` : 'Dashboard';
  const dateSubtitle = `Hoy es ${formatDate(currentDate, 'EEEE, dd de MMMM yyyy')}`;

  return (
    <Container>
      {/* Page Header - ALWAYS VISIBLE */}
      <PageHeader
        title={greeting}
        subtitle={dateSubtitle}
      />

      {/* Error Banner - Show if error */}
      {error && (
        <div className="mb-6">
          <AlertBanner
            type="error"
            title="Error de conexión"
            message={error instanceof Error ? error.message : 'Error desconocido'}
          />
          <div className="mt-4">
            <Button onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Section - Show skeleton inline if loading, else show data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading && !metrics ? (
          // Inline skeleton - no blocking
          <>
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </>
        ) : (
          // Real metrics
          <>
            <MetricCard
              title="Check-ins Hoy"
              value={metrics?.today_visits || 0}
              trend="+10% vs ayer"
              trendDirection="up"
              icon={Users}
              color="primary"
            />
            <MetricCard
              title="Puntos Asignados Hoy"
              value={metrics?.today_points || 0}
              trend="+5% vs ayer"
              trendDirection="up"
              icon={Gift}
              color="teal"
            />
            <MetricCard
              title="Clientes Activos"
              value={metrics?.active_customers || 0}
              trend={`${metrics?.total_customers || 0} totales`}
              trendDirection="neutral"
              icon={TrendingUp}
              color="yellow"
            />
            <MetricCard
              title="Gift Cards Generadas"
              value="0"
              trend="Sin cambios"
              trendDirection="neutral"
              icon={CreditCard}
              color="green"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              <Link
                href={ROUTES.ANALYTICS}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todas →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    type={activity.type}
                    customerName={activity.customerName}
                    amount={activity.amount}
                    timestamp={activity.timestamp}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary-50 hover:border-primary-300"
                onClick={() => router.push(ROUTES.POS)}
              >
                <Gift className="h-6 w-6 text-primary-600" />
                <span className="text-sm font-medium">Asignar Puntos</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent-teal/10 hover:border-accent-teal"
                onClick={() => {
                  // TODO: Open gift card validation modal
                  alert('Función de validación de gift card próximamente');
                }}
              >
                <CreditCard className="h-6 w-6 text-accent-teal" />
                <span className="text-sm font-medium">Validar Gift Card</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent-yellow/10 hover:border-accent-yellow"
                onClick={() => router.push(ROUTES.CUSTOMERS)}
              >
                <Users className="h-6 w-6 text-accent-yellow" />
                <span className="text-sm font-medium">Ver Clientes</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent-green/10 hover:border-accent-green"
                onClick={() => router.push(`${ROUTES.CHALLENGES}/new`)}
              >
                <TrendingUp className="h-6 w-6 text-accent-green" />
                <span className="text-sm font-medium">Crear Reto</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertBanner
              key={index}
              type={alert.type}
              title={alert.title}
              message={alert.message}
            />
          ))}
        </div>
      )}
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardHomeContent />
    </ErrorBoundary>
  );
}
