import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParams = {
  StartupCheck: undefined;
  RegisterDevice: undefined;
  StartupError: {
    message: string;
  };

  Index: undefined;
};

export type StartupErrorProps = NativeStackScreenProps<StackParams, 'StartupError'>;
export type RegisterDeviceProps = NativeStackScreenProps<StackParams, 'RegisterDevice'>;
export type StartupCheckProps = NativeStackScreenProps<StackParams, 'StartupCheck'>;
