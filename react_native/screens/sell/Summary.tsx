import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { SummaryProps } from '../screen-types';

export default function Summary({ navigation }: SummaryProps) {
  const onPressNextHandler = () => {
    navigation.replace('Index');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Összegző képernyő. Itt már csak nyomtatni lehet, nem lesz visszaút (pillanatnyilag még
        persze van). A folyamat legvégén visszatérünk a kör képernyőre.
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={onPressNextHandler}>
          Befejezés
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
