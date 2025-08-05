import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { NoSubscriptionView } from '@/components/dashboard/subscriptions/views/no-subscription-view';
import { MultipleSubscriptionsView } from '@/components/dashboard/subscriptions/views/multiple-subscriptions-view';
import { SubscriptionErrorView } from '@/components/dashboard/subscriptions/views/subscription-error-view';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';
import { SniperTable } from './sniper-table';

export async function CallSniperTrialView() {
  const { data: subscriptions } = await getSubscriptions();

  console.log(subscriptions);

  if (subscriptions) {
    if (subscriptions.length === 0) {
      return <NoSubscriptionView />;
    } else if (subscriptions.length === 1) {
      return <SniperTable />;
    }
  } else {
    return <SubscriptionErrorView />;
  }
}
