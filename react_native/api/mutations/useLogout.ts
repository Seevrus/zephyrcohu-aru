import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom, useAtomValue } from 'jotai';

import {
  defaultStoredToken,
  deviceIdAtom,
  storedTokenAtom,
  tokenAtom,
} from '../../atoms/token';
import { queryKeys } from '../keys';

export function useLogout() {
  const queryClient = useQueryClient();

  const { token } = useAtomValue(tokenAtom);
  const [, setStoredToken] = useAtom(storedTokenAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);

  return useMutation({
    async mutationFn() {
      try {
        await axios.post<void>(
          `${process.env.EXPO_PUBLIC_API_URL}/users/logout`,
          undefined,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        return true;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useLogout:', error.response?.data);

          const status = error.response?.status ?? 0;

          if (status >= 400 && status < 500) {
            return true;
          }
        }

        throw new Error('Váratlan hiba lépett fel a kijelentkezés során.');
      }
    },
    async onSuccess() {
      await setStoredToken(defaultStoredToken);
      await setDeviceId(null);

      // only user related queries should be invalidated on logout
      await queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
    },
  });
}
