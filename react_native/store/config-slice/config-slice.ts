/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { checkToken, registerDevice, unregisterDevice } from './config-api-actions';
import { Config } from './config-slice-types';

import userTypes from '../../constants/userTypes';

const initialState: Config = {
  isLocalStateMerged: false,
  isDemoMode: false,
  isLoggedin: false,
  userType: undefined,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    mergeLocalState: (
      state,
      action: PayloadAction<{
        isDemoMode: boolean;
        isLoggedin: boolean;
        userType?: (typeof userTypes)[keyof typeof userTypes];
      }>
    ) => {
      state.isLocalStateMerged = true;
      state.isDemoMode = action.payload.isDemoMode;
      state.isLoggedin = action.payload.isLoggedin;
      state.userType = action.payload.userType;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.isLoggedin = true;
      state.userType = type;
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
      const { type } = payload;
      state.isLoggedin = true;
      state.userType = type;
    });
    builder.addCase(checkToken.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error(
            'Probléma lépett fel a korábban meghadott hitelesítési adatok ellenőrzése során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
        case 507:
          throw new Error(payload.message);
        default:
          throw new Error(
            'Váratlan hiba lépett fel a kód feldolgozása során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
      }
    });

    builder.addCase(unregisterDevice.fulfilled, (state) => {
      state.isLoggedin = false;
      state.userType = undefined;
    });
    builder.addCase(unregisterDevice.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
