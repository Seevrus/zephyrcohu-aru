/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import fetchStore from './store-api-actions';
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
  extraReducers: (builder) => {
    builder.addCase(fetchStore.fulfilled, (state, { payload }) => {
      state.id = payload.id;
      state.code = payload.code;
      state.name = payload.name;
      state.firstAvailableSerialNumber = payload.firstAvailableSerialNumber;
      state.lastAvailableSerialNumber = payload.lastAvailableSerialNumber;
      state.yearCode = payload.yearCode;
      state.items = payload.items;
      state.partners = payload.partners;
    });
    builder.addCase(fetchStore.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error(
            'Váratlan hiba lépett fel a kiválasztott raktár adatainak lekérése során.'
          );
      }
    });
  },
});

export const { actions: storeActions, reducer: storeReducer } = storeSlice;
