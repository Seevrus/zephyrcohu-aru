import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { PartnersResponseData, PartnersResponseType } from '../response-types/PartnersResponseType';
import useCheckToken from './useCheckToken';
import useToken from './useToken';

export default function usePartnerLists({
  enabled = true,
} = {}): UseQueryResult<PartnersResponseData> {
  const { data: user } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['partners'],
    queryFn: async (): Promise<PartnersResponseData> => {
      try {
        const response = await axios.get<PartnersResponseType>(`${env.api_url}/partners`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (err) {
        console.log(err.message);
        throw new Error('Váratlan hiba lépett fel a partnerek adatainak lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired) && isRoundStarted,
  });
}
