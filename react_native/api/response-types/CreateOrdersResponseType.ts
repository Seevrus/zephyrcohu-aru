import { type OrderItem } from '../request-types/common/OrderItem';

type CreatedOrder = {
  id: number;
  partnerId: number;
  orderedAt: string; // UTC
  items: OrderItem[];
};

export type CreateOrdersResponseData = CreatedOrder[];

export type CreateOrdersResponseType = {
  data: CreateOrdersResponseData;
};
