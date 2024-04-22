import { type ExpirationChange } from '../request-types/common/ExpirationChange';
import { type SellSelectedItemsRequest } from '../request-types/SellSelectedItemsRequest';
import { type StoreDetailsResponseData } from '../response-types/StoreDetailsResponseType';

export function mapSellSelectedItemsRequest(
  storeDetails: StoreDetailsResponseData,
  updatedStorage: StoreDetailsResponseData
): SellSelectedItemsRequest {
  const changes = storeDetails.expirations
    .map<ExpirationChange | undefined>((expiration) => {
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
        startingQuantity: expiration.quantity,
        quantityChange: soldItemExpiration.quantity - expiration.quantity,
        finalQuantity: soldItemExpiration.quantity,
      };
    })
    .filter((expiration): expiration is ExpirationChange => !!expiration);

  return {
    data: {
      changes,
    },
  };
}
