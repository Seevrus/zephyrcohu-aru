import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import { mapRoundsResponse } from '../response-mappers/mapRoundsResponse';
import {
  type ActiveRoundResponseData,
  type RoundsResponseType,
} from '../response-types/ActiveRoundResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function useActiveRound({
  enabled = true,
} = {}): UseQueryResult<ActiveRoundResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, token } = {} } = useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['active-round'],
    queryFn: async () => {
      try {
        const response = await axios.get<RoundsResponseType>(
          `${env.api_url}/rounds`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return mapRoundsResponse(response.data);
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useActiveRound:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a kör adatainak lekérése során.'
        );
      }
    },
    enabled:
      enabled && isCheckTokenSuccess && !isPasswordExpired && isRoundStarted,
    initialData: {} as ActiveRoundResponseData,
  });
}
