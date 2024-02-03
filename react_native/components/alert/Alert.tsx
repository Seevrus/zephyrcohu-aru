import { Overlay } from '@rneui/themed';
import { StyleSheet, Text, View } from 'react-native';

import { Button, type ButtonProps } from '../ui/Button';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

export type AlertButton = {
  text: string;
} & ButtonProps;

type AlertProps = {
  visible: boolean;
  title: string;
  message?: string | null;
  buttons: {
    cancel?: AlertButton | null;
    confirm?: AlertButton | null;
  };
  onBackdropPress: () => void;
};

export function Alert({
  visible,
  title,
  message,
  buttons,
  onBackdropPress,
}: AlertProps) {
  return (
    <Overlay
      testID="boreal-alert"
      isVisible={visible}
      onBackdropPress={onBackdropPress}
      overlayStyle={styles.container}
    >
      <View style={styles.titleContainer}>
        <Text testID="boreal-alert-title" style={styles.title}>
          {title}
        </Text>
      </View>
      {message ? (
        <View style={styles.messageContainer}>
          <Text testID="boreal-alert-message" style={styles.message}>
            {message}
          </Text>
        </View>
      ) : null}
      <View style={styles.buttonsContainer}>
        {buttons.cancel ? (
          <View style={styles.buttonContainer}>
            <Button
              variant={buttons.cancel.variant}
              onPress={buttons.cancel.onPress}
            >
              {buttons.cancel.text}
            </Button>
          </View>
        ) : null}
        {buttons.confirm ? (
          <View style={styles.buttonContainer}>
            <Button
              variant={buttons.confirm.variant}
              onPress={buttons.confirm.onPress}
            >
              {buttons.confirm.text}
            </Button>
          </View>
        ) : null}
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginHorizontal: '4%',
    width: '40%',
  },
  buttonsContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: 10,
    width: '88%',
  },
  message: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.input,
  },
  messageContainer: {
    marginBottom: 20,
  },
  title: {
    color: colors.white,
    fontFamily: 'Roboto-Bold',
    fontSize: fontSizes.body,
  },
  titleContainer: {
    marginBottom: 20,
  },
});
