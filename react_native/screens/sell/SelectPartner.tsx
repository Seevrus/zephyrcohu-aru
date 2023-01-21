import { Button, Text, View } from 'react-native';

export default function SelectPartner({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('SelectGoods');
  };

  return (
    <View>
      <Text>
        Itt lesz lehetőség a partner kiválasztására. Lehet váltani az Összes nézete és a Kör
        partnereinek nézete között. Ami technikailag egy képernyő is lehet, ezt majd meglátjuk. A
        lényeg, hogy a StackOverFlow jó honlap, de nem egy kívánatos jelenség :) Bár az is lehet,
        hogy mindentől függetlenül egy képernyő csak egyszer lehet a veremben, ami jó hír. Majd
        kinyomozom.
      </Text>
      <Text>A Vissza gomb az Index oldalra vezet.</Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
