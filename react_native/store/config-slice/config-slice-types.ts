import userTypes from '../../constants/userTypes';

export type Config = {
  isLocalStateMerged: boolean;
  isDemoMode: boolean;
  isLoggedin: boolean;
  tokenError: boolean;
  userType: (typeof userTypes)[keyof typeof userTypes];
};

export type RegisterDeviceRequestT = {
  token: string;
  deviceId: string;
};

export type RegisterDeviceResponseT = {
  type: (typeof userTypes)[keyof typeof userTypes];
};

export type CheckTokenRequestT = {
  deviceId: string;
  token: string;
};

export type CheckTokenResponseT = {
  type: (typeof userTypes)[keyof typeof userTypes];
};
