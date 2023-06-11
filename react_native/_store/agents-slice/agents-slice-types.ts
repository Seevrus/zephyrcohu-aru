export type FetchAgentsRequest = {
  deviceId: string;
  token: string;
};

export type FetchAgentsResponse = Agents;

export type Agent = {
  id: number;
  code: string;
  name: string;
  phoneNumber: string;
};

export type Agents = {
  data: Agent[];
};
