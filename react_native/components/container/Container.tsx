import { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

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
    <KeyboardAvoidingView
      testID={testID}
      behavior="height"
      style={[style, styles.container]}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
