import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

type DropdownItem = {
  key: string;
  value: string;
};

type DropdownProps = {
  label: string;
  labelPosition?: 'left' | 'top';
  data: DropdownItem[];
  defaultOption?: DropdownItem;
  onSelect: (key: string) => void;
};

const defaultProps = {
  labelPosition: 'top',
  defaultOption: {},
};

export default function Dropdown({
  label,
  labelPosition,
  data,
  defaultOption,
  onSelect,
}: DropdownProps) {
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: labelPosition === 'left' ? 'row' : 'column',
    },
    label: {
      ...(labelPosition === 'left' && { marginRight: 10 }),
      ...(labelPosition === 'top' && { marginBottom: 4 }),
    },
    input: {
      ...(labelPosition === 'top' && { width: '100%' }),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[dynamicStyles.label, styles.label]}>{label}</Text>
      <SelectList
        data={data}
        defaultOption={defaultOption}
        save="key"
        setSelected={onSelect}
        fontFamily="Muli"
        placeholder="Kérem válasszon..."
        searchPlaceholder=" "
        notFoundText="Nem található."
        searchicon={<MaterialIcons name="search" size={24} color="white" />}
        arrowicon={<MaterialIcons name="arrow-drop-down" size={24} color="white" />}
        closeicon={<MaterialIcons name="arrow-drop-up" size={24} color="white" />}
        boxStyles={styles.box}
        inputStyles={styles.input}
        dropdownStyles={styles.dropdown}
        dropdownItemStyles={styles.dropdownItem}
        dropdownTextStyles={styles.dropdownText}
        disabledItemStyles={styles.disabledItem}
        disabledTextStyles={styles.disabledText}
      />
    </View>
  );
}
Dropdown.defaultProps = defaultProps;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '7%',
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: 'bold',
    color: 'white',
  },
  box: {
    backgroundColor: colors.input,
    borderWidth: 0,
    borderRadius: 8,
  },
  input: {
    color: 'white',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: colors.input,
    borderColor: colors.background,
    borderRadius: 0,
    marginTop: 0,
  },
  dropdownItem: {
    backgroundColor: colors.input,
  },
  dropdownText: {
    color: 'white',
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
  disabledItem: {
    backgroundColor: colors.input,
  },
  disabledText: {
    color: colors.gray400,
    fontSize: fontSizes.input,
    fontWeight: 'bold',
  },
});
