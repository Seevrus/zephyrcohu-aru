import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { mapFetchStoreResponse, removeReceiptQuantitiesFromStore } from './stores-api-mappers';
import {
  FetchStoreListRequest,
  FetchStoreListResponse,
  FetchStoreRequest,
  FetchStoreResponse,
  StoreDetails,
  StoreItem,
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
      storeList: response.data.data,
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

export const removeStoreList = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'stores/removeStoreList',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        storeList: undefined,
      });
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
      store,
    });
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
        store: undefined,
      });
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

export const removeItemsFromStore = createAsyncThunk<
  Record<string, StoreItem>,
  never,
  { getState: () => any; rejectValue: ErrorResponseT }
>('stores/removeItemsFromStore', async (_, { getState, rejectWithValue }) => {
  let newItems: Record<string, StoreItem>;
  try {
    const state = getState() as any;

    newItems = removeReceiptQuantitiesFromStore(
      state.stores.store.items,
      state.round.currentReceipt
    );

    await setLocalStorage({
      store: {
        ...state.stores.store,
        items: newItems,
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return newItems;
});

export const upsertReceipts = () => {};
