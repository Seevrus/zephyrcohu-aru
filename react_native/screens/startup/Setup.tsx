import { Button, Text, View } from 'react-native';

export default function Setup({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('StartupCheck');
  };

  return (
    <View>
      <Text>
        Ez az alkalmazás beállítási képernyője. Bekérjük a tokent, eltároljuk valamilyen biztonságos
        módon, és megyünk is tovább a következő képernyőre.
      </Text>
      <Text>Tehát ez a képernyő csak akkor jelenik meg, ha nincs elérhető token.</Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
