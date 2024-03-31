import { propOr, repeat, take, takeLast } from 'ramda';

import { type ReceiptOtherItem } from '../../api/request-types/common/ReceiptItemsTypes';
import { type ReceiptVatAmount } from '../../api/request-types/common/ReceiptVatAmount';
import { type CheckToken } from '../../api/response-mappers/mapCheckTokenResponse';
import { type Partner } from '../../api/response-mappers/mapPartnersResponse';
import {
  type ContextReceipt,
  type ContextReceiptItem,
} from '../../atoms/receipts';
import { createUniqueDiscountedItems } from '../../utils/createUniqueDiscountedItems';

const documentType = '<!DOCTYPE html>';
const head = `
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Számla</title>

    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 5px;
        width: 100%;
      }

      body {
        font-family: 'Lucida Console';
        font-size: 12px;
      }

      header .title-row {
        display: flex;
        width: fit-content;
        border-bottom: 1px solid black;
        margin-bottom: 5px;
      }

      header .title-row .title {
        text-transform: uppercase;
      }

      header .receipt-nr {
        display: grid;
        grid-template-columns: repeat(2, auto);
        justify-items: stretch;
        row-gap: 5px;
        border-bottom: 2px solid black;
      }

      header .receipt-nr .last-column {
        justify-self: end;
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

      .buyer.delivery-address {
        border-bottom: 2px solid black;
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

      .metadata {
        padding: 5px 0;
        display: grid;
        grid-template-columns: repeat(2, auto);
        row-gap: 3px;
        column-gap: 5px;
        border-bottom: 1px solid black;
      }

      .metadata .agent-title,
      .metadata .software-title {
        grid-column: auto / span 2;
      }

      .item-grid {
        display: grid;
        grid-template-columns: repeat(7, auto);
      }

      .item-grid .number {
        display: flex;
        justify-content: flex-end;
      }

      .item-grid .item-nr,
      .item-grid .vtsz,
      .item-grid .serial-nr,
      .item-grid .expires,
      .item-grid .item-name,
      .item-grid .amount-label,
      .item-grid .amount,
      .item-grid .unit,
      .item-grid .net-price,
      .item-grid .net-amount,
      .item-grid .vat-label,
      .item-grid .vat-key,
      .item-grid .vat-amount,
      .item-grid .gross-amount,
      .item-grid .total-label,
      .item-grid .total-amount,
      .item-grid .total-vat-label,
      .item-grid .total-net-amount,
      .item-grid .total-vat-key,
      .item-grid .total-vat-amount,
      .item-grid .total-gross-amount,
      .item-grid .rounding-label,
      .item-grid .rounded-gross-amount,
      .item-grid .total-receipt-amount-label,
      .item-grid .total-receipt-amount {
        padding-left: 5px;
        padding-right: 5px;
      }

      .item-grid .item-nr,
      .item-grid .amount-label,
      .item-grid .amount,
      .item-grid .total-label,
      .item-grid .total-vat-label,
      .item-grid .rounding-label,
      .item-grid .total-receipt-amount-label {
        padding-left: 0;
      }

      .item-grid .item-nr,
      .item-grid .vtsz,
      .item-grid .serial-nr,
      .item-grid .expires,
      .item-grid .item-name {
        border-bottom: 1px dashed black;
        margin-bottom: 5px;
      }

      .item-grid .amount,
      .item-grid .unit,
      .item-grid .net-price,
      .item-grid .net-amount,
      .item-grid .vat-key,
      .item-grid .vat-amount,
      .item-grid .gross-amount {
        border-bottom: 1px dashed black;
        margin-bottom: 5px;
      }

      .item-grid .amount-label,
      .item-grid .amount:not(.has-third-row),
      .item-grid .unit:not(.has-third-row),
      .item-grid .net-price:not(.has-third-row),
      .item-grid .net-amount:not(.has-third-row),
      .item-grid .vat-label,
      .item-grid .vat-key:not(.has-third-row),
      .item-grid .vat-amount:not(.has-third-row),
      .item-grid .gross-amount:not(.has-third-row) {
        border-bottom: 1px solid black;
        margin-bottom: 10px;
      }

      .item-grid .item-name,
      .item-grid .gross-amount,
      .item-grid .total-gross-amount,
      .item-grid .rounded-gross-amount,
      .item-grid .total-receipt-amount {
        padding-right: 0;
      }

      .item-grid .item-name {
        grid-column: 5 / span 3;
      }

      .item-grid .amount-label {
        grid-column: 1 / span 2;
      }

      .item-grid .vat-label {
        grid-column: 5 / span 2;
      }

      .item-grid .amount {
        grid-column: 1 / span 1;
      }

      .item-grid .comment-row {
        grid-column: 1 / span 7;
        margin-top: 5px;
        border-bottom: 1px solid black;
        margin-bottom: 10px;
      }

      .item-grid .total-label,
      .item-grid .total-amount,
      .item-grid .net-amount.total,
      .item-grid .vat-amount.total,
      .item-grid .gross-amount.total {
        border-bottom: 2px solid black;
        margin-bottom: 10px;
      }

      .item-grid .total-label {
        grid-column: 1 / span 2;
      }

      .item-grid .vat-amount.total {
        grid-column: auto / span 2;
      }

      .item-grid .total-vat-label {
        grid-column: 1 / span 3;
      }

      .item-grid .rounding-label {
        grid-column: 1 / span 6;
      }

      .item-grid .rounding-label,
      .item-grid .rounded-gross-amount {
        border-bottom: 2px solid black;
        margin-bottom: 10px;
      }

      .item-grid .total-receipt-amount-label {
        grid-column: 1 / span 6;
      }

      .item-grid .total-receipt-amount-label,
      .item-grid .total-receipt-amount {
        border-bottom: 1px solid black;
        margin-bottom: 10px;
      }

      footer {
        padding-top: 40px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 20px;
        margin-bottom: 30px;
        border-bottom: 1px dashed black;
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
        text-transform: uppercase;
        margin-bottom: 20px;
      }

      footer .thank-you::after {
        content: ' ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯';
      }
    </style>
  </head>`;

