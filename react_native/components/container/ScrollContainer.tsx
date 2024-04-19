import { type PropsWithChildren } from 'react';
import {
  ScrollView,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { colors } from '../../constants/colors';

type ScrollContainerProps = {
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function ScrollContainer({
  testID,
  style,
  children,
}: PropsWithChildren<ScrollContainerProps>) {
  return (
    <ScrollView testID={testID} style={[style, styles.container]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
