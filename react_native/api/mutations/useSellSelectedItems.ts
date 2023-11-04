import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import { useCheckToken } from '../queries/useCheckToken';
import { useStoreDetails } from '../queries/useStoreDetails';
import { useToken } from '../queries/useToken';
import { mapSellSelectedItemsRequest } from '../request-mappers/mapSellSelectedItemsRequest';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';

export function useSellSelectedItems() {
  const queryClient = useQueryClient();
  const { data: user } = useCheckToken();
  const { data: { token } = {} } = useToken();
  const { data: storeDetails } = useStoreDetails({
    storeId: user?.storeId,
  });

  return useMutation({
    mutationKey: ['sell-selected-items'],
    mutationFn: async (updatedStorage: StoreDetailsResponseData) => {
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
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
    },
  });
}
