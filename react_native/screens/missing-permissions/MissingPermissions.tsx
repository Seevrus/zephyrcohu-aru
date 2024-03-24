import { BackHandler, StyleSheet, View } from 'react-native';

import { Container } from '../../components/container/Container';
import { TextCard } from '../../components/info-cards/TextCard';
import { Button } from '../../components/ui/Button';

const exitAppHandler = () => {
  BackHandler.exitApp();
};

export function MissingPermissions() {
  return (
    <Container style={styles.container}>
      <TextCard>
        A Zephyr Boreal használatához szükséges jogosultság a médiatartalmak
        elérése. Kérem, indítsa újra az alkalmazást és a felugró ablakban
        koppintson az &quot;Engedélyezés&quot; válaszra. Amennyiben az ablak nem
        jelenik meg, az egedély az Alkalmazásengedélyek adható meg a rendszer
        menüjében.
      </TextCard>
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={exitAppHandler}>
          Kilépés az alkalmazásból
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: '10%',
    marginTop: 30,
  },
  container: {
    paddingTop: 80,
  },
});
