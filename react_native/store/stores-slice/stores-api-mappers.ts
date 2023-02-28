import { assoc, indexBy, map, mapObjIndexed, pathOr, pipe, prop } from 'ramda';
import { Receipt } from '../round-slice/round-slice-types';
import {
  FetchStoreResponse,
  FetchStoreResponseItem,
  StoreDetails,
  StoreItem,
} from './stores-slice-types';

export const mapFetchStoreResponse = (response: FetchStoreResponse): StoreDetails =>
  assoc(
    'items',
    pipe(
      map((it: FetchStoreResponseItem) =>
        assoc('expirations', indexBy(prop('expiresAt'), it.expirations), it)
      ),
      indexBy(prop('id'))
    )(response.data.items),
    prop('data', response)
  );

export const removeReceiptQuantitiesFromStore = (
  storeItems: Record<string, StoreItem>,
  currentReceipt: Receipt
) =>
  mapObjIndexed(
    (storeItem: StoreItem, itemId: string) => ({
      id: storeItem.id,
      articleNumber: storeItem.articleNumber,
      expirations: mapObjIndexed((expiration, expiresAt) => {
        const receiptQuantity = pathOr(0, ['items', itemId, expiresAt, 'quantity'], currentReceipt);

        return {
          expiresAt: expiration.expiresAt,
          quantity: expiration.quantity - receiptQuantity,
        };
      }, storeItem.expirations),
    }),
    storeItems
  );
