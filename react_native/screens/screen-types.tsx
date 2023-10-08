import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type StackParams = {
  Login: undefined;
  ChangePassword: undefined;
  Index: undefined;
  Settings: undefined;

  SelectStore: undefined;
  SelectItemsFromStore: {
    scannedBarCode?: string;
  };
  ScanBarCode: undefined;
  ReviewStorageChanges: undefined;
  StorageChangesSummary: undefined;

  SelectPartner: {
    screen: 'SelectPartnerFromStore' | 'SelectPartnerFromAll';
  };
  SelectItemsToSell: undefined;
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

export type LoginProps = NativeStackScreenProps<StackParams, 'Login'>;
export type ChangePasswordProps = NativeStackScreenProps<StackParams, 'ChangePassword'>;
export type IndexProps = NativeStackScreenProps<StackParams, 'Index'>;
export type SettingsProps = NativeStackScreenProps<StackParams, 'Settings'>;

export type SelectStoreProps = NativeStackScreenProps<StackParams, 'SelectStore'>;
export type SelectItemsFromStoreProps = NativeStackScreenProps<StackParams, 'SelectItemsFromStore'>;
export type ScanBarCodeProps = NativeStackScreenProps<StackParams, 'ScanBarCode'>;
export type ReviewStorageChangesProps = NativeStackScreenProps<StackParams, 'ReviewStorageChanges'>;
export type StorageChangesSummaryProps = NativeStackScreenProps<
  StackParams,
  'StorageChangesSummary'
>;

export type SelectItemsToSellProps = BottomTabScreenProps<StackParams, 'SelectItemsToSell'>;
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
