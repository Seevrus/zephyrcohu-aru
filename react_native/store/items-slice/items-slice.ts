/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import { fetchItems, removeItems } from './items-api-actions';
import { Items } from './items-slice-types';

const initialState: Items = {
  data: undefined,
};

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['items']>) => {
      if (!state.data) state.data = payload?.data;
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

    builder.addCase(removeItems.fulfilled, (state) => {
      state.data = undefined;
    });
    builder.addCase(removeItems.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: itemsActions, reducer: itemsReducer } = itemsSlice;
