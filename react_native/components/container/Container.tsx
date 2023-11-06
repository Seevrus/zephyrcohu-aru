import { type PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../../constants/colors';

type ContainerProps = {
  style?: StyleProp<ViewStyle>;
};

export function Container({
  style,
  children,
}: PropsWithChildren<ContainerProps>) {
  return <View style={[style, styles.container]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
