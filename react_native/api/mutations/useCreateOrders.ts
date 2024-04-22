import { useMutation } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtomValue } from 'jotai';

import { type ContextOrder } from '../../atoms/orders';
import { tokenAtom } from '../../atoms/token';
import { mapCreateOrdersRequest } from '../request-mappers/mapCreateOrdersRequest';
import {
  type CreateOrdersResponseData,
  type CreateOrdersResponseType,
} from '../response-types/CreateOrdersResponseType';

export function useCreateOrders() {
  const { token } = useAtomValue(tokenAtom);

  return useMutation({
    async mutationFn(
      orders: ContextOrder[]
    ): Promise<CreateOrdersResponseData> {
      try {
        const createOrdersRequest = mapCreateOrdersRequest(orders);

        if (createOrdersRequest.length === 0) {
          return [];
        }

        const response = await axios.post<CreateOrdersResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/orders`,
          { data: createOrdersRequest },
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
          console.log('useCreateOrders:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a rendelések beküldése során.'
        );
      }
    },
  });
}
