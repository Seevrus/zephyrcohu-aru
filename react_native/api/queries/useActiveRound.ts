import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import { mapRoundsResponse } from '../response-mappers/mapRoundsResponse';
import { type RoundsResponseType } from '../response-types/ActiveRoundResponseType';
import { type RoundType } from '../response-types/common/RoundType';
import { checkTokenAtom } from './useCheckToken';
import { tokenAtom } from './useToken';

export const [, activeRoundAtom] = atomsWithQueryAsync(async (get) => {
  const isInternetReachable = await get(netInfoAtom);
  const { data: user } = await get(checkTokenAtom);
  const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

  const isRoundStarted = user?.state === 'R';

  return {
    queryKey: ['active-round'],
    queryFn: async (): Promise<RoundType> => {
      try {
        const response = await axios.get<RoundsResponseType>(
          `${env.api_url}/rounds`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${tokenData?.token}`,
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
      isInternetReachable === true &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      !!tokenData.token &&
      isRoundStarted,
  };
});
