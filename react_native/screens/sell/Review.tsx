import { Button, Text, View } from 'react-native';

export default function Review({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('Summary');
  };

  return (
    <View>
      <Text>
        Áttekintés a partnerről és termékekről. Lehetőség van kikukázni az egészet és visszamenni a
        kezdőképernyőre, vagy a tovább gombra kattintva véglegesíteni.
      </Text>
      <Text>A Vissza gomb az visszavezet a termékekhez, ha még valamit módosítanának.</Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
