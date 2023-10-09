import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';
import { PartnerList, PartnerTabParams } from './screen-types';
import SelectPartner from '../screens/sell/select-partner/SelectPartner';

const PartnerTab = createBottomTabNavigator<PartnerTabParams>();

function StorePartnersIcon({ color }: { color: string }) {
  return <MaterialIcons name="store" size={30} color={color} />;
}

function AllPartnersIcon({ color }: { color: string }) {
  return <MaterialIcons name="all-inclusive" size={30} color={color} />;
}

export default function PartnersBottomTab() {
  return (
    <PartnerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.neutral,
        },
        tabBarActiveTintColor: colors.blue200,
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: fontSizes.footer,
        },
      }}
    >
      <PartnerTab.Screen
        name="SelectPartnerFromStore"
        component={SelectPartner}
        options={{ title: 'Kör Partnerei', tabBarIcon: StorePartnersIcon }}
        initialParams={{
          partners: PartnerList.STORE,
        }}
      />
      <PartnerTab.Screen
        name="SelectPartnerFromAll"
        component={SelectPartner}
        options={{
          title: 'Összes partner',
          tabBarIcon: AllPartnersIcon,
        }}
        initialParams={{
          partners: PartnerList.ALL,
        }}
      />
    </PartnerTab.Navigator>
  );
}
