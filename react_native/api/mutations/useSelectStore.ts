import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import useToken from '../queries/useToken';
import { SelectStoreRequestType } from '../request-types/SelectStoreRequestType';
import { SelectStoreResponseType } from '../response-types/SelectStoreResponseType';

export default function useSelectStore() {
  const queryClient = useQueryClient();
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['select-store'],
    mutationFn: async ({ storeId }: SelectStoreRequestType) => {
      try {
        const response = await axios.post<SelectStoreResponseType>(
          `${env.api_url}/storage/lock_to_user`,
          { data: { storeId } },
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );

        if (response.data.storeId !== storeId) {
          throw new Error();
        }

        return response.data;
      } catch (e) {
        console.log(e.message);
        throw new Error('Váratlan hiba lépett fel a raktár kiválasztása során.');
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(['check-token']);
      queryClient.invalidateQueries(['stores']);
      queryClient.invalidateQueries(['store-details', response.storeId]);
    },
  });
}
