import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { isNil } from 'ramda';
import { useCallback, useState } from 'react';

import { useCheckToken } from '../api/queries/useCheckToken';
import { numberOfReceiptsAtom } from '../atoms/receipts';
import { selectedPartnerAtom } from '../atoms/sellFlow';
import { isStorageSavedToApiAtom } from '../atoms/storageFlow';
import { type TileT } from '../components/Tile';
import { type AlertButton } from '../components/alert/Alert';
import { PartnerList, type StackParams } from '../navigators/screen-types';
import { useIsSelectedPartnerForSellOnCurrentPartnerList } from './sell/useIsSelectedPartnerForSellOnCurrentPartnerList';
import {
  EndErrandTileState,
  ReceiptsTileState,
  SelectPartnerTileState,
  StartErrandTileState,
  StorageTileState,
  useTileStates,
} from './useTileStates';

const FEATURE_NOT_AVAILABLE = 'Funkció nem elérhető';

type UseTilesData = {
  alert: {
    isAlertVisible: boolean;
    alertTitle: string;
    alertMessage: string | null;
    cancelButton: AlertButton | null;
    onBackdropPress: () => void;
  };
  tiles: TileT[];
};

export function useTiles(): UseTilesData | undefined {
  const { data: user } = useCheckToken();
  const navigation = useNavigation<NativeStackNavigationProp<StackParams>>();
  const numberOfReceipts = useAtomValue(loadable(numberOfReceiptsAtom));

  const isPartnerSelectedInSell = !!useAtomValue(selectedPartnerAtom);
  const isSelectedPartnerOnCurrentPartnerList =
    useIsSelectedPartnerForSellOnCurrentPartnerList();
  const isStorageSavedToApi = useAtomValue(isStorageSavedToApiAtom);

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

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [cancelButton, setCancelButton] = useState<AlertButton | null>(null);

  const resetAlertHandler = useCallback(() => {
    setIsAlertVisible(false);
    setAlertTitle('');
    setAlertMessage(null);
    setCancelButton(null);
  }, []);

  if (numberOfReceipts.state === 'hasData') {
    return {
      alert: {
        isAlertVisible,
        alertTitle,
        alertMessage,
        cancelButton,
        onBackdropPress: resetAlertHandler,
      },
      tiles: [
        {
          id: 't0',
          title: 'Rakodás',
          Icon: () => <FontAwesome5 name="truck" size={40} color="white" />,
          variant: storageTileState,
          onPress: () => {
            if (storageTileState === StorageTileState.Disabled) {
              setIsAlertVisible(true);
              setAlertTitle(FEATURE_NOT_AVAILABLE);
              setAlertMessage(storageTileMessage);
              setCancelButton({
                text: 'Értem',
                variant: 'neutral',
                onPress: resetAlertHandler,
              });
            } else if (isNil(user?.storeId)) {
              navigation.navigate('SelectStore');
            } else if (isStorageSavedToApi) {
              navigation.navigate('StorageChangesSummary');
            } else {
              navigation.navigate('SelectItemsFromStore');
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
              setIsAlertVisible(true);
              setAlertTitle(FEATURE_NOT_AVAILABLE);
              setAlertMessage(startErrandTileMessage);
              setCancelButton({
                text: 'Értem',
                variant: 'neutral',
                onPress: resetAlertHandler,
              });
            } else {
              navigation.navigate('StartErrand');
            }
          },
        },
        {
          id: 't2',
          title: 'Árulevétel',
          Icon: () => (
            <MaterialCommunityIcons
              name="cart-arrow-right"
              size={45}
              color="white"
            />
          ),
          variant: selectPartnerTileState,
          onPress: () => {
            if (selectPartnerTileState === SelectPartnerTileState.Disabled) {
              setIsAlertVisible(true);
              setAlertTitle(FEATURE_NOT_AVAILABLE);
              setAlertMessage(selectPartnerTileMessage);
              setCancelButton({
                text: 'Értem',
                variant: 'neutral',
                onPress: resetAlertHandler,
              });
            } else if (isPartnerSelectedInSell) {
              navigation.navigate('SelectItemsToSell');
            } else {
              const partnerScreen =
                isSelectedPartnerOnCurrentPartnerList === undefined ||
                isSelectedPartnerOnCurrentPartnerList === true
                  ? 'SelectPartnerFromStore'
                  : 'SelectPartnerFromAll';
              navigation.navigate('SelectPartner', {
                screen: partnerScreen,
                params: {
                  partners:
                    partnerScreen === 'SelectPartnerFromStore'
                      ? PartnerList.STORE
                      : PartnerList.ALL,
                },
              });
            }
          },
        },
        {
          id: 't3',
          title: `Bizonylatok (${numberOfReceipts.data})`,
          Icon: () => <FontAwesome5 name="receipt" size={40} color="white" />,
          variant: receiptsTileState,
          onPress: () => {
            if (receiptsTileState === ReceiptsTileState.Disabled) {
              setIsAlertVisible(true);
              setAlertTitle(FEATURE_NOT_AVAILABLE);
              setAlertMessage(receiptsTileMessage);
              setCancelButton({
                text: 'Értem',
                variant: 'neutral',
                onPress: resetAlertHandler,
              });
            } else {
              navigation.navigate('ReceiptList');
            }
          },
        },
        {
          id: 't4',
          title: 'Kör zárása',
          Icon: () => (
            <FontAwesome5 name="stop-circle" size={40} color="white" />
          ),
          variant: endErrandTileState,
          onPress: () => {
            if (endErrandTileState === EndErrandTileState.Disabled) {
              setIsAlertVisible(true);
              setAlertTitle(FEATURE_NOT_AVAILABLE);
              setAlertMessage(endErrandTileMessage);
              setCancelButton({
                text: 'Értem',
                variant: 'neutral',
                onPress: resetAlertHandler,
              });
            } else {
              navigation.navigate('EndErrand');
            }
          },
        },
        {
          id: 't5',
          title: 'Teszt média',
          Icon: () => (
            <MaterialCommunityIcons name="printer" size={45} color="white" />
          ),
          variant: 'ok',
          async onPress() {
            const albumName = 'boreal_print';
            const fileDirectory = FileSystem.documentDirectory + albumName;
            const fileName = `${fileDirectory}/print_test.txt`;
            const testFileString = `  Zery egy nagyon szép ember, fején egy új fejhallgatóvel.  `;

            const directoryInfo = await FileSystem.getInfoAsync(fileDirectory);
            if (!directoryInfo.exists) {
              await FileSystem.makeDirectoryAsync(fileDirectory, {
                intermediates: true,
              });
            }

            const permission = await MediaLibrary.requestPermissionsAsync();

            if (FileSystem.documentDirectory !== null && permission.granted) {
              try {
                await FileSystem.writeAsStringAsync(fileName, testFileString, {
                  encoding: FileSystem.EncodingType.UTF8,
                });

                const asset = await MediaLibrary.createAssetAsync(fileName);
                const album = await MediaLibrary.getAlbumAsync(albumName);

                await (album
                  ? MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
                  : MediaLibrary.createAlbumAsync(albumName, asset, false));
              } catch (error) {
                console.error('MediaLibrary.createAssetAsync failed', error);
              }
            } else {
              console.log('Hozzáférés megtagadva');
            }
          },
        },
        {
          id: 't6',
          title: 'Teszt megosztás',
          Icon: () => (
            <MaterialCommunityIcons name="printer" size={45} color="white" />
          ),
          variant: 'ok',
          async onPress() {
            const directoryName = FileSystem.documentDirectory + 'boreal_print';
            const fileName = `${directoryName}/print_test.txt`;
            const testFileString = `  Zery egy nagyon szép ember, fején egy új fejhallgatóvel.  `;

            const directoryInfo = await FileSystem.getInfoAsync(directoryName);
            if (!directoryInfo.exists) {
              await FileSystem.makeDirectoryAsync(directoryName, {
                intermediates: true,
              });
            }

            await FileSystem.writeAsStringAsync(fileName, testFileString, {
              encoding: FileSystem.EncodingType.UTF8,
            });

            await Sharing.shareAsync(fileName, { mimeType: 'text/plain' });
          },
        },
        {
          id: 't7',
          title: 'Teszt engedélyes',
          Icon: () => (
            <MaterialCommunityIcons name="printer" size={45} color="white" />
          ),
          variant: 'ok',
          async onPress() {
            const documentsDirectory =
              FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
                'Documents'
              );

            const borealDirectory = documentsDirectory + '/Boreal';

            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                borealDirectory
              );

            if (permissions.granted) {
              const testFileString = `  Zery egy nagyon szép ember, fején egy új fejhallgatóvel.  `;

              await FileSystem.StorageAccessFramework.writeAsStringAsync(
                borealDirectory + '/print.txt',
                testFileString,
                { encoding: FileSystem.EncodingType.UTF8 }
              );
            }
          },
        },
      ],
    };
  }
}
