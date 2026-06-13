import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { JobFamily } from '../../domain/report';

export const profileKeys = {
  all: ['profiles'] as const,
  own: (userId: string | null) => ['profiles', userId] as const,
};

export type ProfileRow = {
  id: string;
  field: JobFamily | null;
  onboardedAt: string | null;
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
        .select('id, field, onboarded_at')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        id: data.id as string,
        field: (data.field as JobFamily) ?? null,
        onboardedAt: (data.onboarded_at as string | null) ?? null,
      };
    },
    enabled: userId != null,
  });
}

export function useUpdateProfile() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<{ field: JobFamily; onboardedAt: string }>) => {
      if (!userId) {
        throw new Error('Cannot update profile without an authenticated user.');
      }
      const payload: Record<string, unknown> = {};
      if (updates.field !== undefined) payload.field = updates.field;
      if (updates.onboardedAt !== undefined) payload.onboarded_at = updates.onboardedAt;
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
