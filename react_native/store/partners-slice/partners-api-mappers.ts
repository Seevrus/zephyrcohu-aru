import { assoc, indexBy, map, pipe, prop } from 'ramda';
import { FetchPartnersResponse, PartnerDetails } from './partners-slice-types';

// eslint-disable-next-line import/prefer-default-export
export const mapFetchPartnersResponse = (response: FetchPartnersResponse): PartnerDetails[] =>
  map(
    (data) =>
      pipe(
        assoc('locations', indexBy(prop('locationType'), data.locations)),
        assoc('priceList', indexBy(prop('itemId'), data.priceList))
      )(data),
    prop<FetchPartnersResponse['data']>('data', response)
  );
