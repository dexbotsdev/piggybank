import { SubscriptionDetail } from '@/components/dashboard/subscriptions/components/subscription-detail';
import { NoSubscriptionView } from '@/components/dashboard/subscriptions/views/no-subscription-view';
import { MultipleSubscriptionsView } from '@/components/dashboard/subscriptions/views/multiple-subscriptions-view';
import { SubscriptionErrorView } from '@/components/dashboard/subscriptions/views/subscription-error-view';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';
import { SniperTable } from './sniper-table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export async function CallSniperTrialView() {
  const { data: subscriptions } = await getSubscriptions();

  console.log(subscriptions);

  if (subscriptions) {
    if (subscriptions.length === 1) {
      return (
        <>
          <Card
            className={
              'bg-background/50 backdrop-blur-[24px] border-border p-6 col-span-12 md:col-span-6 lg:col-span-4'
            }
          >
            <CardHeader className="p-0 space-y-0">
              <CardTitle className="flex justify-between items-center pb-2">
                <span className={'text-xl font-medium'}>No active subscriptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className={'p-0'}>
              <div className="text-base leading-6 text-secondary">
                Sign up for a subscription to access the sniper screen.
              </div>
            </CardContent>
            <CardFooter className={'p-0 pt-6'}>
              <Button asChild={true} size={'sm'} variant={'outline'} className={'text-sm rounded-sm border-border'}>
                <Link href={'/'}>Subscribe Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </>
      );
    } else if (subscriptions.length === 0) {
      return <SniperTable subscriptions={subscriptions} />;
    }
  } else {
    return <SubscriptionErrorView />;
  }
}
