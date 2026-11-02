# Cocktail Atlas: English cocktail library

Independent, responsive English recipe site **inspired by** [Decent Cocktails](https://en.decentespresso.com/cocktails/), with a similar editorial layout, bottle-cutout imagery, guided recipe steps, search and personal lists. The project is **not affiliated with Decent Espresso** and does not provide the original site’s proprietary account service or hardware protocol.

![Coverage](https://img.shields.io/badge/PDT-304_recipes-c9623c) ![Coverage](https://img.shields.io/badge/Death_%26_Co-477_recipes-556b5d)

## Quick start

```bash
python3 -m http.server 8080
```

Open http://localhost:8080. No build process, dependencies, account credentials or API key needed. Opening `index.html` directly with `file://` is not supported for cross-origin API fetches.

## Routes

Hash routes are compatible with GitHub Pages without additional server rewriting:

- `#/`: choose a cocktail book
- `#/pdt`, `#/deathco`: individual book homepages and spirit lists
- `#/pdt/recipes`, `#/deathco/recipes`: full indexed recipe lists
- `#/pdt/recipe/Margarita`: cocktail details, bottle hover previews, calculated stats, drink illustration, weighted steps, adjustable servings, similar recipes
- `#/pdt/spirits`, `#/pdt/ingredients`, `#/pdt/glasses`: category browse pages
- `#/pdt/search/mezcal`: cross-recipe/ingredient search
- `#/bar`: local ingredient inventory
- `#/saved`: local Wishlist and Made lists
- `#/help`: help center with images and guide
- `#/about`: attribution and limitations

Use Death & Co equivalents by replacing `pdt` with `deathco`.

## Data and images

- Uses Decent Cocktails' publicly documented, **read-only, cross-origin JSON API**: `https://decentespresso.com/cocktails/api/`.
- Recipe index lists are paginated at 50 results, then cached in `localStorage`. Full recipe details load only on demand; the app does not bulk-download recipes.
- The API currently lists **304 PDT** and **477 Death & Co** recipes. The source site displays **300** and **500** as rounded headings.
- Cocktail and glass illustrations are Decent creations licensed CC BY 4.0, subject to their stated limitations.
- **Bottle imagery, brand/product photographs and labels are *not* CC-licensed.** The site points to remotely hosted ingredient photos, thumbnails, and cutout images (for the bottle previews). These files are **not committed** or redistributed with this project. If the asset host blocks hotlinking or removes images, those images will disappear.
- The application respects normal browsing behavior rather than automatically fetching every detail and is designed to avoid the public service's 60 requests/minute per-IP limit.

## Features

- Two source catalogs, responsive desktop/tablet/mobile presentation, light/dark themes
- Cocktail index and ingredient search, including a live suggestion dropdown
- Ingredient cutouts at the recipe top with enlarged hover previews
- Grams / original ounce measurements; choose 1 to 30 drinks
- Recipe making-mode preview with step-by-step navigation
- Cocktail illustrations, nutrition-style drink statistics, similar recipes, other-book versions
- Ingredient directory with name matching and recipes using the ingredient
- Local ingredient shelf, Wishlists, Made records, search and copy controls
- Help and credits sections

## Known differences (not a pixel-perfect clone)

- The original site's full spirit-combination index, ingredient-pair counts and some glass filters are not exposed by the public JSON API. This app offers featured/local results for those categories, while the entire recipe name catalog is available.
- No Decent account login or server synchronization. Your Bar, Made, Wishlist and recent recipe caches are stored **in this browser only**.
- Making mode is a **preview**. No actual Bluetooth/scale measurements, automatic taring, measurement tolerance or completed-pour feedback.
- The original website's adjustable target alcohol/volume/sugar tool, substitution engine, native iOS/macOS app, account data and brand-associated product functionality are not copied.
- Exact visual fidelity across desktop/mobile requires side-by-side browser testing with reference assets. This project follows the same general styling but is an independent implementation.

## Publishing on GitHub Pages

1. Create a new GitHub repository called `cocktail-atlas` and **do not initialize it with README**.
2. From this extracted folder run:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/cocktail-atlas.git
   git push -u origin main
   ```

3. Repository → **Settings → Pages** → Source: **GitHub Actions**. The workflow `.github/workflows/pages.yml` deploys when you push to `main`.

## Tests

```bash
node tests/route_test.cjs
# Optional: full browser integration, if your environment permits local HTTP pages
python3 tests/smoke_test.py
```

`route_test.cjs` renders 13 routes in a mocked document environment and checks recipe data, bottle images, and search flows. `smoke_test.py` uses Playwright/Chromium to test desktop and mobile. In the development environment used to prepare this repository, Chromium blocked local page navigation, so the Playwright test was written but could not be completed; no browser visual pass is claimed.

## Credit and licensing

Decent Espresso's published [licence and credits](https://decentespresso.com/cocktails/license) covers only its owned portions, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): descriptions, methods, computed figures and cocktail and glass artwork. Recipe facts derive from *The PDT Cocktail Book* by Jim Meehan (2011) and *Death & Co: Modern Classic Cocktails* by David Kaplan, Nick Fauchald and Alex Day (2014). This project credits Decent Cocktails in the footer and individual recipe pages. Third-party product labels and bottle images remain their owners' rights. Avoid publishing remote label imagery without verifying usage rights.

Source: <https://en.decentespresso.com/cocktails/> · API: <https://decentespresso.com/cocktails/api/>
