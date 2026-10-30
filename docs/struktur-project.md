# Struktur Project ExploreID

File project dikelompokkan berdasarkan tanggung jawab supaya mudah dicari dan dikembangkan.

```text
EXPLOREID/
├── .htaccess                     # URL publik untuk Apache/Laragon
├── wrangler.toml                 # Konfigurasi Cloudflare Pages dan D1
├── readme.md                     # Spesifikasi project
├── public/                       # Output publik Cloudflare Pages
│   ├── index.html                # Halaman beranda
│   ├── _redirects                # URL publik untuk Cloudflare Pages
│   ├── assets/
│   │   ├── css/styles.css        # Style bersama
│   │   └── js/app.js             # Render halaman dan interaksi
│   └── pages/
│       ├── destinasi.html        # Direktori dan detail tempat
│       ├── kategori.html         # Kategori dari database
│       ├── peta.html
│       ├── tentang.html
│       ├── akun/
│       │   ├── masuk.html
│       │   └── daftar.html
│       └── pengguna/
│           ├── tersimpan.html
│           └── itinerary.html
├── database/
│   ├── schema.sql                # Skema Cloudflare D1 / SQLite
│   └── import_openstreetmap.sql  # 16.794 rekaman dari CSV sumber
├── docs/
│   ├── CLOUDFLARE_D1.md          # Panduan setup database dan deployment
│   └── struktur-project.md       # Panduan struktur folder
├── functions/
│   └── api/
│       ├── categories.js         # API kategori dari D1
│       └── destinations.js       # API pencarian/detail tempat dari D1
```

## Aturan penempatan file

- Halaman publik masuk ke `public/pages/`, lalu daftarkan URL-nya pada `public/_redirects` dan `.htaccess`.
- Halaman akun masuk ke `public/pages/akun/`; halaman pengguna masuk ke `public/pages/pengguna/`.
- Detail tempat memakai `public/pages/destinasi.html?osm_type=...&osm_id=...`, jadi satu template melayani semua baris database.
- Endpoint Cloudflare Pages Functions berada di `functions/api/`.
- Skema dan file impor SQL ada di `database/`; file besar `import_openstreetmap.sql` dibuat dari CSV yang diberikan pengguna.
- Style dan JavaScript bersama ada di `public/assets/css/` dan `public/assets/js/`.

Hanya isi `public/` yang dikirim ke Cloudflare Pages; file SQL dan dokumentasi tidak dipublikasikan sebagai aset statis. Gunakan Cloudflare Pages/Workers untuk menjalankan Functions dan mengakses D1. Apache/Laragon hanya melayani halaman statis dan tidak menyediakan binding D1.
