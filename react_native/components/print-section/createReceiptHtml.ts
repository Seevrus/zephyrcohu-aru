import { propOr, repeat, take, takeLast } from 'ramda';

import { type ReceiptOtherItem } from '../../api/request-types/common/ReceiptItemsTypes';
import { type ReceiptVatAmount } from '../../api/request-types/common/ReceiptVatAmount';
import { type CheckToken } from '../../api/response-mappers/mapCheckTokenResponse';
import { type Partner } from '../../api/response-mappers/mapPartnersResponse';
import {
  type ContextReceipt,
  type ContextReceiptItem,
} from '../../providers/types/receipts-provider-types';
import { createUniqueDiscountedItems } from '../../utils/createUniqueDiscountedItems';

const documentType = '<!DOCTYPE html>';
const head = `
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bizonylat</title>

  <style>
    @page {
      margin: 10px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100vh;
    }

    body {
      font-family: 'Lucida Console';
      font-size: 7pt;
    }

    header {
      display: grid;
      grid-template-columns: repeat(2, auto);
      justify-items: stretch;
      row-gap: 5px;
      border-bottom: 2px solid black;
    }

    header .last-column {
      justify-self: end;
    }

    .title {
      text-transform: uppercase;
      text-decoration: underline;
    }

    .subtitle {
      text-decoration: underline;
    }

    .vendor,
    .buyer {
      padding: 5px 0;
      display: grid;
      grid-template-columns: 2fr 1fr;
      row-gap: 3px;
      column-gap: 5px;
      border-bottom: 1px solid black;
    }

    .vendor .subtitle,
    .buyer .subtitle {
      grid-column: 1 / -1;
    }

    .vendor .vendor-address,
    .buyer .buyer-name,
    .buyer .buyer-address {
      grid-column: 1 / -1;
    }

    .vendor .vendor-name,
    .vendor .vendor-bank,
    .buyer .buyer-bank {
      border-right: 1px solid black;
      padding-right: 5px;
    }

    .vendor .vendor-felir,
    .vendor .vendor-vat,
    .buyer .buyer-vat {
      justify-self: end;
    }

    .vendor .vendor-felir {
      text-transform: uppercase;
    }

    .buyer .delivery-address {
      grid-template-columns: repeat(1, auto);
    }

    .payment,
    .agent,
    .software {
      padding: 5px 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid black;
    }

    .software {
      border-bottom: 2px solid black;
    }

    .payment .payment-deadline,
    .payment .payment-method,
    .software .software-email,
    .software .software-currency {
      border-left: 1px solid black;
      padding-left: 5px;
    }

    .items .item-first-row,
    .items .item-second-row {
      display: grid;
      row-gap: 2px;
      column-gap: 3px;
    }

    .items .item-first-row {
      grid-template-columns: 4fr 7fr 8fr 7fr 40fr;
    }

    .items .item-first-row.label {
      border-bottom: 1px dashed black;
    }

    .items .item-first-row:not(.label) {
      font-size: 7pt;
    }

    .items .item-first-row:not(.label) .item-nr {
      font-size: 7pt;
    }

    .items .item-second-row {
      grid-template-columns: 8fr 15fr 8fr 10fr 3fr 10fr 10fr;
      border-bottom: 1px solid black;
    }

    .items .item-second-row.is-third-row {
      border-bottom: 0;
    }

    .items .item-second-row .amount {
      grid-column-start: 2;
    }

    .items .item-second-row .vat-label {
      grid-column: span 2;
    }

    .items .item-third-row {
      border-bottom: 1px solid black;
      padding-left: 10px;
      text-align: justify;
    }

    .items .item-third-row .comment-label {
      font-style: italic;
    }

    .total {
      display: grid;
      column-gap: 3px;
      padding: 5px 0;
      border-bottom: 2px solid black;
      grid-template-columns: 8fr 15fr 8fr 10fr 3fr 10fr 10fr;
    }

    .total .amount {
      grid-column: 4 / 6;
    }

    .total .vat {
      border: 0;
    }

    .vat,
    .rounding,
    .total-amount {
      display: grid;
      column-gap: 3px;
      padding: 5px 0;
      grid-template-columns: 8fr 15fr 8fr 10fr 3fr 10fr 10fr;
      border-bottom: 1px solid black;
    }

    .vat .label {
      grid-column: 1 / 4;
    }

    .rounding {
      border-bottom: 2px solid black;
    }

    .rounding .label {
      grid-column: 1 / 7;
    }

    .packing-info {
      padding: 5px 0;
      border-bottom: 1px solid black;
      text-align: justify;
    }

    .total-amount {
      font-size: 8pt;
      font-weight: 700;
    }

    .total-amount .label {
      grid-column: 1 / 6;
    }

    .total-amount .currency {
      justify-self: center;
    }

    footer {
      padding-top: 40px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 20px;
    }

    footer .signature {
      border-bottom: 1px solid black;
    }

    footer .vendor-signature,
    footer .vendor-label {
      grid-column-start: 2;
    }

    footer .vendor-label,
    footer .buyer-label {
      margin-top: 5px;
      justify-self: center;
    }

    footer .thank-you {
      grid-column: 1 / -1;
      overflow: hidden;
      white-space: nowrap;
    }

    footer .thank-you::after {
      content: ' ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯';
    }
  </style>
</head>
`;

