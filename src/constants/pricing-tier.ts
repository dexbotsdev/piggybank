export interface Tier {
  name: string;
  id: 'starter' | 'pro' | 'advanced';
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: 'Trial',
    id: 'starter',
    icon: '/assets/icons/price-tiers/free-icon.svg',
    description: 'Ideal for individuals who want to get started .',
    features: ['1 Day', 'Limited Profits', 'Test it Out'],
    featured: true,
    priceId: { month: 'pri_01k1vkmn8brqgmcpe8vfy294g2', year: 'pri_01k1vkmn8brqgmcpe8vfy294g2' },
  },
  // {
  //   name: 'Monthly',
  //   id: 'pro',
  //   icon: '/assets/icons/price-tiers/basic-icon.svg',
  //   description: 'Flexible subscription for Individuals who want to Indulge Regularly',
  //   features: ['Monthly', 'Unlimited Profits', 'Advanced Filtering', 'Everything in Starter'],
  //   featured: true,
  //   priceId: { month: 'pri_01k1vkr23rshm3a07tx5ed3mvf', year: 'pri_01k1vkr23rshm3a07tx5ed3mvf' },
  // },
  // {
  //   name: 'LifeTime',
  //   id: 'advanced',
  //   icon: '/assets/icons/price-tiers/pro-icon.svg',
  //   description: 'Advanced Features, Selectable Callers, .',
  //   features: [
  //     'Lifetime Access',
  //     'Selectable Callers',
  //     'Preset Settings',
  //     'Everything in Pro',
  //   ],
  //   featured: false,
  //   priceId: { month: 'pri_01k1vkpd59brctbgvvvsmn8c7f', year: 'pri_01k1vkpd59brctbgvvvsmn8c7f' },
  // },
];
