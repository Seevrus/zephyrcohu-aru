type Round = {
  id: number;
  name: string;
  clientIds: number[];
  firstAvailableReceiptNr: string;
};

export type Rounds = Round[];
