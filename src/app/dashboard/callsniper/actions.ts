'use server';

import { validateUserSession } from '@/utils/supabase/server';
import { getSubscriptions } from '@/utils/paddle/get-subscriptions';
import axios from 'axios';

interface Error {
  error: string;
}

export async function executeTrade(data: FormData): Promise<string> {
  // const { session, supabase } = await validateUserSession();

  const subscriptionId = data.get('subscriptionId') as string;
  const walletPubkey = data.get('walletPubkey') as string;
  const tokenMint = data.get('tokenMint') as string;
  const sniperooApiKey = data.get('sniperooApiKey') as string;
  const solAmount = data.get('solAmount') as string;
  const takeProfit = data.get('takeProfit') as string;
  const stopLoss = data.get('stopLoss') as string;

  //console.log (session.user)

  try {
    // const { data: customer, error } = await supabase
    //   .from('customers')
    //   .select('sniperoo_api_key, wallet_public_key')
    //   .eq('email', session.user.email)
    //   .single();

    //   console.log(customer)

    // if (error) {
    //   console.error('Error fetching customer:', error);
    //   return JSON.stringify(error.message);
    // }

    // if (!customer.sniperoo_api_key || !customer.wallet_public_key) {
    //   const { error: updateError } = await supabase
    //     .from('customers')
    //     .update({
    //       sniperoo_api_key: sniperooApiKey,
    //       wallet_public_key: walletPubkey,
    //     })
    //   .eq('email', session.user.email)

    //   if (updateError) {
    //     console.error('Error updating customer:', updateError);
    //     return JSON.stringify(updateError.message);
    //   }
    // }

    const requestBody = {
      walletAddresses: [walletPubkey],
      tokenAddress: tokenMint,
      inputAmount: Number(solAmount),
      autoSell: {
        enabled: true, // Assuming auto-sell is always enabled for snipe
        strategy: {
          strategyName: 'simple',
          profitPercentage: Number(takeProfit),
          stopLossPercentage: Number(stopLoss),
        },
      },
    };

    console.log(`[Sniperoo] Sending buy request:`, JSON.stringify(requestBody, null, 2));

    console.log(sniperooApiKey);
    console.log(walletPubkey);

    const response = await axios
      .post('https://api.sniperoo.app/trading/buy-token?toastFrontendId=0', requestBody, {
        headers: {
          Authorization: `Bearer ${sniperooApiKey}`,
          'Content-Type': 'application/json',
        },
      })
      .catch((reason: any) => {
        console.log(reason);
        return reason;
      });

    console.log(`[Sniperoo] Buy response:`, response.data);
    if (response.data && response.data.success) {
      console.log('✅ Trade executed successfully!');

      // Only show alert for manual trades
      console.log(
        `Trade executed for ${tokenMint}!\nAmount: ${solAmount} SOL\nTake Profit: ${takeProfit}%\nStop Loss: ${stopLoss}%`,
      );

      return 'Success: Trade Executed Succesfully';
    } else {
      throw new Error(response.data.message || 'API call failed with no success indication.');
    }
  } catch (error: any) {
    return JSON.stringify(error.message);
  }
}
