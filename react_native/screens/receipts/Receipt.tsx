import { StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

export default function Receipt() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Itt található egy bizonylat részletes megjelenítése, valamint sztornózni is lehet. Itt van
        lehetőség az újranyomtatásra.
      </Text>
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
