/* eslint-disable import/no-unused-modules */
const storageMock = new Map();

export async function getItemAsync(key) {
  return storageMock.get(key);
}

export async function setItemAsync(key, value) {
  storageMock.set(key, value);
  return;
}

export async function deleteItemAsync(key) {
  return storageMock.delete(key);
}
