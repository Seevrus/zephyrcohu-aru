import { FontAwesome5 } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import {
  complement,
  compose,
  filter,
  isNil,
  map,
  pipe,
  prop,
  propEq,
  sortBy,
  toLower,
} from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useSelectStore from '../../../api/mutations/useSelectStore';
import useStores from '../../../api/queries/useStores';
import { StoresResponseData } from '../../../api/response-types/StoresResponseType';
import { StoreType } from '../../../api/response-types/common/StoreType';
import Loading from '../../../components/Loading';
import Tile, { TileT } from '../../../components/Tile';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import colors from '../../../constants/colors';
import { SelectStoreProps } from '../../../navigators/screen-types';

export default function SelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();
  const { mutateAsync: selectStore } = useSelectStore();
  const { isLoading: isStoresLoading, data: stores } = useStores();

  const [isSubmitInProgress, setIsSubmitInProgress] = useState<boolean>(false);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [storeSearchValue, setStoreSearchValue] = useState<string>('');
  const [storesShown, setStoresShown] = useState<StoresResponseData>([]);

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.replace('Index');
    }
  }, [isInternetReachable, navigation]);

  useEffect(() => {
    setStoresShown((stores ?? []).filter((store) => store.name.includes(storeSearchValue)));
  }, [storeSearchValue, stores]);

  const searchInputHandler = useCallback((inputValue: string) => {
    setStoreSearchValue(inputValue);
  }, []);

  const handleStoreSelect = useCallback((storeId: number) => {
    setSelectedStoreId(storeId);
  }, []);

  const handleSubmitSelectedStore = useCallback(async () => {
    setIsSubmitInProgress(true);
    await selectStore({ storeId: selectedStoreId });
    setIsSubmitInProgress(false);
    navigation.replace('SelectItemsFromStore');
  }, [navigation, selectStore, selectedStoreId]);

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
              ? () => <FontAwesome5 name="store-alt-slash" size={35} color="white" />
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

  if (isStoresLoading || isSubmitInProgress) {
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
        <FlatList data={storeTiles} keyExtractor={(tile) => tile.id} renderItem={renderTile} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={handleSubmitSelectedStore}>
            Raktár kiválasztása
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 30,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: '7%',
  },
  listContainer: {
    flex: 1,
  },
  footerContainer: {
    height: 70,
    paddingVertical: 10,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
