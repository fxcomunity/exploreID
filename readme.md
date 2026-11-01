# 🌐 World Monitor — Global Real-Time Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20Production-00E5FF?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Live Status" />
  <img src="https://img.shields.io/badge/Platform-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflareworkers&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React & Vite" />
  <img src="https://img.shields.io/badge/3D%20Engine-Three.js%20%7C%20Globe.gl-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Data%20Integrity-100%25%20Real--Time%20Live-10B981?style=for-the-badge&logo=nasa&logoColor=white" alt="Real-Time Data" />
</p>

<p align="center">
  <b>Platform Intelijen Geospasial & Pemantauan Global Real-Time Berstandar Enterprise.</b><br />
  Mengintegrasikan visualisasi bola dunia 3D interaktif dengan siklus siang-malam NASA, telemetri bencana alam, analitik ekonomi makro, serta sensor kualitas udara dunia tanpa data fiktif.
</p>

<p align="center">
  <a href="https://world-monitor.aqsholhalqi4.workers.dev" target="_blank">
    <b>🚀 Buka Live Deployment di Cloudflare Workers</b>
  </a>
</p>

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Modul Intelijen & Halaman](#-modul-intelijen--halaman)
- [Sumber Data Real-Time](#-sumber-data-real-time-verified)
- [Teknologi & Arsitektur](#-teknologi--arsitektur)
- [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
- [Deployment Cloudflare Workers](#-deployment-cloudflare-workers)
- [Struktur Direktori](#-struktur-direktori)
- [Lisensi](#-lisensi)

---

## 🌟 Fitur Utama

- **3D Planetary Globe (Google Earth Day & Night Cycle)**  
  Visualisasi bumi 3D interaktif beresolusi tinggi menggunakan `globe.gl` dan custom shader Three.js. Menampilkan simulasi pencahayaan matahari aktual: sisi siang (*NASA Blue Marble*), sisi malam (*Earth at Night / City Lights*), gradien senja/fajar (*twilight terminator*), serta batas wilayah negara berdefinisi tinggi yang dapat disorot dan diklik.

- **Global Statistical Intelligence (Tanpa Data Fiktif)**  
  Pusat telemetri murni berbasis metrik kuantitatif. Menyajikan agregasi gempa bumi signifikan M5+ real-time (USGS), distribusi kebakaran, badai, banjir, dan anomali iklim aktif (NASA EONET), serta PDB resmi negara (World Bank).

- **Financial & Forex Exchange Terminal (`/ekonomi`)**  
  Papan pemantauan valas 160+ mata uang dunia (USD, IDR, EUR, GBP, JPY, CNY, SGD, AUD, dll.) dengan kalkulator konversi live, status sesi pasar finansial global (New York, London, Tokyo, Jakarta), yield obligasi negara 10-tahun, dan harga komoditas strategis (Minyak WTI, Gas Alam, Tembaga).

- **Atmospheric & Air Quality Heatmap (`/lingkungan`)**  
  Pemetaan kualitas udara global dengan integrasi sensor lapangan Open-Meteo Air Quality. Menyajikan data live indeks AQI, konsentrasi PM2.5, PM10, serta ozon (O3) pada kota-kota metropolitan dunia.

- **Desain Intelijen Bersih & Natural (100% Zero-Emoji)**  
  Antarmuka monospaced dengan palet warna cyber dark-theme, badge kode ISO negara teknis (misal: `[US]`, `[ID]`, `[JP]`, `[CN]`), tag status teknis (`[FIRE]`, `[SEISMIC]`, `[STORM]`), dan indikator tren visual natural.

- **Cloudflare Edge Compute Deployment**  
  Didistribusikan secara global melalui Cloudflare Workers dengan asset serving edge super cepat, SPA route fallback otomatis, dan header keamanan bawaan (*nosniff*, *SAMEORIGIN*, *strict-origin*).

---

## 🧭 Modul Intelijen & Halaman

| Halaman | Rute URL | Deskripsi Singkat |
| :--- | :--- | :--- |
| **Country Intelligence** | `/intelligence` | Ringkasan profil geopolitik, kestabilan negara, dan indeks komparatif. |
| **Statistical Dashboard** | `/dashboard` | Agregasi KPI real-time: PDB World Bank, gempa USGS, valas, & bencana NASA. |
| **Interactive 3D Globe** | `/map` | Globe 3D Google Earth dengan siklus siang/malam dan poligon negara HD. |
| **Financial Monitor** | `/ekonomi` | Terminal kurs valas live, kalkulator konversi, dan komoditas pasar dunia. |
| **Air Quality Monitor** | `/lingkungan` | Heatmap polusi atmosfer & telemetri sensor AQI kota-kota dunia. |

---

## 📡 Sumber Data Real-Time (Verified)

Aplikasi ini menggunakan pipeline API resmi tanpa simulasi atau data tiruan:

| Sumber Data | Provider / Endpoint | Tipe Integrasi | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Seismik & Gempa** | **USGS Earthquake Hazards Program** | REST GeoJSON Live | Gempa M5+ signifikan global (7 hari terakhir) |
| **Bencana & Anomali** | **NASA EONET v3** | REST API Live | Kebakaran hutan, siklon tropis, erupsi vulkanik |
| **Valuta Asing & Kurs** | **ExchangeRate-API** | REST API Verified | Nilai tukar 160+ mata uang dengan USD base |
| **Ekonomi & PDB** | **World Bank Open Data** | REST JSON API | Data PDB nominal & inflasi tahunan resmi |
| **Komoditas Strategis** | **Alpha Vantage Global Market** | REST API Live | Harga spot Minyak WTI, Gas Alam Henry Hub, Tembaga |
| **Kualitas Udara (AQI)** | **Open-Meteo Air Quality** | REST API Live | Sensor PM2.5, PM10, Ozon, & US AQI per koordinat |
| **Peta Vektor & Tiles** | **MapTiler Cloud** | Vector GL Tiles | Base map tema gelap high-contrast untuk GIS |

---

## 🛠️ Teknologi & Arsitektur

```
[ User Request ] ──> [ Cloudflare Edge Worker (worker.ts) ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [ Static SPA Assets ]            [ SPA Client Routing ]
   (React 18 + Vite 5 + Tailwind)   (React Router v6 Fallback)
            │
            ▼
   [ Real-Time Data Pipeline ]
   ├── NASA EONET API ──────────> Bencana Alam Global
   ├── USGS Earthquake Feed ────> Aktivitas Seismik
   ├── World Bank API ──────────> PDB & Inflasi Riil
   ├── ExchangeRate-API ────────> Kurs Valas 160+ Negara
   ├── Alpha Vantage API ───────> Harga Komoditas Spot
   └── Open-Meteo Air Quality ──> Sensor AQI & Partikulat
```

- **Frontend Core**: React 18, TypeScript, Vite 5, Tailwind CSS.
- **3D & Visualisasi GIS**: Three.js, `globe.gl`, MapLibre GL JS, Recharts, Lucide Icons.
- **Runtime & Deployment**: Cloudflare Workers (dengan binding Static Assets).

---

## 💻 Panduan Instalasi Lokal

### 1. Kloning Repository
```bash
git clone https://github.com/fxcomunity/world-monitor.git
cd world-monitor
```

### 2. Konfigurasi Variabel Lingkungan
Salin template `.env.example` ke file `.env` di folder frontend:
```bash
cp frontend/.env.example frontend/.env
```
Buka file `frontend/.env` dan lengkapi API key Anda:
```env
VITE_MAPTILER_KEY=isi_key_maptiler_anda
VITE_EXCHANGERATE_KEY=isi_key_exchangerate_anda
VITE_ALPHAVANTAGE_KEY=isi_key_alphavantage_anda
```

### 3. Jalankan Aplikasi
```bash
cd frontend
npm install
npm run dev
```
Akses aplikasi melalui browser di **`http://localhost:5173`**.

---

## ☁️ Deployment Cloudflare Workers

Aplikasi ini sudah dilengkapi skrip deployment satu-klik menggunakan Cloudflare Wrangler:

```bash
cd frontend
npm run deploy
```

Perintah di atas akan secara otomatis:
1. Menjalankan kompilasi TypeScript dan bundler Vite (`vite build`).
2. Mengunggah aset yang diperbarui ke Cloudflare Assets Cache.
3. Memperbarui skrip `worker.ts` di jaringan edge Cloudflare secara instan.

Untuk mencoba server lokal Worker sebelum deploy:
```bash
npm run worker:dev
```

---

## 📁 Struktur Direktori

```
world-monitor/
├── .env.example                # Template variabel lingkungan root
├── package.json                # Root proxy scripts
├── README.md                   # Dokumentasi resmi proyek
├── world_monitor_schema.sql    # Skema PostgreSQL (Neon DB)
│
└── frontend/                   # Aplikasi Frontend & Cloudflare Worker
    ├── .env.example            # Template variabel lingkungan frontend
    ├── package.json            # Dependencies & deployment scripts
    ├── vite.config.ts          # Konfigurasi bundler Vite
    ├── wrangler.toml           # Konfigurasi Cloudflare Workers
    ├── worker.ts               # Skrip Edge Worker (SPA fallback & caching)
    └── src/
        ├── App.tsx             # Root Layout (Sidebar, Header, Main content)
        ├── main.tsx            # Routing & RouterProvider
        ├── lib/
        │   └── api.ts          # Integrasi terpusat seluruh API real-time
        └── pages/
            ├── Home.tsx            # Analisis Intelijen Negara
            ├── Dashboard.tsx       # Pusat Analitik Statistik Murni
            ├── Map.tsx             # Globe 3D Google Earth Day/Night
            ├── EconomicMonitor.tsx # Terminal Finansial & Valas Real-Time
            ├── Environment.tsx     # Kualitas Udara & Polusi Atmosfer
            └── Landing.tsx         # Halaman Pengantar Platform
```

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Bebas digunakan untuk keperluan riset, akademis, dan pengembangan sistem situational awareness.
