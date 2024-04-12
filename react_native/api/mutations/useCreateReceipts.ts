import { useMutation } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtomValue } from 'jotai';

import { type ContextReceipt } from '../../atoms/receipts';
import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { mapCreateReceiptsRequest } from '../request-mappers/mapCreateReceiptsRequest';
import {
  type ReceiptResponseData,
  type ReceiptsResponseType,
} from '../response-types/ReceiptsResponseType';

export function useCreateReceipts() {
  const { token } = useAtomValue(tokenAtom);

  return useMutation({
    async mutationFn(receipts: ContextReceipt[]): Promise<ReceiptResponseData> {
      try {
        const receiptRequestData = mapCreateReceiptsRequest(receipts);

        const response = await axios.post<ReceiptsResponseType>(
          `${env.api_url}/receipts`,
          { data: receiptRequestData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Android-Id': getAndroidId(),
            },
          }
        );

        return response.data.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useCreateReceipts:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel a számlák beküldése során.');
      }
    },
  });
}