const packingInfo = `
  <section class="packing-info">
    A számlán szereplő csomagolóanyagok mentesek a termékdíjfizetés alól, a
    termékdíj megfizetésre került. A NÉTA az eladót terheli.
  </section>`;

const footer = `
  <footer>
    <div class="signature vendor-signature"></div>
    <div class="signature buyer-signature"></div>
    <div class="vendor-label">eladó</div>
    <div class="buyer-label">vevő</div>
    <div class="thank-you">Köszönjük a vásárlást!</div>
  </footer>`;

function getItemsList({
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
      <div class="item-nr">${code}</div>
      <div class="vtsz">${take(4, CNCode)} ${takeLast(2, CNCode)}</div>
      <div class="serial-nr">${item.articleNumber}</div>
      <div class="expires">${expiresAt}</div>
      <div class="item-name">${item.name}</div>
      <div class="amount number">${item.quantity}</div>
      <div class="unit">${item.unitName}</div>
      <div class="net-price number">${item.netPrice}</div>
      <div class="net-amount number">${item.netAmount}</div>
      <div class="vat-key number">${displayedVatRate}</div>
      <div class="vat-amount number">${displayedVatAmount}</div>
      <div class="gross-amount number">${item.grossAmount}</div>
      ${
        itemComment &&
        `
        <div class="comment-row">
          <span class="comment-label">Megjegyzés:</span>
          <span class="comment">${itemComment}</span>
        </div>`
      }`;
  });

  return `
    <div class="item-nr">Ssz.</div>
    <div class="vtsz">VTSZ</div>
    <div class="serial-nr">Cikkszám</div>
    <div class="expires">Lejárat</div>
    <div class="item-name">Megnevezés</div>
    <div class="amount-label">Mennyiség és menny. egység</div>
    <div class="net-price">Nettó egységár</div>
    <div class="net-amount">Összeg</div>
    <div class="vat-label">ÁFA kulcsa és összege</div>
    <div class="gross-amount">Bruttó összeg</div>
  
    ${itemRows.join('')}`;
}

function getVatList(vatAmounts: ReceiptVatAmount[]) {
  return vatAmounts
    .map((amount) => {
      const displayedVatRate =
        amount.vatAmount === 0 ? `${amount.vatRate}` : `${amount.vatRate}%`;
      const displayedVatAmount = amount.vatAmount === 0 ? '' : amount.vatAmount;

      return `
        <div class="total-vat-label">ÁFA összesen</div>
        <div class="total-net-amount number">${amount.netAmount}</div>
        <div class="total-vat-key number">${displayedVatRate}</div>
        <div class="total-vat-amount number">${displayedVatAmount}</div>
        <div class="total-gross-amount number">${amount.grossAmount}</div>`;
    })
    .join('');
}

function getOneReceiptBody({
  user,
  receipt,
  partner,
  copy,
}: {
  user: CheckToken;
  receipt: ContextReceipt;
  partner: Partner;
  copy: number;
}) {
  const serialNumberDisplay = `Számlaszám: ${receipt.serialNumber}/${receipt.yearCode}`;

  const copies =
    partner.invoiceType === 'E' || receipt.isPrinted
      ? 'Másolat'
      : `Eredeti: ${copy}./${partner.invoiceCopies} példány`;

  const header = `
    <header>
      <div class="title-row">
        <div class="title">Számla</div>
      </div>
      <div class="receipt-nr">
        <div>${serialNumberDisplay}</div>
        <div class="last-column">
          ${copies}
        </div>
      </div>
    </header>`;

  const vendor = `
    <section class="vendor">
      <div class="subtitle">Eladó</div>
      <div class="vendor-name">
        Neve: ${receipt.vendor.name}
      </div>
      <div class="vendor-felir">Felir: ${receipt.vendor.felir}</div>
      <div class="vendor-address">
        Címe: ${receipt.vendor.postalCode} ${receipt.vendor.city}, ${receipt.vendor.address}
      </div>
      <div class="vendor-bank">
        Bank: ${receipt.vendor.iban}-${receipt.vendor.bankAccount}
      </div>
      <div class="vendor-vat">Adószám: ${receipt.vendor.vatNumber}</div>
    </section>`;

  const buyer = `
    <section class="buyer">
      <div class="subtitle">Vevő (partner):</div>
      <div class="buyer-name">
        Neve: ${receipt.buyer.name}
      </div>
      <div class="buyer-address">
        Címe: ${receipt.buyer.postalCode} ${receipt.buyer.city}, ${receipt.buyer.address}
      </div>
      <div class="buyer-bank">
        Bank: ${receipt.buyer.iban}-${receipt.buyer.bankAccount}
      </div>
      <div class="buyer-vat">Adószám: ${receipt.buyer.vatNumber}</div>
    </section>`;

  const hasDeliveryData = !!receipt.buyer.deliveryName;
  const deliveryData = `
    <section class="buyer delivery-address">
      <div class="subtitle">Vevő (bolt, szállítási cím):</div>
      <div class="buyer-name">
        Neve: ${receipt.buyer.deliveryName}
      </div>
      <div class="buyer-address">
        Címe: ${receipt.buyer.deliveryPostalCode} ${receipt.buyer.deliveryCity}, ${receipt.buyer.deliveryAddress}
      </div>
    </section>`;

  const paymentMethodDisplay =
    partner.paymentDays === 0 ? 'Készpénz' : 'Átutalás';
  const metadata = `
    <section class="metadata">
      <div>Kelt és teljesítés:</div>
      <div>${receipt.invoiceDate}</div>
      <div>Fizetés:</div>
      <div>${paymentMethodDisplay}, ${receipt.paidDate}</div>
      <div class="agent-title">Üzletkötő:</div>
      <div>${user.name}</div>
      <div>${user.phoneNumber}</div>
      <div class="software-title">Szoftver:</div>
      <div>Zephyr Boreal 11.40.0000</div>
      <div>zephyr.bt@gmail.com</div>
    </section>`;

  const displayedVatAmount = receipt.vatAmount === 0 ? '' : receipt.vatAmount;
  const total = `
    <div class="total-label">Összes:</div>
    <div class="total-amount number">${receipt.quantity}</div>
    <div class="net-amount total number">${receipt.netAmount}</div>
    <div class="vat-amount total number">${displayedVatAmount}</div>
    <div class="gross-amount total number">>${receipt.grossAmount}</div>`;

  const hasRounding = partner.paymentDays === 0;
  const rounding = `
    <div class="rounding-label">Kerekítés (5 forintra) összege</div>
    <div class="rounded-gross-amount number">${Math.abs(receipt.roundAmount)}</div>`;

  const totalAmount = `
    <div class="total-receipt-amount-label">
      Számla mindösszesen: (fizetendő)
    </div>
    <div class="total-receipt-amount number">${Math.abs(receipt.roundedAmount)}</div>`;

  return `
    ${header}
    <main>
      ${vendor}
      ${buyer}
      ${hasDeliveryData ? deliveryData : ''}
      ${metadata}
      <section class="item-grid">
        ${getItemsList({
          items: receipt.items,
          otherItems: receipt.otherItems,
        })}
        ${total}
        ${getVatList(receipt.vatAmounts)}
        ${hasRounding ? rounding : ''}
        ${totalAmount}
      </section>
      ${packingInfo}
    </main>
    ${footer}`;
}

export function createReceiptHtml({
  user,
  receipt,
  partner,
}: {
  user: CheckToken;
  receipt: ContextReceipt;
  partner: Partner;
}) {
  const numberOfPrints =
    partner.invoiceType === 'E' || receipt.isPrinted
      ? 2
      : partner.invoiceCopies;

  return `
    ${documentType}
    <html lang="en">
      ${head}
      <body>
        ${[...Array.from({ length: numberOfPrints }).keys()]
          .map((copy) =>
            getOneReceiptBody({ user, receipt, partner, copy: copy + 1 })
          )
          .join('')}
      </body>
    </html>`;
}
