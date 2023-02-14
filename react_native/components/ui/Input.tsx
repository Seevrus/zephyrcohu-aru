import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type InputProps = {
  label: string;
  invalid?: boolean;
  textAlign?: 'left' | 'auto' | 'center' | 'right' | 'justify';
  config?: TextInputProps;
};

const defaultProps = {
  invalid: false,
  textAlign: 'left',
  config: {},
};

export default function Input({ label, invalid, textAlign, config }: InputProps) {
  return (
    <View>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>{label}</Text>
      <TextInput
        style={[styles.input, config?.multiline && styles.multiline, { textAlign }]}
        {...config}
      />
    </View>
  );
}
Input.defaultProps = defaultProps;

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  invalidLabel: {
    color: colors.red300,
  },
  input: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.input,
    color: 'white',
    fontSize: 24,
    fontFamily: 'Roboto',
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
