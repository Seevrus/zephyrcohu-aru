type Client = {
  name: string;
  vatNumber: string;
  address: {
    zipCode: number;
    city: string;
    address: string;
  };
};

export type Clients = Client[];
