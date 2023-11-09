import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';
import { Container } from './container/Container';

type LoadingProps = {
  message?: string;
};

const defaultProps = {
  message: '',
};

export function Loading({ message }: LoadingProps) {
  return (
    <Container style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={colors.blue200} />
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Container>
  );
}
Loading.defaultProps = defaultProps;

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: colors.white,
    fontFamily: 'Roboto',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageContainer: {
    margin: 30,
  },
});
