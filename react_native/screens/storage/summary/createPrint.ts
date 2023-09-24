import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

import { CheckToken } from '../../../api/response-mappers/mapCheckTokenResponse';
import { ListItem } from '../../../providers/StorageFlowProvider';
import { StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';

function mapToNr(index: number) {
  const stringIndex = String(index);

  if (index > 999) {
    return stringIndex;
  }

  return '0'.repeat(3 - stringIndex.length) + stringIndex;
}

const docType = '<!DOCTYPE html>';
const head = `
<head>
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Rakjegyzék</title>

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

    header {
      margin-bottom: 10px;

      .title-row {
        display: flex;
        width: fit-content;
        border-bottom: 1px dashed black;
        padding-bottom: 5px;
        margin-bottom: 5px;

        .title {
          text-transform: uppercase;
          padding-right: 5px;
          border-right: 1px solid black;
        }

        .date {
          padding-left: 5px;
        }
      }

      .contestants {
        display: grid;
        width: fit-content;
        grid-template-columns: repeat(3, auto);

        div {
          padding-right: 10px;
        }
      }

      .date-column {
        justify-self: end;
      }

      .first-row {
        margin-bottom: 5px;
      }

      .label {
        text-decoration: underline;
      }
    }

    main {
      section.items {
        .item {
          display: grid;
          grid-template-columns: repeat(70, minmax(0, 1fr));
          border-bottom: 1px dashed black;
          padding-bottom: 5px;
          margin-bottom: 5px;

          .nr {
            grid-column: 1 / span 4;
          }

          .article-number {
            grid-column: 6 / span 8;
          }

          .expires-at {
            grid-column: 15 / span 27;
          }

          .quantities {
            grid-column: 42 / span 29;
          }

          .item-name {
            grid-column: 1 / span 40;
            word-break: break-all;
          }

          .unit {
            grid-column: 42 / span 6;
          }

          .starting-quantity {
            grid-column: 49 / span 5;
            justify-self: flex-end;
          }

          .quantity-change {
            grid-column: 55 / span 6;
            justify-self: flex-end;
          }

          .final-quantity {
            grid-column: 62 / span 5;
            justify-self: flex-end;
          }

          .ok {
            grid-column: 68 / span 3;
            justify-self: flex-end;
          }
        }
      }

      section.items-summary {
        border-bottom: 2px solid black;
        padding-bottom: 5px;
        margin-bottom: 5px;

        .item {
          display: grid;
          grid-template-columns: repeat(70, minmax(0, 1fr));

          .total-label {
            grid-column: 1 / span 47;
          }

          .starting-total {
            grid-column: 49 / span 5;
            justify-self: flex-end;
          }

          .total-change {
            grid-column: 55 / span 6;
            justify-self: flex-end;
          }

          .ending-total {
            grid-column: 62 / span 5;
            justify-self: flex-end;
          }
        }
      }
    }

    footer {
      margin-top: 30px;

      .signatures-container {
        display: flex;
        justify-content: flex-end;

        .signatures {
          width: 60%;
          margin-right: 20px;
          margin-bottom: 10px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 20px;

          div {
            display: flex;
            justify-content: center;
            width: 100%;
            border-top: 1px solid black;
          }
        }
      }

      .end-delimiter {
        border-bottom: 1px dashed black;
        padding-bottom: 5px;
        margin-bottom: 5px;
      }
    }
  }
</style>
</head>
`;

export default function createPrint({
  receiptItems,
  storeDetails,
  user,
}: {
  receiptItems: ListItem[];
  storeDetails: StoreDetailsResponseData;
  user: CheckToken;
}) {
  const header = `
    <header>
      <div class="title-row">
        <div class="title">Rakjegyzék</div>
        <div class="date">${format(new Date(), 'yyyy. MMMM do', {
          locale: hu,
        })}</div>
      </div>
      <div class="contestants">
        <div>Rakodta:</div>
        <div>${user.code}</div>
        <div>${user.name}</div>
        <div>Raktár:</div>
        <div>${storeDetails.code}</div>
        <div>${storeDetails.name}</div>
      </div>
    </header>
  `;

  const itemsSection = `
    <section class="items">
      <div class="item">
        <div class="nr">Ssz.</div>
        <div class="article-number">Cikkszám</div>
        <div class="expires-at">Lejárat</div>
        <div class="quantities">Mennyiségek</div>
        <div class="item-name">Megnevezés</div>
        <div class="unit">Menny. egység</div>
        <div class="starting-quantity">Kezdő</div>
        <div class="quantity-change">Mozgás</div>
        <div class="final-quantity">Kész</div>
        <div class="ok">Ok?</div>
      </div>
      ${receiptItems.map((item, index) => {
        const quantityChange = (item.currentQuantity || 0) - (item.originalQuantity || 0);

        return `
          <div class="item">
            <div class="nr">${mapToNr(index)}</div>
            <div class="article-number">${item.articleNumber}</div>
            <div class="expires-at">${item.expiresAt}</div>
            <div class="item-name">${item.name}</div>
            <div class="unit">${item.unitName}</div>
            <div class="starting-quantity">${item.originalQuantity || 0}</div>
            <div class="quantity-change">${quantityChange > 0 ? '+' : ''}${quantityChange}</div>
            <div class="final-quantity">${item.currentQuantity}</div>
            <div class="ok">[]</div>
          </div>
        `;
      })}
    </section>
  `;

  const createItemsSummarySection = () => {
    const itemsSummary = receiptItems.reduce(
      (prev, item) => {
        const quantityChange = (item.currentQuantity || 0) - (item.originalQuantity || 0);

        return {
          originalQuantity: prev.originalQuantity + item.originalQuantity,
          in: quantityChange > 0 ? prev.in + quantityChange : prev.in,
          out: quantityChange < 0 ? prev.out + quantityChange : prev.out,
          currentQuantity: prev.currentQuantity + item.currentQuantity,
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
      <section class="items-summary">
        <div class="item">
          <div class="total-label">Összesen (rakodva 2 termék)</div>
          <div class="starting-total">${itemsSummary.originalQuantity}</div>
          <div class="total-change">+${itemsSummary.in}</div>
        </div>
        <div class="item">
          <div class="total-change">${itemsSummary.out}</div>
          <div class="ending-total">${itemsSummary.currentQuantity}</div>
        </div>
      </section>
    `;
  };

  const footer = `
    <footer>
      <div class="signatures-container">
        <div class="signatures">
          <div>Rakodta</div>
          <div>Ellenőrizte</div>
        </div>
      </div>
      <div class="end-delimiter">|> ${format(new Date(), 'yyyy.MM.dd.')} | ${user.code} | ${
        user.name
      } <|</div>
    </footer>
  `;

  return `
    ${docType}
    <html lang="en">
      ${head}
      <body>
        ${header}
        <main>
          ${itemsSection}
          ${createItemsSummarySection()}
        </main>
        ${footer}
      </body>
    </html>
  `;
}
