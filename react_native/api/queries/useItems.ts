import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  type ItemsResponseData,
  type ItemsResponseType,
} from '../response-types/ItemsResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function useItems({
  enabled = true,
} = {}): UseQueryResult<ItemsResponseData> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, isTokenExpired, token } = {} } =
    useToken();

  return useQuery({
    queryKey: ['items', token],
    queryFn: () => fetchItems(token),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired,
  });
}

export async function fetchItems(token: string): Promise<ItemsResponseData> {
  try {
    const response = await axios.get<ItemsResponseType>(
      `${env.api_url}/items`,
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
      console.log('useItems:', error.response?.data);
    }
    throw new Error(
      'Váratlan hiba lépett fel a tételek adatainak lekérése során.'
    );
  }
}
