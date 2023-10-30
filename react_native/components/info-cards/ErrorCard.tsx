import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

export function ErrorCard({ children }: PropsWithChildren) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialIcons name="error-outline" size={36} color="white" />
      </View>
      <View style={styles.informationContainer}>
        <Text style={styles.information}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.error,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    marginHorizontal: '5%',
  },
  icon: {
    marginRight: 8,
    marginTop: 4,
  },
  information: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  informationContainer: {
    flex: 1,
    margin: 8,
  },
});
