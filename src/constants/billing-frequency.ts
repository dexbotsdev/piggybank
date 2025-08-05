export interface IBillingFrequency {
  value: string;
  label: string;
  priceSuffix: string;
}

export const BillingFrequency: IBillingFrequency[] = [
  //  { value: 'trial', label: 'Trial', priceSuffix: ' 1 day Trial' },
  { value: 'month', label: 'Monthly', priceSuffix: 'per user/month' },
  // { value: 'year', label: 'Annual', priceSuffix: 'per user/year' },
];
