/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { fetchStore, removeStore } from './store-api-actions';
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
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['store']>) => {
      state.id = payload.id;
      state.code = payload.code;
      state.name = payload.name;
      state.firstAvailableSerialNumber = payload.firstAvailableSerialNumber;
      state.lastAvailableSerialNumber = payload.lastAvailableSerialNumber;
      state.yearCode = payload.yearCode;
      state.items = mergeDeepLeft(state.items, payload.items ?? {}) as Store['items'];
      state.partners = mergeDeepLeft(state.partners, payload.partners ?? {}) as Store['partners'];
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

    builder.addCase(removeStore.fulfilled, (state) => {
      state.id = undefined;
      state.code = undefined;
      state.name = undefined;
      state.firstAvailableSerialNumber = undefined;
      state.lastAvailableSerialNumber = undefined;
      state.yearCode = undefined;
      state.items = [];
      state.partners = [];
    });
    builder.addCase(removeStore.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: storeActions, reducer: storeReducer } = storeSlice;
