import * as Print from 'expo-print';
import { Button, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';

export default function EndErrand() {
  const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bizonylat</title>

        <style>
          body {
            font-family: 'Lucida Console';
            margin: 0;
          }

          section {
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <main>
          <section>
            <div style="font-size: 20pt">Betűtípus ellenőrzés</div>
            <div style="font-size: 20pt">áÁéÉíÍóÓőŐűŰ<>#;</div>
          </section>
          <section>
            <div style="font-size: 2pt">Betűméret: 2pt</div>
            <div style="font-size: 2pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 4pt">Betűméret: 4pt</div>
            <div style="font-size: 4pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 6pt">Betűméret: 6pt</div>
            <div style="font-size: 6pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 8pt">Betűméret: 8pt</div>
            <div style="font-size: 8pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 10pt">Betűméret: 10pt</div>
            <div style="font-size: 10pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 12pt">Betűméret: 12pt</div>
            <div style="font-size: 12pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
          <section>
            <div style="font-size: 14pt">Betűméret: 14pt</div>
            <div style="font-size: 14pt">
              XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*XXXXXXXXX*
            </div>
          </section>
        </main>
      </body>
    </html>
    `;

  const print = async () => {
    await Print.printAsync({
      html,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Ezen a képernyőn lehet zárni a kört. Azt még el kell döntenünk, hogyan.
      </Text>
      <Text style={styles.text}>A Vissza gomb az Index oldalra vezet.</Text>
      <Button title="Próba Nyomtatás" onPress={print} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
});
