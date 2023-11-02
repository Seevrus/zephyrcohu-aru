import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { atom } from 'jotai';

import env from '../../env.json';
import {
  type PartnersListResponseData,
  type PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import { useCheckToken } from './useCheckToken';
import { tokenAtom, useToken } from './useToken';
import { queryClient } from '../queryClient';

export function usePartnerLists({
  enabled = true,
} = {}): UseQueryResult<PartnersListResponseData> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const {
    data: { isPasswordExpired = true, isTokenExpired = true, token = '' } = {},
  } = useToken();

  return useQuery({
    queryKey: partnerListsQueryKey,
    queryFn: () => fetchPartnerLists(token),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired,
  });
}

export const partnerListsAtom = atom(async (get) => {
  const { token, isPasswordExpired, isTokenExpired } = await get(tokenAtom);

  if (!!token && !isPasswordExpired && !isTokenExpired) {
    try {
      return await queryClient.fetchQuery({
        queryKey: partnerListsQueryKey,
        queryFn: () => fetchPartnerLists(token),
      });
    } catch {
      return;
    }
  }

  return;
});

const partnerListsQueryKey = ['partner-lists'];

export async function fetchPartnerLists(
  token: string
): Promise<PartnersListResponseData> {
  try {
    const response = await axios.get<PartnersListResponseType>(
      `${env.api_url}/partner_lists`,
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
      console.log('usePartnerLists:', error.response?.data);
    }
    throw new Error('Váratlan hiba lépett fel a partnerlisták lekérése során.');
  }
}
