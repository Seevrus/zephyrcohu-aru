import { BorealBarCodeScanner } from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import { type ScanBarCodeInSellProps } from '../../../navigators/screen-types';

export function ScanBarCodeInSell({ navigation }: ScanBarCodeInSellProps) {
  const handleBarCodeScanned = (code: string) => {
    navigation.replace('SelectItemsToSell', { scannedBarCode: code });
  };

  return <BorealBarCodeScanner onCodeScanned={handleBarCodeScanned} />;
}
