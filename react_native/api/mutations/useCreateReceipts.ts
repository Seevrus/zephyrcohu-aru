import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import { useToken } from '../queries/useToken';
import { mapCreateReceiptsRequest } from '../request-mappers/mapCreateReceiptsRequest';
import {
  type ReceiptResponseData,
  type ReceiptsResponseType,
} from '../response-types/ReceiptsResponseType';

export function useCreateReceipts() {
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['create-receipts'],
    mutationFn: async (
      receipts: ContextReceipt[]
    ): Promise<ReceiptResponseData> => {
      try {
        const receiptRequestData = mapCreateReceiptsRequest(receipts);

        const response = await axios.post<ReceiptsResponseType>(
          `${env.api_url}/receipts`,
          { data: receiptRequestData },
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        console.log(error.message);
        throw new Error('Váratlan hiba lépett fel a számlák beküldése során.');
      }
    },
  });
}
