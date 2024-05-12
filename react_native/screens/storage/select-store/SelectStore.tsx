import { useNetInfo } from '@react-native-community/netinfo';
import { isNotNil } from 'ramda';
import { Suspense, useCallback, useEffect } from 'react';
import {
  FlatList,
  type ListRenderItem,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { Container } from '../../../components/container/Container';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Loading } from '../../../components/Loading';
import { Tile, type TileT } from '../../../components/Tile';
import { Input } from '../../../components/ui/Input';
import { ForwardIcon } from '../../../navigators/ForwardIcon';
import { type SelectStoreProps } from '../../../navigators/screen-types';
import { useSelectStoreData } from './useSelectStoreData';

function SuspendedSelectStore({ navigation }: SelectStoreProps) {
  const { isInternetReachable } = useNetInfo();

  const {
    isLoading,
    error,
    selectedStoreId,
    searchInputHandler,
    handleSubmitSelectedStore,
    storeTiles,
  } = useSelectStoreData(navigation);

  useEffect(() => {
    if (isInternetReachable === false) {
      navigation.goBack();
    }
  }, [isInternetReachable, navigation]);

  useEffect(() => {
    if (isNotNil(selectedStoreId)) {
      navigation.setOptions({
        headerRight() {
          return <ForwardIcon onPress={handleSubmitSelectedStore} />;
        },
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [handleSubmitSelectedStore, navigation, selectedStoreId]);

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            label="Keresés"
            labelPosition="left"
            config={{ onChangeText: searchInputHandler }}
          />
        </View>
      </View>
      {error ? (
        <View>
          <ErrorCard>{error}</ErrorCard>
        </View>
      ) : null}
      <View style={styles.listContainer}>
        <FlatList
          data={storeTiles}
          keyExtractor={(tile) => tile.id}
          renderItem={renderTile}
        />
      </View>
    </Container>
  );
}

export function SelectStore(props: SelectStoreProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSelectStore {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
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
