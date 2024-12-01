import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';
import { EndErrand } from '../screens/errand-administration/EndErrand';
import { PrintEndErrand } from '../screens/errand-administration/PrintEndErrand';
import { StartErrand } from '../screens/errand-administration/StartErrand';
import { Login } from '../screens/login/Login';
import { ReceiptDetails } from '../screens/receipts/ReceiptDetails';
import { ReceiptList } from '../screens/receipts/ReceiptList';
import { AddPartnerForm } from '../screens/sell/add-partner/AddPartnerForm';
import { SearchPartnerNavForm } from '../screens/sell/add-partner/SearchPartnerNavForm';
import { Discounts } from '../screens/sell/review/Discounts';
import { Review } from '../screens/sell/review/Review';
import { ScanBarCodeInSell } from '../screens/sell/select-items/ScanBarCodeInSell';
import { SelectItemsToSell } from '../screens/sell/select-items/SelectItemsToSell';
import { SelectOtherItemsToSell } from '../screens/sell/select-other-items/SelectOtherItemsToSell';
import { Summary } from '../screens/sell/summary/Summary';
import { ChangePassword } from '../screens/start-page/ChangePassword';
import { Index } from '../screens/start-page/Index';
import { Settings } from '../screens/start-page/Settings';
import { SettingsButton } from '../screens/start-page/SettingsButton';
import { ReviewStorageChanges } from '../screens/storage/review/ReviewStorageChanges';
import { ScanBarCodeInStorage } from '../screens/storage/select-items/ScanBarCodeInStorage';
import { SelectItemsFromStore } from '../screens/storage/select-items/SelectItemsFromStore';
import { SelectStore } from '../screens/storage/select-store/SelectStore';
import { StorageChangesSummary } from '../screens/storage/summary/StorageChangesSummary';
import { PartnersBottomTab } from './PartnersBottomTab';
import { type StackParams } from './screen-types';

const Stack = createNativeStackNavigator<StackParams>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.neutral,
        },
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: 'Roboto-Bold',
          fontSize: fontSizes.title,
        },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen
        name="Index"
        component={Index}
        options={{
          headerTitle: 'Zephyr Boreal',
          headerRight: SettingsButton,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerTitle: 'Beállítások' }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerTitle: 'Bejelentkezés' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerTitle: 'Új jelszó' }}
      />
      <Stack.Screen
        name="SelectStore"
        component={SelectStore}
        options={{ headerTitle: 'Raktár választása' }}
      />
      <Stack.Screen
        name="SelectItemsFromStore"
        component={SelectItemsFromStore}
        options={{ headerTitle: 'Tételek' }}
      />
      <Stack.Screen
        name="ScanBarCodeInStorage"
        component={ScanBarCodeInStorage}
        options={{ headerTitle: 'Vonalkód olvasása' }}
      />
      <Stack.Screen
        name="ReviewStorageChanges"
        component={ReviewStorageChanges}
        options={{ headerTitle: 'Áttekintés' }}
      />
      <Stack.Screen
        name="StorageChangesSummary"
        component={StorageChangesSummary}
        options={{ headerLeft: undefined, headerTitle: 'Összegzés' }}
      />
      <Stack.Screen
        name="StartErrand"
        component={StartErrand}
        options={{
          headerTitle: 'Kör indítása',
        }}
      />
      <Stack.Screen
        name="SelectPartner"
        component={PartnersBottomTab}
        options={{
          headerTitle: 'Partner kiválasztása',
        }}
      />
      <Stack.Screen
        name="SearchPartnerNavForm"
        component={SearchPartnerNavForm}
        options={{
          headerTitle: 'Új partner keresése',
        }}
      />
      <Stack.Screen
        name="AddPartnerForm"
        component={AddPartnerForm}
        options={{
          headerTitle: 'Új partner hozzáadása',
        }}
      />
      <Stack.Screen
        name="SelectItemsToSell"
        component={SelectItemsToSell}
        options={{
          headerTitle: 'Tételek',
        }}
      />
      <Stack.Screen
        name="ScanBarCodeInSell"
        component={ScanBarCodeInSell}
        options={{ headerTitle: 'Vonalkód olvasása' }}
      />
      <Stack.Screen
        name="Review"
        component={Review}
        options={{
          headerTitle: 'Áttekintés',
        }}
      />
      <Stack.Screen
        name="Discounts"
        component={Discounts}
        options={{
          headerTitle: 'Kedvezmények',
        }}
      />
      <Stack.Screen
        name="SelectOtherItemsToSell"
        component={SelectOtherItemsToSell}
        options={{
          headerTitle: 'Egyéb Tételek',
        }}
      />
      <Stack.Screen
        name="Summary"
        component={Summary}
        options={{
          headerTitle: 'Összegzés',
        }}
      />
      <Stack.Screen
        name="ReceiptList"
        component={ReceiptList}
        options={{
          headerTitle: 'Bizonylatok',
        }}
      />
      <Stack.Screen
        name="ReceiptDetails"
        component={ReceiptDetails}
        options={{
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="EndErrand"
        component={EndErrand}
        options={{
          headerTitle: 'Kör zárása',
        }}
      />
      <Stack.Screen
        name="PrintEndErrand"
        component={PrintEndErrand}
        options={{
          headerTitle: 'Kör nyomtatás',
        }}
      />
    </Stack.Navigator>
  );
}
