/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { StoreList } from './store-list-slice-types';

const initialState: StoreList = [];

const storeListSlice = createSlice({
  name: 'storeList',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['storeList']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as StoreList;
    },
  },
});

export const { actions: storeListActions, reducer: storeListReducer } = storeListSlice;
