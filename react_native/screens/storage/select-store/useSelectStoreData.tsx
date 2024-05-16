import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import {
  allPass,
  isNil,
  isNotNil,
  pipe,
  prepend,
  prop,
  sortBy,
  when,
} from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { queryKeys } from '../../../api/keys';
import { useSelectStore } from '../../../api/mutations/useSelectStore';
import { fetchStoreDetails } from '../../../api/queries/useStoreDetails';
import { useStores } from '../../../api/queries/useStores';
import { type StoreType } from '../../../api/response-types/common/StoreType';
import { type StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';
import {
  primaryStoreAtom,
  selectedStoreCurrentStateAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import { deviceIdAtom, tokenAtom } from '../../../atoms/token';
import { type StackParams } from '../../../navigators/screen-types';

export function useSelectStoreData(
  navigation: NativeStackNavigationProp<StackParams, 'SelectStore', undefined>
) {
  const queryClient = useQueryClient();

  const { mutateAsync: selectStore } = useSelectStore();
  const { isPending: isStoresPending, data: stores } = useStores();
  const { token } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStoreCurrentState] = useAtom(
    selectedStoreCurrentStateAtom
  );

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stores });
  }, [queryClient]);

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const storesShown: StoreType[] = useMemo(
    () =>
      pipe(
        sortBy<StoreType>(prop('name')),
        when(
          allPass([
            () => isNotNil(selectedStoreId),
            (stores) => !stores.some((store) => store.id === selectedStoreId),
          ]),
          prepend(
            (stores ?? []).find(
              (store) => store.id === selectedStoreId
            ) as StoreType
          )
        )
      )(stores ?? []),
    [selectedStoreId, stores]
  );

  const handleSubmitSelectedStore = useCallback(async () => {
    if (
      isNotNil(primaryStoreId) &&
      isNotNil(selectedStoreId) &&
      isNotNil(token)
    ) {
      try {
        setIsSubmitInProgress(true);

        await selectStore({ storeId: selectedStoreId });

        const primaryStoreDetails =
          await queryClient.fetchQuery<StoreDetailsResponseData>({
            queryKey: queryKeys.storeDetails(primaryStoreId),
            queryFn: fetchStoreDetails(token, deviceId, primaryStoreId),
          });
        await setPrimaryStore(primaryStoreDetails);

        const selectedStoreDetails =
          await queryClient.fetchQuery<StoreDetailsResponseData>({
            queryKey: queryKeys.storeDetails(selectedStoreId),
            queryFn: fetchStoreDetails(token, deviceId, selectedStoreId),
          });

        await Promise.all([
          setSelectedStoreInitialState(selectedStoreDetails),
          setSelectedStoreCurrentState(selectedStoreDetails),
        ]);

        navigation.replace('SelectItemsFromStore');
      } catch (error) {
        setSubmitError(error?.message ?? 'Váratlan hiba lépett fel.');
      }
    }
  }, [
    deviceId,
    navigation,
    primaryStoreId,
    queryClient,
    selectStore,
    selectedStoreId,
    setPrimaryStore,
    setSelectedStoreCurrentState,
    setSelectedStoreInitialState,
    token,
  ]);

  const handleStoreSelect = useCallback(
    (storeId: string) => {
      const selectedStore = stores?.find((store) => store.id === +storeId);

      if (isNil(selectedStore?.user)) {
        setSelectedStoreId(+storeId);
      }
    },
    [stores]
  );

  const displayStores = useMemo(
    () =>
      (storesShown ?? [])
        .filter((store) => store.type !== 'P' && store.state === 'I')
        .map((store) => ({
          key: String(store.id),
          value: store.name,
        }))
        .sort((storeA, storeB) =>
          storeA.value.localeCompare(storeB.value, 'HU-hu')
        ),
    [storesShown]
  );

  return {
    isLoading: isStoresPending || isSubmitInProgress,
    error: submitError,
    selectedStoreId,
    handleSubmitSelectedStore,
    displayStores,
    handleStoreSelect,
  };
}
