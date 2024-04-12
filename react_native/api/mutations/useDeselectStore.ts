import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { queryKeys } from '../keys';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useDeselectStore() {
  const queryClient = useQueryClient();
  const { token } = useAtomValue(tokenAtom);

  return useMutation({
    async mutationFn() {
      try {
        const response = await axios.post<LoginResponse>(
          `${env.api_url}/storage/unlock_from_user`,
          undefined,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Android-Id': getAndroidId(),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checkToken });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.stores });
      queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() });
    },
  });
}
