import { type PropsWithChildren } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

export type ButtonProps = {
  variant: 'neutral' | 'ok' | 'warning' | 'error' | 'disabled';
  onPress?: (event: GestureResponderEvent) => void;
};

const defaultProps = {
  onPress: () => {},
};

export function Button({
  variant,
  onPress,
  children,
}: PropsWithChildren<ButtonProps>) {
  const buttonVariants = {
    neutral: colors.neutral,
    ok: colors.ok,
    warning: colors.warning,
    error: colors.error,
    disabled: colors.disabled,
  };

  const buttonBackgroundStyle = {
    backgroundColor: buttonVariants[variant],
  };

  const rippleColors = {
    neutral: colors.neutralRipple,
    ok: colors.okRipple,
    warning: colors.warningRipple,
    error: colors.errorRipple,
    disabled: undefined,
  };

  return (
    <View style={styles.container}>
      <Pressable
        disabled={variant === 'disabled'}
        onPress={onPress}
        style={[styles.buttonContainer, buttonBackgroundStyle]}
        android_ripple={{ color: rippleColors[variant] }}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </Pressable>
    </View>
  );
}
Button.defaultProps = defaultProps;

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    elevation: 2,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  buttonText: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
