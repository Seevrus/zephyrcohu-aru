import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { assoc, concat, map, path, pathOr, pipe, __ } from 'ramda';

import env from '../../env.json';
import { setLocalStorage } from '../async-storage';
import { ErrorResponseT } from '../base-types';
import { getUploadOrdersPayload, getUpsertReceiptsPayload } from './round-api-mappers';
import {
  CancelReceiptResponse,
  EndRoundApiRequest,
  InitializeRoundApiResponse,
  InitializeRoundRequest,
  InitializeRoundResponse,
  Receipt,
  ReceiptTypeEnum,
  UploadOrdersRequestT,
  UpsertReceiptsRequestT,
} from './round-slice-types';

export const initializeRound = createAsyncThunk<
  InitializeRoundResponse,
  InitializeRoundRequest,
  { rejectValue: ErrorResponseT }
>('round/initializeRound', async (requestData, { rejectWithValue }) => {
  let response: AxiosResponse<InitializeRoundApiResponse>;
  try {
    response = await axios.post(
      `${env.api_url}/rounds/start`,
      {
        agentCode: requestData.agentCode,
        agentName: requestData.agentName,
        storeCode: requestData.storeCode,
        storeName: requestData.storeName,
        partnerListId: requestData.partnerListId,
        partnerListName: requestData.partnerListName,
        roundAt: requestData.date,
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${requestData.token}`,
          'X-Device-Id': requestData.deviceId,
        },
      }
    );
  } catch (e) {
    return rejectWithValue(e.response.data);
  }

  try {
    await setLocalStorage({
      round: {
        started: true,
        roundId: response.data.data.roundId,
        agentId: requestData.agentId,
        storeId: requestData.storeId,
        partnerListId: requestData.partnerListId,
        date: requestData.date,
        nextAvailableSerialNumber: requestData.nextAvailableSerialNumber,
        currentReceipt: undefined,
        receipts: [],
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return {
    roundId: response.data.data.roundId,
    agentId: requestData.agentId,
    storeId: requestData.storeId,
    partnerListId: requestData.partnerListId,
    date: requestData.date,
    nextAvailableSerialNumber: requestData.nextAvailableSerialNumber,
  };
});

export const finalizeCurrentReceipt = createAsyncThunk<
  boolean,
  never,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/finalizeCurrentReceipt', async (_, { getState, rejectWithValue }) => {
  try {
    const state: any = getState();
    const { currentReceipt } = state.round;

    const receiptWithSerialNumber = assoc(
      'serialNumber',
      path(['round', 'nextAvailableSerialNumber'], state),
      currentReceipt
    );

    await setLocalStorage({
      round: {
        ...state.round,
        nextAvailableSerialNumber: receiptWithSerialNumber.serialNumber + 1,
        currentReceipt: undefined,
        receipts: concat(state.round.receipts, [receiptWithSerialNumber]),
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return true;
});

export const cancelReceipt = createAsyncThunk<
  CancelReceiptResponse,
  number,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/cancelReceipt', async (serialNumber, { getState, rejectWithValue }) => {
  let cancelSerialNumber: number;

  try {
    const state: any = getState();
    const receiptToCancel = state.round.receipts.find((r) => r.serialNumber === serialNumber);

    if (!receiptToCancel) {
      return rejectWithValue({
        status: 404,
        codeName: 'Not Found',
        message: 'Receipt not found.',
      });
    }

    if (receiptToCancel.type === ReceiptTypeEnum.CANCEL) {
      return rejectWithValue({
        status: 400,
        codeName: 'Bad Request',
        message: 'Cannot cancel a Cancel Receipt.',
      });
    }

    const cancelReceiptItems: any = map(
      (expirations) =>
        map(
          (expirationItem) => assoc('quantity', expirationItem.quantity * -1, expirationItem),
          expirations
        ),
      receiptToCancel.items
    );

    cancelSerialNumber = state.round.nextAvailableSerialNumber;

    const canceler: Receipt = {
      type: ReceiptTypeEnum.CANCEL,
      isSent: false,
      partnerId: receiptToCancel.partnerId,
      serialNumber: cancelSerialNumber,
      connectedSerialNumber: serialNumber,
      originalCopiesPrinted: 0,
      items: cancelReceiptItems,
      orderItems: {},
    };

    const newReceipts = pipe(
      pathOr<Receipt[]>([], ['round', 'receipts']),
      map((receipt) => {
        if (receipt.serialNumber !== serialNumber) return receipt;

        return assoc('connectedSerialNumber', cancelSerialNumber, receipt);
      }),
      concat<Receipt[]>(__, [canceler])
    )(state);

    await setLocalStorage({
      round: {
        ...state.round,
        nextAvailableSerialNumber: canceler.serialNumber + 1,
        currentReceipt: undefined,
        receipts: newReceipts,
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return { serialNumber, cancelSerialNumber };
});

export const upsertReceipts = createAsyncThunk<
  boolean,
  UpsertReceiptsRequestT,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/upsertReceipts', async (requestData, { getState, rejectWithValue }) => {
  const state: any = getState();
  const payload = getUpsertReceiptsPayload(state);

  if (payload?.length > 0) {
    try {
      await axios.post(
        `${env.api_url}/receipts`,
        {
          data: payload,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${requestData.token}`,
            'X-Device-Id': requestData.deviceId,
          },
        }
      );
    } catch (err) {
      return rejectWithValue(err.response.data);
    }

    try {
      await setLocalStorage({
        round: {
          ...state.round,
          receipts: map(assoc('isSent', true), state.round.receipts),
        },
      });
    } catch (e) {
      return rejectWithValue({
        status: 507,
        codeName: 'Insufficient Storage',
        message: e.message,
      });
    }
  }

  return true;
});

