import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';

type LoadingProps = {
  message?: string;
};

const defaultProps = {
  message: '',
};

export function Loading({ message }: LoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.blue200} />
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}
Loading.defaultProps = defaultProps;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
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
