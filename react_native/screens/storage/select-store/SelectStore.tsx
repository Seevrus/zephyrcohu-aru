import { FontAwesome5 } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useAtom } from 'jotai';
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
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useSelectStore } from '../../../api/mutations/useSelectStore';
import { useStoreDetails } from '../../../api/queries/useStoreDetails';
import { useStores } from '../../../api/queries/useStores';
import { type StoreType } from '../../../api/response-types/common/StoreType';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import { Loading } from '../../../components/Loading';
import { Tile, type TileT } from '../../../components/Tile';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectStoreProps } from '../../../navigators/screen-types';

function SuspendedSelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();
  const { mutateAsync: selectStore } = useSelectStore();
  const { isPending: isStoresPending, data: stores } = useStores();

  const [primaryStore, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [selectedStoreInitialState, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [selectedStore, setSelectedStore] = useAtom(selectedStoreAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [storeSearchValue, setStoreSearchValue] = useState<string>('');

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const [
    isPrimaryStoreDetailsQueryEnabled,
    setIsPrimaryStoreDetailsQueryEnabled,
  ] = useState<boolean>(false);
  const {
    data: primaryStoreDetails,
    isSuccess: isPrimaryStoreDetailsSuccess,
    isFetching: isPrimaryStoreDetailsFetching,
  } = useStoreDetails(primaryStoreId, isPrimaryStoreDetailsQueryEnabled);

  const [isStoreDetailsQueryEnabled, setIsStoreDetailsQueryEnabled] =
    useState<boolean>(false);
  const {
    data: storeDetails,
    isSuccess: isStoreDetailsSuccess,
    isFetching: isStoreDetailsFetching,
  } = useStoreDetails(selectedStoreId ?? undefined, isStoreDetailsQueryEnabled);

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

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.replace('Index');
    }
  }, [isInternetReachable, navigation]);

  useEffect(() => {
    if (
      !!primaryStoreDetails &&
      isPrimaryStoreDetailsSuccess &&
      !isPrimaryStoreDetailsFetching
    ) {
      setIsLoading(true);
      setPrimaryStore(primaryStoreDetails).then(() => {
        setIsLoading(false);
      });
    }
  }, [
    isPrimaryStoreDetailsFetching,
    isPrimaryStoreDetailsSuccess,
    primaryStoreDetails,
    setPrimaryStore,
  ]);

  useEffect(() => {
    if (!!storeDetails && isStoreDetailsSuccess && !isStoreDetailsFetching) {
      setIsLoading(true);
      Promise.all([
        setSelectedStoreInitialState(storeDetails),
        setSelectedStore(storeDetails),
      ]).then(() => {
        setIsLoading(false);
      });
    }
  }, [
    isStoreDetailsFetching,
    isStoreDetailsSuccess,
    setSelectedStore,
    setSelectedStoreInitialState,
    storeDetails,
  ]);

  useEffect(() => {
    if (
      isPrimaryStoreDetailsQueryEnabled &&
      !!primaryStore &&
      isStoreDetailsQueryEnabled &&
      !!selectedStoreInitialState &&
      !!selectedStore
    ) {
      navigation.replace('SelectItemsFromStore');
    }
  }, [
    isPrimaryStoreDetailsQueryEnabled,
    isStoreDetailsQueryEnabled,
    navigation,
    primaryStore,
    selectedStore,
    selectedStoreInitialState,
  ]);

  const searchInputHandler = useCallback((inputValue: string) => {
    setStoreSearchValue(inputValue);
  }, []);

  const handleStoreSelect = useCallback((storeId: number) => {
    setSelectedStoreId(storeId);
  }, []);

  const handleSubmitSelectedStore = useCallback(async () => {
    if (isNotNil(selectedStoreId)) {
      setIsSubmitInProgress(true);

      setIsPrimaryStoreDetailsQueryEnabled(true);
      setIsStoreDetailsQueryEnabled(true);
      await selectStore({ storeId: selectedStoreId });
    }
  }, [selectStore, selectedStoreId]);

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

  const renderTile: ListRenderItem<TileT> = useCallback(
    (info: ListRenderItemInfo<TileT>) => (
      <Tile
        id={info.item.id}
        title={info.item.title}
        Icon={info.item.Icon}
        variant={info.item.variant}
        onPress={info.item.onPress}
      />
    ),
    []
  );

  const confirmButtonVariant = isNil(selectedStoreId) ? 'disabled' : 'neutral';

  if (isStoresPending || isLoading || isSubmitInProgress) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            label="Keresés"
            labelPosition="left"
            config={{ onChangeText: searchInputHandler }}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <FlatList
          data={storeTiles}
          keyExtractor={(tile) => tile.id}
          renderItem={renderTile}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button
            variant={confirmButtonVariant}
            onPress={handleSubmitSelectedStore}
          >
            Raktár kiválasztása
          </Button>
        </View>
      </View>
    </View>
  );
}

export function SelectStore(props: SelectStoreProps) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedSelectStore {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingBottom: 30,
  },
  footerContainer: {
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 70,
    paddingVertical: 10,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: '7%',
  },
});
