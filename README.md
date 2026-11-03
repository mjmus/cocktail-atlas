# Cocktail Atlas

A home-focused, responsive cocktail library in English. The original layout, bottle previews, recipe cards, dark theme, and personal lists remain in place.

## Recipe libraries

| Library | Recipes | How data is loaded |
| --- | ---: | --- |
| The PDT Cocktail Book | 304 | Public recipe API, on demand |
| Death & Co | 477 | Public recipe API, on demand |
| Shakerrr Library | 407 | Bundled recipe specifications in `data/shakerrr-recipes.json` |

The existing interface uses rounded headings (300 and 500) for the first two books. All 407 Shakerrr entries were imported from `FusorXE/shakerrr-site` as a separate catalog; the existing book catalogs were not modified.

## Features

- **Browse group by group:** 11 Shakerrr collections, 14 complete PDT/Death & Co base-spirit groups and 26 complete glassware groups. Shakerrr also supports browse-by-spirit and browse-by-glass using its own recipe records.
- Full searchable recipe lists, ingredient directory, recipe steps, images where available, and the enlarged bottle-cutout preview design.
- Set **1 to 30 drinks**. PDT and Death & Co display their supplied gram weights; Shakerrr displays its original volume/count units and scales numeric amounts without inventing ingredient-specific densities.
- Choose alternate Shakerrr recipe versions where the source records multiple versions.
- Wishlist, Made, and Your Bar lists stored locally in your browser.
- Responsive desktop/mobile layout and dark mode.

## Run locally

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080>. Opening `index.html` directly via `file://` is not supported for data fetching. The bundled Shakerrr recipes can load locally after starting the server. PDT and Death & Co recipe details require an internet connection to the public API.

## Useful routes

- `#/` : all libraries
- `#/pdt`, `#/deathco`, `#/shakerrr` : library homepages
- `#/shakerrr/collections` : 11 collections
- `#/shakerrr/collection/Essential%20Cocktail%20Book` : one original collection
- `#/pdt/spirit/gin` : complete PDT gin group
- `#/deathco/glass/Coupe` : complete Death & Co coupe-glass group
- `#/shakerrr/recipe/Elderflower%20Samba%20Martini` : imported recipe
- `#/bar`, `#/saved` : browser-local inventory and lists

## Tests and deployment

```bash
node --check app.js
node --check shakerrr-library.js
node tests/expanded_route_test.cjs
```

The **Verify Cocktail Atlas** GitHub Action runs these checks on each push. The **Deploy to GitHub Pages** workflow publishes `main` automatically.

Live website: <https://mjmus.github.io/cocktail-atlas/>

## Limitations and source credits

This is for personal use but **the GitHub repository and GitHub Pages site are public**, not access-controlled. To keep data genuinely private, change hosting and repository visibility as appropriate.

The imported Shakerrr recipes preserve their documented factual amounts and versions; their weights are not treated as exact grams. The site does not implement synchronized accounts, Bluetooth scale telemetry or all advanced substitution tools.

Source attribution and third-party asset conditions are documented in [ATTRIBUTION.md](ATTRIBUTION.md). Some bottle/product images are loaded from external sites and have separate rights; they are not packaged in this repository. The imported Shakerrr drink images reference the existing Shakerrr repository and may not all be available.

## Additional independent modules (2026-11-02)

- **Mixed ingredient art:** Exact Cinzano Sweet Vermouth and named Scrappy's Cardamom Bitters use verified bottle-photo URLs. Other unrecognized bitters, syrups, juices, and specialty ingredients use original neutral category illustrations rather than invented brand bottles. This is an additive image resolver, not a wholesale replacement of the existing bottle index.
- **One World Cocktail:** A separately stored published `Spicy Pomegranate (Istanbul)` entry with bartender attribution and original SVG cocktail illustration. The 407 imported Shakerrr recipe records are unchanged.
- **Sommelier:** A standalone guide containing 25 representative wine styles, illustrated bottles, grape and region notes, flavor profiles, serving suggestions, structure indicators, and food pairings. These are educational styles, not specific winery vintages. The guide's data and CSS do not alter existing cocktail screens.
- **Safety:** All features were prepared on a branch, with regression tests for original recipe counts, imported versions, personal recipes and new modules.

