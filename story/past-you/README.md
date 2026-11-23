# Story: Stop hating yourself for who you used to be (Sapolsky)

One Instagram story, 1080 × 1920 (9:16). Final image: `story.png`.

- `build.js` — generates `story.html`; the crayon drawing is made in code (seeded
  wobble + SVG crayon-texture filters), so it comes out the same every time
- `render.js` — export to PNG
- Rebuild: `node build.js && node render.js` (needs Playwright)

Visual references: the "Trigger Box" post (flat periwinkle background, pale lime
DM Sans text, rainbow crayon illustration) and its text-only companion page.

## Content and accuracy
- Idea: in *Determined* (2023), Sapolsky argues that behavior comes from causes
  you never controlled (genes, prenatal and childhood environment, stress,
  hormones, and so on), so nobody really deserves blame. This story applies that
  argument to blaming *yourself*. It is an application of his view, not a quote,
  hence "After Robert Sapolsky".
- The four crayon labels (genes, childhood, stress, hormones) all appear in his
  causal chain in *Behave* and *Determined*.

## Fonts (Google Fonts, SIL OFL, in `fonts/`)
DM Sans 700 (text, tracking −0.045em) · Gochi Hand (handwritten notes)

## Palette
background `#7a8ac5` · text `#dde895` · crayons: red `#e8432e`, orange `#f2871b`,
yellow `#f6d31c`, green `#78c43a`, blue `#2f7fd8`, pink `#f08bb0`, purple `#6f3d98`
