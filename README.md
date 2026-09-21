# M-Team d.o.o. — web stranica

Produkcijska implementacija web stranice za M-Team d.o.o. (solarne elektrane, M-CARS,
MT Mount by Enerack).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · React Three Fiber

---

## Pokretanje

```bash
npm install
```

```bash
npm run dev
```

Stranica je dostupna na `http://localhost:3000`.

Ostale naredbe:

```bash
npm run build
```

```bash
npm run preview
```

```bash
npm run typecheck && npm run lint
```

`build` radi statički export u `out/`. `preview` pokreće Cloudflare runtime
lokalno (Wrangler) i poslužuje `out/` zajedno s Pages Functions iz `functions/`
— jedini način da se lokalno testira kontaktni endpoint, jer ga `next dev` više
ne poslužuje.

> **Napomena:** `next dev` i `next build` dijele `.next` direktorij. Ne pokrećite
> ih istovremeno — ako dev server nakon builda počne vraćati 404 za statičke
> datoteke, zaustavite ga, obrišite `.next` i pokrenite ponovno.

---

## Deploy (Cloudflare Pages)

Repozitorij je samokonfigurirajući: `wrangler.toml` sadrži
`pages_build_output_dir = "out"`, pa Cloudflare Pages sam pronalazi izlazni
direktorij.

| Postavka      | Vrijednost                         |
| ------------- | ---------------------------------- |
| Build command | `npm run build`                    |
| Build output  | `out` (čita se iz `wrangler.toml`) |
| Node verzija  | 20 ili novija                      |

Ako je u dashboardu ranije ručno upisan izlazni direktorij (npr. `dist`),
obrišite tu vrijednost da se primijeni ona iz `wrangler.toml`.

### Arhitektura deploya

Stranica se gradi kao **statički export** — svih 12 ruta je prerenderirano i
poslužuje se izravno s CDN-a. Jedini dinamični dio, slanje kontaktnog obrasca,
izveden je kao **Cloudflare Pages Function** u `functions/api/kontakt.ts` i
dostupan je na istoj ruti `/api/kontakt`.

HTTP zaglavlja definirana su u `public/_headers` (Cloudflare ih čita nativno),
jer se `headers()` iz `next.config.mjs` uz statički export ne primjenjuje.

Ako aplikacija kasnije zatreba pravi SSR — dinamične stranice, middleware ili
ISR — uklanja se `output: 'export'` iz `next.config.mjs` i projekt se deploya
preko OpenNext adaptera na Cloudflare Workers.

---

## Rute

| Ruta          | Sadržaj                                                    |
| ------------- | ---------------------------------------------------------- |
| `/`           | Hero s 3D scenom, tri poslovna svijeta, proces, usluge, CTA |
| `/o-nama`     | Profil tvrtke, kompletan proces, distribucija, M-CARS       |
| `/usluge`     | Šest usluga i elektroenergetski elaborati                   |
| `/mobilnost`  | M-CARS — vozila, principi i informativni uvjeti leasinga    |
| `/mt-mount`   | MT Mount by Enerack — interaktivni pregled konstrukcija     |
| `/kontakt`    | Kontaktni podaci i obrazac                                  |
| `/privatnost` | Izjava o privatnosti (sadržajni predložak)                  |
| `/kolacici`   | Kolačići (sadržajni predložak)                              |

Uz njih se generiraju `/sitemap.xml` i `/robots.txt`.

---

## Gdje se uređuje sadržaj

Svi poslovni podaci centralizirani su u `src/content/` — komponente ne sadrže
tvrde vrijednosti.

| Datoteka                     | Sadrži                                                      |
| ---------------------------- | ----------------------------------------------------------- |
| `src/content/company.ts`     | **Naziv, adresa, OIB, telefon, e-mail, godina osnutka**      |
| `src/content/navigation.ts`  | Glavna i pravna navigacija                                   |
| `src/content/services.ts`    | Usluge, elaborati (EUEM, EPZ, EMP, EOTRP, OPIP), HEP ODS     |
| `src/content/leasing.ts`     | M-CARS principi i svi leasing uvjeti + pravna napomena       |
| `src/content/mount.ts`       | Kategorije konstrukcija i prednosti                          |
| `src/content/home.ts`        | Hero, tri svijeta, koraci procesa, prednosti, povjerenje     |
| `src/content/about.ts`       | Tekstovi stranice „O nama”                                   |
| `src/content/photos.ts`      | Fotografije, opisi (alt) i podrijetlo svake slike             |
| `src/content/legal.ts`       | **Izjava o privatnosti i tekst o kolačićima**                 |
| `src/content/faq.ts`         | Česta pitanja — vidljiva sekcija i `FAQPage` označavanje       |

