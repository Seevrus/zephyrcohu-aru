import { add, format } from 'date-fns';
import {
  ascend,
  assoc,
  defaultTo,
  filter,
  find,
  flatten,
  groupBy,
  isEmpty,
  keys,
  last,
  length,
  map,
  mapObjIndexed,
  not,
  path,
  pathOr,
  pickAll,
  pipe,
  prop,
  propEq,
  repeat,
  sortWith,
  values,
  __,
} from 'ramda';

import { Company } from '../config-slice/config-slice-types';
import { Item } from '../items-slice/items-slice-types';
import { PartnerDetails } from '../partners-slice/partners-slice-types';
import {
  ExpirationItem,
  OrderRequestItem,
  Receipt,
  ReceiptPayloadItem,
  ReceiptPlayloadVatAmount,
  ReceiptRequestItem,
  ReceiptTypeEnum,
} from './round-slice-types';

const mapReceiptToPayload = (receipt: Receipt, state): ReceiptRequestItem => {
  const agent = state.agents.data.find((a) => a.id === state.round.agentId);
  const partner = state.partners.partners.find((p) => p.id === receipt.partnerId);
  const priceList = partner?.priceList || {};
  const numberOfPartnerLocations = pipe(prop('locations'), keys, length)(partner);
  const { store } = state.stores;

  const connectedReceipt: Receipt | undefined =
    receipt.type === ReceiptTypeEnum.CANCEL && !!receipt.connectedSerialNumber
      ? state.round.receipts.find((r) => r.serialNumber === receipt.serialNumber)
      : undefined;

  const invoiceDate = new Date(path(['round', 'date'], state));
  const { invoiceType, paymentDays } = partner;
  const fulfillmentDate = add(invoiceDate, { days: paymentDays });
  const paidDate = fulfillmentDate;

  const receiptItems = receipt?.items ?? {};
  const receiptPayloadItems: ReceiptPayloadItem[] = pipe(
    keys,
    map((itemId) =>
      pipe(
        prop<Record<string, ExpirationItem>>(__, receiptItems),
        keys,
        map((expiresAt) => {
          const item = state.items.data.find((itm) => itm.id === +itemId);
          const priceListItem = priceList[item.id];
          const netPrice = priceListItem?.netPrice || item.netPrice;
          const netAmount = netPrice * receiptItems[itemId][expiresAt].quantity;
          const vatRateNumeric = defaultTo(0, +item.vatRate);
          const vatAmount = Math.round(netAmount * (vatRateNumeric / 100));

          return {
            code: '-1',
            CNCode: item.CNCode,
            articleNumber: item.articleNumber,
            expiresAt,
            name: item.name,
            quantity: receiptItems[itemId][expiresAt].quantity,
            unitName: item.unitName,
            netPrice,
            netAmount,
            vatRate: item.vatRate,
            vatAmount,
            grossAmount: netAmount + vatAmount,
          };
        })
      )(itemId)
    ),
    flatten,
    sortWith<ReceiptPayloadItem>([ascend(prop('name')), ascend(prop('expiresAt'))]),
    (items: ReceiptPayloadItem[]) =>
      items.map((item, index) => {
        const codeWithoutZeros = String(index + 1);
        const numLeadingZeros = 3 - codeWithoutZeros.length;
        const code = repeat('0', numLeadingZeros).join('') + codeWithoutZeros;
        return assoc('code', code, item);
      })
  )(receiptItems);

  const totals = receiptPayloadItems.reduce(
    (prev, item) => ({
      quantity: prev.quantity + item.quantity,
      netAmount: prev.netAmount + item.netAmount,
      vatAmount: prev.vatAmount + item.vatAmount,
      grossAmount: prev.grossAmount + item.grossAmount,
    }),
    {
      quantity: 0,
      netAmount: 0,
      vatAmount: 0,
      grossAmount: 0,
    }
  );

  // @ts-ignore
  const vatAmounts: ReceiptPlayloadVatAmount[] = pipe(
    groupBy<ReceiptPayloadItem, string>(prop('vatRate')),
    // @ts-ignore
    map((items) =>
      items.reduce(
        (prev, item) => ({
          vatRate: item.vatRate,
          netAmount: prev.netAmount + item.netAmount,
          vatAmount: prev.vatAmount + item.vatAmount,
          grossAmount: prev.grossAmount + item.grossAmount,
        }),
        {
          vatRate: '',
          netAmount: 0,
          vatAmount: 0,
          grossAmount: 0,
        }
      )
    ),
    values
  )(receiptPayloadItems);

  const roundedAmount =
    partner.paymentDays === 0 ? Math.round(totals.grossAmount / 5) * 5 : totals.grossAmount;
  const roundAmount = roundedAmount - totals.grossAmount;

  return {
    companyCode: path(['config', 'company', 'code'], state),
    partnerCode: prop('code', partner),
    partnerSiteCode: prop('siteCode', partner),
    receiptType: prop('receiptType', receipt),
    ...(!!connectedReceipt && {
      CISerialNumber: prop('serialNumber', connectedReceipt),
      CIYearCode: prop('yearCode', store),
    }),
    serialNumber: prop('serialNumber', receipt),
    yearCode: prop('yearCode', store),
    originalCopiesPrinted: prop('originalCopiesPrinted', receipt),
    vendor: pickAll(
      [
        'name',
        'country',
        'postalCode',
        'city',
        'address',
        'felir',
        'iban',
        'bankAccount',
        'vatNumber',
      ],
      pathOr<Company>({} as Company, ['config', 'company'], state)
    ),
    buyer: {
      ...(numberOfPartnerLocations === 2 && {
        name: path(['locations', 'C', 'name'], partner),
        country: path(['locations', 'C', 'country'], partner),
        postalCode: path(['locations', 'C', 'postalCode'], partner),
        city: path(['locations', 'C', 'city'], partner),
        address: path(['locations', 'C', 'address'], partner),
        deliveryName: path(['locations', 'D', 'name'], partner),
        deliveryCountry: path(['locations', 'D', 'country'], partner),
        deliveryPostalCode: path(['locations', 'D', 'postalCode'], partner),
        deliveryCity: path(['locations', 'D', 'city'], partner),
        deliveryAddress: path(['locations', 'D', 'address'], partner),
      }),
      ...(numberOfPartnerLocations === 1 && {
        name: path(['locations', 'D', 'name'], partner),
        country: path(['locations', 'D', 'country'], partner),
        postalCode: path(['locations', 'D', 'postalCode'], partner),
        city: path(['locations', 'D', 'city'], partner),
        address: path(['locations', 'D', 'address'], partner),
      }),
      iban: prop('iban', partner),
      bankAccount: prop('bankAccount', partner),
      vatNumber: prop('vatNumber', partner),
    },
    invoiceDate: path(['round', 'date'], state),
    fulfillmentDate: format(fulfillmentDate, 'yyyy-MM-dd'),
    invoiceType,
    paidDate: format(paidDate, 'yyyy-MM-dd'),
    agent: {
      code: prop('code', agent),
      name: prop('name', agent),
      phoneNumber: prop('phoneNumber', agent),
    },
    items: receiptPayloadItems,
    ...totals,
    vatAmounts,
    roundAmount,
    roundedAmount,
  };
};

