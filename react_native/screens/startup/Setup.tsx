import { Button, Text, View } from 'react-native';

export default function Setup() {
  return (
    <View>
      <Text>
        Ez az alkalmazás beállítási képernyője. Bekérjük a tokent, engedélyt kérünk hozzáférni a
        telefonszámhoz, eltároljuk a tokent valamilyen biztonságos módon, és megyünk is tovább a
        következő képernyőre.
      </Text>
      <Text>Tehát ez a képernyő csak akkor jelenik meg, ha nincs elérhető token.</Text>
      <Button title="Tovább" />
    </View>
  );
}
