/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Store } from './store-slice-types';

const initialState: Store = {
  id: undefined,
  code: undefined,
  name: undefined,
  firstAvailableSerialNumber: undefined,
  lastAvailableSerialNumber: undefined,
  yearCode: undefined,
  items: [],
  partners: [],
};

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['store']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Store;
    },
  },
});

export const { actions: storeActions, reducer: storeReducer } = storeSlice;
