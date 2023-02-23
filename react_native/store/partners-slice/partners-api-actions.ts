import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';

import env from '../../env.json';
import { LocalStorage, setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { mapFetchPartnersResponse } from './partners-api-mappers';
import {
  FetchPartnerListRequest,
  FetchPartnerListResponse,
  FetchPartnersRequest,
  FetchPartnersResponse,
  PartnerDetails,
} from './partners-slice-types';

export const fetchPartnerList = createAsyncThunk<
  FetchPartnerListResponse,
  FetchPartnerListRequest,
  { rejectValue: ErrorResponseT }
>('partners/fetchPartnerList', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<FetchPartnerListResponse>;
  try {
    response = await axios.get(`${env.api_url}/partner-lists`, {
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
      partners: { partnerLists: response.data.data },
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

export const removePartnerList = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'partners/removePartnerList',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        partners: {
          partnerLists: undefined,
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

export const fetchPartners = createAsyncThunk<
  PartnerDetails[],
  FetchPartnersRequest,
  { rejectValue: ErrorResponseT }
>('partners/fetchPartners', async (requestData, { rejectWithValue }) => {
  let partners: PartnerDetails[];
  try {
    const response: AxiosResponse<FetchPartnersResponse> = await axios.get(
      `${env.api_url}/partners`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${requestData.token}`,
          'X-Device-Id': requestData.deviceId,
        },
      }
    );

    partners = mapFetchPartnersResponse(response.data);
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      partners: { partners },
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
          partners: undefined,
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
