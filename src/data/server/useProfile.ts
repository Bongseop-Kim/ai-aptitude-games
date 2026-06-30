import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { BirthYearBand } from '../../domain/birthYearBand';
import type { JobFamily } from '../../domain/report';

export const profileKeys = {
  all: ['profiles'] as const,
  own: (userId: string | null) => ['profiles', userId] as const,
};

export type ProfileRow = {
  id: string;
  field: JobFamily | null;
  onboardedAt: string | null;
  birthYearBand: BirthYearBand | null;
  birthYearBandConsentAt: string | null;
  pro: boolean;
};

export function useProfile() {
  const { userId } = useAuth();

  return useQuery({
    queryKey: profileKeys.own(userId),
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!userId) {
        throw new Error('Cannot load profile without an authenticated user.');
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, field, onboarded_at, birth_year_band, birth_year_band_consent_at, pro')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id as string,
        field: (data.field as JobFamily) ?? null,
        onboardedAt: (data.onboarded_at as string | null) ?? null,
        birthYearBand: (data.birth_year_band as BirthYearBand) ?? null,
        birthYearBandConsentAt: (data.birth_year_band_consent_at as string | null) ?? null,
        pro: (data.pro as boolean) ?? false,
      };
    },
    enabled: userId != null,
    retry: false,
  });
}

export function useIsPro(): boolean {
  return useProfile().data?.pro ?? false;
}

export function useUpdateProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<{
        field: JobFamily;
        onboardedAt: string;
        birthYearBand: BirthYearBand | null;
        birthYearBandConsentAt: string | null;
      }>,
    ) => {
      if (!userId) {
        throw new Error('Cannot update profile without an authenticated user.');
      }
      const payload: Record<string, unknown> = {};
      if (updates.field !== undefined) payload.field = updates.field;
      if (updates.onboardedAt !== undefined) payload.onboarded_at = updates.onboardedAt;
      if (updates.birthYearBand !== undefined) payload.birth_year_band = updates.birthYearBand;
      if (updates.birthYearBandConsentAt !== undefined)
        payload.birth_year_band_consent_at = updates.birthYearBandConsentAt;
      if (Object.keys(payload).length === 0) return;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useSetPro() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pro: boolean) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ pro })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
