/* eslint-disable no-param-reassign */
import * as SecureStore from 'expo-secure-store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { ErrorResponseT } from '../base-types';
import {
  CheckTokenResponseT,
  Config,
  RegisterDeviceRequestT,
  RegisterDeviceResponseT,
} from './config-slice-types';

const initialState: Config = {
  hasToken: false,
  isTokenValid: false,
  userType: undefined,
};

export const registerDevice = createAsyncThunk<
  RegisterDeviceResponseT,
  RegisterDeviceRequestT,
  { rejectValue: ErrorResponseT }
>('config/registerDevice', async (requestData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${env.api_url}/users/register-device`, requestData, {
      headers: { Authorization: `Bearer ${requestData.token}` },
    });
    return response.data;
  } catch (e) {
    return rejectWithValue(e.response.data);
  }
});

export const checkToken = createAsyncThunk<
  CheckTokenResponseT,
  typeof _,
  { rejectValue: ErrorResponseT }
>('config/checkToken', async (_, { rejectWithValue }) => {
  try {
    const deviceId = await SecureStore.getItemAsync('boreal-device-id');
    const token = await SecureStore.getItemAsync('boreal-token');
    const response = await axios.get(`${env.api_url}/users/check-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Device-Id': deviceId,
      },
    });
    return response.data;
  } catch (e) {
    return rejectWithValue(e.response.data);
  }
});

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setTokenAvailability: (state, action: { payload: boolean; type: string }) => {
      state.hasToken = action.payload;
    },
    setTokenValidity: (state, action: { payload: boolean; type: string }) => {
      state.isTokenValid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerDevice.fulfilled, (state, { payload }) => {
      const { type } = payload;
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
        default:
          throw new Error('Váratlan hiba lépett fel a kód feldolgozása során.');
      }
    });

    builder.addCase(checkToken.fulfilled, (state, { payload }) => {
      const { type } = payload;
      state.userType = type;
    });
    builder.addCase(checkToken.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error(
            'Probléma lépett fel a korábban meghadott hitelesítési adatok ellenőrzése során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
        default:
          throw new Error(
            'Váratlan hiba lépett fel a kód feldolgozása során. Amennyiben a probléma nem oldódik meg többszöri próbálkozás után sem, kérem az alábbi gombra kattintva törölje ki ezeket, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.'
          );
      }
    });
  },
});

export const { actions: configActions, reducer: configReducer } = configSlice;
