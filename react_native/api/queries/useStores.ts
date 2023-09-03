import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { StoresResponseData, StoresResponseType } from '../response-types/StoresResponseType';
import useToken from './useToken';

export default function useStores({ enabled = true } = {}): UseQueryResult<StoresResponseData> {
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      try {
        const response = await axios.get<StoresResponseType>(`${env.api_url}/stores`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (_) {
        throw new Error('Váratlan hiba lépett fel a raktárak adatainak lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired),
  });
}
