# Story: Stop hating yourself for who you used to be (Sapolsky)

One Instagram story, 1080 × 1920 (9:16). Final image: `story.png`.

- `build.js` — generates the page; the crayon drawing is made in code (seeded hand
  drift, loose corners, colouring that spills over the lines, SVG wax-grain and
  pressure filters, light paper texture), so it comes out the same every time
- `render.js` — export to PNG
- One theme: `node build.js [theme] && node render.js` → `story.html` / `story.png`
  (default theme: `paper`)
- All themes: `node build.js --all && node render.js --all` → `variants/*.png` +
  `variants/_sheet.png` (side-by-side comparison)
- Themes (in `THEMES` in build.js): paper (chosen), tomato, forest, butter, night, blush
- Lettering: bubble letters by default; `LETTERS=sticker node build.js` gives the
  bold-stroke-with-white-rim style closer to the first version

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
Each theme sets background, text, line, box colours and texture strength; some
swap a crayon colour that would vanish into the background. Base crayons: red `#e8432e`, orange `#f2871b`,
yellow `#f6d31c`, green `#78c43a`, blue `#2f7fd8`, pink `#f08bb0`, purple `#6f3d98`
