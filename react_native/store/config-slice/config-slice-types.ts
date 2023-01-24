import userTypes from '../../constants/userTypes';

export type Config = {
  hasToken: boolean;
  isTokenValid: boolean;
  userType: (typeof userTypes)[keyof typeof userTypes];
};

export type RegisterDeviceRequestT = {
  token: string;
  deviceId: string;
};

export type RegisterDeviceResponseT = {
  type: (typeof userTypes)[keyof typeof userTypes];
};
