'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export interface MobileNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
  ariaLabel?: string;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    return exact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 shadow-[0_-6px_16px_-8px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom))' }}
      aria-label="Primary mobile"
    >
      {/* Scroll hint gradients */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/80 to-transparent" />

      <div
        className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory"
      >
        <ul className="flex items-stretch gap-1 px-3 py-2 min-h-[68px]">
          {items.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href} className="snap-start">
                <a
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[72px] rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                    active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? '' : ''}`} />
                  <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && item.badge !== '' && (
                    <span className="absolute -top-1 right-2 bg-red-500 text-white text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default MobileBottomNav;


