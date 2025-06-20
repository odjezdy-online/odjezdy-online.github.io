# MD Cast Approved™

Webová komunitní databáze míst a projektů, které by se mohly líbit některým postavám ze seriálu **Murder Drones**.

---

## O projektu

Tento projekt vznikl jako fanouškovská iniciativa, která kombinuje lehký humor, komunitní tipy a oblíbené postavy ze světa Murder Drones. Není to RP, není to fanfikce – spíš taková volná sbírka doporučení s nadhledem a respektem k originálu.

Nápad přišel od uživatele **mxnticek**, který je zároveň autorem vlastního OC **Ch-last** (postava Ch-last není součástí Murder Drones a bude se průběžně doplňovat).

Velkou pomoc při návrhu struktury a implementaci poskytl **ChatGPT** (tento asistent).

---

## Jak to funguje

- Data jsou uložena v JSON souboru [`cyn-approved.json`](./cyn-approved.json).
- Webová stránka je jednoduchá statická aplikace, která tato data načítá a zobrazuje přehledně rozdělená do dvou kategorií:
  - **Turistika** — fyzická místa a výletní destinace
  - **Chaos / Projekty** — komunitní šílenosti, weby, projekty, apod.

---

## Struktura záznamů v JSON

Každý záznam obsahuje:

- `title` – název místa nebo projektu  
- `type` – `"tourism"` nebo `"chaos"`  
- `location` – adresa nebo lokalita  
- `description` – stručný a výstižný popis  
- `how_to_get_there` – volitelný popis cesty nebo dostupnosti  
- `character_reactions` – objekt s reakcemi vybraných postav; reakce jsou psané tak, aby gramaticky odpovídaly pohlaví postavy (viz níže)  
- `approved_by` – autor tipů, často člen komunity  
- `media` – URL obrázku, pokud je k dispozici (volitelné)  

---

## Poznámka k postavám a gramatice

Postavy Murder Drones nejsou mojí tvorbou a jsou vlastnictvím jejich tvůrců. Nejsem autorem těchto postav, pouze je fanouškem.

Pohlaví postav je zde použito pro správnou gramatiku reakcí:

- **Ženy:** Uzi, J, V, Cyn, Lizzy  
- **Muži:** N, Thad  

Do klíčů `character_reactions` proto nepřidávej označení pohlaví, ale texty piš gramaticky správně k dané postavě.

---

## Příklad dat najdeš v souboru [`cyn-approved.json`](./cyn-approved.json).

---

## Jak přidávat nové tipy

Pokud chceš přidat vlastní místo nebo projekt, uprav JSON a pošli pull request nebo otevři issue. Prosím, drž se stylu – stručně, výstižně, s lehkým humorem, ale bez RP.

---

## Licence

MIT — protože chaos je nejlepší bez byrokracie.

---

## Poděkování

Díky za pomoc s návrhem a technickou stránkou projektu patří **ChatGPT**, který pomohl s konceptem, kódem a stylem.

---

**Autor:** mxnticek (OC: Ch-last)

---

Díky, že jsi tu, a užij si to!
