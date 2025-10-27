'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Organization, OrganizationType, OrganizationUpdateDto, Country, State, Bank } from '@/lib/api/organizations-service';
import { useOrganizationActions, useCountries, useStates, useBanks } from '@/hooks/use-organizations';
import { formatDate } from '@/lib/utils';

const settingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  email: z.string().email('Valid email is required'),
  organizationType: z.nativeEnum(OrganizationType),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postcode: z.string().optional(),
  abn: z.string().min(1, 'ABN is required'),
  paymentTerms: z.number().min(0).max(90),
  invoicePrefix: z.string().max(5).optional(),
  isGstRegistered: z.boolean(),
  idCountry: z.string().min(1, 'Country is required'),
  idState: z.string().min(1, 'State is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  bankName: z.string().optional(),
  bankNameOther: z.string().optional(),
  bankBsb: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function OrganizationSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  
  const { updateOrganization } = useOrganizationActions();
  const { countries, isLoading: countriesLoading } = useCountries();
  const { states, isLoading: statesLoading } = useStates(selectedCountry);
  const { banks, isLoading: banksLoading } = useBanks();

  // Mock current organization - in real app, this would come from context
  const currentOrganization: Organization = {
    id: '1',
    name: 'Bugal Care Services',
    email: 'admin@bugal.com.au',
    organizationType: OrganizationType.Company,
    isGstRegistered: true,
    country: { id: '1', name: 'Australia', code: 'AU' },
    idCountry: '1',
    idState: '1',
    timezone: 'Australia/Sydney',
    phoneNumber: '+61 2 1234 5678',
    addressLine1: '123 Business Street',
    addressLine2: 'Suite 100',
    postcode: '2000',
    abn: '12345678901',
    paymentTerms: 30,
    invoicePrefix: 'BCS',
    bankName: { id: '1', name: 'Commonwealth Bank', code: 'CBA' },
    bankBsb: '062-000',
    bankAccountNumber: '12345678',
    referralCode: 'BUGAL2024',
    subscriptionStatus: 'Active' as any,
    createdAt: '2024-01-01T00:00:00Z',
    trialEndDate: '2024-12-31T23:59:59Z',
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationType: OrganizationType.SoleTrader,
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      postcode: '',
      abn: '',
      paymentTerms: 30,
      invoicePrefix: '',
      isGstRegistered: false,
      idCountry: '',
      idState: '',
      timezone: 'Australia/Sydney',
      bankName: '',
      bankNameOther: '',
      bankBsb: '',
      bankAccountNumber: '',
    },
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = form;
  const watchedBankName = watch('bankName');

  useEffect(() => {
    if (currentOrganization) {
      const values = {
        name: currentOrganization.name,
        email: currentOrganization.email,
        organizationType: currentOrganization.organizationType,
        phoneNumber: currentOrganization.phoneNumber || '',
        addressLine1: currentOrganization.addressLine1 || '',
        addressLine2: currentOrganization.addressLine2 || '',
        postcode: currentOrganization.postcode || '',
        abn: currentOrganization.abn || '',
        paymentTerms: currentOrganization.paymentTerms,
        invoicePrefix: currentOrganization.invoicePrefix || '',
        isGstRegistered: currentOrganization.isGstRegistered,
        idCountry: currentOrganization.idCountry,
        idState: currentOrganization.idState,
        timezone: currentOrganization.timezone,
        bankName: currentOrganization.bankName?.id || '',
        bankNameOther: currentOrganization.bankNameOther || '',
        bankBsb: currentOrganization.bankBsb || '',
        bankAccountNumber: currentOrganization.bankAccountNumber || '',
      };
      
      reset(values);
      setSelectedCountry(currentOrganization.idCountry);
      setSelectedBank(currentOrganization.bankName?.id || '');
    }
  }, [currentOrganization, reset]);

  useEffect(() => {
    if (selectedCountry) {
      setValue('idCountry', selectedCountry);
      setValue('idState', ''); // Reset state when country changes
    }
  }, [selectedCountry, setValue]);

  useEffect(() => {
    if (selectedBank) {
      setValue('bankName', selectedBank);
    }
  }, [selectedBank, setValue]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setIsSubmitting(true);
      setIsSuccess(false);
      
      await updateOrganization(currentOrganization.id, values);
      
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerConfig = {
    title: 'Organization Settings',
    subtitle: 'Manage your organization details and preferences',
    icon: Settings,
    showAddButton: false,
  };

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Success Message */}
        {isSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Organization settings updated successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Business Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter organization name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select
                    value={form.watch('organizationType')}
                    onValueChange={(value) => form.setValue('organizationType', value as OrganizationType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrganizationType.SoleTrader}>Sole Trader</SelectItem>
                      <SelectItem value={OrganizationType.Partnership}>Partnership</SelectItem>
                      <SelectItem value={OrganizationType.Company}>Company</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.organizationType && (
                    <p className="text-red-500 text-sm mt-1">{errors.organizationType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="abn">ABN *</Label>
                  <Input
                    id="abn"
                    {...form.register('abn')}
                    placeholder="Enter ABN"
                  />
                  {errors.abn && (
                    <p className="text-red-500 text-sm mt-1">{errors.abn.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={form.watch('timezone')}
                    onValueChange={(value) => form.setValue('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                      <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                      <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                      <SelectItem value="Australia/Darwin">Australia/Darwin</SelectItem>
                      <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-red-500 text-sm mt-1">{errors.timezone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="idCountry">Country *</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                    disabled={countriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idCountry && (
                    <p className="text-red-500 text-sm mt-1">{errors.idCountry.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="idState">State *</Label>
                  <Select
                    value={form.watch('idState')}
                    onValueChange={(value) => form.setValue('idState', value)}
                    disabled={statesLoading || !selectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idState && (
                    <p className="text-red-500 text-sm mt-1">{errors.idState.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register('phoneNumber')}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    {...form.register('addressLine1')}
                    placeholder="Enter address line 1"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    {...form.register('addressLine2')}
                    placeholder="Enter address line 2"
                  />
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    {...form.register('postcode')}
                    placeholder="Enter postcode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Invoicing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Billing & Invoicing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms (days) *</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    max="90"
                    {...form.register('paymentTerms', { valueAsNumber: true })}
                    placeholder="Enter payment terms"
                  />
                  {errors.paymentTerms && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentTerms.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    {...form.register('invoicePrefix')}
                    placeholder="Enter invoice prefix"
                    maxLength={5}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isGstRegistered"
                      checked={form.watch('isGstRegistered')}
                      onCheckedChange={(checked) => form.setValue('isGstRegistered', checked)}
                    />
                    <Label htmlFor="isGstRegistered">GST Registered</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Banking Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank</Label>
                  <Select
                    value={selectedBank}
                    onValueChange={setSelectedBank}
                    disabled={banksLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {watchedBankName === '5' && (
                  <div>
                    <Label htmlFor="bankNameOther">Other Bank Name</Label>
                    <Input
                      id="bankNameOther"
                      {...form.register('bankNameOther')}
                      placeholder="Enter bank name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="bankBsb">BSB</Label>
                  <Input
                    id="bankBsb"
                    {...form.register('bankBsb')}
                    placeholder="Enter BSB"
                  />
                </div>

                <div>
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    {...form.register('bankAccountNumber')}
                    placeholder="Enter account number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Organization ID</Label>
                  <p className="text-sm text-gray-900 font-mono">{currentOrganization.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Referral Code</Label>
                  <p className="text-sm text-gray-900 font-mono">{currentOrganization.referralCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created</Label>
                  <p className="text-sm text-gray-900">{formatDate(new Date(currentOrganization.createdAt))}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Trial End Date</Label>
                  <p className="text-sm text-gray-900">{formatDate(new Date(currentOrganization.trialEndDate))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !isDirty}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
