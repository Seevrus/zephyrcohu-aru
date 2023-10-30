import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import {
  type StoresResponseData,
  type StoresResponseType,
} from '../response-types/StoresResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function useStores({
  enabled = true,
} = {}): UseQueryResult<StoresResponseData> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { token, isPasswordExpired } = {} } = useToken();

  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      try {
        const response = await axios.get<StoresResponseType>(
          `${env.api_url}/stores`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('useStores:', error.message);
        throw new Error(
          'Váratlan hiba lépett fel a raktárak adatainak lekérése során.'
        );
      }
    },
    enabled: enabled && isCheckTokenSuccess && !isPasswordExpired,
  });
}
