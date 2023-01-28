export type Company = {
  name: string;
  vatNumber: string;
  address: {
    zipCode: number;
    city: string;
    address: string;
  };
};
