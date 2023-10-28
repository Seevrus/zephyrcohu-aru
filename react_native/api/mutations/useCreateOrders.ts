import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import env from '../../env.json';
import { ContextOrder } from '../../providers/types/orders-provider-types';
import useToken from '../queries/useToken';
import mapCreateOrdersRequest from '../request-mappers/mapCreateOrdersRequest';
import {
  CreateOrdersResponseData,
  CreateOrdersResponseType,
} from '../response-types/CreateOrdersResponseType';

export default function useCreateOrders() {
  const { data: { token } = {} } = useToken();

  return useMutation({
    mutationKey: ['create-orders'],
    mutationFn: async (orders: ContextOrder[]): Promise<CreateOrdersResponseData> => {
      try {
        const createOrdersRequest = mapCreateOrdersRequest(orders);

        const response = await axios.post<CreateOrdersResponseType>(
          `${env.api_url}/orders`,
          { data: createOrdersRequest },
          { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
        );

        return response.data.data;
      } catch (e) {
        console.log(e.message);
        throw new Error('Váratlan hiba lépett fel a rendelések beküldése során.');
      }
    },
  });
}
