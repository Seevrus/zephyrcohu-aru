import { BorealBarCodeScanner } from '../../../components/bar-code-scanner/BorealBarCodeScanner';
import { type ScanBarCodeInSellProps } from '../../../navigators/screen-types';

export function ScanBarCodeInSell({ navigation }: ScanBarCodeInSellProps) {
  return (
    <BorealBarCodeScanner
      navigation={navigation}
      previousScreen="SelectItemsToSell"
    />
  );
}
