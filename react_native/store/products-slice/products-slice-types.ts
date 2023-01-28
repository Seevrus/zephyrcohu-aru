type Expiration = {
  expiresAt: Date;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  expirations: Expiration[];
};

export type Products = Product[];
