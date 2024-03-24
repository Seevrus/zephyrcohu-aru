import { type StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';
import { atomWithMediaStorage, mediaKeys } from './helpers';

export const primaryStoreAtom =
  atomWithMediaStorage<StoreDetailsResponseData | null>(
    mediaKeys.primaryStore,
    null
  );

export const selectedStoreInitialStateAtom =
  atomWithMediaStorage<StoreDetailsResponseData | null>(
    mediaKeys.selectedStoreInitial,
    null
  );

export const selectedStoreCurrentStateAtom =
  atomWithMediaStorage<StoreDetailsResponseData | null>(
    mediaKeys.selectedStoreCurrent,
    null
  );
