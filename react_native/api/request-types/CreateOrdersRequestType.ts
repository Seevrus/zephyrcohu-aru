type OrderItem = {
  articleNumber: string;
  name: string;
  quantity: number;
};

export type OrderRequest = {
  partnerId: number;
  orderedAt: string; // UTC
  items: OrderItem[];
};

type OrderRequestData = OrderRequest[];

export type CreateOrdersRequest = {
  data: OrderRequestData;
};
