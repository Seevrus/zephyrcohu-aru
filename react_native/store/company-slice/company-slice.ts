/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LocalStorage } from '../async-storage';
import { Company } from './company-slice-types';

const initialState: Company = undefined;

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['company']>) => {
      state = action.payload;
    },
  },
});

export const { actions: companyActions, reducer: companyReducer } = companySlice;
