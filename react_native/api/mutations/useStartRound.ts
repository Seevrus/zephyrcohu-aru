import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import useToken from '../queries/useToken';
import { StartRoundRequestType } from '../request-types/StartRoundRequestType';
import { StartRoundResponseType } from '../response-types/StartRoundResponseType';

export default function useStartRound() {
  const queryClient = useQueryClient();
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['start-round'],
    mutationFn: async (request: StartRoundRequestType) => {
      try {
        const response = await axios.post<StartRoundResponseType>(
          `${env.api_url}/rounds/start`,
          { data: request },
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );

        if (response.data.data.storeId !== request.storeId) {
          throw new Error();
        }

        return response.data.data;
      } catch (e) {
        console.log(e.message);
        throw new Error('Váratlan hiba lépett fel a kör indítása során.');
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['check-token'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-details', response.storeId] });
    },
  });
}
