/* eslint-disable import/no-default-export */
/* eslint-disable import/no-unused-modules */

const storageMock = new Map();

const AsycStorage = {
  getItem(key) {
    return Promise.resolve(storageMock.get(key));
  },
  removeItem(key) {
    return Promise.resolve(storageMock.delete(key));
  },
  setItem(key, value) {
    storageMock.set(key, value);
    return Promise.resolve();
  },
};

export default AsycStorage;
