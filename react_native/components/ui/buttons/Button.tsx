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
    neutral: colors.purple500,
    ok: colors.green500,
    error: colors.red600,
    disabled: colors.gray500,
  };

  const buttonBackgroundStyle = {
    backgroundColor: buttonVariants[variant],
  };

  return (
    <View>
      <Pressable
        style={({ pressed }) => pressed && styles.pressed}
        disabled={variant === 'disabled'}
        onPress={onPress}
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
