import { ActivityIndicator, StyleSheet, View } from 'react-native';
import colors from '../constants/colors';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.blue200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple500,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
