import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileApi, Profile, ProfileUpdateDto } from '@/lib/api/profile-service';

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await profileApi.getMe();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Don't set profile to null - keep previous data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

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
