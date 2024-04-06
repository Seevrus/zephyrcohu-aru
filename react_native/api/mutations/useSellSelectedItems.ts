import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
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
          `${env.api_url}/storage/sell`,
          request,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores });
      queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() });
    },
  });
}
