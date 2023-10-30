import { type FunctionComponent } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';

export type TileT = {
  id: string;
  title: string;
  Icon: FunctionComponent;
  variant: 'ok' | 'warning' | 'disabled' | 'neutral';
  onPress: () => void;
};

export function Tile({ id, title, Icon, variant, onPress }: TileT) {
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
    <View key={id} style={styles.container}>
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
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  iconContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '20%',
  },
  tile: {
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '90%',
  },
  title: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
  },
});
