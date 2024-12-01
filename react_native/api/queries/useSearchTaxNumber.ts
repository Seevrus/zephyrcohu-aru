import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  mapSearchTaxPayerResponse,
  type TaxPayer,
} from '../response-mappers/mapSearchTaxPayerResponse';
import { type SearchTaxNumberResponseType } from '../response-types/SearchTaxNumberResponseType';
import { useCheckToken } from './useCheckToken';

type UseSearhcTaxNumberProps = {
  taxNumber: string;
  enabled?: boolean;
};

export function useSearchTaxNumber({
  taxNumber,
  enabled = true,
}: UseSearhcTaxNumberProps): UseQueryResult<TaxPayer[]> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.searchTaxNumber(taxNumber, token),
    async queryFn(): Promise<TaxPayer[]> {
      try {
        const response = await axios.post<SearchTaxNumberResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/partners/search`,
          { data: { taxNumber } },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
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
      isNotNil(deviceId) &&
      isCheckTokenSuccess &&
      !isPasswordExpired,
    placeholderData: undefined,
  });
}
