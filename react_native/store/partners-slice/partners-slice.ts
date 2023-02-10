/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepRight } from 'ramda';

import { LocalStorage } from '../async-storage';
import { Partners } from './partners-slice-types';

const initialState: Partners = [];

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['partners']>) => {
      state = mergeDeepRight(state, action.payload) as Partners;
    },
  },
});

export const { actions: partnersActions, reducer: partnersReducer } = partnersSlice;
