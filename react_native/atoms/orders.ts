import { type OrderRequest } from '../api/request-types/CreateOrdersRequestType';
import { atomWithAsyncStorage } from './helpers';

export type ContextOrder = OrderRequest & {
  isSent: boolean;
};

export const ordersAtom = atomWithAsyncStorage<ContextOrder[]>(
  'boreal-orders',
  []
);

export const currentOrderAtom = atomWithAsyncStorage<ContextOrder | null>(
  'boreal-current-order',
  null
);
