import { assoc, indexBy, map, pipe, prop } from 'ramda';
import { FetchStoreResponse, FetchStoreResponseItem, Store } from './store-slice-types';

// eslint-disable-next-line import/prefer-default-export
export const mapFetchStoreResponse = (response: FetchStoreResponse): Store =>
  assoc(
    'items',
    pipe(
      map((it: FetchStoreResponseItem) =>
        assoc('expirations', indexBy(prop('expiresAt'), it.expirations), it)
      ),
      indexBy(prop('id'))
    )(response.items),
    response
  );
