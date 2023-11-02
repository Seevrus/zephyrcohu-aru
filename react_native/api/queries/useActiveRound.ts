import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { atom } from 'jotai';

import env from '../../env.json';
import { queryClient } from '../queryClient';
import { mapRoundsResponse } from '../response-mappers/mapRoundsResponse';
import {
  type ActiveRoundResponseData,
  type RoundsResponseType,
} from '../response-types/ActiveRoundResponseType';
import { useCheckToken } from './useCheckToken';
import { tokenAtom, useToken } from './useToken';

export function useActiveRound({
  enabled = true,
} = {}): UseQueryResult<ActiveRoundResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const {
    data: { isPasswordExpired = true, isTokenExpired = true, token = '' } = {},
  } = useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: activeRoundQueryKey,
    queryFn: () => fetchActiveRound(token),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}

export const activeRoundAtom = atom(async (get) => {
  const { token, isPasswordExpired, isTokenExpired } = await get(tokenAtom);

  if (!!token && !isPasswordExpired && !isTokenExpired) {
    try {
      return await queryClient.fetchQuery({
        queryKey: activeRoundQueryKey,
        queryFn: () => fetchActiveRound(token),
      });
    } catch {
      return;
    }
  }

  return;
});

const activeRoundQueryKey = ['active-round'];

export async function fetchActiveRound(token: string) {
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
    throw new Error('Váratlan hiba lépett fel a kör adatainak lekérése során.');
  }
}
