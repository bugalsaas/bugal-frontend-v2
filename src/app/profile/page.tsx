'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { MainLayout } from '@/components/layout/wrapped-main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useCountries, useStates, useBanks } from '@/hooks/use-organizations';
import { formatDate } from '@/lib/utils';
import { ProfileUpdateDto } from '@/lib/api/profile-service';
import { DatePickerField } from '@/components/form/date-picker-field';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().optional(),
  dob: z.string().optional(),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  idCountry: z.string().optional(),
  idState: z.string().optional(),
  postcode: z.string().optional(),
  bankName: z.string().optional(),
  bankNameOther: z.string().optional(),
  bankBsb: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { profile, isLoading: profileLoading, error, updateProfile } = useProfile();
  const { countries, isLoading: countriesLoading } = useCountries();
  const { states, isLoading: statesLoading } = useStates(profile?.idCountry || '');
  const { banks, isLoading: banksLoading } = useBanks();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dob: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      idCountry: '',
      idState: '',
      postcode: '',
      bankName: '',
      bankNameOther: '',
      bankBsb: '',
      bankAccountNumber: '',
    },
  });

  const { handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = form;
  const watchedBankName = watch('bankName');

  useEffect(() => {
    if (profile) {
      const values = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender || '',
        dob: profile.dob || '',
        phoneNumber: profile.phoneNumber || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        idCountry: profile.idCountry || '',
        idState: profile.idState || '',
        postcode: profile.postcode || '',
        bankName: profile.bankName || '',
        bankNameOther: profile.bankNameOther || '',
        bankBsb: profile.bankBsb || '',
        bankAccountNumber: profile.bankAccountNumber || '',
      };
      
      reset(values);
      setSelectedCountry(profile.idCountry || '');
      setSelectedBank(profile.bankName || '');
    }
  }, [profile, reset]);

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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      await updateProfile(values);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return 'U';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const headerConfig = {
    title: 'Profile',
    subtitle: 'Profile overview',
    showAddButton: false,
  };

  // Show loading state for a maximum of 3 seconds
  const [showTimeout, setShowTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (profileLoading && !showTimeout) {
    return (
      <MainLayout activeNavItem="profile" headerConfig={headerConfig}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </MainLayout>
    );
  }

  if (error && !profile) {
    return (
      <MainLayout activeNavItem="profile" headerConfig={headerConfig}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout activeNavItem="profile" headerConfig={headerConfig}>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Data</h3>
          <p className="text-gray-600">Unable to load profile information.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeNavItem="profile" headerConfig={headerConfig}>
      <div className="space-y-6">
        {/* Success Message */}
        {saveSuccess && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Profile updated successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20" style={{ backgroundColor: profile?.color || '#3B82F6' }}>
                  <AvatarFallback className="text-white font-semibold text-2xl">
                    {getInitials(profile?.firstName, profile?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl">{profile?.fullName || 'Loading...'}</CardTitle>
                  <p className="text-gray-600 mt-1">{profile?.email || 'Loading...'}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {profile?.createdAt && (
                      <div className="text-sm text-gray-600">
                        Member since: {formatDate(new Date(profile.createdAt))}
                      </div>
                    )}
                    {profile?.lastLoginAt && (
                      <div className="text-sm text-gray-600">
                        Last login: {formatDate(new Date(profile.lastLoginAt))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={form.watch('gender')}
                    onValueChange={(value) => form.setValue('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DatePickerField
                  label="Date of Birth"
                  id="dob"
                  value={form.watch('dob')}
                  onChange={(value) => form.setValue('dob', value)}
                  error={form.formState.errors.dob}
                />

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
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
                  <Label htmlFor="idCountry">Country</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={setSelectedCountry}
                    disabled={countriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(countries) ? countries : []).map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="idState">State</Label>
                  <Select
                    value={form.watch('idState')}
                    onValueChange={(value) => form.setValue('idState', value)}
                    disabled={statesLoading || !selectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(states) ? states : []).map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Banking Information</span>
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
                      {(Array.isArray(banks) ? banks : []).map((bank) => (
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

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSaving || !isDirty}
              className="min-w-[120px]"
            >
              {isSaving ? (
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
