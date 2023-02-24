/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { fetchStore, fetchStoreList, removeStore, removeStoreList } from './stores-api-actions';
import { StoresSlice } from './stores-slice-types';

const initialState: StoresSlice = {
  storeList: undefined,
  store: undefined,
};

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['stores']>) => {
      if (!state.storeList) state.storeList = payload?.storeList;
      if (!state.store) state.store = payload?.store;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStoreList.fulfilled, (state, { payload }) => {
      state.storeList = payload.data;
    });
    builder.addCase(fetchStoreList.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a raktárak lekérése során.');
      }
    });

    builder.addCase(removeStoreList.fulfilled, (state) => {
      state.storeList = undefined;
    });
    builder.addCase(removeStoreList.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });

    builder.addCase(fetchStore.fulfilled, (state, { payload }) => {
      state.store = payload;
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
      state.store = undefined;
    });
    builder.addCase(removeStore.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: storesActions, reducer: storesReducer } = storesSlice;
