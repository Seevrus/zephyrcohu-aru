import BorealBarCodeScanner from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import { ScanBarCodeInStorageProps } from '../../../navigators/screen-types';

export default function ScanBarCodeInStorage({ navigation }: ScanBarCodeInStorageProps) {
  const handleBarCodeScanned = (code: string) => {
    navigation.replace('SelectItemsFromStore', { scannedBarCode: code });
  };

  return <BorealBarCodeScanner onCodeScanned={handleBarCodeScanned} />;
}
