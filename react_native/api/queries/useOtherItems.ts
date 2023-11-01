import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  type OtherItemsResponseData,
  type OtherItemsResponseType,
} from '../response-types/OtherItemsResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function useOtherItems({
  enabled = true,
} = {}): UseQueryResult<OtherItemsResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, isTokenExpired, token } = {} } =
    useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['other-items'],
    queryFn: async (): Promise<OtherItemsResponseData> => {
      try {
        const response = await axios.get<OtherItemsResponseType>(
          `${env.api_url}/other_items`,
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
          console.log('useOtherItems:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel az egyéb tételek adatainak lekérése során.'
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
    initialData: [],
  });
}
