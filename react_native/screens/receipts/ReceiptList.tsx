import { Button, Text, View } from 'react-native';

export default function ReceiptList({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('Receipt');
  };

  return (
    <View>
      <Text>
        Itt listázzuk a már elkészült bizonylatokat. Rájuk kattintva kiderülnek részletek egy másik
        képernyőn, ahol majd sztornózni is lehet.
      </Text>
      <Text>A Vissza gomb az Index oldalra vezet.</Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