export const getUpsertReceiptsPayload = (state): ReceiptRequestItem[] =>
  pipe(
    pathOr<Receipt[]>([], ['round', 'receipts']),
    filter(propEq('isSent', false)),
    map((receipt) => mapReceiptToPayload(receipt, state))
  )(state);

export const getLastReceiptPayload = (state): ReceiptRequestItem =>
  pipe(pathOr<Receipt[]>([], ['round', 'receipts']), last<Receipt>, (receipt) =>
    mapReceiptToPayload(receipt, state)
  )(state);

export const getReceiptPayloadBySn = (state, serialNumber: number): ReceiptRequestItem =>
  pipe(
    pathOr<Receipt[]>([], ['round', 'receipts']),
    find<Receipt>(propEq('serialNumber', serialNumber)),
    (receipt) => mapReceiptToPayload(receipt, state)
  )(state);

export const getUploadOrdersPayload = (state): OrderRequestItem[] => {
  const receipts: Receipt[] = pathOr([], ['round', 'receipts'], state);

  return receipts
    .filter((receipt) => not(isEmpty(receipt.orderItems)))
    .map((receipt) => {
      const partner: PartnerDetails = state.partners.partners.find(
        (p) => p.id === receipt.partnerId
      );

      return {
        partnerCode: partner.code,
        partnerSiteCode: partner.siteCode,
        orderDate: path<string>(['round', 'date'], state),
        items: values(
          mapObjIndexed((value, itemId) => {
            const item: Item = state.items.data.find((itm) => itm.id === +itemId);

            return {
              articleNumber: item.articleNumber,
              quantity: value.quantity,
            };
          }, receipt.orderItems)
        ),
      };
    });
};