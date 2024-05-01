/* eslint-disable import/no-duplicates */
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { join, map, pipe, prepend, prop, sortBy } from 'ramda';

import { type CheckToken } from '../../api/response-mappers/mapCheckTokenResponse';
import { type PartnersListResponseData } from '../../api/response-types/PartnersListResponseType';
import { type StoreDetailsResponseData } from '../../api/response-types/StoreDetailsResponseType';
import { type ContextReceipt } from '../../atoms/receipts';

const documentType = '<!DOCTYPE html>';
const head = `
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Körzárásos lista</title>

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
        width: 100%;
        column-gap: 5px;
        grid-template-columns: repeat(3, auto);
      }

      body header .contestants div.round-start {
        justify-self: end;
        border-right: 1px solid black;
      }

      .items {
        display: grid;
        grid-template-columns: repeat(5, auto);
        column-gap: 5px;
        row-gap: 5px;
      }

      .items > div {
        display: flex;
        align-items: center;
      }

      .items > .number {
        justify-content: flex-end;
      }

      .items .summary {
        grid-column: auto / span 4;
      }

      footer {
        margin-top: 10px;
        border-top: 2px solid black;
        padding-top: 10px;
      }

      footer .signatures-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      footer .signatures-container .signatures {
        width: 60%;
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 20px;
      }

      footer .signatures-container .signatures div {
        display: flex;
        justify-content: center;
        width: 100%;
        border-top: 1px solid black;
      }

      footer .amount-summary {
        margin-bottom: 30px;
        border-bottom: 1px dashed black;
        border-top: 1px solid black;
        padding: 5px 0 30px 0;
        display: grid;
        grid-template-columns: repeat(3, auto);
        column-gap: 5px;
      }

      footer .amount-summary .number {
        justify-self: end;
      }
    </style>
  </head>`;

export function createPrintEndErrand({
  partnerLists,
  receipts,
  storeDetails,
  user,
}: {
  partnerLists: PartnersListResponseData;
  receipts: ContextReceipt[];
  storeDetails: StoreDetailsResponseData;
  user: CheckToken;
}) {
  const partnerList = partnerLists.find(
    (pl) => pl.id === user.lastRound?.partnerListId
  );

  const header = `
    <header>
      <div class="title-row">
        <div class="title">Körelszámolás</div>
        <div class="date">
          ${format(new Date(), 'yyyy. MMMM do', { locale: hu })}
        </div>
      </div>

      <div class="contestants">
        <div>Üzletkötő</div>
        <div>${user.userName}</div>
        <div>${user.name}</div>

        <div>Raktár</div>
        <div>${storeDetails.code}</div>
        <div>${storeDetails.name}</div>

        <div>Kör</div>
        <div>${user.lastRound?.id ?? ''}</div>
        <div>${partnerList?.name ?? ''}</div>

        <div>Kördátum:</div>
        <div>
          ${format(user.lastRound?.roundStarted ?? new Date(), 'yyyy.MM.dd.')}
        </div>
        <div>
          ${format(user.lastRound?.roundFinished ?? new Date(), 'yyyy.MM.dd.')}
        </div>
      </div>
    </header>`;

  const receiptsList = pipe(
    sortBy<ContextReceipt>(prop('serialNumber')),
    map((receipt) => {
      const receiptType = receipt.invoiceType === 'E' ? 'Á' : 'K';

      return `
        <div class="number">${receipt.serialNumber}/${receipt.yearCode}</div>
        <div>${receiptType}</div>
        <div>${receipt.buyer.vatNumber}</div>
        <div>${receipt.buyer.name}</div>
        <div class="number">${receipt.roundedAmount}</div>`;
    }),
    prepend(`
      <div>Számlaszám</div>
      <div>F</div>
      <div>Adószám</div>
      <div>Bolt</div>
      <div>Végösszeg</div>`),
    join('')
  )(receipts);

  const [totalQuantity, totalAmount, totalCashAmount] = receipts.reduce(
    ([previousTotalQuantity, previousTotal, previousCashTotal], receipt) => [
      previousTotalQuantity +
        receipt.items.reduce(
          (previousItemQuantity, item) => previousItemQuantity + item.quantity,
          0
        ),
      previousTotal + receipt.roundedAmount,
      receipt.invoiceType === 'P'
        ? previousCashTotal + receipt.roundedAmount
        : previousCashTotal,
    ],
    [0, 0, 0]
  );

  const totals = `
    <div class="summary">Összesen (${receipts.length} db számla)</div>
    <div class="number">${totalAmount}</div>

    <div class="summary">Készpénzes számlák összesen</div>
    <div class="number">${totalCashAmount}</div>`;

  const footer = `
    <footer>
      <div>A számlákat és a készpénzt</div>

      <div class="signatures-container">
        <div class="signatures">
          <div>átvettem</div>
          <div>átadtam</div>
        </div>
      </div>

      <div class="amount-summary">
        <div>Számlázott készlet összesen</div>
        <div class="number">${totalQuantity} karton</div>
        <div class="number">${totalAmount} Ft</div>
      </div>
    </footer>`;

  return `
    ${documentType}
    <html lang="en">
      ${head}
      <body>
        ${header}
        <main>
          <section class="items">
            ${receiptsList}
            ${totals}
          </section>
        </main>
        ${footer}
      </body>
    </html>
  `;
}
