<div>
  <div style="border-bottom: 3px solid rgb(0, 0, 128);">
    <img style="height: 4rem;" src="https://zephyr.co.hu/img/logo/logo.png" alt="Zephyr Logo">
  </div>
  <div style="background-color: rgb(207, 231, 245); padding: 1rem; font-family: sans-serif; font-size: 14px;">
    <p>Ez egy automatikus email üzenet, amelyet azért küldött ki a rendszer, mert az Áruforgalmi Alkalmazás egyik
      mesterkulcsával új felhasználó létrehozására került sor.</p>
    <p>Az kéréshez kapcsolódó paraméterek:</p>
    <ul>
      <li>Cég azonosítója: {{ $company_id }}</li>
      <li>Mesterkulcs azonosítója: {{ $master_key_id }}</li>
      <li>Felhasználó azonosítója: {{ $user_id }}</li>
      <li>Felhasználó telefonszáma: {{ $user_phone_number }}</li>
      <li>Generált kulcs azonosítója: {{ $user_key_id }}</li>
    </ul>
    <p>Amennyiben a műveletet nem Te kezdeményezted, haladéktalanul vedd fel velem a kapcsolatot.</p>
    <p style="margin-bottom: 0;">Üdvözlettel,</p>
    <p style="margin-top: 0;">Dr. Till Zoltán</p>
  </div>
</div>