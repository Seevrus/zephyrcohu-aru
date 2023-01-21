/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { Config } from './config-slice-types';

const initialState: Config = {
  hasToken: false,
  isTokenValid: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setTokenAvailability: (state, action: { payload: boolean; type: string }) => {
      state.hasToken = action.payload;
    },
    setTokenvalidity: (state, action: { payload: boolean; type: string }) => {
      state.isTokenValid = action.payload;
    },
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
