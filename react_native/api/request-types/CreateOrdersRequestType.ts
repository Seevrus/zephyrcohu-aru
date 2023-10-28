import { OrderItem } from './common/OrderItem';

export type OrderRequest = {
  partnerId: number;
  orderedAt: string; // UTC
  items: OrderItem[];
};

export type OrderRequestData = OrderRequest[];

export type CreateOrdersRequest = {
  data: OrderRequestData;
};
