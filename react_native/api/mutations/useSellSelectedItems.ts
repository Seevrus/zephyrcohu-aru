import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import { useCheckToken } from '../queries/useCheckToken';
import { useStoreDetails } from '../queries/useStoreDetails';
import { mapSellSelectedItemsRequest } from '../request-mappers/mapSellSelectedItemsRequest';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';

export function useSellSelectedItems() {
  const queryClient = useQueryClient();
  const { data: user } = useCheckToken();
  const { data: storeDetails } = useStoreDetails(user?.storeId ?? undefined);

  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn(updatedStorage: StoreDetailsResponseData) {
      try {
        if (!storeDetails) {
          throw new Error('Raktár adatai nem elérhetőek');
        }

        const request = mapSellSelectedItemsRequest(
          storeDetails,
          updatedStorage
        );

        const response = await axios.post<StoreDetailsResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/storage/sell`,
          request,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useSellSelectedItems:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel a raktár frissítése során.');
      }
    },
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
        queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() }),
      ]);
    },
  });
}
