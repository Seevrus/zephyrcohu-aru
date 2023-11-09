import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { type SelectStoreRequestType } from '../request-types/SelectStoreRequestType';
import { type SelectStoreResponseType } from '../response-types/SelectStoreResponseType';

export function useSelectStore() {
  const queryClient = useQueryClient();
  const { token } = useAtomValue(tokenAtom);

  return useMutation({
    mutationKey: ['select-store'],
    mutationFn: async ({ storeId }: SelectStoreRequestType) => {
      try {
        const response = await axios.post<SelectStoreResponseType>(
          `${env.api_url}/storage/lock_to_user`,
          { data: { storeId } },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({
        queryKey: ['store-details', response.storeId],
      });
    },
  });
}
