import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { mapFetchStoreResponse } from './stores-api-mappers';
import {
  FetchStoreListRequest,
  FetchStoreListResponse,
  FetchStoreRequest,
  FetchStoreResponse,
  StoreDetails,
} from './stores-slice-types';

export const fetchStoreList = createAsyncThunk<
  FetchStoreListResponse,
  FetchStoreListRequest,
  { rejectValue: ErrorResponseT }
>('stores/fetchStoreList', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchStoreListResponse>;
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
      stores: {
        storeList: response.data.data,
      },
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

export const removeStoreList = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'stores/removeStoreList',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        stores: {
          storeList: undefined,
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

export const fetchStore = createAsyncThunk<
  StoreDetails,
  FetchStoreRequest,
  { rejectValue: ErrorResponseT }
>('stores/fetchStore', async (requestData, { rejectWithValue }) => {
  let store: StoreDetails;
  try {
    const response: AxiosResponse<FetchStoreResponse> = await axios.get(
      `${env.api_url}/stores/${requestData.code}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${requestData.token}`,
          'X-Device-Id': requestData.deviceId,
        },
      }
    );

    store = mapFetchStoreResponse(response.data);
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      stores: {
        store,
      },
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
  'stores/removeStore',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        stores: {
          store: undefined,
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
