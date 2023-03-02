import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

import env from '../../env.json';
import { removeLocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import {
  CheckTokenRequestT,
  CheckTokenResponseT,
  RegisterDeviceRequestT,
  RegisterDeviceResponseT,
} from './config-slice-types';

export const registerDevice = createAsyncThunk<
  RegisterDeviceResponseT,
  RegisterDeviceRequestT,
  { rejectValue: ErrorResponseT }
>('config/registerDevice', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<RegisterDeviceResponseT>;
  try {
    response = await axios.post(
      `${env.api_url}/tokens/register-device`,
      {
        deviceId: requestData.deviceId,
      },
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${requestData.token}` },
      }
    );
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      config: {
        userType: response.data.data?.type,
        company: response.data.data?.company,
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return response.data;
});

export const checkToken = createAsyncThunk<
  CheckTokenResponseT,
  CheckTokenRequestT,
  { rejectValue: ErrorResponseT }
>('config/checkToken', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<CheckTokenResponseT>;
  try {
    response = await axios.get(`${env.api_url}/tokens/check-token`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });
  } catch (e) {
    try {
      await setLocalStorage({
        config: {
          userType: undefined,
          company: undefined,
        },
        partnerLists: undefined,
        partners: undefined,
        items: undefined,
        storeList: undefined,
        store: undefined,
        round: undefined,
      });
    } catch (_) {
      return rejectWithValue(e.response.data);
    }

    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      config: {
        userType: response.data.data?.type,
        company: response.data.data?.company,
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return response.data;
});

export const unregisterDevice = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'config/unregisterDevice',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('boreal-device-id');
      await SecureStore.deleteItemAsync('boreal-token');
      await SecureStore.deleteItemAsync('boreal-store');
    } catch (e) {
      return rejectWithValue({
        status: 507,
        codeName: 'Insufficient Storage',
        message:
          'Probléma lépett fel a hitelesítési adatok eltávolítása során. Kérem próbálkozzon újra később.',
      });
    }

    try {
      await removeLocalStorage();
    } catch (e) {
      return rejectWithValue({
        status: 507,
        codeName: 'Insufficient Storage',
        message: e.message,
      });
    }

    return true;
  }
);