### Prije objave obavezno provjeriti

1. **OIB** u `src/content/company.ts` — unesen je točno kako je dostavljen
   (`H10707184811`). Standardni hrvatski OIB ima 11 znamenki bez slova; ako je
   dostavljena vrijednost tipfeler, ispravite je na tom jednom mjestu.
2. **`NEXT_PUBLIC_SITE_URL`** — koristi se za canonical URL-ove, sitemap i Open Graph.
3. **Adresa** — sudski registar navodi sjedište `Kralja Tomislava 110, Čepin`, a
   postojeća stranica i narudžba navode `Osječka 188, 31431 Čepin`. Obje su u
   `company.ts` (`registeredOffice` i `address`): sjedište se koristi u pravnim
   tekstovima, a druga adresa u kontaktu. **Potvrditi koja je aktualna.**
4. **`/privatnost` i `/kolacici`** — tekstovi opisuju točno ono što ova
   implementacija radi i sastavljeni su prema Općoj uredbi o zaštiti podataka.
   Prije objave neka ih pregleda odgovorna osoba. Ako se doda analitika ili bilo
   koji vanjski skript, obavezno dopuniti popis primatelja i uvesti privolu.

---

## Kontaktni obrazac

Obrazac **namjerno ne glumi uspješno slanje.** Dok nisu postavljene environment
varijable, endpoint `/api/kontakt` vraća `503` i sučelje korisniku ponudi `tel:`
i `mailto:` alternative.

Endpoint je Cloudflare Pages Function: `functions/api/kontakt.ts`.

Aktivacija u produkciji — u Cloudflare Pages dashboardu, pod
**Settings → Environment variables**, dodajte `RESEND_API_KEY`,
`CONTACT_FROM_EMAIL` i `CONTACT_TO_EMAIL`.

Za lokalno testiranje kopirajte `.env.example` u `.dev.vars` i popunite iste
ključeve — `npm run preview` ih učitava automatski.

Ako se koristi drugi davatelj usluge, zamijenite funkciju `sendViaResend` u
`functions/api/kontakt.ts` — ostatak (validacija, honeypot, ograničenje broja
zahtjeva) ostaje isti.

Validacija se izvodi istom Zod shemom (`src/lib/contact-schema.ts`) na klijentu i
na poslužitelju.

> Ograničenje broja zahtjeva drži se u memoriji izolata, pa vrijedi unutar
> jednog Workers izolata. Za strogu kontrolu koristiti Cloudflare KV ili Durable
> Object.

---

## 3D scene

Sve je proceduralno — nema vanjskih glTF modela ni HDR datoteka.

| Datoteka                             | Uloga                                                                |
| ------------------------------------ | -------------------------------------------------------------------- |
| `three/carShape.ts`                  | Parametarski oblik karoserije — **jedini izvor istine za vozilo**     |
| `three/panelTexture.ts`              | Proceduralna tekstura fotonaponskog modula (ćelije, sabirnice)        |
| `three/layouts.ts`                   | Rasporedi 320 instanci za tri stanja hero scene                       |
| `three/HeroScene.tsx`                | Hero: morph solarno polje → konstrukcija → vozilo                     |
| `three/MountScene.tsx`               | MT Mount: „exploded view” nosivog sustava po kategoriji               |

### Oblik vozila

`carShape.ts` opisuje karoseriju nizom poprečnih presjeka po dužini (visina
krova, visina praga, poluširina) uz glatku interpolaciju i otvore blatobrana.
Iz te iste površine nastaju dvije stvari:

Hero scena po toj površini raspoređuje solarne module — vozilo je doslovno
popločano panelima, što zatvara priču „energija → konstrukcija → mobilnost”.

Stranica `/mobilnost` **ne koristi 3D model** nego stvarnu fotografiju M-Teamova
voznog parka. Razlog je u odjeljku „Zašto na M-CARS stranici nema 3D modela”.

### Materijali unutar jednog instanced mesha

Hero scena crta svih 320 instanci jednim pozivom. Da bi staklo modula, brušeni
čelik, lak karoserije, guma i svjetla ipak izgledali različito, četiri atributa
po instanci ubacuju se u standardni PBR shader preko `onBeforeCompile`:

| Atribut   | Uloga                                                             |
| --------- | ----------------------------------------------------------------- |
| `aGloss`  | hrapavost — od mat čelika do stakla modula                         |
| `aMetal`  | metalnost — guma i staklo su dielektrici, čelik i lak nisu         |
| `aGlow`   | emisija svjetala vozila, koju zatim hvata bloom                    |
| `aPanel`  | na instancu se crta tekstura fotonaponskog modula                  |

Tekstura modula nosi samo množitelj svjetline (ćelije, razmaci, sabirnice,
zakošeni uglovi), pa boja i dalje dolazi iz boje po instanci. Aluminijski okvir
se ne crta u teksturi nego se računa u shaderu iz UV koordinata — tako je
jednako debeo bez obzira na veličinu pločice.

### Morph prijelaz

Prijelaz ide **izravno** iz zatečenog stanja u odabrano: u trenutku promjene
zamrzne se trenutna slika i iz nje se interpolira u cilj. Zato odabir M-CARS-a
iz solarnog polja ne prolazi usput kroz konstrukciju.

Svaka instanca kreće s malim kašnjenjem ovisnim o položaju, opisuje luk i
zavrti se oko vlastite osi dok putuje. Preobrazba se tako prelijeva preko
objekta umjesto da se sve pomakne odjednom.

### Sunčeve zrake

Nema sunčevog koluta. Scenom putuje **traka svjetla**: prelazak preko cijelog
polja traje 10 sekundi (`SWEEP_DURATION`), nakon čega svjetla nema idućih 15
sekundi (`SWEEP_GAP`). Prvi prelazak kreće 0,4 s nakon učitavanja
(`SWEEP_DELAY`), pa se vidi odmah na otvaranju stranice.

Gibanje je linearno, tako da traka doista prijeđe **svih** modula u tih 10
sekundi, a ne da uspori na rubovima. Usmjereno svjetlo (`SunSweep`) prati traku,
pa se uz odsjaj mijenja i osvjetljenje cijele scene.

Sam odsjaj računa se u shaderu iz položaja instance po osi X (`vSweepX`,
uniformi `uSweep` / `uSweepWidth` / `uSweepStrength`) i razlikuje dvije vrste
ploha:

- **moduli** — svjetlo hvata cijelu plohu, ali se modulira teksturom ćelija, pa
  po staklu titra umjesto da klizi kao ravna ploha;
- **lak i metal** (karoserija, nosači) — uži odsjaj s jačom ovisnošću o kutu
  plohe, pa vozilo i konstrukcija dobiju klizni bljesak, a ne ravnomjeran sjaj.

Zato se prelazak vidi u sva tri svijeta: na modulima, na konstrukciji i na
vozilu.

Isti ritam ima i istaknuti dio naslova u herou (`.sun-text` u `globals.css`):
prijelaz traje 10 s od 25 s ciklusa, s istim kašnjenjem od 0,4 s.

### Vrijeme, ne broj frameova

Trajanja se mjere preko `performance.now()`, a ne zbrajanjem `dt` ili preko sata
scene. Oboje staje zajedno s render petljom, koju namjerno pauziramo kad kartica
nije aktivna — animacije bi tada ostajale zaglavljene na početku.

### Pravila izvedbe

- **Lazy load** — `next/dynamic` uz `ssr: false`, montira se tek kad scena uđe u
  vidno polje, pa WebGL ne blokira LCP.
- **Pauza** — render petlja staje (`frameloop="never"`) kad kartica nije aktivna
  ili je scena izvan pogleda.
- **Slabiji uređaji** — manji `dpr`, bez antialiasa, bez `clearcoat` materijala,
  bez kontaktnih sjena i bez postprocesiranja.
- **`prefers-reduced-motion`** — hero prelazi na `frameloop="demand"`, bez
  lebdenja, parallaxa, luka i pomicanja kamere; DOM animacije postaju kratki
  fade prijelazi.
- **Bez WebGL-a ili uz gubitak konteksta** — statični SVG fallback
  (`three/SceneFallback.tsx`).
- **Sunčeva traka** prelazi scenu 10 s, pa je nema 15 s (`SWEEP_DURATION` +
  `SWEEP_GAP`). Uz `prefers-reduced-motion` traka stoji na sredini polja —
  odsjaj je vidljiv, ali se ne miče. Na slabijim uređajima je nešto jača, jer
  tamo nema bloom-a koji bi je inače pojačao.

Kadar se prilagođava omjeru prikaza, pa scena ostaje u okviru i na uskim
zaslonima.

---

## Zašto na M-CARS stranici nema 3D modela

