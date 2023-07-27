import { FC } from 'react';
import { Alert } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BarCodeTile,
  EndErrandTile,
  ReceiptsTile,
  SelectPartnerTile,
  StartErrandTile,
} from '../../hooks/useIndexTile';

import EndErrandLogo from '../../assets/svg/end-errand.svg';
import PurchaseLogo from '../../assets/svg/purchase.svg';
import ReceiptsLogo from '../../assets/svg/receipts.svg';
import StartErrandLogo from '../../assets/svg/start-errand.svg';
import BarCodeLogo from '../../assets/svg/bar_code.svg';
import { StackParams } from '../screen-types';

export type TileT = {
  id: string;
  title: string;
  icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export const getTiles = ({
  isInternetReachable,
  selectPartnerTile,
  receiptsTile,
  startErrandTile,
  barCodeTile,
  endErrandTile,
  numberOfReceipts,
  navigation,
}: {
  isInternetReachable: boolean;
  selectPartnerTile: SelectPartnerTile;
  receiptsTile: ReceiptsTile;
  startErrandTile: StartErrandTile;
  endErrandTile: EndErrandTile;
  barCodeTile: BarCodeTile;
  numberOfReceipts: number;
  navigation: NativeStackNavigationProp<StackParams, 'Index'>;
}) => {
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
          navigation.navigate('SelectPartner');
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
          Alert.alert('Funkció nem elérhető', 'Még nem készült bizonylat.', [{ text: 'Értem' }]);
        } else {
          navigation.navigate('ReceiptList');
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
          const alertMessage = isInternetReachable
            ? 'Már van elkészült bizonylat.'
            : 'Az alkalmazás jelenleg internetkapcsolat nélkül működik.';
          Alert.alert('Funkció nem elérhető', alertMessage, [{ text: 'Értem' }]);
        } else if (startErrandTile === StartErrandTile.Warning) {
          Alert.alert('Megerősítés szükséges', 'Biztosan szeretne új kört indítani?', [
            { text: 'Mégsem' },
            {
              text: 'Igen',
              onPress: () => {
                navigation.navigate('StartErrand');
              },
            },
          ]);
        } else {
          navigation.navigate('StartErrand');
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
          navigation.navigate('EndErrand');
        }
      },
    },
    {
      id: 't4',
      title: 'Vonalkód teszt',
      icon: BarCodeLogo,
      variant: barCodeTile,
      onPress: () => {
        navigation.navigate('BarCodeTest');
      },
    },
  ];

  return TILES;
};
