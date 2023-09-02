import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { useUserContext } from '../../providers/UserProvider';

export default function useLogout() {
  const queryClient = useQueryClient();
  const { clearUserFromContext } = useUserContext();

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
    },
  });
}
