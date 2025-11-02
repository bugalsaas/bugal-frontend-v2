'use client';

import { useState, useEffect } from 'react';
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

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const headerConfig = {
    title: "Contacts",
    subtitle: "Contacts overview",
    showSearch: true,
    showAddButton: true,
    addButtonText: "New Contact",
    searchPlaceholder: "Search contacts...",
    onSearchChange: handleSearchChange,
    onAddClick: handleAddContact,
    customFilterComponent: (
      <Select
        value={contactTypeFilter}
        onValueChange={(value) => setContactTypeFilter(value as ContactType)}
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