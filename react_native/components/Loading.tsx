import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type LoadingProps = {
  message?: string;
};

const defaultProps = {
  message: '',
};

export default function Loading({ message }: LoadingProps) {
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
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    margin: 30,
  },
  message: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
