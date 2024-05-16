// eslint-disable-next-line import/no-named-as-default
import Constants from 'expo-constants';

export function getBundleId() {
  return Constants.expoConfig?.ios?.bundleIdentifier ?? '';
}

export function getVersion() {
  Constants.expoConfig?.version;
}

export default {
  getBundleId,
  getVersion,
};
