import { type OrderRequest } from '../api/request-types/CreateOrdersRequestType';
import {
  atomWithAsyncStorage,
  atomWithMediaStorage,
  mediaKeys,
} from './helpers';

export type ContextOrder = OrderRequest & {
  isSent: boolean;
};

export const ordersAtom = atomWithMediaStorage<ContextOrder[]>(
  mediaKeys.orders,
  []
);

export const currentOrderAtom = atomWithAsyncStorage<ContextOrder | null>(
  'boreal-current-order',
  null
);
