'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ContactsList } from '@/components/pages/contacts-list';
import { ContactModal } from '@/components/modals/contact-modal';
import { Contact } from '@/lib/api/contacts-service';
import { useContactActions } from '@/hooks/use-contacts';

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [searchValue, setSearchValue] = useState('');

  const { deleteContact } = useContactActions();

  const handleAddContact = () => {
    setModalMode('new');
    setSelectedContact(undefined);
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
  };

  return (
    <MainLayout 
      activeNavItem="contacts"
      headerConfig={headerConfig}
      notifications={5}
      user={{ name: "User", initials: "U" }}
    >
      <ContactsList 
        onAddContact={handleAddContact}
        onEditContact={handleEditContact}
        onViewContact={handleViewContact}
        searchValue={searchValue}
      />
      
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        contact={selectedContact}
        onSave={handleSaveContact}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
      />
    </MainLayout>
  );
}