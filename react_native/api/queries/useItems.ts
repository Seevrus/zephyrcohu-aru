import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { ItemsResponseData, ItemsResponseType } from '../response-types/ItemsResponseType';
import useToken from './useToken';

export default function useItems({ enabled = true } = {}): UseQueryResult<ItemsResponseData> {
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      try {
        const response = await axios.get<ItemsResponseType>(`${env.api_url}/items`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (_) {
        throw new Error('Váratlan hiba lépett fel a tételek adatainak lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired),
  });
}
