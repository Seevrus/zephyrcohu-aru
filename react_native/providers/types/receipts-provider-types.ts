import { CreateReceiptRequest } from '../../api/request-types/CreateReceiptsRequestType';
import { ReceiptItem } from '../../api/request-types/common/ReceiptItemsTypes';

export type SelectedDiscount = {
  id: number;
  quantity: number;
  name: string;
} & (
  | {
      type: 'absolute' | 'percentage';
      amount: number;
      price?: undefined;
    }
  | {
      type: 'freeForm';
      amount?: undefined;
      price: number;
    }
);

export type ContextReceiptItem = ReceiptItem & {
  selectedDiscounts?: SelectedDiscount[];
};

export type ContextReceipt = Omit<CreateReceiptRequest, 'items'> & {
  id: number;
  isSent: boolean;
  shouldBeUpdated: boolean;
  items: ContextReceiptItem[];
};
