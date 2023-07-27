import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useCheckToken from '../../hooks/useCheckToken';
import useIndexTile from '../../hooks/useIndexTile';
import useToken from '../../hooks/useToken';

import { useAppSelector } from '../../store/hooks';

import TextCard from '../../components/info-cards/TextCard';
import Loading from '../../components/Loading';
import Tile from '../../components/Tile';
import colors from '../../constants/colors';
import { IndexProps } from '../screen-types';
import { getTiles, TileT } from './getTiles';

export default function Index({ navigation }: IndexProps) {
  const { isInternetReachable } = useNetInfo();

  const { deviceId, token, credentialsAvailable } = useToken();
  const [isTokenValid, tokenValidationError] = useCheckToken(
    isInternetReachable,
    credentialsAvailable,
    deviceId,
    token
  );
  const { selectPartnerTile, receiptsTile, startErrandTile, endErrandTile, barCodeTile } =
    useIndexTile();

  useEffect(() => {
    if (tokenValidationError) {
      navigation.replace('StartupError', {
        message: 'A korábban megadott belépőkód nem érvényes.',
      });
    }
  }, [navigation, tokenValidationError]);

  const numberOfReceipts = useAppSelector((state) => state.round.receipts)?.length ?? 0;

  const tiles = getTiles({
    isInternetReachable,
    selectPartnerTile,
    receiptsTile,
    startErrandTile,
    endErrandTile,
    barCodeTile,
    numberOfReceipts,
    navigation,
  });

  if (isInternetReachable && !isTokenValid && !tokenValidationError) {
    return <Loading />;
  }

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
    paddingBottom: 30,
  },
  textCardContainer: {
    marginTop: 30,
  },
  error: {
    marginTop: 30,
  },
});
