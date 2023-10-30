import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import { useToken } from '../queries/useToken';
import { mapUpdateReceiptsRequest } from '../request-mappers/mapUpdateReceiptsRequest';
import {
  type ReceiptResponseData,
  type ReceiptsResponseType,
} from '../response-types/ReceiptsResponseType';

export function useUpdateReceipts() {
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['update-receipts'],
    mutationFn: async (
      receipts: ContextReceipt[]
    ): Promise<ReceiptResponseData> => {
      try {
        const receiptRequestData = mapUpdateReceiptsRequest(receipts);

        const response = await axios.post<ReceiptsResponseType>(
          `${env.api_url}/receipts/update_printed_copies`,
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
        // eslint-disable-next-line no-console
        console.log('useUpdateReceipts:', error.message);
        throw new Error('Váratlan hiba lépett fel a számlák frissítése során.');
      }
    },
  });
}
