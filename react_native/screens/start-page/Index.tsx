import { useNetInfo } from '@react-native-community/netinfo';
import {
  FlatList,
  type ListRenderItem,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { useToken } from '../../api/queries/useToken';
import { Loading } from '../../components/Loading';
import { Tile, type TileT } from '../../components/Tile';
import { TextCard } from '../../components/info-cards/TextCard';
import { colors } from '../../constants/colors';
import { useTiles } from '../../hooks/useTiles';

export function Index() {
  const { isPending: isUserPending } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const {
    isPending: isTokenPending,
    data: { isPasswordExpired, isTokenExpired } = {},
  } = useToken();

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

  if (isTokenPending || isUserPending) {
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
      {isPasswordExpired && (
        <View style={styles.textCardContainer}>
          <TextCard>Az Ön jelszava lejárt, kérem változtassa meg.</TextCard>
        </View>
      )}
      {isTokenExpired && (
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
