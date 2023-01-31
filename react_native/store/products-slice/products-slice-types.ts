type Stock = {
  expiresAt: Date;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  stock: Stock[];
};

export type Products = Product[];
