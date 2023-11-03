import { atom } from 'jotai';

export type StorageListItem = {
  itemId: number;
  expirationId: number;
  articleNumber: string;
  name: string;
  expiresAt: string;
  itemBarcode: string;
  expirationBarcode: string;
  unitName: string;
  primaryStoreQuantity: number | undefined;
  originalQuantity: number | undefined;
  currentQuantity: number | undefined;
};

export const isStorageSavedToApiAtom = atom(false);

export const storageListItemsAtom = atom<StorageListItem[] | undefined>(
  undefined
);
