import { FC } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import useLocalState from '../hooks/useLocalState';
import useOnlineCredentials from '../hooks/useOnlineCredentials';

import EndErrandLogo from '../assets/svg/end-errand.svg';
import PurchaseLogo from '../assets/svg/purchase.svg';
import ReceiptsLogo from '../assets/svg/receipts.svg';
import StartErrandLogo from '../assets/svg/start-errand.svg';
import ErrorCard from '../components/info-cards/ErrorCard';
import Tile from '../components/Tile';
import colors from '../constants/colors';
import { useAppSelector } from '../store/hooks';

type TileT = {
  id: string;
  title: string;
  icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
};

const TILES: TileT[] = [
  {
    id: 't0',
    title: 'Árulevétel',
    icon: PurchaseLogo,
    variant: 'ok',
  },
  {
    id: 't1',
    title: 'Bizonylatok',
    icon: ReceiptsLogo,
    variant: 'disabled',
  },
  {
    id: 't2',
    title: 'Kör indítása',
    icon: StartErrandLogo,
    variant: 'warning',
  },
  {
    id: 't3',
    title: 'Kör zárása',
    icon: EndErrandLogo,
    variant: 'neutral',
  },
];

// 1. Helyre kell állítani a state-et lokálból, ha van
// 2. Ha nincs aktív kör, kell egy check token
// 2.1. Ha nincs beállítva a telephely, be kell állíttatnunk
// 2.2. Be kell húzni a konfigurációs fájlt helyi hálózatról

export default function Index() {
  const [localStateError] = useLocalState();
  const [credentialsError] = useOnlineCredentials();
  const userType = useAppSelector((state) => state.config.userType);
  console.log(userType);

  const renderTile: ListRenderItem<TileT> = (info: ListRenderItemInfo<TileT>) => (
    <Tile title={info.item.title} Icon={info.item.icon} variant={info.item.variant} />
  );

  return (
    <View style={styles.container}>
      {!!localStateError && (
        <View style={styles.error}>
          <ErrorCard>{localStateError}</ErrorCard>
        </View>
      )}
      {!!credentialsError && (
        <View style={styles.error}>
          <ErrorCard>{credentialsError}</ErrorCard>
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
  error: {
    marginTop: 30,
  },
});
