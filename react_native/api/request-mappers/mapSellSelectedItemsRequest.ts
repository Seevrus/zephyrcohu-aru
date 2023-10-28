import { identity } from 'ramda';

import { SellSelectedItemsRequest } from '../request-types/SellSelectedItemsRequest';
import { StoreDetailsResponseData } from '../response-types/StoreDetailsResponseType';

export default function mapSellSelectedItemsRequest(
  storeDetails: StoreDetailsResponseData,
  soldItems: Record<number, Record<number, number>>
): SellSelectedItemsRequest {
  const changes = storeDetails.expirations
    .map((expiration) => {
      const soldItemQuantity = soldItems?.[expiration.itemId]?.[expiration.expirationId];

      if (!soldItemQuantity) {
        return undefined;
      }

      return {
        expirationId: expiration.expirationId,
        quantityChange: expiration.quantity - soldItemQuantity,
      };
    })
    .filter(identity);

  return {
    data: {
      changes,
    },
  };
}
