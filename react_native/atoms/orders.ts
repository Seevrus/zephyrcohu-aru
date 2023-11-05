import { type OrderRequest } from '../api/request-types/CreateOrdersRequestType';
import { atomWithAsyncStorage } from './helpers';

type ContextOrder = OrderRequest & {
  isSent: boolean;
};

export const ordersAtom = atomWithAsyncStorage<ContextOrder[]>(
  'boreal-orders-context',
  []
);

export const currentOrderAtom = atomWithAsyncStorage<ContextOrder | null>(
  'boreal-current-order-context',
  null
);
