import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type InputProps = {
  label: string;
  invalid?: boolean;
  config?: TextInputProps;
};

const defaultProps = {
  invalid: false,
  config: {},
};

export default function Input({ label, invalid, config }: InputProps) {
  return (
    <View>
      <Text style={[styles.label, invalid && styles.invalidLabel]}>{label}</Text>
      <TextInput style={[styles.input, config?.multiline && styles.multiline]} {...config} />
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
    backgroundColor: colors.purple300,
    color: 'white',
    fontSize: 24,
    fontFamily: 'Muli',
  },
  multiline: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
});
