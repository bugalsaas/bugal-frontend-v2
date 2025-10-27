'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { mobileCard, mobileSpacing, mobileUtils } from '@/lib/mobile-utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function MobileCard({ 
  children, 
  className, 
  interactive = false,
  elevated = false,
  onClick 
}: MobileCardProps) {
  const baseClasses = elevated ? mobileCard.elevated : mobileCard.base;
  const interactiveClasses = interactive ? mobileCard.interactive : '';
  
  return (
    <div
      className={cn(
        baseClasses,
        interactiveClasses,
        mobileUtils.touchFeedback,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Mobile-specific card variants
export function StatCard({ 
  title, 
  value, 
  change, 
  trend,
  className 
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const trendColor = {
    up: 'text-success-500',
    down: 'text-destructive-500',
    neutral: 'text-gray-500'
  }[trend || 'neutral'];

  return (
    <MobileCard className={cn('text-center', className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {change && (
        <p className={`text-sm ${trendColor}`}>
          {trend === 'up' && '↗'} {trend === 'down' && '↘'} {change}
        </p>
      )}
    </MobileCard>
  );
}

export function ActionCard({ 
  title, 
  description, 
  action, 
  icon,
  className 
}: {
  title: string;
  description?: string;
  action: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <MobileCard 
      interactive 
      onClick={action}
      className={cn('cursor-pointer', className)}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <span className="text-gray-400">→</span>
        </div>
      </div>
    </MobileCard>
  );
}

export function ListCard({ 
  items, 
  className 
}: {
  items: Array<{
    title: string;
    subtitle?: string;
    value?: string;
    badge?: string;
    onClick?: () => void;
  }>;
  className?: string;
}) {
  return (
    <MobileCard className={className}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between py-2',
              item.onClick && 'cursor-pointer hover:bg-gray-50 rounded-md px-2 -mx-2'
            )}
            onClick={item.onClick}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {item.badge}
                </span>
              )}
              {item.value && (
                <span className="text-sm text-gray-900">{item.value}</span>
              )}
              {item.onClick && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </MobileCard>
  );
}
