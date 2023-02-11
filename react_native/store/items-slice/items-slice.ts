/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import fetchItems from './items-api-actions';
import { Items } from './items-slice-types';

const initialState: Items = {
  data: [],
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['items']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Items;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchItems.fulfilled, (state, { payload }) => {
      state.data = payload.data;
    });
    builder.addCase(fetchItems.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a termékek adatainak lekérése során.');
      }
    });
  },
});

export const { actions: itemsActions, reducer: itemsReducer } = itemsSlice;
