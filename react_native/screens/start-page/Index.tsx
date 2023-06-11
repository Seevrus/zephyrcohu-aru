import { useNetInfo } from '@react-native-community/netinfo';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import Tile from '../../components/Tile';
import TextCard from '../../components/info-cards/TextCard';
import colors from '../../constants/colors';
import useTiles, { TileT } from '../../hooks/useTiles';
import useToken from '../../api/queries/useToken';

export default function Index() {
  const { isInternetReachable } = useNetInfo();
  const {
    data: { isTokenExpired },
  } = useToken();

  const tiles = useTiles();

  const renderTile: ListRenderItem<TileT> = (info: ListRenderItemInfo<TileT>) => (
    <Tile
      title={info.item.title}
      Icon={info.item.icon}
      variant={info.item.variant}
      onPress={info.item.onPress}
    />
  );

  return (
    <View style={styles.container}>
      {!isInternetReachable && (
        <View style={styles.textCardContainer}>
          <TextCard>Az alkalmazás jelenleg internetkapcsolat nélkül működik.</TextCard>
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
        numColumns={2}
        renderItem={renderTile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  textCardContainer: {
    marginTop: 30,
  },
  error: {
    marginTop: 30,
  },
});
