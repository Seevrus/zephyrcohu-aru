import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

type InputProps = {
  label: string;
  labelPosition?: 'left' | 'top';
  value?: string;
  invalid?: boolean;
  variant?: 'input' | 'disabled';
  textAlign?: 'left' | 'auto' | 'center' | 'right' | 'justify';
  config?: TextInputProps;
};

export function Input({
  label,
  labelPosition = 'top',
  value = '',
  invalid = false,
  variant,
  textAlign = 'left',
  config = {},
}: InputProps) {
  const inputVariants = {
    input: colors.input,
    disabled: colors.disabled,
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: labelPosition === 'left' ? 'center' : 'flex-start',
      flexDirection: labelPosition === 'left' ? 'row' : 'column',
    },
    input: {
      backgroundColor: (() => {
        if (variant) return inputVariants[variant];
        return config.editable === false ? colors.disabled : colors.input;
      })(),
      textAlign,
      ...(labelPosition === 'top' && { width: '100%' }),
    },
    label: {
      ...(labelPosition === 'left' && { marginRight: 10 }),
      ...(labelPosition === 'top' && { marginBottom: 4 }),
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text
        style={[
          dynamicStyles.label,
          styles.label,
          invalid && styles.invalidLabel,
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          config?.multiline && styles.multiline,
          dynamicStyles.input,
        ]}
        {...config}
        {...(!config.multiline &&
          !config.secureTextEntry && {
            multiline: true,
            numberOfLines: 1,
          })}
        {...(value && { value })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 4,
  },
  input: {
    borderRadius: 8,
    color: colors.white,
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: fontSizes.input,
    padding: 8,
  },
  invalidLabel: {
    color: colors.red300,
  },
  label: {
    color: colors.white,
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
