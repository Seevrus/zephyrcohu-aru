/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mergeDeepLeft } from 'ramda';

import { LocalStorage } from '../async-storage';
import { checkToken, registerDevice, unregisterDevice } from './config-api-actions';
import { Config } from './config-slice-types';

const initialState: Config = {
  isDemoMode: false,
  userType: undefined,
  company: undefined,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    mergeLocalState: (state, action: PayloadAction<LocalStorage['config']>) => {
      state = mergeDeepLeft(state, action.payload ?? {}) as Config;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      state.userType = payload.data?.type;
      state.company = payload.data?.company;
    });
    builder.addCase(registerDevice.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 400:
          throw new Error(
            'Ez a felhasználó egy másik eszközön már érvényesítette a hozzáférését. Amennyiben az alkalmazás újratelepítése vagy a készülék cseréje miatt újbóli bejelentkezésre van szükség, kérem igényeljen új kódot az alkalmazás adminisztrátorától.'
          );
        case 401:
          throw new Error('A beírt token érvénytelen.');
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(checkToken.fulfilled, (state, { payload }) => {
      state.userType = payload.data?.type;
      state.company = payload.data?.company;
    });
    builder.addCase(checkToken.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error(
            'Probléma lépett fel a korábban megadott hitelesítési adatok ellenőrzése során.'
          );
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(unregisterDevice.fulfilled, (state) => {
      state.userType = undefined;
    });
    builder.addCase(unregisterDevice.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
