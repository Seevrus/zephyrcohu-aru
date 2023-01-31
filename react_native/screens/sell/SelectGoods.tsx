import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { SelectGoodsProps } from '../screen-types';

export default function SelectGoods({ navigation }: SelectGoodsProps) {
  const onPressNextHandler = () => {
    navigation.navigate('Review');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Itt lesz lehetőség a termékek kiválasztására lejáratok, illetve rendelés szerint.
      </Text>
      <Text style={styles.text}>
        A Vissza gomb az visszavezet a partnerekhez. Az első ötlet az, hogy ez kitöröl minden
        kiválasztott terméket is, ami persze nem törvényszerű.
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
