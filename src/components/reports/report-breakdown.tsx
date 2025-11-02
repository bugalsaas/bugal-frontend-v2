'use client';

import React, { useState, useEffect } from 'react';
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
  const [isAllCollapsed, setIsAllCollapsed] = useState(true);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleAll = () => {
    if (isAllCollapsed) {
      // Expand all
      setExpandedItems(new Set(data.map(item => item.id)));
      setIsAllCollapsed(false);
    } else {
      // Collapse all
      setExpandedItems(new Set());
      setIsAllCollapsed(true);
    }
  };

  // Update isAllCollapsed state when expandedItems changes
  useEffect(() => {
    if (data.length === 0) {
      setIsAllCollapsed(true);
      return;
    }
    
    const allExpanded = expandedItems.size === data.length;
    const noneExpanded = expandedItems.size === 0;
    
    if (allExpanded) {
      setIsAllCollapsed(false);
    } else if (noneExpanded) {
      setIsAllCollapsed(true);
    }
  }, [expandedItems, data.length]);

  if (data.length === 0) {
    return null;
  }

  const renderToggleButton = () => {
    return (
      <Button
        type="button"
        variant="link"
        className="text-sm text-blue-600 hover:text-blue-800 no-print"
        onClick={toggleAll}
      >
        {isAllCollapsed ? 'expand all' : 'collapse all'}
      </Button>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {renderToggleButton()}
      </div>
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
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
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
      <div className="flex justify-end mt-4">
        {renderToggleButton()}
      </div>
    </Card>
  );
}
