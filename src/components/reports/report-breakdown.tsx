'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ReportBreakdownProps<T> {
  title: string;
  data: T[];
  renderLeft: (item: T) => React.ReactNode;
  renderRight: (item: T) => React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
}

export function ReportBreakdown<T extends { id: string }>({ 
  title, 
  data, 
  renderLeft, 
  renderRight, 
  renderItem 
}: ReportBreakdownProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="text-sm font-medium text-gray-900">
                    {renderLeft(item)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {renderRight(item)}
                </div>
              </div>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                  <div className="pt-4 space-y-3">
                    {renderItem(item)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
