import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import { useStores } from '../queries/useStores';
import { useToken } from '../queries/useToken';
import { mapSaveSelectedItemsRequest } from '../request-mappers/mapSaveSelectedItemsRequest';
import { type StoreDetailsResponseType } from '../response-types/StoreDetailsResponseType';

export function useSaveSelectedItems() {
  const queryClient = useQueryClient();
  const { data: stores } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['save-selected-items'],
    mutationFn: async (
      storageExpirations: Record<number, Record<number, number>>
    ) => {
      try {
        if (!primaryStoreId) {
          throw new Error('Elsődleges raktár nem található!');
        }

        const request = mapSaveSelectedItemsRequest(
          primaryStoreId,
          storageExpirations
        );

        const response = await axios.post<StoreDetailsResponseType>(
          `${env.api_url}/storage/load`,
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
          console.log('useSaveSelectedItems:', error.response?.data);
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
