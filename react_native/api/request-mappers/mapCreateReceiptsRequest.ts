import { assoc, complement, filter, map, pipe, prop } from 'ramda';

import { ContextReceipt } from '../../providers/types/receipts-provider-types';
import createUniqueDiscountedItems from '../../utils/createUniqueDiscountedItems';
import { ReceiptRequest, ReceiptRequestData } from '../request-types/CreateReceiptsRequestType';

export default function mapCreateReceiptsRequest(receipts: ContextReceipt[]): ReceiptRequestData {
  return pipe(
    filter<ContextReceipt>(complement(prop('isSent'))),
    map<ContextReceipt, ReceiptRequest>((receipt) =>
      assoc('items', createUniqueDiscountedItems(receipt.items), receipt)
    )
  )(receipts);
}
