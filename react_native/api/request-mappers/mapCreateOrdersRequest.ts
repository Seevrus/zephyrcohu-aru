import { complement, dissoc, filter, map, pipe, prop } from 'ramda';

import { type ContextOrder } from '../../atoms/orders';
import { type OrderRequestData } from '../request-types/CreateOrdersRequestType';

export function mapCreateOrdersRequest(
  orders: ContextOrder[]
): OrderRequestData {
  return pipe(
    filter<ContextOrder>(complement(prop('isSent'))),
    map(dissoc('isSent'))
  )(orders);
}
