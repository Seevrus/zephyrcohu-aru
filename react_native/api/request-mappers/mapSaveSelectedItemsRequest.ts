import { type ListItem } from '../../providers/StorageFlowProvider';
import { type SaveSelectedItemsRequest } from '../request-types/SaveSelectedItemsRequest';

export function mapSaveSelectedItemsRequest(
  primaryStoreId: number,
  changedItems: ListItem[]
): SaveSelectedItemsRequest {
  return {
    data: {
      primaryStoreId,
      changes: changedItems.map((item) => ({
        expirationId: item.expirationId,
        quantityChange: item.currentQuantity - (item.originalQuantity ?? 0),
      })),
    },
  };
}
