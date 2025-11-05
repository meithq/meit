import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ChallengesSkeleton } from '@/components/challenges/challenges-skeleton';

export default function ChallengesLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Retos y Desafíos"
        subtitle="Gestiona los retos de fidelización para tus clientes"
        actions={<Skeleton height={44} width={140} />}
      />
      <ChallengesSkeleton count={3} />
    </div>
  );
}