export const increaseOriginalCopiesPrinted = createAsyncThunk<
  number,
  number,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/increaseOriginalCopiesPrinted', async (serialNumber, { getState, rejectWithValue }) => {
  try {
    const state: any = getState();
    const receipts = state.round.receipts.map((receipt) => {
      if (receipt.serialNumber !== serialNumber) return receipt;

      return {
        ...receipt,
        isSent: false,
        originalCopiesPrinted: receipt.originalCopiesPrinted + 1,
      };
    });

    await setLocalStorage({
      round: {
        ...state.round,
        receipts,
      },
    });
  } catch (e) {
    return rejectWithValue({
      status: 507,
      codeName: 'Insufficient Storage',
      message: e.message,
    });
  }

  return serialNumber;
});

export const uploadOrders = createAsyncThunk<
  boolean,
  UploadOrdersRequestT,
  { getState: () => any; rejectValue: ErrorResponseT }
>('round/uploadOrders', async (requestData, { getState, rejectWithValue }) => {
  const state: any = getState();
  const payload = getUploadOrdersPayload(state);

  if (payload?.length > 0) {
    try {
      await axios.post(
        `${env.api_url}/orders`,
        {
          data: payload,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${requestData.token}`,
            'X-Device-Id': requestData.deviceId,
          },
        }
      );
    } catch (err) {
      return rejectWithValue(err.response.data);
    }

    try {
      await setLocalStorage({
        round: {
          ...state.round,
          receipts: map(assoc('orderItems', {}), state.round.receipts),
        },
      });
    } catch (e) {
      return rejectWithValue({
        status: 507,
        codeName: 'Insufficient Storage',
        message: e.message,
      });
    }
  }

  return true;
});

export const endRoundApi = createAsyncThunk<
  boolean,
  EndRoundApiRequest,
  { rejectValue: ErrorResponseT }
>('round/endRoundApi', async (requestData, { rejectWithValue }) => {
  try {
    await axios.post(
      `${env.api_url}/rounds/finish`,
      {
        id: requestData.roundId,
        lastSerialNumber: requestData.lastSerialNumber ?? 0,
        yearCode: requestData.yearCode ?? 0,
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${requestData.token}`,
          'X-Device-Id': requestData.deviceId,
        },
      }
    );
  } catch (err) {
    return rejectWithValue(err.response.data);
  }

  return true;
});

export const endRoundLocal = createAsyncThunk<boolean, never, { rejectValue: ErrorResponseT }>(
  'round/endRoundLocal',
  async (_, { rejectWithValue }) => {
    try {
      await setLocalStorage({
        agents: undefined,
        items: undefined,
        partners: undefined,
        partnerLists: undefined,
        round: undefined,
        storeList: undefined,
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