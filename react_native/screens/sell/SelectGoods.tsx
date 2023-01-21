import { Button, Text, View } from 'react-native';

export default function SelectGoods({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('Review');
  };

  return (
    <View>
      <Text>Itt lesz lehetőség a termékek kiválasztására lejáratok, illetve rendelés szerint.</Text>
      <Text>
        A Vissza gomb az visszavezet a partnerekhez. Az első ötlet az, hogy ez kitöröl minden
        kiválasztott terméket is, ami persze nem törvényszerű.
      </Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
