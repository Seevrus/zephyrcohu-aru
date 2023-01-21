import { Text, View } from 'react-native';

export default function StartErrand() {
  return (
    <View>
      <Text>
        Ezen a képernyőn lehet indítani a kört. Célszerű lehet ellenőrizni a hálózati mappa
        elérhetőségét, és annak függvényében aktívvá tenni a zárási folyamat indítását. A kör
        indításához ki kell választani a kört, amihez már le kell tölteni a kör adatait, úgyhogy ezt
        a hálózatról fájlmegnyiást itt próbálnám megcsinálni.
      </Text>
      <Text>A Vissza gomb az Index oldalra vezet.</Text>
    </View>
  );
}
