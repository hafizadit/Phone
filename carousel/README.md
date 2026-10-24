# Carousel: Kenapa Hidup Makin Mahal?

6 slide Instagram, 1080 × 1350 (4:5). Hasil akhir ada di `png/`.

- `carousel.html` — sumber desain (semua slide, grafik dalam SVG)
- `render.js` — ekspor tiap slide ke PNG: `node render.js` (butuh Playwright)
- Teks dan catatan verifikasi data: `../drafts/carousel-draft-id.md`

## Font
- Body: **Thasadith** (Google Fonts, SIL OFL), disertakan di `fonts/`.
- Judul: **Olympic** (font komersial, tidak disertakan). Selama Olympic belum
  terpasang, judul memakai **Archivo** (SIL OFL) sebagai pengganti. Pasang
  Olympic di sistem, lalu jalankan ulang `node render.js`; CSS sudah memanggil
  `"Olympic"` lebih dulu.

## Palet
`#041724` · `#093c33` · `#0e6142` · `#138651` · `#18ab60` (+ teks terang `#eef6f0`)
