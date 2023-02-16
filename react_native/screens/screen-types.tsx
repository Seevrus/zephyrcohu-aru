import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParams = {
  StartupCheck: undefined;
  RegisterDevice: undefined;
  StartupError: {
    message: string;
  };

  Index: undefined;

  SelectPartner: undefined;
  SelectItems: undefined;
  Review: undefined;
  Summary: undefined;

  ReceiptList: undefined;
  Receipt: undefined;

  StartErrand: undefined;
  EndErrand: undefined;
};

export type StartupCheckProps = NativeStackScreenProps<StackParams, 'StartupCheck'>;
export type RegisterDeviceProps = NativeStackScreenProps<StackParams, 'RegisterDevice'>;
export type StartupErrorProps = NativeStackScreenProps<StackParams, 'StartupError'>;

export type IndexProps = NativeStackScreenProps<StackParams, 'Index'>;

export type SelectItemsProps = BottomTabScreenProps<StackParams, 'SelectItems'>;
export type ReviewProps = NativeStackScreenProps<StackParams, 'Review'>;
export type SummaryProps = NativeStackScreenProps<StackParams, 'Summary'>;

export type ReceiptListProps = NativeStackScreenProps<StackParams, 'ReceiptList'>;

export type StartErrandProps = NativeStackScreenProps<StackParams, 'StartErrand'>;

export enum PartnerList {
  STORE,
  ALL,
}

export type PartnerTabParams = {
  SelectPartnerFromStore: {
    partners: PartnerList;
  };
  SelectPartnerFromAll: {
    partners: PartnerList;
  };
  SelectItems: NavigatorScreenParams<StackParams>;
};

export type SelectPartnerProps = BottomTabScreenProps<PartnerTabParams, 'SelectPartnerFromStore'>;