Fotorealističan model automobila koji je istovremeno besplatan, provjerljivo
slobodan za komercijalnu upotrebu i bez problema sa žigom i pravima na dizajn
praktički ne postoji. Besplatni CC0 modeli (Kenney, Quaternius) su stilizirani i
niskopoligonalni, a realistični modeli stvarnih vozila nose rizik žiga.

Zato `/mobilnost` koristi **stvarne fotografije M-Teamova voznog parka** —
uvjerljivije su od bilo kojeg besplatnog modela i nema licencnog rizika.
Ako se kasnije nabavi licencirani model, dodaje se kao lijeno učitani glTF.

---

## Vizualni asseti

`public/icon.svg` i `public/og-default.svg` generirani su kao SVG.

Fotografije u `public/slike/` preuzete su s postojeće stranice m-team.hr i
unaprijed pretvorene u WebP u dvije širine. Uz statički export nema optimizacije
u runtimeu, pa `components/ui/Photo.tsx` koristi običan `<img>` sa `srcset`,
`sizes` i zadanim dimenzijama (bez pomicanja rasporeda).

Popis, opisi i podrijetlo svake fotografije su u `src/content/photos.ts`. Polje
`origin` razlikuje **vlastite** fotografije M-Teamovih izvedbi od **stock**
materijala koji se već koristi na postojećoj stranici.

**Prije objave:** potvrditi pravo korištenja svake fotografije, posebno onih
označenih kao `stock`.

Stock materijal (Pexels, Unsplash) nije „bez autorskih prava” — licencu treba
provjeriti prije objave.

---

## SEO

| Element                | Stanje                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| Naslov i opis          | jedinstveni po ruti                                               |
| Canonical              | apsolutni, iz `NEXT_PUBLIC_SITE_URL`                              |
| `robots` direktive     | `max-image-preview:large`, `max-snippet:-1`                       |
| Open Graph             | **PNG 1200×630 po sekciji** — mreže ne prikazuju SVG              |
| `LocalBusiness`        | samo provjereni podaci iz `company.ts`, uz `sameAs`               |
| `ItemList` / `Service` | šest usluga, na naslovnici i `/usluge`                            |
| `FAQPage`              | 10 pitanja, tekst identičan vidljivom sadržaju                    |
| `BreadcrumbList`       | na svim podstranicama                                             |
| Sitemap                | prioriteti po ruti + slike (`image:image`)                        |
| Semantika              | jedan `h1` po stranici, `aria-labelledby` na sekcijama            |

Strukturirani podaci namjerno **ne** sadrže ocjene, recenzije, radno vrijeme ni
koordinate — netočno označavanje može dovesti do ručne kazne u tražilici.

FAQ sadržaj živi u `src/content/faq.ts` i koristi se na dva mjesta: u vidljivoj
sekciji i u `FAQPage` označavanju. Mora ostati identičan na oba.

---

## Tipografija

Naslovi koriste **Sora**, tekst **Manrope**. Sora je geometrijski grotesk s
izraženijim karakterom od Montserrata i na velikim naslovima djeluje tehničnije.

Za povratak na Montserrat dovoljno je zamijeniti uvoz i poziv u
`src/app/layout.tsx` te fallback u `tailwind.config.ts` — ostatak stilova ide
preko CSS varijable `--font-display`.

---

## Sadržajna pravila

Stranica namjerno **ne sadrži** izmišljene recenzije, logotipe partnera, reference,
broj instalacija, megavate ni certifikate koji nisu dostavljeni.

Brojčane tvrdnje („do 70%”, „5–8 godina”) uvijek su popraćene napomenom da ovise o
konkretnom projektu. Leasing uvjeti su označeni kao informativni i praćeni obaveznom
pravnom napomenom iz `src/content/leasing.ts`.

Strukturirani podaci (`LocalBusiness`) generiraju se isključivo iz `company.ts`.

---

## Pristupačnost

- Semantički HTML, hijerarhija `h1`–`h3`, `aria-labelledby` na sekcijama
- „Prijeđi na glavni sadržaj” poveznica
- Vidljiv `focus-visible` stil na svim interaktivnim elementima
- Pregled konstrukcija na `/mt-mount` radi kao ARIA tablist — strelice, Home i End
- Mobilni izbornik se zatvara na Escape i vraća fokus na gumb koji ga je otvorio
- Obrazac ima povezane labele, `aria-invalid`, `aria-describedby` i `role="alert"`
- 3D platna su `aria-hidden` — cjelokupan sadržaj postoji i u tekstualnom obliku
