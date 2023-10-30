import { identity } from 'ramda';

import { type SellSelectedItemsRequest } from '../request-types/SellSelectedItemsRequest';
import { type StoreDetailsResponseData } from '../response-types/StoreDetailsResponseType';

export function mapSellSelectedItemsRequest(
  storeDetails: StoreDetailsResponseData,
  updatedStorage: StoreDetailsResponseData
): SellSelectedItemsRequest {
  const changes = storeDetails.expirations
    .map((expiration) => {
      const soldItemExpiration = updatedStorage.expirations.find(
        (exp) => exp.expirationId === expiration.expirationId
      );

      if (
        !soldItemExpiration ||
        expiration.quantity === soldItemExpiration.quantity
      ) {
        return;
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
