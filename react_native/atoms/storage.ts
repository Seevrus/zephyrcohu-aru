import { type StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';
import { atomWithAsyncStorage } from './helpers';

export const primaryStoreAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-primary-store',
    null
  );

export const selectedStoreInitialStateAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-selected-store-initial-state',
    null
  );

export const selectedStoreCurrentStateAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-selected-store-current-state',
    null
  );
