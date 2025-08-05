'use client';

import { Album, CreditCard, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: <Home className="h-6 w-6" />,
    href: '/dashboard',
  },
  {
    title: 'Sniper',
    icon: <Home className="h-6 w-6" />,
    href: '/callsniper',
  },
  {
    title: 'Subscriptions',
    icon: <Album className="h-6 w-6" />,
    href: '/dashboard/subscriptions',
  },
  {
    title: 'Payments',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/dashboard/payments',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col grow justify-between items-start px-2 text-sm font-medium lg:px-4">
      <div className={'w-full'}>
        <SidebarNav />
      </div>
    </nav>
  );
}
