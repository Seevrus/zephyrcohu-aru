import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useDeselectStore() {
  const queryClient = useQueryClient();
  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn() {
      try {
        const response = await axios.post<LoginResponse>(
          `${process.env.EXPO_PUBLIC_API_URL}/storage/unlock_from_user`,
          undefined,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Android-Id': deviceId,
            },
          }
        );

        return response.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useDeselectStore:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a raktár leválasztása során.'
        );
      }
    },
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.checkToken }),
        queryClient.invalidateQueries({ queryKey: queryKeys.items }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
        queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() }),
      ]);
    },
  });
}
