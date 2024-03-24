import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EncodingType,
  cacheDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system';
import {
  addAssetsToAlbumAsync,
  createAlbumAsync,
  createAssetAsync,
  deleteAssetsAsync,
  getAlbumAsync,
  getAssetsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-media-library';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export const atomWithAsyncStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => AsyncStorage);
  return atomWithStorage<T>(key, content, storage);
};

const SecureStorage = <const>{
  getItem: getItemAsync,
  setItem: setItemAsync,
  removeItem: deleteItemAsync,
};

export const atomWithSecureStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => SecureStorage);
  return atomWithStorage<T>(key, content, storage);
};

const albumName = 'boreal';
const storageDirectory = cacheDirectory + albumName;
const imageExtension = '.jpg';

async function ensureCacheDirectoryExists() {
  const directoryInfo = await getInfoAsync(storageDirectory);

  if (!directoryInfo.exists) {
    await makeDirectoryAsync(storageDirectory, {
      intermediates: true,
    });
  }
}

async function requestPermissions() {
  let permissions = await getPermissionsAsync();

  if (!permissions.granted && permissions.canAskAgain) {
    permissions = await requestPermissionsAsync();
  }

  return permissions;
}

const MediaStorage = <const>{
  async getItem(key: string) {
    const permissions = await requestPermissions();

    if (!permissions.granted) {
      return;
    }

    const cacheAlbum = await getAlbumAsync(albumName);

    if (!cacheAlbum) {
      return;
    }

    const cacheItems = await getAssetsAsync({ album: cacheAlbum, first: 100 });
    const cacheItem = cacheItems.assets.find((asset) =>
      asset.filename.includes(key)
    );

    if (!cacheItem) {
      return;
    }

    const cacheItemUri = cacheItem.uri;
    const cacheItemContent = await readAsStringAsync(cacheItemUri, {
      encoding: EncodingType.UTF8,
    });

    return JSON.parse(cacheItemContent);
  },
  async setItem(key: string, value: string) {
    const permissions = await requestPermissions();

    if (!permissions.granted) {
      return;
    }

    await ensureCacheDirectoryExists();
    const temporaryFile = storageDirectory + '/' + key + imageExtension;

    await writeAsStringAsync(temporaryFile, value, {
      encoding: EncodingType.UTF8,
    });

    const cacheItem = await createAssetAsync(temporaryFile);
    const cacheAlbum = await getAlbumAsync(albumName);

    await (cacheAlbum
      ? addAssetsToAlbumAsync([cacheItem], cacheAlbum, false)
      : createAlbumAsync(albumName, cacheItem, false));
  },
  async removeItem(key: string) {
    const permissions = await requestPermissions();

    if (!permissions.granted) {
      return;
    }

    const cacheAlbum = await getAlbumAsync(albumName);

    if (!cacheAlbum) {
      return;
    }

    const cacheItems = await getAssetsAsync({ album: cacheAlbum, first: 100 });
    const cacheItem = cacheItems.assets.find((asset) =>
      asset.filename.includes(key)
    );

    if (!cacheItem) {
      return;
    }

    await deleteAssetsAsync([cacheItem]);
  },
};

export const atomWithMediaStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => MediaStorage);
  return atomWithStorage<T>(key, content, storage);
};
