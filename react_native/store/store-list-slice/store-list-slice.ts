/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import fetchStores from './store-list-api-actions';
import { StoreList } from './store-list-slice-types';

const initialState: StoreList = {
  fetched: false,
  data: [],
};

const storeListSlice = createSlice({
  name: 'storeList',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['storeList']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as StoreList;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchStores.fulfilled, (state, { payload }) => {
      state.fetched = true;
      state.data = payload.data;
    });
    builder.addCase(fetchStores.rejected, (state, { payload }) => {
      state.fetched = false;
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a raktárak lekérése során.');
      }
    });
  },
});

export const { actions: storeListActions, reducer: storeListReducer } = storeListSlice;
