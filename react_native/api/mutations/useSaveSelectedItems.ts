import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import useStores from '../queries/useStores';
import useToken from '../queries/useToken';
import mapSaveSelectedItemsRequest from '../request-mappers/mapSaveSelectedItemsRequest';
import { StoreDetailsResponseType } from '../response-types/StoreDetailsResponseType';

export default function useSaveSelectedItems() {
  const queryClient = useQueryClient();
  const { data: stores } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['save-selected-items'],
    mutationFn: async (storageExpirations: Record<number, Record<number, number>>) => {
      try {
        if (!primaryStoreId) {
          throw new Error('Elsődleges raktár nem található!');
        }

        const request = mapSaveSelectedItemsRequest(primaryStoreId, storageExpirations);

        const response = await axios.post<StoreDetailsResponseType>(
          `${env.api_url}/storage/load`,
          request,
          {
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          }
        );

        return response.data.data;
      } catch (err) {
        console.log(err.message);
        throw new Error('Váratlan hiba lépett fel a raktár frissítése során.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-details'] });
    },
  });
}
