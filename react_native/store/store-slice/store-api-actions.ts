import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { mapFetchStoreResponse } from './api-mappers';
import { FetchStoreRequest, Store } from './store-slice-types';

export const fetchStore = createAsyncThunk<
  Store,
  FetchStoreRequest,
  { rejectValue: ErrorResponseT }
>('store/fetchStore', async (requestData, { rejectWithValue }) => {
  let store: Store;
  try {
    const response = await axios.get(`${env.api_url}/stores/${requestData.code}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });

    store = mapFetchStoreResponse(response.data);
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      store,
    } as Partial<LocalStorage>);
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return store;
});

export const removeStore = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'store/removeStore',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        store: {
          items: {},
          partners: [],
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
