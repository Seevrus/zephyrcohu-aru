import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import useCheckToken from '../queries/useCheckToken';
import useStoreDetails from '../queries/useStoreDetails';
import useToken from '../queries/useToken';
import mapSellSelectedItemsRequest from '../request-mappers/mapSellSelectedItemsRequest';
import { StoreDetailsResponseType } from '../response-types/StoreDetailsResponseType';

export default function useSellSelectedItems() {
  const queryClient = useQueryClient();
  const { data: user } = useCheckToken();
  const { data: { token } = {} } = useToken();
  const { data: storeDetails } = useStoreDetails({
    storeId: user?.storeId,
  });

  return useMutation({
    mutationKey: ['sell-selected-items'],
    mutationFn: async (soldItems: Record<number, Record<number, number>>) => {
      try {
        if (!storeDetails) {
          throw new Error('Raktár adatai nem elérhetőek');
        }

        const request = mapSellSelectedItemsRequest(storeDetails, soldItems);

        const response = await axios.post<StoreDetailsResponseType>(
          `${env.api_url}/storage/sell`,
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
