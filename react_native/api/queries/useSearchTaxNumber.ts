import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  mapSearchTaxPayerResponse,
  type TaxPayer,
} from '../response-mappers/mapSearchTaxPayerResponse';
import { type SearchTaxNumberResponseType } from '../response-types/SearchTaxNumberResponseType';
import { useCheckToken } from './checkTokenAtom';
import { useToken } from './tokenAtom';

type UseSearhcTaxNumberProps = {
  taxNumber: string;
  enabled?: boolean;
};

export function useSearchTaxNumber({
  taxNumber,
  enabled = true,
}: UseSearhcTaxNumberProps): UseQueryResult<TaxPayer[]> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, isTokenExpired, token } = {} } =
    useToken();

  return useQuery({
    queryKey: ['search-tax-number', taxNumber, token],
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
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useSearchTaxNumber:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel az adószám keresése során.');
      }
    },
    enabled:
      enabled &&
      /^(\d{8})$/.test(taxNumber) &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired,
  });
}
