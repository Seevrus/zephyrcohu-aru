/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft, pipe, propOr, values } from 'ramda';

import { LocalStorage } from '../async-storage';
import { fetchAgents, removeAgents } from './agents-api-actions';
import { Agents } from './agents-slice-types';

const initialState: Agents = {
  data: [],
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['agents']>) => {
      state.data = pipe(
        mergeDeepLeft(state.data),
        values
      )(propOr([], 'data', payload) as Agents['data']);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAgents.fulfilled, (state, { payload }) => {
      state.data = payload.data;
    });
    builder.addCase(fetchAgents.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('Váratlan hitelesítési hiba.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a termékek adatainak lekérése során.');
      }
    });

    builder.addCase(removeAgents.fulfilled, (state) => {
      state.data = [];
    });
    builder.addCase(removeAgents.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: agentsActions, reducer: agentsReducer } = agentsSlice;
