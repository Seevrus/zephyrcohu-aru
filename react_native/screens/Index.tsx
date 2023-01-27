import { FC } from 'react';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import EndErrandLogo from '../assets/svg/end-errand.svg';
import PurchaseLogo from '../assets/svg/purchase.svg';
import ReceiptsLogo from '../assets/svg/receipts.svg';
import StartErrandLogo from '../assets/svg/start-errand.svg';
import Tile from '../components/Tile';
import colors from '../constants/colors';

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
    variant: 'ok',
  },
];

export default function Index() {
  const renderTile: ListRenderItem<TileT> = (info: ListRenderItemInfo<TileT>) => (
    <Tile title={info.item.title} Icon={info.item.icon} variant={info.item.variant} />
  );

  return (
    <View style={styles.container}>
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
    backgroundColor: colors.purple500,
  },
});
