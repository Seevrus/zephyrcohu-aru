import { FunctionComponent } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../constants/colors';
import fontSizes from '../constants/fontSizes';

type TileProps = {
  title: string;
  Icon: FunctionComponent;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export default function Tile({ title, Icon, variant, onPress }: TileProps) {
  const tileColors = {
    ok: colors.ok,
    warning: colors.warning,
    neutral: colors.neutral,
    disabled: colors.disabled,
  };

  const rippleColors = {
    ok: colors.okRipple,
    warning: colors.warningRipple,
    neutral: colors.neutralRipple,
    disabled: colors.disabledRipple,
  };

  const tileStyle = {
    backgroundColor: tileColors[variant],
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tile, tileStyle]}
        android_ripple={{
          color: rippleColors[variant],
        }}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          <Icon />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
  },
  tile: {
    flex: 1,
    flexDirection: 'row',
    width: '90%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  iconContainer: {
    width: '20%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
});
