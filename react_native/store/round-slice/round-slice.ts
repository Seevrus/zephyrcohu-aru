/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { assoc, concat, dissocPath, map, mergeDeepLeft, pipe, prop, propOr, values } from 'ramda';

import { LocalStorage } from '../async-storage';
import {
  cancelReceipt,
  endErrand,
  finalizeCurrentReceipt,
  increaseOriginalCopiesPrinted,
  initializeRound,
  uploadOrders,
  upsertReceipts,
} from './round-api-actions';
import { Item, OrderItem, Receipt, ReceiptTypeEnum, Round } from './round-slice-types';

const initialState: Round = {
  started: undefined,
  agentId: undefined,
  storeId: undefined,
  partnerListId: undefined,
  date: undefined,
  nextAvailableSerialNumber: undefined,
  currentReceipt: undefined,
  receipts: [],
};

const roundSlice = createSlice({
  name: 'round',
  initialState,
  reducers: {
    mergeLocalState: (state, { payload }: PayloadAction<LocalStorage['round']>) => {
      state.started = payload?.started;
      state.agentId = payload?.agentId;
      state.storeId = payload?.storeId;
      state.partnerListId = payload?.partnerListId;
      state.date = payload?.date;
      state.nextAvailableSerialNumber = payload?.nextAvailableSerialNumber;
      state.currentReceipt = payload?.currentReceipt;
      state.receipts = pipe(
        mergeDeepLeft(state.receipts),
        values
      )(propOr([], 'receipts', payload) as Round['receipts']) as Round['receipts'];
    },
    addNewReceipt: (state) => {
      state.currentReceipt = {
        type: ReceiptTypeEnum.NORMAL,
        isSent: false,
        partnerId: undefined,
        serialNumber: -1,
        originalCopiesPrinted: 0,
        items: {},
        orderItems: {},
      };
    },
    selectPartner: (state, { payload }: PayloadAction<number>) => {
      state.currentReceipt.partnerId = payload;
      state.currentReceipt.items = {};
      state.currentReceipt.orderItems = {};
    },
    putItems: (state, { payload }: PayloadAction<Item>) => {
      state.currentReceipt.items = payload;
    },
    removeItem: (state, { payload }: PayloadAction<{ id: number; expiresAt: string }>) => {
      state.currentReceipt.items = dissocPath(
        [payload.id, payload.expiresAt],
        state.currentReceipt.items
      );
    },
    putOrderItems: (state, { payload }: PayloadAction<OrderItem>) => {
      state.currentReceipt.orderItems = payload;
    },
    removeLastUnsentReceipt: (state) => {
      state.currentReceipt = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeRound.fulfilled, (state, { payload }) => {
      state.started = true;
      state.agentId = payload.agentId;
      state.storeId = payload.storeId;
      state.partnerListId = payload.partnerListId;
      state.date = payload.date;
      state.nextAvailableSerialNumber = payload.nextAvailableSerialNumber;
      state.receipts = [];
    });
    builder.addCase(initializeRound.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });

    builder.addCase(finalizeCurrentReceipt.fulfilled, (state) => {
      const { currentReceipt } = state;
      const receiptWithSerialNumber = assoc(
        'serialNumber',
        prop('nextAvailableSerialNumber', state),
        currentReceipt
      );
      state.receipts = concat(state.receipts, [receiptWithSerialNumber]);
      state.nextAvailableSerialNumber = receiptWithSerialNumber.serialNumber + 1;
      state.currentReceipt = undefined;
    });
    builder.addCase(finalizeCurrentReceipt.rejected, () => {
      throw new Error('Váratlan hiba lépett fel a számlaadatok háttértárra mentése során.');
    });

    builder.addCase(cancelReceipt.fulfilled, (state, { payload }) => {
      const receiptToCancel = state.receipts.find((r) => r.serialNumber === payload.serialNumber);
      const cancelReceiptItems: any = map(
        (expirations) =>
          map(
            (expirationItem) => assoc('quantity', expirationItem.quantity * -1, expirationItem),
            expirations
          ),
        receiptToCancel.items
      );

      const canceler: Receipt = {
        type: ReceiptTypeEnum.CANCEL,
        isSent: false,
        partnerId: receiptToCancel.partnerId,
        serialNumber: state.nextAvailableSerialNumber,
        connectedSerialNumber: receiptToCancel.serialNumber,
        originalCopiesPrinted: 0,
        items: cancelReceiptItems,
        orderItems: {},
      };

      state.receipts = concat(state.receipts, [canceler]);
      state.nextAvailableSerialNumber = canceler.serialNumber + 1;
    });
    builder.addCase(cancelReceipt.rejected, () => {
      throw new Error('Váratlan hiba lépett fel a storno számla háttértárra mentése során.');
    });

    builder.addCase(upsertReceipts.fulfilled, (state) => {
      state.receipts = map(assoc('isSent', true), state.receipts);
    });
    builder.addCase(upsertReceipts.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('A beírt token érvénytelen.');
        case 422:
          throw new Error(
            'A szerver visszautasította a számlát, mert annak formátuma nem megfelelő.'
          );
        case 507:
          throw new Error('Váratlan hiba lépett fel a számlaadatok háttértárra mentése során.');
        default:
          throw new Error('Váratlan hiba lépett fel a számlaadatok beküldése során.');
      }
    });

    builder.addCase(increaseOriginalCopiesPrinted.fulfilled, (state, { payload: serialNumber }) => {
      state.receipts = state.receipts.map((receipt) => {
        if (receipt.serialNumber !== serialNumber) return receipt;

        return {
          ...receipt,
          isSent: false,
          originalCopiesPrinted: receipt.originalCopiesPrinted + 1,
        };
      });
    });
    builder.addCase(increaseOriginalCopiesPrinted.rejected, () => {
      throw new Error('Váratlan hiba lépett fel a számlaadatok háttértárra mentése során.');
    });

    builder.addCase(uploadOrders.fulfilled, (state) => {
      state.receipts = map(assoc('orderItems', {}), state.receipts);
    });
    builder.addCase(uploadOrders.rejected, (_, { payload }) => {
      switch (payload.status) {
        case 401:
          throw new Error('A beírt token érvénytelen.');
        case 422:
          throw new Error(
            'A szerver visszautasította a rendelést, mert annak formátuma nem megfelelő.'
          );
        case 507:
          throw new Error('Váratlan hiba lépett fel a beküldött rendelések eltávolítása során.');
        default:
          throw new Error('Váratlan hiba lépett fel a rendelés beküldése során.');
      }
    });

    builder.addCase(endErrand.fulfilled, (state) => {
      state.started = false;
      state.agentId = undefined;
      state.storeId = undefined;
      state.partnerListId = undefined;
      state.date = undefined;
      state.nextAvailableSerialNumber = undefined;
      state.currentReceipt = undefined;
      state.receipts = [];
    });
    builder.addCase(endErrand.rejected, (_, { payload }) => {
      throw new Error(payload.message);
    });
  },
});

export const { actions: roundActions, reducer: roundReducer } = roundSlice;
