import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { mapFetchPartnersResponse } from './partners-api-mappers';
import { FetchPartnersRequest, Partners } from './partners-slice-types';

export const fetchPartners = createAsyncThunk<
  Partners,
  FetchPartnersRequest,
  { rejectValue: ErrorResponseT }
>('partners/fetchPartners', async (requestData, { rejectWithValue }) => {
  let partners: Partners;
  try {
    const response = await axios.get(`${env.api_url}/partners`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${requestData.token}`,
        'X-Device-Id': requestData.deviceId,
      },
    });

    partners = mapFetchPartnersResponse(response);
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      partners,
    } as Partial<LocalStorage>);
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return partners;
});

export const removePartners = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'partners/removePartners',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        partners: {
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
