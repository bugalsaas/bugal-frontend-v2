'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ContactsList } from '@/components/pages/contacts-list';
import { ContactModal } from '@/components/modals/contact-modal';
import { Contact } from '@/lib/api/contacts-service';

export default function ContactsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'view'>('new');
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();

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
    // The ContactsList component will refresh automatically via the hook
  };

  const headerConfig = {
    title: "Contacts",
    subtitle: "Contacts overview",
    showSearch: false,
    showAddButton: false,
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
      />
      
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        contact={selectedContact}
        onSave={handleSaveContact}
      />
    </MainLayout>
  );
}