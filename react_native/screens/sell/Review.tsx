import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ReviewProps } from '../screen-types';

export default function Review({ navigation }: ReviewProps) {
  const onPressNextHandler = () => {
    navigation.navigate('Summary');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Áttekintés a partnerről és termékekről. Lehetőség van kikukázni az egészet és visszamenni a
        kezdőképernyőre, vagy a tovább gombra kattintva véglegesíteni.
      </Text>
      <Text style={styles.text}>
        A Vissza gomb az visszavezet a termékekhez, ha még valamit módosítanának.
      </Text>
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
