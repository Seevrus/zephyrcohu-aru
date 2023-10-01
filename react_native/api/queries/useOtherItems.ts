import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import {
  OtherItemsResponseData,
  OtherItemsResponseType,
} from '../response-types/OtherItemsResponseType';
import useCheckToken from './useCheckToken';
import useToken from './useToken';

export default function useOtherItems({
  enabled = true,
} = {}): UseQueryResult<OtherItemsResponseData> {
  const { data: user } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['other-items'],
    queryFn: async (): Promise<OtherItemsResponseData> => {
      try {
        const response = await axios.get<OtherItemsResponseType>(`${env.api_url}/other_items`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (_) {
        throw new Error('Váratlan hiba lépett fel az egyéb tételek adatainak lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired) && isRoundStarted,
  });
}
