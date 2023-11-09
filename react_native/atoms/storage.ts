import { type StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';
import { atomWithAsyncStorage } from './helpers';

export const primaryStoreAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-primary-store',
    null
  );

export const selectedStoreInitialStateAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-selected-store-original',
    null
  );

export const selectedStoreAtom =
  atomWithAsyncStorage<StoreDetailsResponseData | null>(
    'boreal-selected-store',
    null
  );
