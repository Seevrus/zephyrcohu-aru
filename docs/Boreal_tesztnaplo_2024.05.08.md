## Napló a Zephyr Boreal mobilalkalmazás teszteléséről

### Dátum: 2024.05.08. - verzió: 0.8.2

Kezdő képernyő

> Ha bementem a rakodásba és kiválasztottam egy raktárat, de végül nem csináltam semmit sem, csak visszatérek a főmenübe, akkor semmi mást nem tudok csinálni, csak rakodni (csak abba a raktárba), minden más szürke

Ez így működik, a raktár választásánál ugyanis azt lefoglalja a telefon a szereveren, és a rakodás befejezéséig nem is engedi el. Finomíthatunk rajta, de a raktárválasztásnak itt el kell indítania a rakodást

> Ha rakodás közben belekoppintottam a mennyiségbe és a numerikus billentyűzeten (príma) beírok egy mennyiséget, akkor eltűnik a tétellista véglegesítése alulról és sehogan se jön elő, így nem tudok továbbmenni (ugyanez van az árulevételnél is).
> Tudom hogy én kértem, hogy ha billentyűzök, akkor ne legyen elöl a véglegesítés gomb, hanem csak az "OK" (zöld pipa, gondolom), és ez jó is, csak azután nem jön vissza a véglegesítés gomb az alsó résszel együtt.

Ezt nem igazán tudom reprodukálni. Ha becsukom a billentyűzetet, előkerül a gomb is.

> Lehet hogy a tétel-képernyőkön mindegyik esetben a fejlécbe kéne tenni nem csak a vissza, hanem a tovább gombot is? Elég volna annyi felirat rá, hogy "tovább", vagy csak egy nyil ami jobbra mutat (he ledokumentálom nekik hogy az visz tovább, akkor fogják érteni és kész) és akkor nem kellene a véglegesítés gombbal kungfuznod.
> Árulevételnél csináltam megint (mert az előbb kénytelen voltam végül visszalépni)és most nem veszett el a "tovább..." felirat és a lábléc vele együtt, de az előbb igen.

Roger-roger

> Ha vonalkódot keresnék, nagyon szuper a megvilágítás és az egész, az is hogy visszajön a keresett vonalkód a keresőmezőbe, de végül nem keres vele (pedig direkt olyat használtam, ami létező, a pálcikás pandáé) és ilyenkor van ugyan véglegesítés gombom, de szürke

A rakodási képernyőn nem volt jó, kijavítottam.

> Jó lenne ha a rakodási áttekintő képernyőn is ugyanabban a sorrendben lennének a tételek, mint az előző lépésben most pont fordítva van

Átnéztem a rendezést, javítva remélhetőleg.

> Az áttekintőn a mindösszesen frankó, amúgy középre lenne igazítva, vagy direkt jobbra?

Direkt jobbra van igazítva, mint a számok általában

> Megint hiába kattintok a rakjegyzék nyomtatására, nem történik semmi (de a mennyiségek frissítése megtörténik amúgy). Egyik nyomtatásnál sem jön elő az előnézet. Így a listaképeket nem tudtam tesztelni.

Ez csak a Play Store-os verzióban jön elő, még nyomozom bőszen.

> Számlán egyéb tételnél a mennyiséghez nem lehet negatív értéket beírni, hadd lehessen.

Roger-roger
