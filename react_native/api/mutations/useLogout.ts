import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtom, useAtomValue } from 'jotai';

import {
  defaultStoredToken,
  storedTokenAtom,
  tokenAtom,
} from '../../atoms/token';
import env from '../../env.json';
import { queryKeys } from '../keys';

export function useLogout() {
  const queryClient = useQueryClient();

  const { token } = useAtomValue(tokenAtom);
  const [, setStoredToken] = useAtom(storedTokenAtom);

  return useMutation({
    async mutationFn() {
      try {
        await axios.post<void>(`${env.api_url}/orders`, undefined, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Android-Id': getAndroidId(),
          },
        });
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useCreateOrders:', error.response?.data);
        }

        throw new Error('Váratlan hiba lépett fel a kijelentkezés során.');
      }
    },
    async onSuccess() {
      await setStoredToken(defaultStoredToken);

      // only user related queries should be invalidated on logout
      await queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    },
  });
}
