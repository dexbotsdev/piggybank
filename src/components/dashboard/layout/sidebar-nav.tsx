'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrenchSniperIcon, SettingsIcon } from '@/components/icons';
import { Banknote, Home, PanelTopDashedIcon, WalletCards } from 'lucide-react';

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard',
    },
    {
      id: 'callSniper',
      label: 'Call Sniper',
      icon: TrenchSniperIcon,
      href: '/dashboard/callsniper',
    },
    {
      id: 'subscription',
      label: 'Subscriptions',
      icon: WalletCards,
      href: '/dashboard/subscriptions',
    },
    // {
    //   id: "trenchsniper",
    //   label: "Payments",
    //   icon: Banknote,
    //   href: "/dashboard/payments",
    // },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      href: '/dashboard/settings',
    },
  ];

  return (
    <nav className="flex-1 p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname === `${item.href}/`;

          return (
            <Button key={item.id} variant="ghost" asChild>
              <Link
                href={item.href}
                className={`flex w-full items-center justify-start text-sm font-normal h-10 transition-all duration-200 rounded-lg ${
                  isActive ? ' text-leaf-primary hover:bg-leaf-primary/20' : ' text-white hover:bg-leaf-highlight/50'
                }`}
              >
                <span className="ml-3 flex items-center text-sm font-normal justify-center w-6 h-6">
                  <item.icon />
                </span>
                <span className="ml-3 text-sm font-normal ">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
