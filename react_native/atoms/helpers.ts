import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cacheDirectory,
  EncodingType,
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

const MediaStorage = <const>{
  async getItem(key: string) {
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

export const mediaKeys = <const>{
  maxNewPartnerIdInUse: 'a06a3e58-f1cf-4309-b33a-639889d41e96',
  orders: 'a03f4948-e8d7-4393-aeb4-3b9a18034451',
  primaryStore: '61ce65cb-3142-4d0b-a982-16e574a6bd96',
  receipts: '7b39b7aa-ce7b-4b4f-a290-2778c9e72368',
  selectedStoreCurrent: 'e35c1ffe-57aa-4639-9655-4928d92e51c4',
  selectedStoreInitial: '9704835a-1f8f-4121-84a0-f0e643eee249',
};

export const atomWithMediaStorage = <T>(key: string, content: T) => {
  const storage = createJSONStorage<T>(() => MediaStorage);
  return atomWithStorage<T>(key, content, storage);
};
