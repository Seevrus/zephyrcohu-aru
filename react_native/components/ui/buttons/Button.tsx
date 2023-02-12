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
    padding: 15,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
});
