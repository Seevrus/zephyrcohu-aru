import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

export default function StartErrand() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Ezen a képernyőn lehet indítani a kört. Azt még meg kell beszélnünk, hogy hogyan.
      </Text>
      <Text style={styles.text}>A Vissza gomb a kör képernyőre vezet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
});
