export default `
<!DOCTYPE html>
<html lang="en">
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
        font-size: 9pt;
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
      .software .software-email {
        border-left: 1px solid black;
        padding-left: 5px;
      }

      .items .item-odd-row,
      .items .item-even-row {
        display: grid;
        margin: 5px 0;
      }

      .items .item-odd-row {
        grid-template-columns: 4fr 9fr 9fr 8fr 40fr;
      }

      .items .item-odd-row.label {
        border-bottom: 1px dashed black;
      }

      .items .item-odd-row:not(.label) {
        font-size: 9pt;
      }

      .items .item-odd-row:not(.label) .item-nr {
        font-size: 7pt;
      }

      .items .item-even-row {
        grid-template-columns: 9fr 16fr 9fr 11fr 4fr 11fr 10fr;
        border-bottom: 1px solid black;
      }

      .items .item-even-row .amount {
        grid-column-start: 2;
      }

      .items .item-even-row .vat-label {
        grid-column: span 2;
      }

      .total {
        display: grid;
        padding: 5px 0;
        border-bottom: 2px solid black;
        grid-template-columns: 9fr 16fr 9fr 11fr 4fr 11fr 10fr;
      }

      .total .amount {
        grid-column: 4 / 6;
      }

      .vat,
      .rounding,
      .total-amount {
        display: grid;
        padding: 5px 0;
        grid-template-columns: 9fr 16fr 9fr 11fr 4fr 11fr 10fr;
        border-bottom: 1px solid black;
      }

      .vat .label {
        grid-column: 1 / 4;
      }

      .rounding {
        border-bottom: 2px solid black;
      }

      .rounding .label,
      .total-amount .label {
        grid-column: 1 / 7;
      }

      .packing-info {
        padding: 5px 0;
        border-bottom: 1px solid black;
        text-align: justify;
      }

      footer {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 20px;
      }

      footer .signature {
        height: 40px;
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
  <body>
    <header>
      <div class="title">Storno számla</div>
      <div class="last-column">(Stornozott számla száma: xxxxxxxx/xx)</div>
      <div>Számlaszám: xxxxxxxx/xx</div>
      <div class="last-column">Eredeti: 1./3 példány</div>
    </header>
    <main>
      <section class="vendor">
        <div class="subtitle">Eladó</div>
        <div class="vendor-name">Neve: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx45x</div>
        <div class="vendor-felir">Felir: *******9*</div>
        <div class="vendor-address">
          Címe: xx4x xxxxxxxxxxxxxxxxx20x xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx38x
        </div>
        <div class="vendor-bank">Bank: xxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx</div>
        <div class="vendor-vat">Adószám: xxxxxxxx-x-xx</div>
      </section>
      <section class="buyer">
        <div class="subtitle">Vevő</div>
        <div class="buyer-name">Neve: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx45x</div>
        <div class="buyer-address">
          Címe: xx4x xxxxxxxxxxxxxxxxx20x xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx38x
        </div>
        <div class="buyer-bank">Bank: xxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx</div>
        <div class="buyer-vat">Adószám: xxxxxxxx-x-xx</div>
      </section>
      <section class="buyer delivery-address">
        <div class="subtitle">Vevő szállítási címe</div>
        <div class="buyer-name">Neve: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx45x</div>
        <div class="buyer-address">
          Címe: xx4x xxxxxxxxxxxxxxxxx20x xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx38x
        </div>
      </section>
      <section class="payment">
        <div>Kelt: xxxx.xx.xx</div>
        <div class="payment-deadline">Teljesítés: xxxx.xx.xx</div>
        <div class="payment-method">Fizetés: Készpénz, xxxx.xx.xx</div>
      </section>
      <section class="agent">
        <div class="agent-name">Üzletkötő: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
        <div class="agent-phone">+36xx-xxxxxxx</div>
      </section>
      <section class="software">
        <div class="software-label">Szoftver:</div>
        <div class="software-name">Zephyr Boreal 11.40.0000</div>
        <div class="software-email">zephyr.bt@gmail.com</div>
      </section>
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
        <div class="item-odd-row">
          <div class="item-nr">001.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
        <div class="item-odd-row">
          <div class="item-nr">002.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
        <div class="item-odd-row">
          <div class="item-nr">003.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
        <div class="item-odd-row">
          <div class="item-nr">004.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
        <div class="item-odd-row">
          <div class="item-nr">005.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
        <div class="item-odd-row">
          <div class="item-nr">006.</div>
          <div>****&nbsp;**</div>
          <div>******8*</div>
          <div>****.**</div>
          <div>*************************************40*</div>
        </div>
        <div class="item-even-row">
          <div class="amount">xxxxxx8x karton</div>
          <div>xxxxxx8x</div>
          <div>xxxxxxx10x</div>
          <div>27%</div>
          <div>xxxxxxx10x</div>
          <div>xxxxxxx10x</div>
        </div>
      </section>
      <section class="total">
        <div class="label">Összes:</div>
        <div class="quantity">xxxxxx8x</div>
        <div class="amount">xxxxxxx10x</div>
        <div class="vat">xxxxxxx10x</div>
        <div class="gross">xxxxxxx10x</div>
      </section>
      <section class="vat">
        <div class="label">ÁFA összesen</div>
        <div class="amount">xxxxxxx10x</div>
        <div class="vat-key">5%</div>
        <div class="vat-amount">xxxxxxx10x</div>
        <div class="gross">xxxxxxx10x</div>

        <div class="label">ÁFA összesen</div>
        <div class="amount">xxxxxxx10x</div>
        <div class="vat-key">27%</div>
        <div class="vat-amount">xxxxxxx10x</div>
        <div class="gross">xxxxxxx10x</div>
      </section>
      <section class="rounding">
        <div class="label">Kerekítés (5 forintra) összege</div>
        <div class="amount">xxxxxxx10x</div>
      </section>
      <section class="total-amount">
        <div class="label">Számla mindösszesen: (visszajáró)</div>
        <div class="amount">xxxxxxx10x</div>
      </section>
      <section class="packing-info">
        A számlán szereplő csomagolóanyagok a termékdíjfizetés alól mentesek, a termékdíj
        megfizetésre került. A népegészségügyi termékadó az eladót terheli.
      </section>
    </main>
    <footer>
      <div class="signature vendor-signature"></div>
      <div class="signature buyer-signature"></div>
      <div class="vendor-label">eladó</div>
      <div class="buyer-label">vevő</div>
      <div class="thank-you">Köszönjük a vásárlást!</div>
    </footer>
  </body>
</html>
`;