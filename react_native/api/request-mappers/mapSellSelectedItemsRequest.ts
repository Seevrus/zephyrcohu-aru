import { identity } from 'ramda';

import { SellSelectedItemsRequest } from '../request-types/SellSelectedItemsRequest';
import { StoreDetailsResponseData } from '../response-types/StoreDetailsResponseType';

export default function mapSellSelectedItemsRequest(
  storeDetails: StoreDetailsResponseData,
  updatedStorage: StoreDetailsResponseData
): SellSelectedItemsRequest {
  const changes = storeDetails.expirations
    .map((expiration) => {
      const soldItemExpiration = updatedStorage.expirations.find(
        (e) => e.expirationId === expiration.expirationId
      );

      if (!soldItemExpiration || expiration.quantity === soldItemExpiration.quantity) {
        return undefined;
      }

      return {
        expirationId: expiration.expirationId,
        quantityChange: soldItemExpiration.quantity - expiration.quantity,
      };
    })
    .filter(identity);

  return {
    data: {
      changes,
    },
  };
}
