import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileApi, Profile, ProfileUpdateDto } from '@/lib/api/profile-service';

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setError('Not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileApi.getMe();
      setProfile(data);
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
    reloadProfile: loadProfile,
  };
}

export default useProfile;
