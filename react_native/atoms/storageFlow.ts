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

export const primaryStoreExpirationsAtom = atom<
  Record<number, Record<number, number>>
>({});
export const originalStorageExpirationsAtom = atom<
  Record<number, Record<number, number>>
>({});
export const storageExpirationsAtom = atom<
  Record<number, Record<number, number>>
>({});

export const searchStateAtom = atom({
  searchTerm: '',
  barCode: '',
});

export const isStorageSavedToApiAtom = atom(false);

export const storageListItemsAtom = atom<StorageListItem[] | undefined>(
  undefined
);
