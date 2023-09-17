import BorealBarCodeScanner from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import { ScanBarCodeProps } from '../../screen-types';

export default function ScanBarCode({ navigation }: ScanBarCodeProps) {
  const handleBarCodeScanned = (code: string) => {
    navigation.replace('SelectItemsFromStore', { scannedBarCode: code });
  };

  return <BorealBarCodeScanner onCodeScanned={handleBarCodeScanned} />;
}
