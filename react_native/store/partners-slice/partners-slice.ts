/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import fetchPartners from './partners-api-actions';
import { Partners } from './partners-slice-types';

const initialState: Partners = {
  data: [],
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['partners']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Partners;
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
  },
});

export const { actions: partnersActions, reducer: partnersReducer } = partnersSlice;
