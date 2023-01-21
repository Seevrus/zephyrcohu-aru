import { Button, Text, View } from 'react-native';

export default function Index({ navigation }) {
  const onPressHandler = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View>
      <Text>És ez már a tényleges kezdőképernyő, ahonnan a fő funkciók elérhetőek.</Text>
      <Text>
        A vissza gombbal kilépünk, a StartupCheck felé nincs visszaút. (Majd egyszer, még nincs
        implementálva.)
      </Text>
      <Button title="Árulevétel" onPress={() => onPressHandler('SelectPartner')} />
      <Button title="Elkészült bizonylatok" onPress={() => onPressHandler('ReceiptList')} />
      <Button title="Kör indítása" onPress={() => onPressHandler('StartErrand')} />
      <Button title="Kör zárása" onPress={() => onPressHandler('EndErrand')} />
    </View>
  );
}
