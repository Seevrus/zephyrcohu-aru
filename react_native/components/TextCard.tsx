import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type TextCardProps = {
  children: ReactNode;
};

export default function TextCard({ children }: TextCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialIcons name="info-outline" size={36} color="white" />
      </View>
      <View style={styles.informationContainer}>
        <Text style={styles.information}>{children}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse',
    marginHorizontal: '5%',
    backgroundColor: colors.purple800,
    borderRadius: 10,
  },
  icon: {
    marginTop: 8,
    marginRight: 8,
  },
  informationContainer: {
    flex: 1,
    margin: 8,
  },
  information: {
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    color: 'white',
  },
});
