# Gaya Poster Biru-Emas (referensi: `reference.jpg`)

Gaya poster informasi bergaya DJP: latar biru royal, judul tebal emas + putih yang
miring ke atas, foto orang cut-out di tengah, panel info navy dengan pil kuning,
dan tagline tulisan tangan kuning. Sumber siap pakai: `template.html` (1080 × 1350).
Render: `node render.js` → `poster.png`.

Saat membuat desain baru "seperti ini", salin `template.html`, ganti isi teks dan
foto. Jangan pakai logo/lambang instansi asli kecuali pemiliknya yang meminta.

## Font
| Peran | Font | Ukuran @1080 | Catatan |
|---|---|---|---|
| Judul | **Montserrat ExtraBold 800** | 100–104 px, line-height ~1.06 | rata kiri, `rotate(-4deg)`, bayangan lembut `0 6px 18px rgba(0,8,50,.45)` |
| Teks panel | Montserrat Medium 500 | 26 px, lh 1.2 | rata tengah, putih |
| Pil | Montserrat Bold 700 | 29 px | teks navy di atas kuning |
| Body | Montserrat Regular 400 | 24–25 px, lh ~1.46 | putih lembut, 2 baris |
| URL | Montserrat Bold 700 | 23 px | putih, kanan bawah |
| Tagline | **Caveat Bold 700** | 46 px, lh .95 | kuning, `rotate(-3deg)`, 2 baris diakhiri koma di baris 1 |

Font ada di `fonts/` (Google Fonts, SIL OFL).

## Palet
| Token | Hex | Pakai |
|---|---|---|
| royal | `#102078` | warna dasar latar |
| royal-lt | `#1a3aa1` | gradasi terang kiri-atas & kanan |
| royal-glow | `#4a62c2` | sudut kanan-bawah paling terang |
| navy | `#001048` (82% opak) | panel info |
| ink | `#0e1a4a` | teks di atas kuning |
| gold | `#e8b800` | 2 baris pertama judul, segmen bar ke-2 |
| yellow | `#f8e000` | pil, tagline Caveat, segmen bar ke-3 |
| white | `#ffffff` | baris terakhir judul (kata kunci), URL, segmen bar ke-1 |

## Komposisi (kanvas 1080 × 1350, 4:5)
1. **Header** kiri-atas: lambang (~82 px) │ garis tipis putih vertikal │ logo putih.
2. **Judul** mulai x≈86, y≈215, 3 baris pendek (2–3 kata). Baris 1–2 emas, baris
   terakhir (kata kunci + "?") putih. Judul menumpuk di atas foto — foto boleh
   menyentuh/bersinggungan dengan huruf baris terakhir.
3. **Foto** cut-out PNG transparan, diambil dari atas (top-down), mengisi area
   tengah sampai kiri-bawah (≈ y 330–1000). Properti foto memakai biru + kuning
   agar menyatu dengan palet (kursi biru, meja kuning).
4. **Panel info** kanan, x 651–1010, y≈905: 2 baris kalimat pengantar + pil kuning
   berisi fakta utama (nomor aturan, tanggal, angka).
5. **Body** kiri-bawah x≈85, y≈1124, 2 baris penjelas.
6. **Tagline** Caveat kanan-bawah x≈721, y≈1112, 2 baris pararel ("Lebih X, / Lebih Y").
7. **Footer** y≈1310: bar 7 px tiga segmen sama panjang (putih → emas → kuning),
   x 85–812; URL rata kanan (margin kanan ~58).

## Latar & dekorasi
- Beberapa radial-gradient biru di atas `#102078` (kiri-atas, kanan-tengah, kanan-bawah lebih terang).
- Cahaya bokeh hangat buram (emas pucat) di sudut kanan-atas dan tepi kiri tengah-bawah.
- Dua bentuk lengkung transparan putih ~7%: satu dari tepi kiri turun ke bawah kursi,
  satu pita melengkung dari tengah-bawah naik lalu turun ke kanan-bawah.

## Prinsip
- Hanya 3 warna aksen: emas, kuning, putih di atas biru. Tanpa warna lain.
- Hierarki: judul (pertanyaan) → foto → pil fakta → tagline → body.
- Elemen judul dan tagline sedikit miring (−3° s/d −4°) agar dinamis; elemen lain lurus.
- Margin kiri ~85 px; elemen kanan berakhir di ~1010.
