import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FunctionComponent } from 'react';
import { Alert } from 'react-native';

import useTileStates, {
  EndErrandTileState,
  ReceiptsTileState,
  SelectPartnerTileState,
  StartErrandTileState,
} from './useTileStates';
import useToken from '../api/queries/useToken';

import { StackParams } from '../screens/screen-types';

export type TileT = {
  id: string;
  title: string;
  Icon: FunctionComponent;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export default function useTiles(): TileT[] {
  const { isInternetReachable } = useNetInfo();
  const {
    data: { isPasswordExpired, isTokenExpired },
  } = useToken();
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();

  const {
    storageTileState,
    selectPartnerTileState,
    receiptsTileState,
    startErrandTileState,
    endErrandTileState,
  } = useTileStates();

  const numberOfReceipts = 0;

  let alertMessage: string;
  if (isTokenExpired) {
    alertMessage = 'A funkció csak bejelentkezés után elérhető.';
  } else if (isPasswordExpired) {
    alertMessage = 'Az Ön jelszava lejárt, kérem változtassa meg.';
  } else if (!isInternetReachable) {
    alertMessage = 'Az alkalmazás jelenleg internetkapcsolat nélkül működik.';
  }

  return [
    {
      id: 't0',
      title: 'Rakodás',
      Icon: () => <FontAwesome5 name="truck" size={40} color="white" />,
      variant: storageTileState,
      onPress: () => {
        if (selectPartnerTileState === SelectPartnerTileState.Disabled) {
          Alert.alert(
            'Funkció nem elérhető',
            alertMessage ?? 'Rakodás csak két kör között lehetséges.',
            [{ text: 'Értem' }]
          );
        } else {
          navigation.navigate('SelectPartner');
        }
      },
    },
    {
      id: 't1',
      title: 'Kör indítása',
      Icon: () => <FontAwesome5 name="play" size={40} color="white" />,
      variant: startErrandTileState,
      onPress: () => {
        if (startErrandTileState === StartErrandTileState.Disabled) {
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
      id: 't2',
      title: 'Árulevétel',
      Icon: () => <MaterialCommunityIcons name="cart-arrow-right" size={45} color="white" />,
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
      id: 't3',
      title: `Bizonylatok (${numberOfReceipts})`,
      Icon: () => <FontAwesome5 name="receipt" size={40} color="white" />,
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
      id: 't4',
      title: 'Kör zárása',
      Icon: () => <FontAwesome5 name="stop-circle" size={40} color="white" />,
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
