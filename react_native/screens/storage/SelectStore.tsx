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
import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useSelectStore from '../../api/mutations/useSelectStore';
import useStores from '../../api/queries/useStores';
import { StoreType } from '../../api/response-types/common/StoreType';
import Loading from '../../components/Loading';
import Tile, { TileT } from '../../components/Tile';
import colors from '../../constants/colors';
import { SelectStoreProps } from '../screen-types';

export default function SelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();
  const { mutateAsync: selectStore } = useSelectStore();
  const { isLoading: isStoresLoading, data: stores = [] } = useStores();

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.replace('Index');
    }
  }, [isInternetReachable, navigation]);

  const handleStoreSelect = useCallback(
    async (storeId: number) => {
      await selectStore({ storeId });
      navigation.replace('SelectItemsFromStore');
    },
    [navigation, selectStore]
  );

  const storeTiles = useMemo(
    () =>
      pipe(
        filter(complement(propEq('P', 'type'))),
        sortBy<StoreType>(compose(toLower, prop('name'))),
        map<StoreType, TileT>((store) => {
          const isStoreAvailable = isNil(store.user);

          return {
            id: String(store.id),
            title: store.name,
            Icon: isStoreAvailable
              ? () => <FontAwesome5 name="store-alt" size={35} color="white" />
              : () => <FontAwesome5 name="store-alt-slash" size={35} color="white" />,
            variant: isStoreAvailable ? 'neutral' : 'disabled',
            onPress: () => handleStoreSelect(store.id),
          };
        })
      )(stores),
    [handleStoreSelect, stores]
  );

  const renderTile: ListRenderItem<TileT> = (info: ListRenderItemInfo<TileT>) => (
    <Tile
      id={info.item.id}
      title={info.item.title}
      Icon={info.item.Icon}
      variant={info.item.variant}
      onPress={info.item.onPress}
    />
  );

  if (isStoresLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList data={storeTiles} keyExtractor={(tile) => tile.id} renderItem={renderTile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 30,
  },
});
