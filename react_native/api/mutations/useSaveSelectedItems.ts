import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { type StorageListItem } from '../../atoms/storageFlow';
import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import { useStores } from '../queries/useStores';
import { mapSaveSelectedItemsRequest } from '../request-mappers/mapSaveSelectedItemsRequest';
import { type StoreDetailsResponseType } from '../response-types/StoreDetailsResponseType';

export function useSaveSelectedItems() {
  const queryClient = useQueryClient();
  const { data: stores } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useMutation({
    async mutationFn(changedItems: StorageListItem[]) {
      try {
        if (!primaryStoreId) {
          throw new Error('Elsődleges raktár nem található!');
        }

        const request = mapSaveSelectedItemsRequest(
          primaryStoreId,
          changedItems
        );

        const response = await axios.post<StoreDetailsResponseType>(
          `${process.env.EXPO_PUBLIC_API_URL}/storage/load`,
          request,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        return response.data.data;
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useSaveSelectedItems:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel a raktár frissítése során.');
      }
    },
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stores }),
        queryClient.invalidateQueries({ queryKey: queryKeys.storeDetails() }),
      ]);
    },
  });
}
