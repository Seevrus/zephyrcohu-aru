import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import {
  mapSearchTaxPayerResponse,
  type TaxPayer,
} from '../response-mappers/mapSearchTaxPayerResponse';
import { type SearchTaxNumberResponseType } from '../response-types/SearchTaxNumberResponseType';
import { useToken } from './useToken';

type UseSearhcTaxNumberProps = {
  taxNumber: string;
  enabled?: boolean;
};

export function useSearchTaxNumber({
  taxNumber,
  enabled = true,
}: UseSearhcTaxNumberProps): UseQueryResult<TaxPayer[]> {
  const {
    isSuccess: isTokenSuccess,
    data: { token, isTokenExpired, isPasswordExpired } = {},
  } = useToken();

  return useQuery({
    queryKey: ['search-tax-number', taxNumber],
    queryFn: async (): Promise<TaxPayer[]> => {
      try {
        const response = await axios.post<SearchTaxNumberResponseType>(
          `${env.api_url}/partners/search`,
          { data: { taxNumber } },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return mapSearchTaxPayerResponse(response.data.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('useSearchTaxNumber', error.message);
        throw new Error('Váratlan hiba lépett fel az adószám keresése során.');
      }
    },
    enabled:
      enabled &&
      /^(\d{8})$/.test(taxNumber) &&
      isTokenSuccess &&
      !!token &&
      !(isTokenExpired || isPasswordExpired),
    staleTime: 0, // for testing purposes only
  });
}
