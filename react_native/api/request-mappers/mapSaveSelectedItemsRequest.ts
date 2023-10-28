import { flatten, map, pipe, toPairs, values } from 'ramda';
import { SaveSelectedItemsRequest } from '../request-types/SaveSelectedItemsRequest';

export default function mapSaveSelectedItemsRequest(
  primaryStoreId: number,
  storageExpirations: Record<number, Record<number, number>>
): SaveSelectedItemsRequest {
  const changes = pipe(
    values,
    map(
      pipe(
        toPairs<Record<number, number>>,
        map(([expirationId, quantityChange]) => ({
          expirationId: +expirationId,
          quantityChange,
        }))
      )
    ),
    flatten
  )(storageExpirations);

  return {
    data: {
      primaryStoreId,
      changes,
    },
  };
}
