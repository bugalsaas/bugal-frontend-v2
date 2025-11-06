'use client';

import React from 'react';
import { X, Search } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeaderConfig } from '@/lib/navigation-config';

interface MobileSearchFiltersDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  headerConfig: PageHeaderConfig;
}

export function MobileSearchFiltersDrawer({
  isOpen,
  onOpenChange,
  headerConfig,
}: MobileSearchFiltersDrawerProps) {
  const [searchValue, setSearchValue] = React.useState('');

  // Sync search value when drawer opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      // Reset search value when drawer closes (only if not using Apply/Clear pattern)
      if (!headerConfig.onApply) {
        setSearchValue('');
      }
    }
  }, [isOpen, headerConfig.onApply]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Call parent's onSearchChange to update parent's drawer state
    if (headerConfig.onSearchChange) {
      headerConfig.onSearchChange(value);
    }
  };

  const handleAddClick = () => {
    if (headerConfig.onAddClick) {
      headerConfig.onAddClick();
      // Optionally close drawer after clicking add
      // onOpenChange(false);
    }
  };

  const handleApply = () => {
    if (headerConfig.onApply) {
      headerConfig.onApply();
    }
    // Close drawer after applying
    onOpenChange(false);
  };

  const handleClear = () => {
    if (headerConfig.onClear) {
      headerConfig.onClear();
    }
    // Clear search value in drawer
    setSearchValue('');
    // Keep drawer open
  };

  const drawerTitle = headerConfig.drawerTitle || 'Search & Filters';
  const showAddButtonInDrawer = headerConfig.showAddButtonInDrawer !== false && headerConfig.showAddButton && !headerConfig.onApply;
  const showApplyClear = headerConfig.onApply && headerConfig.onClear;

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="top">
      <DrawerContent className="max-h-[calc(100vh-56px)] rounded-b-lg z-40" style={{ top: '56px' }}>
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle>{drawerTitle}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Search Input */}
          {headerConfig.showSearch && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={headerConfig.searchPlaceholder || 'Search...'}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Custom Filter Component */}
          {headerConfig.customFilterComponent && (
            <div className="space-y-2">
              {headerConfig.customFilterComponent}
            </div>
          )}

          {/* Filter Button */}
          {headerConfig.showFilters && headerConfig.onFilterClick && (
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={headerConfig.onFilterClick}
                className="w-full"
              >
                Filters
              </Button>
            </div>
          )}

          {/* Apply and Clear Buttons */}
          {showApplyClear && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          )}

          {/* Add Button */}
          {showAddButtonInDrawer && (
            <div className="space-y-2 pt-2 border-t">
              <Button
                onClick={handleAddClick}
                className="w-full"
              >
                {headerConfig.addButtonText || 'New'}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

