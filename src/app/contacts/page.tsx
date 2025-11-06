'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { ContactsList } from '@/components/pages/contacts-list';
import { ContactModal } from '@/components/modals/contact-modal';
import { Contact, ContactType } from '@/lib/api/contacts-service';
import { useContactActions, useContacts } from '@/hooks/use-contacts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<ContactType>(ContactType.All);

  const { deleteContact } = useContactActions();
  const { setFilter, data: contacts, loading, error, total, reloadList } = useContacts();

  // Update filter when contact type or search changes
  useEffect(() => {
    setFilter({ 
      type: contactTypeFilter, 
      search: searchValue || '' 
    });
  }, [contactTypeFilter, searchValue, setFilter]);

  const handleAddContact = () => {
    // Clear any previous contact data and set to new mode
    setSelectedContact(undefined);
    setModalMode('new');
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setModalMode('edit');
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setModalMode('view');
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = (contact: Contact) => {
    console.log('Contact saved:', contact);
    // ContactsList will refresh automatically via the hook
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      // ContactsList will refresh automatically via the hook
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error; // Re-throw so modal can handle error state
    }
  };

  // Local state for drawer search/filter (not applied until Apply is clicked)
  const [drawerSearchValue, setDrawerSearchValue] = useState('');
  const [drawerContactTypeFilter, setDrawerContactTypeFilter] = useState<ContactType>(ContactType.All);

  const handleSearchChange = (value: string) => {
    // Update drawer search value (not applied yet)
    setDrawerSearchValue(value);
  };

  const handleDrawerFilterChange = (value: ContactType) => {
    // Update drawer filter value (not applied yet)
    setDrawerContactTypeFilter(value);
  };

  const handleApply = () => {
    // Apply the drawer values to actual filters
    setSearchValue(drawerSearchValue);
    setContactTypeFilter(drawerContactTypeFilter);
  };

  const handleClear = () => {
    // Clear drawer values
    setDrawerSearchValue('');
    setDrawerContactTypeFilter(ContactType.All);
    // Also clear actual filters
    setSearchValue('');
    setContactTypeFilter(ContactType.All);
  };

  // Sync drawer values when drawer opens
  const handleDrawerOpenChange = React.useCallback((isOpen: boolean) => {
    if (isOpen) {
      // When drawer opens, sync drawer values with current filter values
      setDrawerSearchValue(searchValue);
      setDrawerContactTypeFilter(contactTypeFilter);
      // Call handleSearchChange to sync the drawer's internal search input
      // This will trigger onSearchChange which updates the drawer component
      handleSearchChange(searchValue);
    }
  }, [searchValue, contactTypeFilter, handleSearchChange]);

  // Calculate active filter count based on actual applied filters
  const activeFilterCount = (() => {
    let count = 0;
    if (contactTypeFilter !== ContactType.All) count++;
    if (searchValue && searchValue.length > 0) count++;
    return count;
  })();

  const headerConfig = {
    title: "Contacts",
    subtitle: "Contacts overview",
    showSearch: true, // Show search in mobile drawer
    showAddButton: false, // Hide from header - moved to list row
    showAddButtonInDrawer: false, // Don't show in drawer on mobile
    searchPlaceholder: "Search contacts...",
    onSearchChange: handleSearchChange, // This is for the drawer's internal search
    onApply: handleApply,
    onClear: handleClear,
    onDrawerOpenChange: handleDrawerOpenChange,
    activeFilterCount,
    customFilterComponent: (
      <Select
        value={drawerContactTypeFilter}
        onValueChange={handleDrawerFilterChange}
      >
        <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ContactType.All}>All</SelectItem>
          <SelectItem value={ContactType.Client}>Client</SelectItem>
          <SelectItem value={ContactType.Organisation}>Organisation</SelectItem>
        </SelectContent>
      </Select>
    ),
  };

  return (
    <MainLayout 
      activeNavItem="contacts"
      headerConfig={headerConfig}
    >

      <ContactsList 
        contacts={contacts}
        loading={loading}
        error={error}
        total={total}
        reloadList={reloadList}
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onViewContact={handleViewContact}
        // Filter props (desktop uses applied filters, mobile uses drawer)
        searchValue={searchValue}
        contactTypeFilter={contactTypeFilter}
        onSearchChange={(value) => setSearchValue(value)}
        onFilterChange={(value) => setContactTypeFilter(value)}
      />
      
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Clear selected contact when modal closes to ensure clean state for next open
          if (modalMode === 'new') {
            setSelectedContact(undefined);
          }
        }}
        mode={modalMode}
        contact={modalMode === 'new' ? undefined : selectedContact}
        onSave={handleSaveContact}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
      />
    </MainLayout>
  );
}