import { NetInfoStateType } from '@react-native-community/netinfo';
import { FC } from 'react';
import { Alert } from 'react-native';
import { SvgProps } from 'react-native-svg';

import {
  EndErrandTile,
  ReceiptsTile,
  SelectPartnerTile,
  StartErrandTile,
} from '../../hooks/useIndexTile';

import EndErrandLogo from '../../assets/svg/end-errand.svg';
import PurchaseLogo from '../../assets/svg/purchase.svg';
import ReceiptsLogo from '../../assets/svg/receipts.svg';
import StartErrandLogo from '../../assets/svg/start-errand.svg';

export type TileT = {
  id: string;
  title: string;
  icon: FC<SvgProps>;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export const getTiles = ({
  selectPartnerTile,
  receiptsTile,
  startErrandTile,
  endErrandTile,
  numberOfReceipts,
  networkType,
}: {
  selectPartnerTile: SelectPartnerTile;
  receiptsTile: ReceiptsTile;
  startErrandTile: StartErrandTile;
  endErrandTile: EndErrandTile;
  numberOfReceipts: number;
  networkType: NetInfoStateType;
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
            networkType === 'wifi'
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

  return TILES;
};
