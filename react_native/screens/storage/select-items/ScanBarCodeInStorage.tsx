import { BorealBarCodeScanner } from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import { type ScanBarCodeInStorageProps } from '../../../navigators/screen-types';

export function ScanBarCodeInStorage({
  navigation,
}: ScanBarCodeInStorageProps) {
  return (
    <BorealBarCodeScanner
      navigation={navigation}
      previousScreen="SelectItemsFromStore"
    />
  );
}
