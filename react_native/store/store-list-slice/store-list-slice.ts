/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft, pipe, propOr, values } from 'ramda';

import { LocalStorage } from '../async-storage';
import { fetchStores, removeStores } from './store-list-api-actions';
import { StoreList } from './store-list-slice-types';

const initialState: StoreList = {
  fetched: undefined,
  data: [],
};

const storeListSlice = createSlice({
  name: 'storeList',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['storeList']>) => {
      state.fetched = payload?.fetched ?? false;
      state.data = pipe(
        mergeDeepLeft(state.data),
        values
      )(propOr([], 'data', payload) as StoreList['data']);
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

    builder.addCase(removeStores.fulfilled, (state) => {
      state.fetched = false;
      state.data = [];
    });
    builder.addCase(removeStores.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: storeListActions, reducer: storeListReducer } = storeListSlice;
