import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { useToken } from '../queries/useToken';
import { type FinishRoundRequestType } from '../request-types/FinishRoundRequestType';
import { type FinishRoundResponseType } from '../response-types/FinishRoundResponseType';

export function useFinishRound() {
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['start-round'],
    mutationFn: async (request: FinishRoundRequestType) => {
      try {
        const response = await axios.post<FinishRoundResponseType>(
          `${env.api_url}/rounds/finish`,
          { data: request },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.data.storeId !== request.roundId) {
          throw new Error('Invalid Round ID');
        }

        return response.data.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('useStartRound:', error.message);
        throw new Error('Váratlan hiba lépett fel a kör indítása során.');
      }
    },
  });
}
