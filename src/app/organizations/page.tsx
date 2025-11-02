'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { OrganizationsList } from '@/components/pages/organizations-list';
import { OrganizationModal } from '@/components/modals/organization-modal';
import { Organization, OrganizationCreateDto, OrganizationUpdateDto } from '@/lib/api/organizations-service';
import { useOrganizationActions } from '@/hooks/use-organizations';
import { Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>();
  
  const { 
    isLoading, 
    createOrganization, 
    updateOrganization, 
    deleteOrganization, 
    exportOrganizations 
  } = useOrganizationActions();

  const handleAddOrganization = () => {
    setSelectedOrganization(undefined);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteOrganization = async (organization: Organization) => {
    if (window.confirm(`Are you sure you want to delete "${organization.name}"? This action cannot be undone.`)) {
      try {
        await deleteOrganization(organization.id);
        // The list will refresh automatically through the hook
      } catch (error) {
        console.error('Failed to delete organization:', error);
        alert('Failed to delete organization. Please try again.');
      }
    }
  };

  const handleExportOrganizations = async () => {
    try {
      await exportOrganizations();
      alert('Organizations exported successfully!');
    } catch (error) {
      console.error('Failed to export organizations:', error);
      alert('Failed to export organizations. Please try again.');
    }
  };

  const handleSaveOrganization = async (data: OrganizationCreateDto | OrganizationUpdateDto) => {
    try {
      if (modalMode === 'new') {
        await createOrganization(data as OrganizationCreateDto);
      } else if (modalMode === 'edit' && selectedOrganization) {
        await updateOrganization(selectedOrganization.id, data as OrganizationUpdateDto);
      }
      // The list will refresh automatically through the hook
    } catch (error) {
      console.error('Failed to save organization:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(undefined);
  };

  // Auto-open create modal when ?new=1 present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === '1') {
        setModalMode('new');
        setIsModalOpen(true);
      }
    }
  }, []);

  const headerConfig = {
    title: 'Organizations',
    subtitle: 'Organizations overview',
    icon: Building2,
    showAddButton: true,
    addButtonText: 'Add Organization',
    onAddClick: handleAddOrganization,
  };

  return (
    <MainLayout activeNavItem="organizations" headerConfig={headerConfig}>
      <div className="space-y-6">
        <OrganizationsList
          onViewOrganization={handleViewOrganization}
          onEditOrganization={handleEditOrganization}
          onDeleteOrganization={handleDeleteOrganization}
          onExportOrganizations={handleExportOrganizations}
        />

        <OrganizationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode={modalMode}
          organization={selectedOrganization}
          onSave={handleSaveOrganization}
        />
      </div>
    </MainLayout>
  );
}
