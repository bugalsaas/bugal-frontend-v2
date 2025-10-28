import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileApi, Profile, ProfileUpdateDto } from '@/lib/api/profile-service';

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use user data from auth context instead of making a separate API call
  useEffect(() => {
    if (user && isAuthenticated) {
      // Transform auth context user to Profile format
      const profileData: Profile = {
        id: user.id,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        fullName: user.name || '',
        email: user.email,
        initials: user.initials || 'U',
        color: user.avatar || '#3B82F6',
        gender: undefined,
        dob: undefined,
        phoneNumber: undefined,
        addressLine1: undefined,
        addressLine2: undefined,
        idCountry: undefined,
        idState: undefined,
        postcode: undefined,
        timezone: undefined,
        bankName: undefined,
        bankNameOther: undefined,
        bankBsb: undefined,
        bankAccountNumber: undefined,
        createdAt: '',
        isEmailConfirmed: true,
        completed: false,
      };
      
      setProfile(profileData);
      setIsLoading(false);
      setError(null);
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setError('Not authenticated');
      setProfile(null);
    }
  }, [user, isAuthenticated]);

  const updateProfile = async (data: ProfileUpdateDto): Promise<Profile> => {
    try {
      const updated = await profileApi.updateMe(data);
      setProfile(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const patchProfile = async (data: { firstName: string; lastName: string }): Promise<Profile> => {
    try {
      const updated = await profileApi.patchMe(data);
      setProfile(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    patchProfile,
    reloadProfile: () => {
      // Refresh user data by reloading the page
      window.location.reload();
    },
  };
}

export default useProfile;
