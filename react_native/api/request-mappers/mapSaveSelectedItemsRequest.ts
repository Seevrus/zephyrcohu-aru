import { type StorageListItem } from '../../atoms/storageFlow';
import { type SaveSelectedItemsRequest } from '../request-types/SaveSelectedItemsRequest';

export function mapSaveSelectedItemsRequest(
  primaryStoreId: number,
  changedItems: StorageListItem[]
): SaveSelectedItemsRequest {
  return {
    data: {
      primaryStoreId,
      changes: changedItems.map((item) => ({
        expirationId: item.expirationId,
        startingQuantity: item.originalQuantity ?? 0,
        quantityChange:
          (item.currentQuantity ?? 0) - (item.originalQuantity ?? 0),
        finalQuantity: item.currentQuantity ?? 0,
      })),
    },
  };
}
