import { map, pick } from 'ramda';

import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import {
  type UpdateReceiptRequest,
  type UpdateReceiptsRequestData,
} from '../request-types/UpdateReceiptsRequestType';

export function mapUpdateReceiptsRequest(
  receipts: ContextReceipt[]
): UpdateReceiptsRequestData {
  return map<ContextReceipt, UpdateReceiptRequest>(
    pick(['id', 'originalCopiesPrinted']),
    receipts
  );
}
