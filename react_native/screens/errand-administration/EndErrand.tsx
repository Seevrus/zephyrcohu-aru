import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

export default function EndErrand() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Ezen a képernyőn lehet zárni a kört. Azt még el kell döntenünk, hogyan.
      </Text>
      <Text style={styles.text}>A Vissza gomb az Index oldalra vezet.</Text>
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
