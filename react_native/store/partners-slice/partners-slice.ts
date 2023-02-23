/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LocalStorage } from '../async-storage';
import {
  fetchPartnerList,
  fetchPartners,
  removePartnerList,
  removePartners,
} from './partners-api-actions';
import { PartnersSlice } from './partners-slice-types';

const initialState: PartnersSlice = {
  partnerLists: undefined,
  partners: undefined,
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['partners']>) => {
      if (!state.partnerLists) state.partnerLists = payload?.partnerLists;
      if (!state.partners) state.partners = payload?.partners;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPartnerList.fulfilled, (state, { payload }) => {
      state.partnerLists = payload.data;
    });
    builder.addCase(fetchPartnerList.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a partnerlista lekérése során.');
      }
    });

    builder.addCase(removePartnerList.fulfilled, (state) => {
      state.partnerLists = undefined;
    });
    builder.addCase(removePartnerList.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });

    builder.addCase(fetchPartners.fulfilled, (state, { payload }) => {
      state.partners = payload;
    });
    builder.addCase(fetchPartners.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a partnerek adatainak lekérése során.');
      }
    });

    builder.addCase(removePartners.fulfilled, (state) => {
      state.partners = undefined;
    });
    builder.addCase(removePartners.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: partnersActions, reducer: partnersReducer } = partnersSlice;
