import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { useStorageContext } from '../../providers/StorageProvider';
import { useUserContext } from '../../providers/UserProvider';

export default function useLogout() {
  const queryClient = useQueryClient();
  const { clearUserFromContext } = useUserContext();
  const { clearStorageFromContext } = useStorageContext();

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      try {
        await SecureStore.deleteItemAsync('boreal-token');
      } catch (e) {
        throw new Error('Váratlan hiba lépett fel a kijelentkezés során.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token'] });
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
      clearUserFromContext();
      clearStorageFromContext();
    },
  });
}
