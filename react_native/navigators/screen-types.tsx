import { type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  type CompositeScreenProps,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import { type RegularReviewItem } from '../providers/sell-flow-hooks/useReview';

export type StackParams = {
  Login: undefined;
  ChangePassword: undefined;
  Index: undefined;
  Settings: undefined;

  SelectStore: undefined;
  SelectItemsFromStore:
    | {
        scannedBarCode?: string;
      }
    | undefined;
  ScanBarCodeInStorage: undefined;
  ReviewStorageChanges: undefined;
  StorageChangesSummary: undefined;

  SelectPartner: NavigatorScreenParams<PartnerTabParams>;
  SelectItemsToSell:
    | {
        scannedBarCode?: string;
      }
    | undefined;
  ScanBarCodeInSell: undefined;
  Review: undefined;
  Discounts: {
    item: RegularReviewItem;
  };
  SelectOtherItemsToSell: undefined;
  Summary: undefined;

  SearchPartnerNavForm:
    | {
        taxNumber?: string;
      }
    | undefined;
  AddPartnerForm:
    | {
        taxNumber?: string;
        name?: string;
        centralPostalCode?: string | undefined;
        centralCity?: string | undefined;
        centralAddress?: string | undefined;
        deliveryPostalCode?: string;
        deliveryCity?: string;
        deliveryAddress?: string;
      }
    | undefined;

  ReceiptList: undefined;
  ReceiptDetails: {
    serialNumber: number;
  };

  StartErrand: undefined;
  EndErrand: undefined;
  BarCodeTest: undefined;
};

export type LoginProps = NativeStackScreenProps<StackParams, 'Login'>;
export type ChangePasswordProps = NativeStackScreenProps<
  StackParams,
  'ChangePassword'
>;
export type SettingsProps = NativeStackScreenProps<StackParams, 'Settings'>;

export type SelectStoreProps = NativeStackScreenProps<
  StackParams,
  'SelectStore'
>;
export type SelectItemsFromStoreProps = NativeStackScreenProps<
  StackParams,
  'SelectItemsFromStore'
>;
export type ScanBarCodeInStorageProps = NativeStackScreenProps<
  StackParams,
  'ScanBarCodeInStorage'
>;
export type ReviewStorageChangesProps = NativeStackScreenProps<
  StackParams,
  'ReviewStorageChanges'
>;
export type StorageChangesSummaryProps = NativeStackScreenProps<
  StackParams,
  'StorageChangesSummary'
>;

export type SelectItemsToSellProps = BottomTabScreenProps<
  StackParams,
  'SelectItemsToSell'
>;
export type ScanBarCodeInSellProps = NativeStackScreenProps<
  StackParams,
  'ScanBarCodeInSell'
>;
export type ReviewProps = NativeStackScreenProps<StackParams, 'Review'>;
export type DiscountsProps = NativeStackScreenProps<StackParams, 'Discounts'>;
export type SelectOtherItemsToSellProps = BottomTabScreenProps<
  StackParams,
  'SelectOtherItemsToSell'
>;
export type SummaryProps = NativeStackScreenProps<StackParams, 'Summary'>;

export type SearchPartnerNavFormProps = NativeStackScreenProps<
  StackParams,
  'SearchPartnerNavForm'
>;
export type AddPartnerFormProps = NativeStackScreenProps<
  StackParams,
  'AddPartnerForm'
>;

export type ReceiptListProps = NativeStackScreenProps<
  StackParams,
  'ReceiptList'
>;
export type ReceiptDetailsProps = NativeStackScreenProps<
  StackParams,
  'ReceiptDetails'
>;

export type StartErrandProps = NativeStackScreenProps<
  StackParams,
  'StartErrand'
>;
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
};

export type SelectPartnerProps = CompositeScreenProps<
  BottomTabScreenProps<
    PartnerTabParams,
    'SelectPartnerFromStore' | 'SelectPartnerFromAll'
  >,
  NativeStackScreenProps<StackParams>
>;