const software = `
  <section class="software">
    <div class="software-name">SW: Zephyr Boreal 11.40.0000</div>
    <div class="software-email">zephyr.bt@gmail.com</div>
    <div class="software-currency">Pénznem: HUF</div>
  </section>
`;

const packingInfo = `
  <section class="packing-info">
    A számlán szereplő csomagolóanyagok a termékdíjfizetés alól mentesek, a termékdíj
    megfizetésre került. A népegészségügyi termékadó az eladót terheli.
  </section>
`;

const footer = `
  <footer>
    <div class="signature vendor-signature"></div>
    <div class="signature buyer-signature"></div>
    <div class="vendor-label">eladó</div>
    <div class="buyer-label">vevő</div>
    <div class="thank-you">Köszönjük a vásárlást!</div>
  </footer>`;

function getItemsSection({
  items,
  otherItems,
}: {
  items: ContextReceiptItem[];
  otherItems: ReceiptOtherItem[] | undefined;
}) {
  const sorter = (
    itemA: ContextReceiptItem | ReceiptOtherItem,
    itemB: ContextReceiptItem | ReceiptOtherItem
  ) => itemA.name.localeCompare(itemB.name, 'HU-hu');

  const allItems = [
    ...createUniqueDiscountedItems(items.sort(sorter)),
    ...(otherItems ?? []).sort(sorter),
  ];

  const itemRows = allItems.map((item, index) => {
    const code =
      index > 99
        ? `${index}.`
        : `${repeat('0', 3 - String(index).length)}${index}.`;
    const displayedVatRate =
      item.vatAmount === 0 ? `${item.vatRate}` : `${item.vatRate}%`;
    const displayedVatAmount = item.vatAmount === 0 ? '' : item.vatAmount;

    const CNCode = propOr<
      string,
      ContextReceiptItem | ReceiptOtherItem,
      string
    >('', 'CNCode', item);

    const expiresAt = propOr<
      string,
      ContextReceiptItem | ReceiptOtherItem,
      string
    >('', 'expiresAt', item);

    const itemComment = propOr<
      string,
      ContextReceiptItem | ReceiptOtherItem,
      string
    >(
      propOr<string, ContextReceiptItem | ReceiptOtherItem, string>(
        '',
        'comment',
        item
      ),
      'discountName',
      item
    );

    return `
      <div class="item-first-row">
        <div class="item-nr">${code}</div>
        <div>${take(4, CNCode)}&nbsp;${takeLast(2, CNCode)}</div>
        <div>${item.articleNumber}</div>
        <div>${expiresAt}</div>
        <div>${item.name}</div>
      </div>
      <div class="item-second-row ${itemComment ? 'is-third-row' : ''}">
        <div class="amount">${item.quantity} ${item.unitName}</div>
        <div>${item.netPrice}</div>
        <div>${item.netAmount}</div>
        <div>${displayedVatRate}</div>
        <div>${displayedVatAmount}</div>
        <div>${item.grossAmount}</div>
      </div>
      ${
        itemComment &&
        `<div class="item-third-row">
          <span class="comment-label">Megjegyzés:</span>
          <span class="comment">${itemComment}</span>
        </div>`
      }
    `;
  });

  return `
    <section class="items">
      <div class="item-odd-row label">
        <div class="item-nr">Ssz.</div>
        <div>VTSZ</div>
        <div>Cikkszám</div>
        <div>Lejárat</div>
        <div>Megnevezés</div>
      </div>
      <div class="item-even-row label">
        <div class="amount">Mennyiség<br />és menny.egység</div>
        <div>Nettó<br />egységár</div>
        <div>Összeg</div>
        <div class="vat-label">ÁFA kulcsa<br />és összege</div>
        <div>Bruttó<br />összeg</div>
      </div>
      ${itemRows.join('')}
    </section>
  `;
}

function getVatSection(vatAmounts: ReceiptVatAmount[]) {
  const vatRows = vatAmounts.map((amount) => {
    const displayedVatRate =
      amount.vatAmount === 0 ? `${amount.vatRate}` : `${amount.vatRate}%`;
    const displayedVatAmount = amount.vatAmount === 0 ? '' : amount.vatAmount;

    return `
      <div class="label">ÁFA összesen</div>
      <div class="amount">${amount.netAmount}</div>
      <div class="vat-key">${displayedVatRate}</div>
      <div class="vat-amount">${displayedVatAmount}</div>
      <div class="gross">${amount.grossAmount}</div>
    `;
  });

  return `
    <section class="vat">
      ${vatRows.join('')}
    </section>
  `;
}

