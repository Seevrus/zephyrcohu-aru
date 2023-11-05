import { useNetInfo } from '@react-native-community/netinfo';
import { isNil } from 'ramda';
import { Suspense, useCallback, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { Loading } from '../../../components/Loading';
import { Tile, type TileT } from '../../../components/Tile';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { colors } from '../../../constants/colors';
import { type SelectStoreProps } from '../../../navigators/screen-types';
import { useSelectStoreData } from './useSelectStoreData';

function SuspendedSelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    selectedStoreId,
    searchInputHandler,
    handleSubmitSelectedStore,
    storeTiles,
  } = useSelectStoreData();

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.goBack();
    }
  }, [isInternetReachable, navigation]);

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

  if (isLoading) {
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
