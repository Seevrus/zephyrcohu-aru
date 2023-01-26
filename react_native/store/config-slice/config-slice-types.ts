import userTypes from '../../constants/userTypes';

export type Config = {
  isDemoMode: boolean;
  isLoggedin: boolean;
  userType: (typeof userTypes)[keyof typeof userTypes];
};

export type RegisterDeviceRequestT = {
  token: string;
  deviceId: string;
};

export type RegisterDeviceResponseT = {
  type: (typeof userTypes)[keyof typeof userTypes];
};

export type CheckTokenquestT = {
  deviceId: string;
  token: string;
};

export type CheckTokenResponseT = {
  type: (typeof userTypes)[keyof typeof userTypes];
};
