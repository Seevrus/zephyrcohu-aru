import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { PropsWithChildren } from 'react';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type ButtonProps = {
  variant: 'neutral' | 'ok' | 'warning' | 'error' | 'disabled';
  onPress?: (event: GestureResponderEvent) => void;
};

const defaultProps = {
  onPress: () => {},
};

export default function Button({ variant, onPress, children }: PropsWithChildren<ButtonProps>) {
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
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    height: 50,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
});
