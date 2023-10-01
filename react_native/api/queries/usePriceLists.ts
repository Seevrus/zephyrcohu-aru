import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import {
  PriceListResponseData,
  PriceListResponseType,
} from '../response-types/PriceListResponseType';
import useCheckToken from './useCheckToken';
import useToken from './useToken';

export default function usePriceLists({
  enabled = true,
} = {}): UseQueryResult<PriceListResponseData> {
  const { data: user } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['price-lists'],
    queryFn: async (): Promise<PriceListResponseData> => {
      try {
        const response = await axios.get<PriceListResponseType>(`${env.api_url}/price_lists`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (err) {
        console.log(err.message);
        throw new Error('Váratlan hiba lépett fel az árlisták lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired) && isRoundStarted,
  });
}
