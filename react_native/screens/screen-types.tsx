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
  ReceiptDetails: {
    serialNumber: number;
  };

  StartErrand: undefined;
  EndErrand: undefined;
  BarCodeTest: undefined;
};

export type StartupCheckProps = NativeStackScreenProps<StackParams, 'StartupCheck'>;
export type RegisterDeviceProps = NativeStackScreenProps<StackParams, 'RegisterDevice'>;
export type StartupErrorProps = NativeStackScreenProps<StackParams, 'StartupError'>;

export type IndexProps = NativeStackScreenProps<StackParams, 'Index'>;

export type SelectItemsProps = BottomTabScreenProps<StackParams, 'SelectItems'>;
export type ReviewProps = NativeStackScreenProps<StackParams, 'Review'>;
export type SummaryProps = NativeStackScreenProps<StackParams, 'Summary'>;

export type ReceiptListProps = NativeStackScreenProps<StackParams, 'ReceiptList'>;
export type ReceiptDetailsProps = NativeStackScreenProps<StackParams, 'ReceiptDetails'>;

export type StartErrandProps = NativeStackScreenProps<StackParams, 'StartErrand'>;
export type EndErrandProps = NativeStackScreenProps<StackParams, 'EndErrand'>;

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
