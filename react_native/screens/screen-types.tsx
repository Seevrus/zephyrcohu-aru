import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParams = {
  StartupCheck: undefined;
  RegisterDevice: undefined;
  StartupError: {
    message: string;
  };

  Index: undefined;
};

export type StartupCheckProps = NativeStackScreenProps<StackParams, 'StartupCheck'>;
export type RegisterDeviceProps = NativeStackScreenProps<StackParams, 'RegisterDevice'>;
export type StartupErrorProps = NativeStackScreenProps<StackParams, 'StartupError'>;

export type IndexProps = NativeStackScreenProps<StackParams, 'Index'>;
