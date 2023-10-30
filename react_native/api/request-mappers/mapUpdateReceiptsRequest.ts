import { complement, filter, map, pick, pipe, prop } from 'ramda';

import { type ContextReceipt } from '../../providers/types/receipts-provider-types';
import {
  type UpdateReceiptRequest,
  type UpdateReceiptsRequestData,
} from '../request-types/UpdateReceiptsRequestType';

export function mapUpdateReceiptsRequest(
  receipts: ContextReceipt[]
): UpdateReceiptsRequestData {
  return pipe(
    filter<ContextReceipt>(complement(prop('shouldBeUpdated'))),
    map<ContextReceipt, UpdateReceiptRequest>(
      pick(['id', 'originalCopiesPrinted'])
    )
  )(receipts);
}
