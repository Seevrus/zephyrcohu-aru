import { complement, dissoc, filter, map, pipe, prop } from 'ramda';

import { ContextOrder } from '../../providers/types/orders-provider-types';
import { OrderRequestData } from '../request-types/CreateOrdersRequestType';

export default function mapCreateOrdersRequest(orders: ContextOrder[]): OrderRequestData {
  return pipe(filter<ContextOrder>(complement(prop('isSent'))), map(dissoc('isSent')))(orders);
}
