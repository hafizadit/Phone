# Catatan proyek

- `carousel/` — carousel Instagram "Kenapa Hidup Makin Mahal" (lihat README di dalamnya).
- `story/free-will/` — IG story 1080×1920 "Did you choose to read this?" (Sapolsky, free will); render `node render.js`.
- `story/past-you/` — IG story 1080×1920 "Stop hating yourself for who you used to be" (Sapolsky), gaya krayon di atas kertas (tema `paper`); `node build.js && node render.js`.
- `story/rapor/` — lanjutan seri: rapor "Kurang rajin" + sticky notes, tema `sage`; `node build.js && node render.js`.
- `story/pencil-case/` — seri #3: kotak pensil 3 tingkat ("punya dia") vs kresek + pensil pendek ("punya kamu"), tema `sky`; `node build.js && node render.js`.
- `story/shared/hand.js` — alat gambar tangan untuk seri story: `createHand` (garis goyang, `scribbleFill` arsir krayon berantakan), `createKit` (tulisan tangan `write`, `rough`, `rule`, `arrow`), `defs` (filter krayon/kertas). Urutan warna seri: paper → sage → sky. Komposisi seri: judul 64px di y 326, ilustrasi ~856px lebar di tengah, teks bawah 50px di y 1410, label 28px di y 1618.
- `styles/djp-poster/` — gaya poster biru-emas (Montserrat + Caveat) yang dipelajari dari
  `reference.jpg`. Saat diminta mendesain "seperti desain itu / gaya biru-emas / gaya DJP",
  baca `styles/djp-poster/STYLE.md` lalu mulai dari salinan `template.html`; render dengan
  `node render.js <file>.html`.
