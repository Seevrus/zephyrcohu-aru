import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ReceiptListProps } from '../screen-types';

export default function ReceiptList({ navigation }: ReceiptListProps) {
  const onPressNextHandler = () => {
    navigation.navigate('Receipt');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Itt listázzuk a már elkészült bizonylatokat. Rájuk kattintva kiderülnek részletek egy másik
        képernyőn, ahol majd sztornózni is lehet.
      </Text>
      <Text style={styles.text}>A Vissza gomb a Kör képernyőre vezet.</Text>
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={onPressNextHandler}>
          Tovább
        </Button>
      </View>
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
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