## My Recipes: personal cocktail notebook

Use **My Recipes** in the navigation to create and save custom cocktails. Enter drink name, ingredient names and amounts, glassware, garnishes, instructions and tasting notes. A live bottle gallery uses the same verified artwork matcher and saved generic-spirit bottle preferences.

On any existing PDT, Death & Co or Shakerrr recipe, click **+ Make my version** to pre-fill the editor with the original recipe, then customize and save a separate personal variation. Your original source recipe remains unchanged.

The personal library supports editing, duplication, deletion, resized serving measurements, guided preparation steps, and JSON backup **Export** / **Import**. Backups merge by recipe ID.

**Privacy/storage:** Custom recipes are stored only in the current browser's `localStorage`. They are not uploaded to GitHub or shared across browsers and devices. Export backups regularly, particularly before clearing browser data or using a new device. Bottle photos may load from external image servers; custom ingredient names entered into the page are not transmitted by the recipe save function.

## Real Sommelier producer bottle examples

All 25 Sommelier categories now display a specifically matched **real producer bottle** instead of a generic primary illustration. The original SVG bottles remain fallback art for unavailable third-party images. Cards identify the producer; detail pages show the producer, cuvée, and image-source link. Brand names are searchable. Serving, flavor and pairing guidance remains wine-style guidance, not tasting notes for a given photographed vintage.

Bottle images are externally linked, not stored in the repo. See `ATTRIBUTION.md` for rights and availability considerations.

## Sommelier: individual wine profiles (2026-11-03)

The Sommelier landing page now includes **22 individual producer-specific bottlings** with their real producer bottle images, descriptions, aroma, palate, finish, structure, food pairings, suggested serving temperatures, and linked tasting-source references. Profiles are in `data/sommelier-producer-bottles.json`. The original 25 wine-style pages remain available below the individual bottle catalog, without changing any cocktail recipes.

Where the tasting references describe a specific vintage, the profile identifies it; non-vintage and house-style profiles are labeled accordingly. Bottle photos reuse the existing 25-product image gallery and can depict a different vintage. Third-party image usage and source credit remain governed by `ATTRIBUTION.md`.

The remaining three style examples have not yet received individual profiles: Château Suduiraut, Royal Tokaji, and Michele Chiarlo. They still appear in the original wine-style guide with their bottle photos.

## Wines I've Tried (2026-11-03)

Added a separate, non-destructive personal Sommelier collection containing the **13 wines** from the user's uploaded wine list. All profiles have real photographs of the identified wine's bottle and visible source links, plus separate note sections for the uploaded descriptions and extended sommelier analysis (nose, palate, finish, suggested food pairings, serving temperature and structure).

The personal list is stored in `data/sommelier-tried-wines.json`, rendered by `sommelier-tried.js` and `sommelier-tried.css` at `#/sommelier` and `#/sommelier/tried/<id>`. **The original 22 wine-producer profiles, 25 styles and cocktail data were not changed.**

Important label caveats are shown on each entry: e.g., the supplied Willa wine's year isn't independently verified, Roselana's available matching photo is a 2024 label while the list records 2023, and Furlani 'Alpino' was matched to the skin-contact Pinot Grigio **Alpino Macerato** rather than a different conventional Alpino cuvée. Third-party photos are linked from their source websites and are not downloaded into this repository.

## One Sommelier bottle catalog (2026-11-03)

All **35 specific real wine bottles** appear together inside the existing **Explore real bottles** grid, alphabetically by producer: 22 producer profiles and 13 bottles originally collected from a wine list. The UI does not separate these sources, rank wines, or display prices. Search all bottles by name, producer, grape, country, region, flavor, or food pairing. Wine-type filters include red, white, rosé, orange, sparkling and dessert/fortified.

Every bottle retains a dedicated profile, its real product image and source notes. Previous URLs remain supported, including the legacy `#/sommelier/tried/<id>` route, while new cards use the consistent `#/sommelier/bottle/<id>` route. The 25 educational wine-style cards continue below, unchanged. The original cocktail data, measurements and My Recipes features were not modified.
