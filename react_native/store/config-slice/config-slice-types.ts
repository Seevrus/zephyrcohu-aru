import userTypes from '../../constants/userTypes';

export type Config = {
  isDemoMode: boolean;
  userType: (typeof userTypes)[keyof typeof userTypes];
};

export type RegisterDeviceRequestT = {
  token: string;
  deviceId: string;
};

export type RegisterDeviceResponseT = {
  data: { type: (typeof userTypes)[keyof typeof userTypes] };
};

export type CheckTokenRequestT = {
  deviceId: string;
  token: string;
};

export type CheckTokenResponseT = {
  data: { type: (typeof userTypes)[keyof typeof userTypes] };
};
