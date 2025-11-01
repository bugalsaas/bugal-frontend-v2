'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Contact, ContactType, ContactStatus, State } from '@/lib/api/contacts-service';
import { Gender, RelationshipType, RoleType, RoleTypeToText, RelationshipTypeToText, GenderToText } from '@/lib/types/contact-types';
import { useContactActions } from '@/hooks/use-contacts';
import { useCountries, useStates } from '@/hooks/use-organizations';
import { useAuth } from '@/contexts/auth-context';
import { Phone, Mail, MapPin, User, Building, Plus, Trash2, Edit } from 'lucide-react';
import { DatePickerField } from '@/components/form/date-picker-field';

// Form validation schema
const contactSchema = z.object({
  // Client fields (required when contactType is Client)
  firstName: z.string().min(1, 'First Name is required').optional().or(z.literal('')),
  lastName: z.string().min(1, 'Surname is required').optional().or(z.literal('')),
  fullName: z.string().optional(), // For display/backward compatibility
  ndisNumber: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  // Organisation fields (required when contactType is Organisation)
  organisationName: z.string().min(1, 'Organisation Name is required').optional().or(z.literal('')),
  // Common fields
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  mobileNumber: z.string().optional(),
  phone: z.string().optional(), // Keep for backward compatibility
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  state: z.string().optional(), // For display
  idState: z.string().optional(), // State ID for backend
  postcode: z.string().optional(),
  contactType: z.nativeEnum(ContactType),
  status: z.nativeEnum(ContactStatus).optional(),
  notes: z.string().optional(),
  dob: z.string().optional(),
  // Guardian fields
  hasGuardian: z.boolean().optional(),
  guardianFirstName: z.string().min(1, 'Guardian First Name is required').optional().or(z.literal('')),
  guardianLastName: z.string().min(1, 'Guardian Surname is required').optional().or(z.literal('')),
  guardianEmail: z.string().email().optional().or(z.literal('')),
  guardianPhoneNumber: z.string().optional(),
  guardianRelationshipType: z.nativeEnum(RelationshipType).optional(),
  // Organisation contact fields
  hasOrganisationContact: z.boolean().optional(),
  organisationContactName: z.string().min(1, 'Contact Name is required').optional().or(z.literal('')),
  organisationContactEmail: z.string().email().optional().or(z.literal('')),
  organisationContactMobileNumber: z.string().optional(),
}).refine((data) => {
  // If Client, firstName and lastName are required
  if (data.contactType === ContactType.Client) {
    const hasFirstName = data.firstName && data.firstName.trim().length > 0;
    const hasLastName = data.lastName && data.lastName.trim().length > 0;
    return hasFirstName && hasLastName;
  }
  // If Organisation, organisationName is required
  if (data.contactType === ContactType.Organisation) {
    return data.organisationName && data.organisationName.trim().length > 0;
  }
  return true;
}, {
  message: 'Client requires First Name and Surname, Organisation requires Name',
  path: ['firstName'], // This will show error on firstName field
}).refine((data) => {
  // If hasGuardian is true, guardian firstName and lastName are required
  if (data.hasGuardian) {
    const hasFirstName = data.guardianFirstName && data.guardianFirstName.trim().length > 0;
    const hasLastName = data.guardianLastName && data.guardianLastName.trim().length > 0;
    return hasFirstName && hasLastName;
  }
  return true;
}, {
  message: 'Guardian First Name and Surname are required when guardian information is added',
  path: ['guardianFirstName'],
}).refine((data) => {
  // If hasOrganisationContact is true, organisationContactName is required
  if (data.hasOrganisationContact) {
    return data.organisationContactName && data.organisationContactName.trim().length > 0;
  }
  return true;
}, {
  message: 'Contact Name is required when organisation contact is added',
  path: ['organisationContactName'],
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  contact?: Contact;
  onSave?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactModal({ isOpen, onClose, mode, contact, onSave, onEdit, onDelete }: ContactModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasGuardian, setHasGuardian] = useState(false);
  const [hasOrganisationContact, setHasOrganisationContact] = useState(false);
  const [invoiceRecipients, setInvoiceRecipients] = useState<Array<{ email: string; roleType: RoleType }>>([]);
  // Start with empty string - we'll set Australia ID after countries load
  // This prevents calling API with potentially wrong ID format
  const [australiaCountryId, setAustraliaCountryId] = useState<string>('');

  const { user } = useAuth();
  const { countries, isLoading: countriesLoading } = useCountries();
  // Always use Australia for states since we only operate in Australia
  // Only fetch states when we have a valid country ID
  const { states, isLoading: statesLoading } = useStates(australiaCountryId || '');
  const { createContact, updateContact, deleteContact, isSaving, isDeleting } = useContactActions();

  // Find and set Australia country ID when countries load
  useEffect(() => {
    if (countries.length > 0 && !australiaCountryId) {
      // Find Australia by name, code, or ID
      const aus = countries.find(c => {
        const name = (c.name || '').toLowerCase();
        const code = (c.code || '').toLowerCase();
        const id = String(c.id || '');
        return name.includes('australia') || code === 'au' || id === '1';
      });
      // Set the actual ID from the API response
      if (aus) {
        setAustraliaCountryId(String(aus.id));
      } else if (countries.length > 0) {
        // Fallback: try ID '1' directly
        const country1 = countries.find(c => String(c.id) === '1');
        if (country1) {
          setAustraliaCountryId(String(country1.id));
        } else {
          // Last resort: use first country (should be Australia)
          console.warn('Australia not found in countries list, using first country');
          setAustraliaCountryId(String(countries[0].id));
        }
      }
    }
  }, [countries, australiaCountryId]);

  const isReadOnly = mode === 'view';
  const isClient = contact?.contactType === ContactType.Client;
  const isOrganisation = contact?.contactType === ContactType.Organisation;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      fullName: '',
      organisationName: '',
      email: '',
      mobileNumber: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      idState: '',
      postcode: '',
      contactType: ContactType.Client,
      status: ContactStatus.Active,
      notes: '',
      dob: '',
      ndisNumber: '',
      gender: undefined,
      hasGuardian: false,
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhoneNumber: '',
      guardianRelationshipType: undefined,
      hasOrganisationContact: false,
      organisationContactName: '',
      organisationContactEmail: '',
      organisationContactMobileNumber: '',
    },
  });

  // Reset form when contact or mode changes
  useEffect(() => {
    if (mode === 'new') {
      // Reset everything for new contact
      setCurrentStep(1);
      setHasGuardian(false);
      setHasOrganisationContact(false);
      setInvoiceRecipients([]);
      // Ensure Australia is set for new contacts (default is '1', verify when countries load)
      if (!australiaCountryId) {
        setAustraliaCountryId('1');
      }
      form.reset({
        firstName: '',
        lastName: '',
        fullName: '',
        organisationName: '',
        email: '',
        mobileNumber: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        state: '',
        idState: '',
        postcode: '',
        contactType: ContactType.Client,
        status: ContactStatus.Active,
        notes: '',
        dob: '',
        ndisNumber: '',
        gender: undefined,
        hasGuardian: false,
        guardianFirstName: '',
        guardianLastName: '',
        guardianEmail: '',
        guardianPhoneNumber: '',
        guardianRelationshipType: undefined,
        hasOrganisationContact: false,
        organisationContactName: '',
        organisationContactEmail: '',
        organisationContactMobileNumber: '',
      });
    } else if (contact && (mode === 'edit' || mode === 'view')) {
      // Australia will be set automatically when countries load via the useEffect above
      // Extract state ID if state is an object
      const stateId = typeof contact.state === 'object' && contact.state !== null 
        ? (contact.state as { id?: string }).id || contact.idState || ''
        : contact.idState || '';
      const stateDisplay = typeof contact.state === 'object' && contact.state !== null
        ? (contact.state as { name?: string }).name || ''
        : (typeof contact.state === 'string' ? contact.state : '');

      // Load invoice recipients (support both field names)
      const recipients = contact.invoiceRecipients || contact.invoices || [];
      const mappedRecipients = recipients.map(r => {
        // Map old role string to roleType enum if needed
        const role = (r as any).roleType || (r as any).role;
        let roleType = RoleType.Other;
        if (typeof role === 'string' && role in RoleType) {
          roleType = role as RoleType;
        } else if (role) {
          // Try to map common role strings to enum values
          const roleMap: Record<string, RoleType> = {
            'Accounts Department': RoleType.AccountsDepartment,
            'Support Coordinator': RoleType.Coordinator,
            'NDIS Contact': RoleType.NDISContact,
            'Other Guardian': RoleType.OtherGuardian,
            'Other': RoleType.Other,
            'Plan Manager': RoleType.PlanManager,
          };
          roleType = roleMap[role] || RoleType.Other;
        }
        return {
          email: r.email,
          roleType,
        };
      });
      setInvoiceRecipients(mappedRecipients);
      setHasGuardian(contact.hasGuardian || false);
      setHasOrganisationContact(contact.hasOrganisationContact || false);

      // Load contact data for edit/view
      form.reset({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        fullName: contact.fullName || '',
        organisationName: contact.organisationName || '',
        email: contact.email || '',
        mobileNumber: contact.mobileNumber || contact.phone || '',
        phone: contact.phone || contact.mobileNumber || '',
        addressLine1: contact.addressLine1 || '',
        addressLine2: contact.addressLine2 || '',
        state: stateDisplay,
        idState: stateId,
        postcode: contact.postcode || '',
        contactType: contact.contactType,
        status: contact.status || ContactStatus.Active,
        notes: contact.notes || '',
        dob: contact.dob || '',
        ndisNumber: contact.ndisNumber || '',
        gender: contact.gender,
        hasGuardian: contact.hasGuardian || false,
        guardianFirstName: contact.guardianFirstName || '',
        guardianLastName: contact.guardianLastName || '',
        guardianEmail: contact.guardianEmail || '',
        guardianPhoneNumber: contact.guardianPhoneNumber || contact.guardianPhone || '',
        guardianRelationshipType: contact.guardianRelationshipType,
        hasOrganisationContact: contact.hasOrganisationContact || false,
        organisationContactName: contact.organisationContactName || '',
        organisationContactEmail: contact.organisationContactEmail || '',
        organisationContactMobileNumber: contact.organisationContactMobileNumber || contact.organisationContactPhone || '',
      });
    }
  }, [contact, mode, form, countries, australiaCountryId]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Structure data according to backend DTOs
      const contactData: Partial<Contact> = {
        contactType: data.contactType,
        status: data.status || ContactStatus.Active,
        email: data.email || undefined,
        mobileNumber: data.mobileNumber || undefined,
        addressLine1: data.addressLine1 || undefined,
        addressLine2: data.addressLine2 || undefined,
        idState: data.idState || undefined,
        postcode: data.postcode || undefined,
        notes: data.notes || undefined,
        dob: data.dob || undefined,
      };

      // Client-specific fields
      if (data.contactType === ContactType.Client) {
        contactData.firstName = data.firstName || '';
        contactData.lastName = data.lastName || '';
        contactData.ndisNumber = data.ndisNumber || undefined;
        contactData.gender = data.gender;
        // Guardian fields
        if (data.hasGuardian) {
          contactData.hasGuardian = true;
          contactData.guardianFirstName = data.guardianFirstName || '';
          contactData.guardianLastName = data.guardianLastName || '';
          contactData.guardianEmail = data.guardianEmail || undefined;
          contactData.guardianPhoneNumber = data.guardianPhoneNumber || undefined;
          contactData.guardianRelationshipType = data.guardianRelationshipType;
        }
        // Invoice recipients for clients
        if (invoiceRecipients.length > 0) {
          contactData.invoices = invoiceRecipients.map(r => ({
            email: r.email,
            roleType: r.roleType,
          }));
        }
      }

      // Organisation-specific fields
      if (data.contactType === ContactType.Organisation) {
        contactData.organisationName = data.organisationName || '';
        // Organisation contact fields
        if (data.hasOrganisationContact) {
          contactData.hasOrganisationContact = true;
          contactData.organisationContactName = data.organisationContactName || '';
          contactData.organisationContactEmail = data.organisationContactEmail || undefined;
          contactData.organisationContactMobileNumber = data.organisationContactMobileNumber || undefined;
        }
      }

      if (mode === 'new') {
        const newContact = await createContact(contactData as Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>);
        onSave?.(newContact);
      } else if (mode === 'edit' && contact?.id) {
        const updatedContact = await updateContact(contact.id, contactData);
        onSave?.(updatedContact);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const addInvoiceRecipient = () => {
    setInvoiceRecipients([...invoiceRecipients, { email: '', roleType: RoleType.AccountsDepartment }]);
  };

  const removeInvoiceRecipient = (index: number) => {
    setInvoiceRecipients(invoiceRecipients.filter((_, i) => i !== index));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              form.watch('contactType') === ContactType.Client ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => form.setValue('contactType', ContactType.Client)}
          >
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium">Client</h4>
                <p className="text-sm text-gray-600">Individual person</p>
              </div>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer transition-colors ${
              form.watch('contactType') === ContactType.Organisation ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => form.setValue('contactType', ContactType.Organisation)}
          >
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-purple-600" />
              <div>
                <h4 className="font-medium">Organisation</h4>
                <p className="text-sm text-gray-600">Company/Organization</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        {form.watch('contactType') === ContactType.Client ? (
          <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                <Label htmlFor="firstName">First Name *</Label>
            <Input
                  id="firstName"
                  {...form.register('firstName')}
              disabled={isReadOnly}
                  placeholder="Enter first name"
            />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
            )}
          </div>
            <div>
                <Label htmlFor="lastName">Surname *</Label>
              <Input
                  id="lastName"
                  {...form.register('lastName')}
                  disabled={isReadOnly}
                  placeholder="Enter surname"
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ndisNumber">NDIS Number</Label>
                <Input
                  id="ndisNumber"
                  {...form.register('ndisNumber')}
                  disabled={isReadOnly}
                  placeholder="Enter NDIS number"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.watch('gender') || ''}
                  onValueChange={(value) => form.setValue('gender', value ? (value as Gender) : undefined)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.Male}>Male</SelectItem>
                    <SelectItem value={Gender.Female}>Female</SelectItem>
                    <SelectItem value={Gender.Other}>Other</SelectItem>
                    <SelectItem value={Gender.PreferNotToSay}>Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <DatePickerField
                label="Date of Birth"
                id="dob"
                value={form.watch('dob')}
                onChange={(value) => form.setValue('dob', value)}
                error={form.formState.errors.dob}
                disabled={isReadOnly}
              />
            </div>
          </div>
        ) : (
          <div>
            <Label htmlFor="organisationName">Name *</Label>
            <Input
              id="organisationName"
              {...form.register('organisationName')}
              disabled={isReadOnly}
              placeholder="Enter organisation name"
            />
            {form.formState.errors.organisationName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.organisationName.message}</p>
          )}
        </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  disabled={isReadOnly}
                  className="pl-10"
                  placeholder="Enter email address"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="mobileNumber"
                  {...form.register('mobileNumber')}
                  disabled={isReadOnly}
                  className="pl-10"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="addressLine1"
                {...form.register('addressLine1')}
                disabled={isReadOnly}
                className="pl-10"
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                {...form.register('addressLine2')}
                disabled={isReadOnly}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div>
              <Label htmlFor="idState">State</Label>
              <Select
                value={form.watch('idState') || ''}
                onValueChange={(value) => {
                  form.setValue('idState', value);
                  // Also update state display name
                  const selectedState = states.find(s => s.id === value);
                  if (selectedState) {
                    form.setValue('state', selectedState.name);
                  }
                }}
                disabled={isReadOnly || statesLoading || !australiaCountryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={statesLoading || !australiaCountryId ? "Loading states..." : states.length === 0 ? "No states available" : "Select state"} />
                </SelectTrigger>
                <SelectContent>
                  {states.length > 0 ? (
                    states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))
                  ) : (
                    !statesLoading && australiaCountryId && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No states available
                      </div>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                {...form.register('postcode')}
                disabled={isReadOnly}
                placeholder="Enter postcode"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as ContactStatus)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContactStatus.Active}>Active</SelectItem>
                <SelectItem value={ContactStatus.Inactive}>Inactive</SelectItem>
                <SelectItem value={ContactStatus.Archived}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              disabled={isReadOnly}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {form.watch('contactType') === ContactType.Client && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Guardian Information</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="hasGuardian"
              checked={hasGuardian}
              onCheckedChange={setHasGuardian}
              disabled={isReadOnly}
            />
            <Label htmlFor="hasGuardian">Add guardian information</Label>
          </div>

          {hasGuardian && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianFirstName">Guardian First Name *</Label>
                  <Input
                    id="guardianFirstName"
                    {...form.register('guardianFirstName')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian first name"
                  />
                  {form.formState.errors.guardianFirstName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.guardianFirstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="guardianLastName">Guardian Surname *</Label>
                  <Input
                    id="guardianLastName"
                    {...form.register('guardianLastName')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian surname"
                  />
                  {form.formState.errors.guardianLastName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.guardianLastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guardianEmail">Guardian Email</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    {...form.register('guardianEmail')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian email"
                  />
                </div>

                <div>
                  <Label htmlFor="guardianPhoneNumber">Guardian Phone Number</Label>
                  <Input
                    id="guardianPhoneNumber"
                    {...form.register('guardianPhoneNumber')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian phone number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="guardianRelationshipType">Relationship</Label>
                <Select
                  value={form.watch('guardianRelationshipType') || ''}
                  onValueChange={(value) => form.setValue('guardianRelationshipType', value ? (value as RelationshipType) : undefined)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RelationshipType.Parent}>Parent</SelectItem>
                    <SelectItem value={RelationshipType.Sibling}>Sibling</SelectItem>
                    <SelectItem value={RelationshipType.OtherFamilyMember}>Other Family Member</SelectItem>
                    <SelectItem value={RelationshipType.LegalGuardian}>Legal Guardian</SelectItem>
                    <SelectItem value={RelationshipType.SupportCoordinator}>Support Coordinator</SelectItem>
                    <SelectItem value={RelationshipType.Other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {form.watch('contactType') === ContactType.Organisation && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Organisation Contact</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="hasOrganisationContact"
              checked={hasOrganisationContact}
              onCheckedChange={setHasOrganisationContact}
              disabled={isReadOnly}
            />
            <Label htmlFor="hasOrganisationContact">Add organisation contact person</Label>
          </div>

          {hasOrganisationContact && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="organisationContactName">Contact Name</Label>
                <Input
                  id="organisationContactName"
                  {...form.register('organisationContactName')}
                  disabled={isReadOnly}
                  placeholder="Enter contact person name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organisationContactEmail">Contact Email</Label>
                  <Input
                    id="organisationContactEmail"
                    type="email"
                    {...form.register('organisationContactEmail')}
                    disabled={isReadOnly}
                    placeholder="Enter contact email"
                  />
                </div>

                <div>
                  <Label htmlFor="organisationContactMobileNumber">Contact Mobile Number</Label>
                  <Input
                    id="organisationContactMobileNumber"
                    {...form.register('organisationContactMobileNumber')}
                    disabled={isReadOnly}
                    placeholder="Enter contact mobile number"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {form.watch('contactType') === ContactType.Client && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Invoice Recipients</h3>
          <div className="space-y-4">
            {invoiceRecipients.map((recipient, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={recipient.email}
                        onChange={(e) => {
                          const newRecipients = [...invoiceRecipients];
                          newRecipients[index].email = e.target.value;
                          setInvoiceRecipients(newRecipients);
                        }}
                        disabled={isReadOnly}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        value={recipient.roleType || ''}
                        onValueChange={(value) => {
                          const newRecipients = [...invoiceRecipients];
                          newRecipients[index].roleType = value as RoleType;
                          setInvoiceRecipients(newRecipients);
                        }}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={RoleType.AccountsDepartment}>{RoleTypeToText(RoleType.AccountsDepartment)}</SelectItem>
                          <SelectItem value={RoleType.Coordinator}>{RoleTypeToText(RoleType.Coordinator)}</SelectItem>
                          <SelectItem value={RoleType.NDISContact}>{RoleTypeToText(RoleType.NDISContact)}</SelectItem>
                          <SelectItem value={RoleType.OtherGuardian}>{RoleTypeToText(RoleType.OtherGuardian)}</SelectItem>
                          <SelectItem value={RoleType.Other}>{RoleTypeToText(RoleType.Other)}</SelectItem>
                          <SelectItem value={RoleType.PlanManager}>{RoleTypeToText(RoleType.PlanManager)}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInvoiceRecipient(index)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={addInvoiceRecipient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Invoice Recipient
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderViewMode = () => {
    const anyContact = contact as any;
    const stateLabel = (() => {
      const s = contact?.state as any;
      if (!s) return '';
      if (typeof s === 'string') return s;
      if (typeof s?.name === 'string') return s.name;
      return String(s);
    })();

    return (
      <div className="space-y-8">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {contact?.contactType === ContactType.Organisation ? (
            <Building className="h-8 w-8 text-purple-600" />
          ) : (
            <User className="h-8 w-8 text-blue-600" />
          )}
          <div>
            <h3 className="text-xl font-semibold">{contact?.fullName}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{contact?.contactType}</Badge>
              <Badge variant={contact?.status === ContactStatus.Active ? 'default' : 'secondary'}>
                {contact?.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

        {/* Basic information */}
        <div>
          <h4 className="font-semibold mb-3">Basic information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {anyContact?.firstName && <div><span className="text-gray-500">Firstname</span><div>{anyContact.firstName}</div></div>}
            {anyContact?.lastName && <div><span className="text-gray-500">Surname</span><div>{anyContact.lastName}</div></div>}
            {anyContact?.ndisNumber && <div><span className="text-gray-500">NDIS number</span><div>{anyContact.ndisNumber}</div></div>}
            {anyContact?.gender && (
              <div>
                <span className="text-gray-500">Gender</span>
                <div>{GenderToText(anyContact.gender as Gender)}</div>
              </div>
            )}
            {(anyContact?.mobileNumber || contact?.phone) && (
              <div><span className="text-gray-500">Mobile number</span><div>{anyContact.mobileNumber || contact?.phone}</div></div>
            )}
            {contact?.dob && (
              <div>
                <span className="text-gray-500">Date of Birth</span>
                <div>{new Date(contact.dob).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Contact information */}
        <div>
          <h4 className="font-semibold mb-3">Contact Information</h4>
          <div className="space-y-2">
            {contact?.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{contact.email}</span>
              </div>
            )}
            {(contact?.addressLine1 || contact?.addressLine2 || contact?.state || contact?.postcode) && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {contact?.addressLine1}
                  {contact?.addressLine2 && `, ${contact.addressLine2}`}
                  {stateLabel && `, ${stateLabel}`}
                  {contact?.postcode && ` ${contact.postcode}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional contact (client/organisation specific) */}
        {contact?.contactType === ContactType.Client && (
          <div>
            <h4 className="font-semibold mb-3">Additional contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {(anyContact?.guardianFirstName || anyContact?.guardianLastName) && (
                <div><span className="text-gray-500">Name</span><div>{[anyContact.guardianFirstName, anyContact.guardianLastName].filter(Boolean).join(' ')}</div></div>
              )}
              {anyContact?.guardianEmail && <div><span className="text-gray-500">Email</span><div>{anyContact.guardianEmail}</div></div>}
              {(anyContact?.guardianPhoneNumber || anyContact?.guardianPhone) && (
                <div><span className="text-gray-500">Phone number</span><div>{anyContact.guardianPhoneNumber || anyContact.guardianPhone}</div></div>
              )}
              {(anyContact?.guardianRelationshipType || anyContact?.guardianRelationship) && (
                <div>
                  <span className="text-gray-500">Relationship</span>
                  <div>
                    {anyContact.guardianRelationshipType 
                      ? RelationshipTypeToText(anyContact.guardianRelationshipType as RelationshipType)
                      : anyContact.guardianRelationship}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {contact?.contactType === ContactType.Organisation && (
          <div>
            <h4 className="font-semibold mb-3">Organisation contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {anyContact?.organisationContactName && <div><span className="text-gray-500">Contact Name</span><div>{anyContact.organisationContactName}</div></div>}
              {anyContact?.organisationContactEmail && <div><span className="text-gray-500">Contact Email</span><div>{anyContact.organisationContactEmail}</div></div>}
              {(anyContact?.organisationContactMobileNumber || anyContact?.organisationContactPhone) && (
                <div><span className="text-gray-500">Contact Phone</span><div>{anyContact.organisationContactMobileNumber || anyContact.organisationContactPhone}</div></div>
              )}
            </div>
          </div>
        )}

        {/* Invoice recipients */}
        {(Array.isArray(contact?.invoiceRecipients) && contact!.invoiceRecipients!.length > 0) || (Array.isArray(contact?.invoices) && contact!.invoices!.length > 0) ? (
          <div>
            <h4 className="font-semibold mb-3">Who will receive the invoices</h4>
            <div className="space-y-2 text-sm">
              {(contact?.invoiceRecipients || contact?.invoices || []).map((r: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span className="text-gray-500">Email</span><div>{r.email}</div></div>
                  <div>
                    <span className="text-gray-500">Role</span>
                    <div>{r.roleType ? RoleTypeToText(r.roleType as RoleType) : r.role || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Notes */}
        {contact?.notes && (
          <div>
            <h4 className="font-semibold mb-3">Notes</h4>
            <p className="text-sm text-gray-600">{contact.notes}</p>
          </div>
        )}
    </div>
  );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'new' && 'Add New Contact'}
            {mode === 'edit' && 'Edit Contact'}
            {mode === 'view' && 'View Contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {isReadOnly ? (
            renderViewMode()
          ) : (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step content */}
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div className="flex space-x-2">
              {!isReadOnly && currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {isReadOnly && onEdit && contact && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onEdit(contact);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              
              {isReadOnly && onDelete && contact && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this contact?')) {
                      try {
                        if (onDelete) {
                          await onDelete(contact.id);
                        } else {
                          await deleteContact(contact.id);
                        }
                        onClose();
                      } catch (error) {
                        console.error('Failed to delete contact:', error);
                      }
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              
              {!isReadOnly && currentStep < 3 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                </Button>
              )}
              
              {!isReadOnly && currentStep === 3 && (
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : mode === 'new' ? 'Create Contact' : 'Save Changes'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
