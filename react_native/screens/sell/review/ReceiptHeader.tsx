import { StyleSheet, Text, View } from 'react-native';
import fontSizes from '../../../constants/fontSizes';

export default function ReceiptHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cikknév, cikkszám és lejárat</Text>
      <View style={styles.rightContainer}>
        <Text style={styles.text}>Mennyiség és bruttó összeg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    borderBottomColor: 'white',
    borderBottomWidth: 1,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.smallText,
  },
});
