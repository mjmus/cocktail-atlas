# Cocktail Atlas

A home-focused, responsive cocktail library in English. The original layout, bottle previews, recipe cards, dark theme, and personal lists remain in place.

## Recipe libraries

| Library | Recipes | How data is loaded |
| --- | ---: | --- |
| The PDT Cocktail Book | 304 | Public recipe API, on demand |
| Death & Co | 477 | Public recipe API, on demand |
| Shakerrr Library | 407 | Bundled recipe specifications in `data/shakerrr-recipes.json` |

The source interface uses rounded headings (300 and 500) for the first two books. All 407 Shakerrr entries were imported from `FusorXE/shakerrr-site` as a separate catalog; the existing book catalogs were not modified.

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
