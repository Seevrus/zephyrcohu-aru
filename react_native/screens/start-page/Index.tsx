import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { checkTokenAtom } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../api/queries/useToken';
import { Loading } from '../../components/Loading';
import { Tile, type TileT } from '../../components/Tile';
import { TextCard } from '../../components/info-cards/TextCard';
import { colors } from '../../constants/colors';
import { useTiles } from '../../hooks/useTiles';
import { Suspense } from 'react';

function SuspendedIndex() {
  const { isFetching: isUserFetching } = useAtomValue(checkTokenAtom);
  const { isInternetReachable } = useNetInfo();
  const { isPending: isTokenPending, data: tokenData } =
    useAtomValue(tokenAtom);

  const tiles = useTiles();

  const renderTile: ListRenderItem<TileT> = (
    info: ListRenderItemInfo<TileT>
  ) => (
    <Tile
      id={info.item.id}
      title={info.item.title}
      Icon={info.item.Icon}
      variant={info.item.variant}
      onPress={info.item.onPress}
    />
  );

  if (isTokenPending || isUserFetching) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!isInternetReachable && (
        <View style={styles.textCardContainer}>
          <TextCard>
            Az alkalmazás jelenleg internetkapcsolat nélkül működik.
          </TextCard>
        </View>
      )}
      {tokenData?.isPasswordExpired && (
        <View style={styles.textCardContainer}>
          <TextCard>Az Ön jelszava lejárt, kérem változtassa meg.</TextCard>
        </View>
      )}
      {tokenData?.isTokenExpired && (
        <View style={styles.textCardContainer}>
          <TextCard>Körindításhoz és -záráshoz kérem jelentkezzen be.</TextCard>
        </View>
      )}
      <FlatList
        data={tiles}
        keyExtractor={(tile) => tile.id}
        renderItem={renderTile}
      />
    </View>
  );
}

export function Index() {
  return (
    <Suspense>
      <SuspendedIndex />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingBottom: 30,
  },
  textCardContainer: {
    marginTop: 30,
  },
});
