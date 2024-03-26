import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { mapRoundsResponse } from '../response-mappers/mapRoundsResponse';
import { type RoundsResponseType } from '../response-types/ActiveRoundResponseType';
import { type RoundType } from '../response-types/common/RoundType';
import { useCheckToken } from './useCheckToken';

export function useActiveRound() {
  const { isInternetReachable } = useNetInfo();
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();

  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['active-round'],
    queryFn: fetchActiveRound(token),
    enabled:
      isInternetReachable === true &&
      !isTokenExpired &&
      !isPasswordExpired &&
      !!token &&
      isCheckTokenSuccess &&
      isRoundStarted,
  });
}

export const fetchActiveRound =
  (token: string) => async (): Promise<RoundType | undefined> => {
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
  };
