import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Organization, OrganizationType, OrganizationCreateDto, OrganizationUpdateDto, Country, State, Bank } from '@/lib/api/organizations-service';
import { useCountries, useStates, useBanks } from '@/hooks/use-organizations';
import { formatDate } from '@/lib/utils';

const organizationSchema = z.object({
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

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'new' | 'edit' | 'view';
  organization?: Organization;
  onSave: (data: OrganizationCreateDto | OrganizationUpdateDto) => Promise<void>;
}

export function OrganizationModal({
  isOpen,
  onClose,
  mode,
  organization,
  onSave,
}: OrganizationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  
  const { countries, isLoading: countriesLoading } = useCountries();
  const { states, isLoading: statesLoading } = useStates(selectedCountry);
  const { banks, isLoading: banksLoading } = useBanks();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
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

  const { handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const watchedBankName = watch('bankName');

  useEffect(() => {
    if (organization && mode !== 'new') {
      const values = {
        name: organization.name,
        email: organization.email,
        organizationType: organization.organizationType,
        phoneNumber: organization.phoneNumber || '',
        addressLine1: organization.addressLine1 || '',
        addressLine2: organization.addressLine2 || '',
        postcode: organization.postcode || '',
        abn: organization.abn || '',
        paymentTerms: organization.paymentTerms,
        invoicePrefix: organization.invoicePrefix || '',
        isGstRegistered: organization.isGstRegistered,
        idCountry: organization.idCountry,
        idState: organization.idState,
        timezone: organization.timezone,
        bankName: organization.bankName?.id || '',
        bankNameOther: organization.bankNameOther || '',
        bankBsb: organization.bankBsb || '',
        bankAccountNumber: organization.bankAccountNumber || '',
      };
      
      reset(values);
      setSelectedCountry(organization.idCountry);
      setSelectedBank(organization.bankName?.id || '');
    } else if (mode === 'new') {
      reset();
      setSelectedCountry('');
      setSelectedBank('');
    }
  }, [organization, mode, reset]);

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

  const onSubmit = async (values: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Failed to save organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrganizationTypeColor = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.SoleTrader:
        return 'bg-blue-100 text-blue-800';
      case OrganizationType.Partnership:
        return 'bg-green-100 text-green-800';
      case OrganizationType.Company:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrganizationInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (mode === 'view' && organization) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Building2 className="h-6 w-6" />
              <span>View Organization</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Organization Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-blue-800">
                      {getOrganizationInitials(organization.name)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{organization.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getOrganizationTypeColor(organization.organizationType)}>
                        {organization.organizationType}
                      </Badge>
                      {organization.isGstRegistered && (
                        <Badge variant="outline" className="text-green-700 border-green-200">
                          GST Registered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
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
                        <Label className="text-sm font-medium text-gray-700">Organization Type</Label>
                        <p className="text-sm text-gray-900">{organization.organizationType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">ABN</Label>
                        <p className="text-sm text-gray-900">{organization.abn}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Country</Label>
                        <p className="text-sm text-gray-900">{organization.country?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Timezone</Label>
                        <p className="text-sm text-gray-900">{organization.timezone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Created</Label>
                        <p className="text-sm text-gray-900">{formatDate(new Date(organization.createdAt))}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Referral Code</Label>
                        <p className="text-sm text-gray-900 font-mono">{organization.referralCode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
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
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-sm text-gray-900">{organization.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <p className="text-sm text-gray-900">{organization.phoneNumber || 'Not provided'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                        <p className="text-sm text-gray-900">
                          {organization.addressLine1 || 'Not provided'}
                          {organization.addressLine2 && `, ${organization.addressLine2}`}
                          {organization.postcode && `, ${organization.postcode}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
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
                        <Label className="text-sm font-medium text-gray-700">Payment Terms</Label>
                        <p className="text-sm text-gray-900">{organization.paymentTerms} days</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Invoice Prefix</Label>
                        <p className="text-sm text-gray-900">{organization.invoicePrefix || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">GST Registered</Label>
                        <p className="text-sm text-gray-900">{organization.isGstRegistered ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="banking" className="space-y-4">
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
                        <Label className="text-sm font-medium text-gray-700">Bank</Label>
                        <p className="text-sm text-gray-900">
                          {organization.bankName?.name || organization.bankNameOther || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">BSB</Label>
                        <p className="text-sm text-gray-900">{organization.bankBsb || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                        <p className="text-sm text-gray-900">{organization.bankAccountNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Building2 className="h-6 w-6" />
            <span>
              {mode === 'new' ? 'Create Organization' : 'Edit Organization'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
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
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Organization'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
