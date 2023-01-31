import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { SelectPartnerProps } from '../screen-types';

export default function SelectPartner({ navigation }: SelectPartnerProps) {
  const onPressNextHandler = () => {
    navigation.navigate('SelectGoods');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Itt lesz lehetőség a partner kiválasztására. Lehet majd váltani az Összes nézete és a Kör
        partnereinek nézete között.
      </Text>
      <Text style={styles.text}>A Vissza gomb A Kör képernyőre vezet.</Text>
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
