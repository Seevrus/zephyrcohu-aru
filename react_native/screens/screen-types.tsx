import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParams = {
  StartupCheck: undefined;
  Login: undefined;
  Index: undefined;
  StartupError: {
    message: string;
  };
};

export type StartupErrorProps = NativeStackScreenProps<StackParams, 'StartupError'>;
export type LoginProps = NativeStackScreenProps<StackParams, 'Login'>;
export type StartupCheckProps = NativeStackScreenProps<StackParams, 'StartupCheck'>;