export function createReceiptHtml({
  user,
  receipt,
  partner,
}: {
  user: CheckToken | undefined;
  receipt: ContextReceipt;
  partner: Partner;
}) {
  const originalOrCopy =
    receipt.invoiceType === 'E' ||
    receipt.originalCopiesPrinted >= partner.invoiceCopies
      ? 'Másolat'
      : `Eredeti: ${receipt.originalCopiesPrinted + 1}./${
          partner.invoiceCopies
        } példány`;

  const serialNumberDisplay = `Számlaszám: ${receipt.serialNumber}/${receipt.yearCode}`;

  const header = `
    <header>
      <div>${serialNumberDisplay}</div>
      <div class="last-column">${originalOrCopy}</div>
    </header>
  `;

  const vendor = `
    <section class="vendor">
      <div class="subtitle">Eladó</div>
      <div class="vendor-name">Neve: ${receipt.vendor.name}</div>
      <div class="vendor-felir">Felir: ${receipt.vendor.felir}</div>
      <div class="vendor-address">
        Címe: ${receipt.vendor.postalCode} ${receipt.vendor.city}, ${receipt.vendor.address}
      </div>
      <div class="vendor-bank">Bank: ${receipt.vendor.iban}-${receipt.vendor.bankAccount}</div>
      <div class="vendor-vat">Adószám: ${receipt.vendor.vatNumber}</div>
    </section>
  `;

  const buyer = `
    <section class="buyer">
      <div class="subtitle">Vevő</div>
      <div class="buyer-name">Neve: ${receipt.buyer.name}</div>
      <div class="buyer-address">
        Címe: ${receipt.buyer.postalCode} ${receipt.buyer.city}, ${receipt.buyer.address}
      </div>
      <div class="buyer-bank">Bank: ${receipt.buyer.iban}-${receipt.buyer.bankAccount}</div>
      <div class="buyer-vat">Adószám: ${receipt.buyer.vatNumber}</div>
    </section>
  `;

  const hasDeliveryData = !!receipt.buyer.deliveryName;
  const deliveryData = `
    <section class="buyer delivery-address">
      <div class="subtitle">Vevő szállítási címe</div>
      <div class="buyer-name">Neve: ${receipt.buyer.deliveryName}</div>
      <div class="buyer-address">
        Címe: ${receipt.buyer.deliveryPostalCode} ${receipt.buyer.deliveryCity}, ${receipt.buyer.deliveryAddress}
      </div>
    </section>
  `;

  const paymentMethodDisplay =
    partner.paymentDays === 0 ? 'Készpénz' : 'Átutalás';
  const payment = `
    <section class="payment">
      <div>Kelt: ${receipt.invoiceDate}</div>
      <div class="payment-deadline">Teljesítés: ${receipt.fulfillmentDate}</div>
      <div class="payment-method">Fizetés: ${paymentMethodDisplay}, ${receipt.paidDate}</div>
    </section>
  `;

  const agent = `
    <section class="agent">
      <div class="agent-name">Üzletkötő: ${user?.name}</div>
      <div class="agent-phone">${user?.phoneNumber ?? ''}</div>
    </section>
  `;

  const displayedVatAmount = receipt.vatAmount === 0 ? '' : receipt.vatAmount;
  const total = `
    <section class="total">
      <div class="label">Összes:</div>
      <div class="quantity">${receipt.quantity}</div>
      <div class="amount">${receipt.netAmount}</div>
      <div class="vat">${displayedVatAmount}</div>
      <div class="gross">${receipt.grossAmount}</div>
    </section>
  `;

  const hasRounding = partner.paymentDays === 0;
  const rounding = `
    <section class="rounding">
      <div class="label">Kerekítés (5 forintra) összege</div>
      <div class="amount">${Math.abs(receipt.roundAmount)}</div>
    </section>
  `;

  const totalAmount = `
    <section class="total-amount">
      <div class="label">Számla mindösszesen: (fizetendő)</div>
      <div class="currency">(HUF)</div>
      <div class="amount">${Math.abs(receipt.roundedAmount)}</div>
    </section>
  `;

  return `
    ${documentType}
    <html lang="en">
      ${head}
      <body>
        ${header}
        <main>
          ${vendor}
          ${buyer}
          ${hasDeliveryData ? deliveryData : ''}
          ${payment}
          ${agent}
          ${software}
          ${getItemsSection({
            items: receipt.items,
            otherItems: receipt.otherItems,
          })}
          ${total}
          ${getVatSection(receipt.vatAmounts)}
          ${hasRounding ? rounding : ''}
          ${totalAmount}
          ${packingInfo}
        </main>
        ${footer}
      </body>
    </html>`;
}
