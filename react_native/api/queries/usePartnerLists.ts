import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import {
  PartnersListResponseData,
  PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import useToken from './useToken';

export default function usePartnerLists({
  enabled = true,
} = {}): UseQueryResult<PartnersListResponseData> {
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  return useQuery({
    queryKey: ['partner-lists'],
    queryFn: async (): Promise<PartnersListResponseData> => {
      try {
        const response = await axios.get<PartnersListResponseType>(`${env.api_url}/partner_lists`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return response.data.data;
      } catch (err) {
        console.log(err.message);
        throw new Error('Váratlan hiba lépett fel a partnerlisták lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired),
  });
}
