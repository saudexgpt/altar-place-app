# Branding source files

- `altar-place-app-logo.png` — transparent gold logo, used in-app (`src/assets/branding/altar-place-logo.png` is the copy actually imported by components).
- `logo-color-guide.png` — reference render of the logo on its navy backdrop; source for the extracted brand palette below.
- `sample-colors.mjs` / `derive-palette.mjs` — one-off scripts (run with `node branding/<file>.mjs`, requires `@capacitor/assets`' bundled `sharp` dependency) used to sample exact pixel colors from the source art and derive the full shade/tint/contrast set applied in `src/theme/variables.css`. Re-run these if the source art ever changes.

## Extracted palette

- **Gold** (primary): `#F0B030`
- **Dark Blue / Navy** (secondary base, all surface tones): `#001040` (fully saturated; lightness varied in HSL for background/card/border tiers, never blended toward gray)

## Regenerating icons/splash

The `../assets/logo.png` file (a copy of the transparent logo) is the source `@capacitor/assets` reads in "Easy Mode". To regenerate all Android icon densities and splash screens after changing the logo:

```
cd mobile-ionic-app
npx capacitor-assets generate --android \
  --iconBackgroundColor '#001040' --iconBackgroundColorDark '#001040' \
  --splashBackgroundColor '#001040' --splashBackgroundColorDark '#001040'
npx cap sync android
```
