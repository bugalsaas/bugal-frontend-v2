'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Plus, CheckCircle } from 'lucide-react';
import { Organization } from '@/lib/api/organizations-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrganizationSwitcherProps {
  organizations: Organization[];
  currentOrganization: Organization | null;
  onOrganizationSwitch: (org: Organization) => void;
  onCreateNew: () => void;
}

export function OrganizationSwitcher({ 
  organizations, 
  currentOrganization,
  onOrganizationSwitch,
  onCreateNew
}: OrganizationSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('sole_trader');

  const handleCreateOrg = () => {
    // TODO: Implement organization creation
    setCreateOrgModalOpen(false);
    setNewOrgName('');
    onCreateNew();
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left hover:bg-gray-700"
            style={{ 
              color: 'white !important',
              backgroundColor: 'transparent'
            }}
          >
            {currentOrganization ? (
              <>
                <Building2 className="h-4 w-4 mr-2" style={{ color: 'white' }} />
                <span className="truncate" style={{ color: 'white' }}>{currentOrganization.name}</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mr-2" style={{ color: 'white' }} />
                <span style={{ color: 'white' }}>Select a business</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase">
            Business
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {organizations.map((org) => {
            const isCurrent = currentOrganization?.id === org.id;
            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  onOrganizationSwitch(org);
                  setDropdownOpen(false);
                }}
                disabled={isCurrent}
                className="cursor-pointer"
              >
                {isCurrent ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">{org.name}</span>
                    <span className="ml-auto text-xs text-gray-500">(current)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{org.name}</span>
                  </>
                )}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCreateOrgModalOpen(true);
              setDropdownOpen(false);
            }}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>New business</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Organization Modal */}
      <Dialog open={createOrgModalOpen} onOpenChange={setCreateOrgModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Business</DialogTitle>
            <DialogDescription>
              Create a new business organization to manage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Business Name *</Label>
              <Input
                id="org-name"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Enter business name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="org-type">Business Type</Label>
              <Select value={newOrgType} onValueChange={setNewOrgType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_trader">Sole Trader</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateOrgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateOrg} 
              disabled={!newOrgName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
