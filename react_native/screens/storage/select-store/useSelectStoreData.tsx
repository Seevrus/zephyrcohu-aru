import { FontAwesome5 } from '@expo/vector-icons';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import {
  allPass,
  complement,
  compose,
  filter,
  isNil,
  isNotNil,
  map,
  pipe,
  prepend,
  prop,
  propEq,
  sortBy,
  take,
  toLower,
  when,
} from 'ramda';
import { useCallback, useMemo, useState } from 'react';

import { useSelectStore } from '../../../api/mutations/useSelectStore';
import { fetchStoreDetails } from '../../../api/queries/useStoreDetails';
import { useStores } from '../../../api/queries/useStores';
import { type StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';
import { type StoreType } from '../../../api/response-types/common/StoreType';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import { tokenAtom } from '../../../atoms/token';
import { type TileT } from '../../../components/Tile';
import { type StackParams } from '../../../navigators/screen-types';

export function useSelectStoreData(
  navigation: NativeStackNavigationProp<StackParams, 'SelectStore', undefined>
) {
  const queryClient = useQueryClient();

  const { mutateAsync: selectStore } = useSelectStore();
  const { isPending: isStoresPending, data: stores } = useStores();
  const { token } = useAtomValue(tokenAtom);

  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStore] = useAtom(selectedStoreAtom);

  const [storeSearchValue, setStoreSearchValue] = useState<string>('');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const storesShown: StoreType[] = useMemo(
    () =>
      pipe(
        when(
          () => !!storeSearchValue,
          filter<StoreType>((store) => store.name.includes(storeSearchValue))
        ),
        sortBy<StoreType>(prop('name')),
        (stores) => take<StoreType>(10, stores),
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
    [selectedStoreId, storeSearchValue, stores]
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
            queryKey: ['store-details', primaryStoreId],
            queryFn: fetchStoreDetails(token, primaryStoreId),
          });
        await setPrimaryStore(primaryStoreDetails);

        const selectedStoreDetails =
          await queryClient.fetchQuery<StoreDetailsResponseData>({
            queryKey: ['store-details', selectedStoreId],
            queryFn: fetchStoreDetails(token, selectedStoreId),
          });
        await setSelectedStoreInitialState(selectedStoreDetails);
        await setSelectedStore(selectedStoreDetails);

        navigation.replace('SelectItemsFromStore');
      } catch (error) {
        setSubmitError(error?.message ?? 'Váratlan hiba lépett fel.');
      }
    }
  }, [
    navigation,
    primaryStoreId,
    queryClient,
    selectStore,
    selectedStoreId,
    setPrimaryStore,
    setSelectedStore,
    setSelectedStoreInitialState,
    token,
  ]);

  const handleStoreSelect = useCallback((storeId: number) => {
    setSelectedStoreId(storeId);
  }, []);

  const storeTiles = useMemo(
    () =>
      pipe(
        filter(complement(propEq('P', 'type'))),
        sortBy<StoreType>(compose(toLower, prop('name'))),
        map<StoreType, TileT>((store) => {
          const isStoreOccupied = !isNil(store.user);

          const buttonVariant = (() => {
            if (isStoreOccupied) return 'disabled';
            if (store.id === selectedStoreId) return 'ok';
            return 'neutral';
          })();

          return {
            id: String(store.id),
            title: store.name,
            Icon: isStoreOccupied
              ? () => (
                  <FontAwesome5
                    name="store-alt-slash"
                    size={35}
                    color="white"
                  />
                )
              : () => <FontAwesome5 name="store-alt" size={35} color="white" />,
            variant: buttonVariant,
            onPress: () => handleStoreSelect(store.id),
          };
        })
      )(storesShown),
    [handleStoreSelect, selectedStoreId, storesShown]
  );

  return {
    isLoading: isStoresPending || isSubmitInProgress,
    error: submitError,
    selectedStoreId,
    searchInputHandler: setStoreSearchValue,
    handleSubmitSelectedStore,
    storeTiles,
  };
}