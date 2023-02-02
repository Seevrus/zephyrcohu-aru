type Round = {
  id: number;
  name: string;
  clientIds: number[];
  receiptNr: {
    first: string;
    last: string;
  };
};

export type Rounds = Round[];
