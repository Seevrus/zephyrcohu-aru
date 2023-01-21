import { Button, Text, View } from 'react-native';

export default function StartupCheck({ navigation }) {
  const onPressNextHandler = () => {
    navigation.navigate('Index');
  };

  return (
    <View>
      <Text>
        Ezen a képernyőn ellenőrizzük, hogy hogy áll az alkalmazás. Érvényes-e a token? Van-e
        elindított kör? Szóval kicsit malmozunk, beállítjuk a memóriabeli állapotokat a tárolt
        információ alapján, és megyünk is tovább. Ha valami gond van, itt hibaüzenettel megállunk.
      </Text>
      <Text>
        Ha van elindított kör, nem kell token ellenőrzés, mégpedig azért nem, hogy az alkalmazás
        offline is működőképes legyen.
      </Text>
      <Text>
        A vissza gombbal kilépünk, a Setup felé nincs visszaút. (Majd egyszer, még nincs
        implementálva.)
      </Text>
      <Button title="Tovább" onPress={onPressNextHandler} />
    </View>
  );
}
