/* eslint-disable import/no-duplicates */
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { trim } from 'ramda';

import { type CheckToken } from '../../../api/response-mappers/mapCheckTokenResponse';
import { type StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';
import { type StorageListItem } from '../../../atoms/storageFlow';

function mapToNr(index: number) {
  const stringIndex = String(index);

  if (index > 999) {
    return stringIndex;
  }

  return '0'.repeat(3 - stringIndex.length) + stringIndex + '.';
}

const documentType = '<!DOCTYPE html>';
const head = `
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rakjegyzék</title>

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

      body header {
        margin-bottom: 10px;
      }

      body header .title-row {
        display: flex;
        width: fit-content;
        border-bottom: 1px solid black;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }

      body header .title-row .title {
        text-transform: uppercase;
        padding-right: 5px;
        border-right: 1px solid black;
      }

      body header .title-row .date {
        padding-left: 5px;
      }

      body header .contestants {
        display: grid;
        width: fit-content;
        grid-template-columns: repeat(3, auto);
      }

      body header .contestants div {
        padding-right: 10px;
      }

      body header .date-column {
        justify-self: end;
      }

      body header .first-row {
        margin-bottom: 5px;
      }

      .item-grid {
        display: grid;
        grid-template-columns: repeat(9, auto);
        border-bottom: 2px solid black;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }

      .item-grid .item {
        padding-left: 5px;
        padding-right: 5px;
      }

      .item-grid .item.nr,
      .item-grid .item.item-name,
      .item-grid .item.total-label {
        padding-left: 0;
      }

      .item-grid .item.quantities,
      .item-grid .item.ok {
        padding-right: 0;
      }

      .item-grid .item.item-name,
      .item-grid .item.unit,
      .item-grid .item.starting-quantity,
      .item-grid .item.quantity-change,
      .item-grid .item.final-quantity,
      .item-grid .item.ok {
        border-bottom: 1px solid black;
        margin-bottom: 10px;
      }

      .item-grid .item.starting-quantity,
      .item-grid .item.quantity-change,
      .item-grid .item.final-quantity,
      .item-grid .item.ok,
      .item-grid .item.starting-total,
      .item-grid .item.total-change,
      .item-grid .item.ending-total {
        display: flex;
        justify-content: flex-end;
      }

      .item-grid .item.expires-at {
        grid-column: 3 / span 2;
      }

      .item-grid .item.barcode {
        grid-column: 5 / span 2;
      }

      .item-grid .item.quantities {
        grid-column: 7 / span 2;
      }

      .item-grid .item.item-name {
        grid-column: 1 / span 3;
        overflow-wrap: break-word;
      }

      .item-grid .item.unit {
        grid-column: 4 / span 2;
      }

      .item-grid .item.ok {
        align-items: center;
      }

      .square-check {
        width: 15px;
        height: 15px;
        border: 1px solid black;
        margin-bottom: 5px;
      }

      .item-grid .item.total-label {
        grid-column: 1 / span 5;
        grid-row: auto / span 2;
      }

      .item-grid .item.total-change {
        grid-column: 7 / span 1;
      }

      body footer {
        margin-top: 30px;
      }

      body footer .signatures-container {
        display: flex;
        justify-content: flex-end;
      }

      body footer .signatures-container .signatures {
        width: 60%;
        margin-right: 20px;
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 20px;
      }

      body footer .signatures-container .signatures div {
        display: flex;
        justify-content: center;
        width: 100%;
        border-top: 1px solid black;
      }

      body footer .end-delimiter {
        border-bottom: 1px dashed black;
        padding-bottom: 30px;
        margin-bottom: 20px;
      }
    </style>
  </head>`;

export function createPrintStorageChanges({
  receiptItems,
  storeDetails,
  user,
}: {
  receiptItems: StorageListItem[];
  storeDetails: StoreDetailsResponseData;
  user: CheckToken;
}) {
  const header = `
    <header>
      <div class="title-row">
        <div class="title">Rakjegyzék</div>
        <div class="date">
          ${format(new Date(), 'yyyy. MMMM do', { locale: hu })}
        </div>
      </div>
      <div class="contestants">
        <div>Rakodta:</div>
        <div>${user.userName}</div>
        <div>${user.name}</div>
        <div>Raktár:</div>
        <div>${storeDetails.code}</div>
        <div>${storeDetails.name}</div>
      </div>
    </header>`;

  const itemsList = `
    <div class="item nr">Ssz.</div>
    <div class="item article-number">Cikkszám</div>
    <div class="item expires-at">Lejárat</div>
    <div class="item barcode">Vonalkód</div>
    <div class="item quantities">Mennyiségek</div>
    <div class="item item-name">Megnevezés</div>
    <div class="item unit">Egység</div>
    <div class="item starting-quantity">Kezdő</div>
    <div class="item quantity-change">Mozgás</div>
    <div class="item final-quantity">Kész</div>
    <div class="item ok">Ok?</div>
  
    ${receiptItems
      .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name, 'HU-hu'))
      .map((item, index) => {
        const quantityChange = item.quantityChange ?? 0;
        const currentQuantity = (item.originalQuantity ?? 0) + quantityChange;

        return `
          <div class="item nr">${mapToNr(index + 1)}</div>
          <div class="item article-number">${item.articleNumber}</div>
          <div class="item expires-at">${item.expiresAt}</div>
          <div class="item barcode">
            ${trim(`${item.itemBarcode} ${item.expirationBarcode}`)}
          </div>
          <div class="item item-name">${item.name}</div>
          <div class="item unit">${item.unitName}</div>
          <div class="item starting-quantity">${item.originalQuantity || 0}</div>
          <div class="item quantity-change">
            ${quantityChange > 0 ? '+' : ''}${quantityChange}
          </div>
          <div class="item final-quantity">${currentQuantity}</div>
          <div class="item ok">
            <div class="square-check"></div>
          </div>`;
      })
      .join('')}`;

  const createItemsSummarySection = () => {
    const itemsSummary = receiptItems.reduce(
      (prev, item) => {
        const quantityChange = item.quantityChange ?? 0;
        const currentQuantity = (item.originalQuantity ?? 0) + quantityChange;

        return {
          originalQuantity:
            prev.originalQuantity + (item.originalQuantity ?? 0),
          in: quantityChange > 0 ? prev.in + quantityChange : prev.in,
          out: quantityChange < 0 ? prev.out + quantityChange : prev.out,
          currentQuantity: prev.currentQuantity + currentQuantity,
        };
      },
      {
        originalQuantity: 0,
        in: 0,
        out: 0,
        currentQuantity: 0,
      }
    );

    return `
      <div class="item total-label">
        Összesen (rakodva ${receiptItems.length} termék)
      </div>
      <div class="item starting-total">${itemsSummary.originalQuantity}</div>
      <div class="item total-change">+${itemsSummary.in}</div>

      <div class="item total-change">${itemsSummary.out}</div>
      <div class="item ending-total">${itemsSummary.currentQuantity}</div>`;
  };

  const footer = `
    <footer>
      <div class="signatures-container">
        <div class="signatures">
          <div>Rakodta</div>
          <div>Ellenőrizte</div>
        </div>
      </div>
      <div class="end-delimiter">
        |> ${format(new Date(), 'yyyy.MM.dd.')} | ${user.userName} | ${user.name} <|
      </div>
    </footer>`;

  return `
    ${documentType}
    <html lang="en">
      ${head}
      <body>
        ${header}
        <main>
          <div class="item-grid">
            ${itemsList}
            ${createItemsSummarySection()}
          </div>
        </main>
        ${footer}
      </body>
    </html>`;
}
