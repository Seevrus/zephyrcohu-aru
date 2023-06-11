import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type InputProps = {
  label: string;
  labelPosition?: 'left' | 'top';
  value?: string;
  invalid?: boolean;
  textAlign?: 'left' | 'auto' | 'center' | 'right' | 'justify';
  config?: TextInputProps;
};

const defaultProps = {
  labelPosition: 'top',
  value: '',
  invalid: false,
  textAlign: 'left',
  config: {},
};

export default function Input({
  label,
  labelPosition,
  value,
  invalid,
  textAlign,
  config,
}: InputProps) {
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: labelPosition === 'left' ? 'row' : 'column',
      alignItems: labelPosition === 'left' ? 'center' : 'flex-start',
    },
    label: {
      ...(labelPosition === 'left' && { marginRight: 10 }),
      ...(labelPosition === 'top' && { marginBottom: 4 }),
    },
    input: {
      ...(labelPosition === 'top' && { width: '100%' }),
      textAlign,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text style={[dynamicStyles.label, styles.label, invalid && styles.invalidLabel]}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, config?.multiline && styles.multiline, dynamicStyles.input]}
        {...config}
        {...(value && { value })}
      />
    </View>
  );
}
Input.defaultProps = defaultProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 4,
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: 'white',
  },
  invalidLabel: {
    color: colors.red300,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.input,
    color: 'white',
    fontSize: fontSizes.input,
    fontFamily: 'Roboto',
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
