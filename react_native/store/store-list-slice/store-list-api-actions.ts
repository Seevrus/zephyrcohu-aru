import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { FetchStoresRequest, FetchStoresResponse } from './store-list-slice-types';

export const fetchStores = createAsyncThunk<
  FetchStoresResponse,
  FetchStoresRequest,
  { rejectValue: ErrorResponseT }
>('storeList/fetchStores', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchStoresResponse>;
  try {
    response = await axios.get(`${env.api_url}/stores`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      storeList: { fetched: true, data: response.data.data },
    } as Partial<LocalStorage>);
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return response.data;
});

export const removeStores = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'storeList/removeStores',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        storeList: {
          fetched: false,
          data: [],
        },
      } as Partial<LocalStorage>);
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
