'use client';

import React, { useState } from 'react';
import { useContactActions } from '@/hooks/use-contacts';
import { ContactType, ContactStatus, Contact } from '@/lib/api/contacts-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Edit,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContactsListProps {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  total: number;
  reloadList: () => void;
  onAddContact: () => void;
  onEditContact: (contact: Contact) => void;
  onViewContact: (contact: Contact) => void;
}

export function ContactsList({ 
  contacts,
  loading,
  error,
  total,
  reloadList,
  onAddContact, 
  onEditContact, 
  onViewContact 
}: ContactsListProps) {
  const router = useRouter();

  const { deleteContact, selectContact } = useContactActions();

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(contactId);
        reloadList();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const handleViewContact = (contact: Contact) => {
    onViewContact(contact);
  };

  const handleEditContact = (contact: Contact) => {
    onEditContact(contact);
  };

  const getContactTypeIcon = (type: ContactType) => {
    switch (type) {
      case ContactType.Organisation:
        return <Building className="h-4 w-4 text-purple-600" />;
      case ContactType.Staff:
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadgeVariant = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.Active:
        return 'default';
      case ContactStatus.Inactive:
        return 'secondary';
      case ContactStatus.Archived:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Helper function to format address with proper state handling
  const formatAddress = (contact: Contact) => {
    if (!contact.addressLine1) return null;
    
    const parts = [contact.addressLine1];
    if (contact.addressLine2) parts.push(contact.addressLine2);
    
    // Handle state - can be string or object with name property
    let stateName = '';
    if (contact.state) {
      if (typeof contact.state === 'object' && contact.state !== null) {
        stateName = (contact.state as { name?: string }).name || '';
      } else {
        stateName = String(contact.state);
      }
    }
    if (stateName) parts.push(stateName);
    if (contact.postcode) parts.push(contact.postcode);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={reloadList}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total} contact{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts?.map((contact) => {
          const formattedAddress = formatAddress(contact);
          return (
            <Card 
              key={contact.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewContact(contact)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Grid layout: Name/Email (left) | Phone/Address (right) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left column: Name and Email */}
                    <div className="space-y-3">
                      {/* First row: Name */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getContactTypeIcon(contact.contactType)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contact.fullName || contact.organisationName}
                          </h3>
                        </div>
                        {contact.status && contact.status !== '-' && (
                          <Badge variant={getStatusBadgeVariant(contact.status)}>
                            {contact.status}
                          </Badge>
                        )}
                      </div>
                      {/* Second row: Email */}
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Right column: Phone and Address */}
                    <div className="space-y-3">
                      {/* First row: Phone Number */}
                      {(contact.mobileNumber || contact.phone) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{contact.mobileNumber || contact.phone}</span>
                        </div>
                      )}
                      {/* Second row: Address */}
                      {formattedAddress && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{formattedAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {contact.notes && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="italic">"{contact.notes}"</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {contacts?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No contacts found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first contact
          </p>
          <Button onClick={onAddContact} className="flex items-center mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      )}
    </div>
  );
}
