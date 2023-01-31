import { useNetInfo } from '@react-native-community/netinfo';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import useCheckToken from '../../hooks/useCheckToken';
import useToken from '../../hooks/useToken';

import { useAppSelector } from '../../store/hooks';

import EndErrandLogo from '../../assets/svg/end-errand.svg';
import PurchaseLogo from '../../assets/svg/purchase.svg';
import ReceiptsLogo from '../../assets/svg/receipts.svg';
import StartErrandLogo from '../../assets/svg/start-errand.svg';
import TextCard from '../../components/info-cards/TextCard';
import Loading from '../../components/Loading';
import Tile from '../../components/Tile';
import colors from '../../constants/colors';
import { IndexProps } from '../screen-types';
import { TileT } from './getTiles';

// 1. Helyre kell állítani a state-et lokálból, ha van
// 2. Ha nincs aktív kör, kell egy check token
// 2.1. Ha nincs beállítva a telephely, be kell állíttatnunk
// 2.2. Be kell húzni a konfigurációs fájlt helyi hálózatról

export default function Index({ navigation }: IndexProps) {
  const { isInternetReachable } = useNetInfo();

  const { deviceId, token, credentialsAvailable } = useToken();
  const [isTokenValid, tokenValidationError] = useCheckToken(
    isInternetReachable,
    credentialsAvailable,
    deviceId,
    token
  );
  // const { selectPartnerTile, receiptsTile, startErrandTile, endErrandTile } = useIndexTile();

  const numberOfReceipts = useAppSelector((state) => state.round.receipts).length;

  const TILES = [
    {
      id: 't0',
      title: 'Árulevétel',
      icon: PurchaseLogo,
      variant: 'neutral',
      onPress: () => {
        navigation.navigate('SelectPartner');
      },
    },
    {
      id: 't1',
      title: `Bizonylatok (${numberOfReceipts})`,
      icon: ReceiptsLogo,
      variant: 'neutral',
      onPress: () => {
        navigation.navigate('ReceiptList');
      },
    },
    {
      id: 't2',
      title: 'Kör indítása',
      icon: StartErrandLogo,
      variant: 'neutral',
      onPress: () => {
        navigation.navigate('StartErrand');
      },
    },
    {
      id: 't3',
      title: 'Kör zárása',
      icon: EndErrandLogo,
      variant: 'neutral',
      onPress: () => {
        navigation.navigate('EndErrand');
      },
    },
  ];

  if (isInternetReachable && !isTokenValid && !tokenValidationError) {
    return <Loading />;
  }

  if (tokenValidationError) {
    navigation.replace('StartupError', {
      message: 'A korábban megadott belépőkód nem érvényes.',
    });
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
        data={TILES}
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
