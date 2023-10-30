import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      try {
        await SecureStore.deleteItemAsync('boreal-token');
      } catch {
        throw new Error('Váratlan hiba lépett fel a kijelentkezés során.');
      }
    },
    onSuccess: () => {
      // only user related queries should be invalidated on logout
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['token'] });
    },
  });
}
