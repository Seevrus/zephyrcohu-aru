import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  mapPartnersResponse,
  type Partners,
} from '../response-mappers/mapPartnersResponse';
import { type PartnersResponseType } from '../response-types/PartnersResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function usePartners({ enabled = true } = {}): UseQueryResult<Partners> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, isTokenExpired, token } = {} } =
    useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['partners'],
    queryFn: async (): Promise<Partners> => {
      try {
        const response = await axios.get<PartnersResponseType>(
          `${env.api_url}/partners`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return mapPartnersResponse(response.data.data);
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('usePartners:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a partnerek adatainak lekérése során.'
        );
      }
    },
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}
