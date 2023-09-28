import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import mapRoundsResponse from '../response-mappers/mapRoundsResponse';
import {
  ActiveRoundResponseData,
  RoundsResponseType,
} from '../response-types/ActiveRoundResponseType';
import useToken from './useToken';

export default function useActiveRound({
  enabled = true,
} = {}): UseQueryResult<ActiveRoundResponseData> {
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  return useQuery({
    queryKey: ['active-round'],
    queryFn: async () => {
      try {
        const response = await axios.get<RoundsResponseType>(`${env.api_url}/rounds`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return mapRoundsResponse(response.data);
      } catch (_) {
        throw new Error('Váratlan hiba lépett fel a kör adatainak lekérése során.');
      }
    },
    enabled: enabled && isTokenSuccess && !(isTokenExpired || isPasswordExpired),
  });
}
