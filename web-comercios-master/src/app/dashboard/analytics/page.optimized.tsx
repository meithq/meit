'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { subDays } from 'date-fns';

import { useAnalytics } from '@/hooks/use-analytics';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';

import { Container } from '@/components/layout/container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

import { PeriodSelector, type PeriodRange } from '@/components/analytics/period-selector';
import { MetricsGrid } from '@/components/analytics/metrics-grid';

// Lazy load heavy chart components
const CheckInsChart = dynamic(
  () => import('@/components/analytics/check-ins-chart').then((mod) => ({ default: mod.CheckInsChart })),
  {
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false, // Charts use window/document, can't SSR
  }
);

const PointsChart = dynamic(
  () => import('@/components/analytics/points-chart').then((mod) => ({ default: mod.PointsChart })),
  {
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false,
  }
);

const TopChallengesChart = dynamic(
  () => import('@/components/analytics/top-challenges-chart').then((mod) => ({ default: mod.TopChallengesChart })),
  {
    loading: () => <Skeleton className="h-80 w-full" />,
    ssr: false,
  }
);

const InsightsSection = dynamic(
  () => import('@/components/analytics/insights-section').then((mod) => ({ default: mod.InsightsSection })),
  {
    loading: () => <Skeleton className="h-40 w-full" />,
  }
);

const ExportButton = dynamic(
  () => import('@/components/analytics/export-button').then((mod) => ({ default: mod.ExportButton })),
  {
    loading: () => <Skeleton className="h-10 w-32" />,
  }
);

function AnalyticsContent() {
  const router = useRouter();
  const { merchantId } = useAuthStore();

  // Period state - default to last 30 days
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
    label: 'Últimos 30 días',
  });

  // Analytics hook with date range
  const { metrics, checkinsData, pointsData, topChallenges, insights, loading, error, fetchAnalytics } =
    useAnalytics(selectedPeriod);

  // Fetch analytics on mount and when period changes
  React.useEffect(() => {
    if (merchantId) {
      fetchAnalytics();
    }
  }, [merchantId, selectedPeriod, fetchAnalytics]);

  // Handle period change
  const handlePeriodChange = (period: PeriodRange) => {
    setSelectedPeriod(period);
  };

  // Error state
  if (error) {
    return (
      <Container>
        <PageHeader title="Analytics" subtitle="Error al cargar los datos" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error de conexión</h3>
              <p className="text-sm text-red-700">
                {error || 'Error al cargar analytics'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => fetchAnalytics()} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        subtitle="Análisis detallado de tu negocio"
        actions={
          <ExportButton
            metrics={metrics}
            checkinsData={checkinsData}
            pointsData={pointsData}
            topChallenges={topChallenges}
            dateRange={selectedPeriod}
          />
        }
      />

      {/* Period Selector */}
      <div className="mb-8">
        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />
      </div>

      {/* Metrics Grid - 6 cards */}
      <section aria-labelledby="metrics-heading" className="mb-12">
        <h2 id="metrics-heading" className="sr-only">
          Métricas principales
        </h2>
        <MetricsGrid metrics={metrics} loading={loading} />
      </section>

      {/* Charts Section - Lazy loaded */}
      <section aria-labelledby="charts-heading" className="mb-12">
        <h2 id="charts-heading" className="text-2xl font-semibold text-neutral-900 mb-6">
          Tendencias
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CheckInsChart data={checkinsData} loading={loading} />
          <PointsChart data={pointsData} loading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <TopChallengesChart data={topChallenges} loading={loading} />
        </div>
      </section>

      {/* Insights Section */}
      <section className="mb-12">
        <InsightsSection insights={insights} loading={loading} />
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-50 to-accent-teal/10 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">¿Quieres mejorar estos números?</h3>
        <p className="text-neutral-600 mb-6">
          Crea nuevos retos para incentivar a tus clientes y aumentar la participación
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => router.push(`${ROUTES.CHALLENGES}/new`)}>
            Crear Nuevo Reto
          </Button>
          <Button variant="outline" onClick={() => router.push(ROUTES.CUSTOMERS)}>
            Ver Clientes
          </Button>
        </div>
      </section>
    </Container>
  );
}

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
