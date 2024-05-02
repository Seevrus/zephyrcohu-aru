import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import { type SelectStoreRequestType } from '../request-types/SelectStoreRequestType';
import { type SelectStoreResponseType } from '../response-types/SelectStoreResponseType';

export function useSelectStore() {
  const queryClient = useQueryClient();
  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn({ storeId }: SelectStoreRequestType) {
      try {
        const response = await axios.post<SelectStoreResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/storage/lock_to_user`,
          { data: { storeId } },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Android-Id': deviceId,
            },
          }
        );

        if (response.data.storeId !== storeId) {
          throw new Error('Invalid Store ID');
        }

        return response.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useSelectStore:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a raktár kiválasztása során.'
        );
      }
    },
    async onSuccess(response) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.checkToken }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.storeDetails(response.storeId),
        }),
      ]);
    },
  });
}
