import { ScrollView, StyleSheet, Text, View } from 'react-native';

import TextCard from '../../components/TextCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';

export default function Login() {
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextCard>
        Üdvözöljük a <Text style={styles.cardEmphasized}>Zephyr Boreal</Text> áruforgalmi alkalmazás
        kezdőoldalán! A kezdéshez adja meg az adminisztrátorától kapott bejelentkezési kódot.
      </TextCard>
      <View style={styles.form}>
        <View>
          <Input
            label="Kód"
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              multiline: true,
            }}
          />
          <View style={styles.buttonContainer}>
            <Button>Alkalmazás regisztrációja</Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple500,
  },
  cardEmphasized: {
    fontWeight: 'bold',
  },
  form: {
    marginHorizontal: '5%',
    padding: 8,
    backgroundColor: colors.purple800,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
