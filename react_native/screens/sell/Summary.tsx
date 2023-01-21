import { Button, Text, View } from 'react-native';

export default function Summary({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('Index');
  };

  return (
    <View>
      <Text>
        Összegző képernyő. Itt már csak nyomtatni lehet, nem lesz visszaúr (pillanatnyilag még
        persze van). A folyamat legvégén visszatérünk a kezdőképernyőre.
      </Text>
      <Button title="Befejezés" onPress={onPressNextHandler} />
    </View>
  );
}
