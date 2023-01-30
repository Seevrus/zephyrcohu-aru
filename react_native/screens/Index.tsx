import { useNetInfo } from '@react-native-community/netinfo';
import { FC } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { SvgProps } from 'react-native-svg';

import useCheckToken from '../hooks/useCheckToken';
import useIndexTile, {
  EndErrandTile,
  ReceiptsTile,
  SelectPartnerTile,
  StartErrandTile,
} from '../hooks/useIndexTile';
import useToken from '../hooks/useToken';

import { useAppSelector } from '../store/hooks';

import EndErrandLogo from '../assets/svg/end-errand.svg';
import PurchaseLogo from '../assets/svg/purchase.svg';
import ReceiptsLogo from '../assets/svg/receipts.svg';
import StartErrandLogo from '../assets/svg/start-errand.svg';
import TextCard from '../components/info-cards/TextCard';
import Loading from '../components/Loading';
import Tile from '../components/Tile';
import colors from '../constants/colors';
import { IndexProps } from './screen-types';

type TileT = {
  id: string;
  title: string;
  icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

// 1. Helyre kell állítani a state-et lokálból, ha van
// 2. Ha nincs aktív kör, kell egy check token
// 2.1. Ha nincs beállítva a telephely, be kell állíttatnunk
// 2.2. Be kell húzni a konfigurációs fájlt helyi hálózatról

export default function Index({ navigation }: IndexProps) {
  const { isInternetReachable, type: netWorkType } = useNetInfo();

  const { deviceId, token, credentialsAvailable } = useToken();
  const [isTokenValid, tokenValidationError] = useCheckToken(
    isInternetReachable,
    credentialsAvailable,
    deviceId,
    token
  );
  const { selectPartnerTile, receiptsTile, startErrandTile, endErrandTile } = useIndexTile();

  const numberOfReceipts = useAppSelector((state) => state.round.receipts).length;

  const TILES: TileT[] = [
    {
      id: 't0',
      title: 'Árulevétel',
      icon: PurchaseLogo,
      variant: selectPartnerTile,
      onPress: () => {
        if (selectPartnerTile === SelectPartnerTile.Disabled) {
          Alert.alert('Funkció nem elérhető', 'Árulevétel csak a kör indítása után lehetséges.', [
            { text: 'Értem' },
          ]);
        } else {
          // Navigálás...
        }
      },
    },
    {
      id: 't1',
      title: `Bizonylatok (${numberOfReceipts})`,
      icon: ReceiptsLogo,
      variant: receiptsTile,
      onPress: () => {
        if (receiptsTile === ReceiptsTile.Disabled) {
          Alert.alert('Funkció nem elérhető', 'Nincs elkészült bizonylat.', [{ text: 'Értem' }]);
        } else {
          // Navigálás...
        }
      },
    },
    {
      id: 't2',
      title: 'Kör indítása',
      icon: StartErrandLogo,
      variant: startErrandTile,
      onPress: () => {
        if (startErrandTile === StartErrandTile.Disabled) {
          const alertMessage =
            netWorkType === 'wifi'
              ? 'A készülék nem kapcsolódik a helyi hálózathoz'
              : 'Már van elkészült bizonylat';
          Alert.alert('Funkció nem elérhető', alertMessage, [{ text: 'Értem' }]);
        } else if (startErrandTile === StartErrandTile.Warning) {
          Alert.alert('Megerősítés szükséges', 'Biztosan szeretne új kört indítani?', [
            { text: 'Mégsem' },
            {
              text: 'Igen',
              onPress: () => {
                /** Navigálás... */
              },
            },
          ]);
        } else {
          // Navigálás...
        }
      },
    },
    {
      id: 't3',
      title: 'Kör zárása',
      icon: EndErrandLogo,
      variant: endErrandTile,
      onPress: () => {
        if (endErrandTile === EndErrandTile.Disabled) {
          Alert.alert('Funkció nem elérhető', 'Nincs kör indítva.', [{ text: 'Értem' }]);
        } else {
          // Navigálás...
        }
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
