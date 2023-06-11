import { ScrollView, StyleSheet, View } from 'react-native';

import ErrorCard from '../../components/info-cards/ErrorCard';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import { StartupErrorProps } from '../screen-types';

export default function Error({ navigation, route }: StartupErrorProps) {
  const { message: errorMessage } = route.params;

  const tryAgainHandler = () => {
    navigation.replace('StartupCheck');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.error}>
        <ErrorCard>{errorMessage}</ErrorCard>
      </View>
      <View style={styles.buttonContainer}>
        <Button variant="neutral" onPress={tryAgainHandler}>
          Újrapróbálkozás
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    marginTop: 30,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
