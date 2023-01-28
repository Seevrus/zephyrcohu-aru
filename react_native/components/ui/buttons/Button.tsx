import { ReactNode } from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';

type ButtonProps = {
  variant: 'neutral' | 'ok' | 'error' | 'disabled';
  onPress?: (event: GestureResponderEvent) => void;
  children: ReactNode;
};

const defaultProps = {
  onPress: () => {},
};

export default function Button({ variant, onPress, children }: ButtonProps) {
  const buttonVariants = {
    neutral: colors.neutral,
    ok: colors.ok,
    error: colors.error,
    disabled: colors.disabled,
  };

  const buttonBackgroundStyle = {
    backgroundColor: buttonVariants[variant],
  };

  const rippleColors = {
    neutral: colors.neutralRipple,
    ok: colors.okRipple,
    error: colors.errorRipple,
  };

  return (
    <View>
      <Pressable
        disabled={variant === 'disabled'}
        onPress={onPress}
        android_ripple={{ color: rippleColors[variant] }}
      >
        <View style={[styles.button, buttonBackgroundStyle]}>
          <Text style={styles.buttonText}>{children}</Text>
        </View>
      </Pressable>
    </View>
  );
}
Button.defaultProps = defaultProps;

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.75,
    borderRadius: 4,
  },
});
