import { OrderRequest } from '../../api/request-types/CreateOrdersRequestType';

export type ContextOrder = OrderRequest & {
  isSent: boolean;
};
