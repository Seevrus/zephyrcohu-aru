/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { fetchPartners, removePartners } from './partners-api-actions';
import { Partners } from './partners-slice-types';

const initialState: Partners = {
  data: [],
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['partners']>) => {
      state.data = mergeDeepLeft(state.data, payload.data ?? []) as Partners['data'];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPartners.fulfilled, (state, { payload }) => {
      state.data = payload.data;
    });
    builder.addCase(fetchPartners.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a termékek adatainak lekérése során.');
      }
    });

    builder.addCase(removePartners.fulfilled, (state) => {
      state.data = [];
    });
    builder.addCase(removePartners.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: partnersActions, reducer: partnersReducer } = partnersSlice;
