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
        quantityChange: item.quantityChange ?? 0,
        finalQuantity:
          (item.originalQuantity ?? 0) + (item.quantityChange ?? 0),
      })),
    },
  };
}
