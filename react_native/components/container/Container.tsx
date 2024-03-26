import { type PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../../constants/colors';

type ContainerProps = {
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Container({
  testID,
  style,
  children,
}: PropsWithChildren<ContainerProps>) {
  return (
    <View testID={testID} style={[style, styles.container]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
