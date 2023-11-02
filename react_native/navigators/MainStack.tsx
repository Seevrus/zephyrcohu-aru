import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';
import { Login } from '../screens/login/Login';
import { Index } from '../screens/start-page/Index';
import { Settings } from '../screens/start-page/Settings';
import { SettingsButton } from '../screens/start-page/SettingsButton';
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
      {/* <Stack.Screen
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
        options={{ headerLeft: null, headerTitle: 'Összegzés' }}
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
      /> */}
    </Stack.Navigator>
  );
}
