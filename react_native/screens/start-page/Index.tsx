import { useNetInfo } from '@react-native-community/netinfo';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { Suspense } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../atoms/token';
import { Loading } from '../../components/Loading';
import { Tile, type TileT } from '../../components/Tile';
import { Container } from '../../components/container/Container';
import { TextCard } from '../../components/info-cards/TextCard';
import { colors } from '../../constants/colors';
import { useTiles } from '../../hooks/useTiles';

function SuspendedIndex() {
  const { isFetching: isUserFetching } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const token = useAtomValue(loadable(tokenAtom));

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

  if (isUserFetching || token.state !== 'hasData') {
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
      {token.data.isPasswordExpired ? (
        <View style={styles.textCardContainer}>
          <TextCard>Az Ön jelszava lejárt, kérem változtassa meg.</TextCard>
        </View>
      ) : null}
      {token.data.isTokenExpired ? (
        <View style={styles.textCardContainer}>
          <TextCard>Körindításhoz és -záráshoz kérem jelentkezzen be.</TextCard>
        </View>
      ) : null}
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
    <Suspense fallback={<Container />}>
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
