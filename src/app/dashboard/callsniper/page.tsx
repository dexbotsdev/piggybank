import { DashboardPageHeader } from '@/components/dashboard/layout/dashboard-page-header';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { CallSniperTrialView } from '@/components/trenchsniper/CallSniperTrialView';
import { SniperTable } from '@/components/trenchsniper/sniper-table';
import { Suspense } from 'react';

export default function TrenchSniperPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
      <DashboardPageHeader pageTitle={'Call Sniper'} />
      <Suspense fallback={<LoadingScreen />}>
        <CallSniperTrialView />
      </Suspense>
    </main>
  );
}
