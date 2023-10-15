import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isNil } from 'ramda';
import { Alert } from 'react-native';

import { useMemo } from 'react';
import useCheckToken from '../api/queries/useCheckToken';
import { TileT } from '../components/Tile';
import { StackParams } from '../navigators/screen-types';
import { useReceiptsContext } from '../providers/ReceiptsProvider';
import { useSellFlowContext } from '../providers/SellFlowProvider';
import { useStorageFlowContext } from '../providers/StorageFlowProvider';
import useTileStates, {
  EndErrandTileState,
  ReceiptsTileState,
  SelectPartnerTileState,
  StartErrandTileState,
  StorageTileState,
} from './useTileStates';

export default function useTiles(): TileT[] {
  const { data: user } = useCheckToken();
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const { numberOfReceipts } = useReceiptsContext();
  const { isSelectedPartnerOnCurrentPartnerList, isPartnerChosenForCurrentReceipt } =
    useSellFlowContext();
  const { areModificationsSaved } = useStorageFlowContext();

  const {
    storageTileState,
    storageTileMessage,
    selectPartnerTileState,
    selectPartnerTileMessage,
    receiptsTileState,
    receiptsTileMessage,
    startErrandTileState,
    startErrandTileMessage,
    endErrandTileState,
    endErrandTileMessage,
  } = useTileStates();

  return useMemo(
    () => [
      {
        id: 't0',
        title: 'Rakodás',
        Icon: () => <FontAwesome5 name="truck" size={40} color="white" />,
        variant: storageTileState,
        onPress: () => {
          if (storageTileState === StorageTileState.Disabled) {
            Alert.alert('Funkció nem elérhető', storageTileMessage, [{ text: 'Értem' }]);
          } else if (isNil(user?.storeId)) {
            navigation.navigate('SelectStore');
          } else if (!areModificationsSaved) {
            navigation.navigate('SelectItemsFromStore');
          } else {
            navigation.navigate('StorageChangesSummary');
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
            Alert.alert('Funkció nem elérhető', startErrandTileMessage, [{ text: 'Értem' }]);
          } else if (startErrandTileState === StartErrandTileState.Warning) {
            Alert.alert('Megerősítés szükséges', selectPartnerTileMessage, [
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
            Alert.alert('Funkció nem elérhető', selectPartnerTileMessage, [{ text: 'Értem' }]);
          } else if (isPartnerChosenForCurrentReceipt) {
            navigation.navigate('SelectItemsToSell');
          } else {
            const partnerScreen =
              isSelectedPartnerOnCurrentPartnerList === undefined ||
              isSelectedPartnerOnCurrentPartnerList === true
                ? 'SelectPartnerFromStore'
                : 'SelectPartnerFromAll';
            navigation.navigate('SelectPartner', { screen: partnerScreen });
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
            Alert.alert('Funkció nem elérhető', receiptsTileMessage, [{ text: 'Értem' }]);
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
            Alert.alert('Funkció nem elérhető', endErrandTileMessage, [{ text: 'Értem' }]);
          } else {
            navigation.navigate('EndErrand');
          }
        },
      },
    ],
    [
      areModificationsSaved,
      endErrandTileMessage,
      endErrandTileState,
      isPartnerChosenForCurrentReceipt,
      isSelectedPartnerOnCurrentPartnerList,
      navigation,
      numberOfReceipts,
      receiptsTileMessage,
      receiptsTileState,
      selectPartnerTileMessage,
      selectPartnerTileState,
      startErrandTileMessage,
      startErrandTileState,
      storageTileMessage,
      storageTileState,
      user?.storeId,
    ]
  );
}
