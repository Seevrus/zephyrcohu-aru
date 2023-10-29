import { complement, filter, map, pick, pipe, prop } from 'ramda';

import { ContextReceipt } from '../../providers/types/receipts-provider-types';
import {
  UpdateReceiptRequest,
  UpdateReceiptsRequestData,
} from '../request-types/UpdateReceiptsRequestType';

export default function mapUpdateReceiptsRequest(
  receipts: ContextReceipt[]
): UpdateReceiptsRequestData {
  return pipe(
    filter<ContextReceipt>(complement(prop('shouldBeUpdated'))),
    map<ContextReceipt, UpdateReceiptRequest>(pick(['id', 'originalCopiesPrinted']))
  )(receipts);
}
