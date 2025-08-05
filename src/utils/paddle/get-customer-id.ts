import { createClient } from '@/utils/supabase/server';

export async function getCustomerId() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();

  console.log(user);

  if (user.data.user?.email) {
    const customersData = await supabase
      .from('customers')
      .select('customer_id,email')
      .eq('email', user.data.user?.email)
      .single();

    console.log(customersData);

    if (customersData?.data?.customer_id) {
      return customersData?.data?.customer_id as string;
    }
  }
  return '';
}
