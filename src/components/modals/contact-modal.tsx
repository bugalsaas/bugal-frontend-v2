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
import { Contact, ContactType, ContactStatus } from '@/lib/api/contacts-service';
import { useContactActions } from '@/hooks/use-contacts';
import { Phone, Mail, MapPin, User, Building, Plus, Trash2, Calendar, Edit } from 'lucide-react';
import { DatePickerField } from '@/components/form/date-picker-field';

// Form validation schema
const contactSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
  contactType: z.nativeEnum(ContactType),
  status: z.nativeEnum(ContactStatus),
  notes: z.string().optional(),
  dob: z.string().optional(),
  // Guardian fields
  hasGuardian: z.boolean().optional(),
  guardianName: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal('')),
  guardianPhone: z.string().optional(),
  guardianRelationship: z.string().optional(),
  // Organisation contact fields
  hasOrganisationContact: z.boolean().optional(),
  organisationContactName: z.string().optional(),
  organisationContactEmail: z.string().email().optional().or(z.literal('')),
  organisationContactPhone: z.string().optional(),
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
  const [invoiceRecipients, setInvoiceRecipients] = useState<Array<{ email: string; role: string }>>([]);

  const { createContact, updateContact, deleteContact, isSaving, isDeleting } = useContactActions();

  const isReadOnly = mode === 'view';
  const isClient = contact?.contactType === ContactType.Client;
  const isOrganisation = contact?.contactType === ContactType.Organisation;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      postcode: '',
      contactType: ContactType.Client,
      status: ContactStatus.Active,
      notes: '',
      dob: '',
      hasGuardian: false,
      guardianName: '',
      guardianEmail: '',
      guardianPhone: '',
      guardianRelationship: '',
      hasOrganisationContact: false,
      organisationContactName: '',
      organisationContactEmail: '',
      organisationContactPhone: '',
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
      form.reset({
        fullName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        state: '',
        postcode: '',
        contactType: ContactType.Client,
        status: ContactStatus.Active,
        notes: '',
        dob: '',
        hasGuardian: false,
        guardianName: '',
        guardianEmail: '',
        guardianPhone: '',
        guardianRelationship: '',
        hasOrganisationContact: false,
        organisationContactName: '',
        organisationContactEmail: '',
        organisationContactPhone: '',
      });
    } else if (contact && (mode === 'edit' || mode === 'view')) {
      // Load contact data for edit/view
      form.reset({
        fullName: contact.fullName,
        email: contact.email || '',
        phone: contact.phone || '',
        addressLine1: contact.addressLine1 || '',
        addressLine2: contact.addressLine2 || '',
        state: contact.state || '',
        postcode: contact.postcode || '',
        contactType: contact.contactType,
        status: contact.status,
        notes: contact.notes || '',
        dob: contact.dob || '',
        hasGuardian: false, // Will be set based on data
        guardianName: '',
        guardianEmail: '',
        guardianPhone: '',
        guardianRelationship: '',
        hasOrganisationContact: false,
        organisationContactName: '',
        organisationContactEmail: '',
        organisationContactPhone: '',
      });
    }
  }, [contact, mode, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const contactData = {
        ...data,
        id: contact?.id || Date.now().toString(),
        createdAt: contact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (mode === 'new') {
        const newContact = await createContact(contactData);
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
    setInvoiceRecipients([...invoiceRecipients, { email: '', role: 'Primary' }]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              {...form.register('fullName')}
              disabled={isReadOnly}
              placeholder="Enter full name"
            />
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          {form.watch('contactType') === ContactType.Client && (
            <DatePickerField
              label="Date of Birth"
              id="dob"
              value={form.watch('dob')}
              onChange={(value) => form.setValue('dob', value)}
              error={form.formState.errors.dob}
              disabled={isReadOnly}
            />
          )}
        </div>
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
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  {...form.register('phone')}
                  disabled={isReadOnly}
                  className="pl-10"
                  placeholder="Enter phone number"
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
              <Label htmlFor="state">State</Label>
              <Select
                value={form.watch('state')}
                onValueChange={(value) => form.setValue('state', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIC">Victoria</SelectItem>
                  <SelectItem value="NSW">New South Wales</SelectItem>
                  <SelectItem value="QLD">Queensland</SelectItem>
                  <SelectItem value="WA">Western Australia</SelectItem>
                  <SelectItem value="SA">South Australia</SelectItem>
                  <SelectItem value="TAS">Tasmania</SelectItem>
                  <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                  <SelectItem value="NT">Northern Territory</SelectItem>
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
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    {...form.register('guardianName')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian name"
                  />
                </div>

                <div>
                  <Label htmlFor="guardianRelationship">Relationship</Label>
                  <Select
                    value={form.watch('guardianRelationship')}
                    onValueChange={(value) => form.setValue('guardianRelationship', value)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="carer">Carer</SelectItem>
                      <SelectItem value="family">Family Member</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input
                    id="guardianPhone"
                    {...form.register('guardianPhone')}
                    disabled={isReadOnly}
                    placeholder="Enter guardian phone"
                  />
                </div>
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
                  <Label htmlFor="organisationContactPhone">Contact Phone</Label>
                  <Input
                    id="organisationContactPhone"
                    {...form.register('organisationContactPhone')}
                    disabled={isReadOnly}
                    placeholder="Enter contact phone"
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
                        value={recipient.role}
                        onValueChange={(value) => {
                          const newRecipients = [...invoiceRecipients];
                          newRecipients[index].role = value;
                          setInvoiceRecipients(newRecipients);
                        }}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
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
            {anyContact?.gender && <div><span className="text-gray-500">Gender</span><div>{anyContact.gender}</div></div>}
            {(anyContact?.mobileNumber || contact?.phone) && (
              <div><span className="text-gray-500">Mobile number</span><div>{anyContact.mobileNumber || contact?.phone}</div></div>
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
            {contact?.dob && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">DOB: {new Date(contact.dob).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional contact (client/organisation specific) */}
        {contact?.contactType === ContactType.Client && (
          <div>
            <h4 className="font-semibold mb-3">Additional contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {anyContact?.guardianName && <div><span className="text-gray-500">Name</span><div>{anyContact.guardianName}</div></div>}
              {anyContact?.guardianEmail && <div><span className="text-gray-500">Email</span><div>{anyContact.guardianEmail}</div></div>}
              {anyContact?.guardianPhone && <div><span className="text-gray-500">Phone number</span><div>{anyContact.guardianPhone}</div></div>}
              {anyContact?.guardianRelationship && <div><span className="text-gray-500">Relationship</span><div>{anyContact.guardianRelationship}</div></div>}
            </div>
          </div>
        )}

        {contact?.contactType === ContactType.Organisation && (
          <div>
            <h4 className="font-semibold mb-3">Organisation contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {anyContact?.organisationContactName && <div><span className="text-gray-500">Contact Name</span><div>{anyContact.organisationContactName}</div></div>}
              {anyContact?.organisationContactEmail && <div><span className="text-gray-500">Contact Email</span><div>{anyContact.organisationContactEmail}</div></div>}
              {anyContact?.organisationContactPhone && <div><span className="text-gray-500">Contact Phone</span><div>{anyContact.organisationContactPhone}</div></div>}
            </div>
          </div>
        )}

        {/* Invoice recipients */}
        {Array.isArray(contact?.invoiceRecipients) && contact!.invoiceRecipients!.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Who will receive the invoices</h4>
            <div className="space-y-2 text-sm">
              {contact!.invoiceRecipients!.map((r, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span className="text-gray-500">Email</span><div>{r.email}</div></div>
                  <div><span className="text-gray-500">Role</span><div>{r.role}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    onClose();
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
