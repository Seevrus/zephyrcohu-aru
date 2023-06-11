import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FC } from 'react';
import { Alert } from 'react-native';
import { SvgProps } from 'react-native-svg';

import useTileStates, {
  EndErrandTileState,
  ReceiptsTileState,
  SelectPartnerTileState,
  StartErrandTileState,
} from './useTileStates';

import EndErrandLogo from '../assets/svg/end-errand.svg';
import PurchaseLogo from '../assets/svg/purchase.svg';
import ReceiptsLogo from '../assets/svg/receipts.svg';
import StartErrandLogo from '../assets/svg/start-errand.svg';
import { StackParams } from '../screens/screen-types';

export type TileT = {
  id: string;
  title: string;
  icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export default function useTiles(): TileT[] {
  const { isInternetReachable } = useNetInfo();
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();

  const { selectPartnerTileState, receiptsTileState, startErrandTileState, endErrandTileState } =
    useTileStates();

  const numberOfReceipts = 0;

  return [
    {
      id: 't0',
      title: 'Árulevétel',
      icon: PurchaseLogo,
      variant: selectPartnerTileState,
      onPress: () => {
        if (selectPartnerTileState === SelectPartnerTileState.Disabled) {
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
      variant: receiptsTileState,
      onPress: () => {
        if (receiptsTileState === ReceiptsTileState.Disabled) {
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
      variant: startErrandTileState,
      onPress: () => {
        if (startErrandTileState === StartErrandTileState.Disabled) {
          const alertMessage = isInternetReachable
            ? 'Már van elkészült bizonylat.'
            : 'Az alkalmazás jelenleg internetkapcsolat nélkül működik.';
          Alert.alert('Funkció nem elérhető', alertMessage, [{ text: 'Értem' }]);
        } else if (startErrandTileState === StartErrandTileState.Warning) {
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
      variant: endErrandTileState,
      onPress: () => {
        if (endErrandTileState === EndErrandTileState.Disabled) {
          Alert.alert('Funkció nem elérhető', 'Nincs kör indítva.', [{ text: 'Értem' }]);
        } else {
          navigation.navigate('EndErrand');
        }
      },
    },
  ];
}
