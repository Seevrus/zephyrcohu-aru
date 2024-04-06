import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { defaultStoredToken, storedTokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';

export function useLogout() {
  const queryClient = useQueryClient();

  const [, setStoredToken] = useAtom(storedTokenAtom);

  return useMutation({
    async mutationFn() {
      try {
        await setStoredToken(defaultStoredToken);
      } catch {
        throw new Error('Váratlan hiba lépett fel a kijelentkezés során.');
      }
    },
    onSuccess: () => {
      // only user related queries should be invalidated on logout
      queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    },
  });
}
