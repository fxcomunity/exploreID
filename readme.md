# World Monitor — Global Real-Time Intelligence Platform

Platform pemantauan dan analisis intelijen global berbasis web dengan visualisasi **3D Interactive Globe (Google Earth Day & Night Cycle)**, peta tematik cuaca & kualitas udara, metrik ekonomi/valas real-time, seismik USGS, dan bencana global NASA EONET.

Live Deployment: **[https://world-monitor.aqsholhalqi4.workers.dev](https://world-monitor.aqsholhalqi4.workers.dev)**

---

## Fitur Utama

- **Live 3D Globe with Day/Night Illumination**: Siklus siang (Blue Marble NASA) dan malam (City Lights) dengan garis batas negara interaktif HD.
- **Global Statistical Intelligence**: Ringkasan metrik ekonomi makro (World Bank PDB & Inflasi), log seismik USGS M5+, dan distribusi anomali bencana NASA EONET tanpa data fiktif.
- **Financial & Economic Monitor (`/ekonomi`)**: Kurs valas real-time 160+ mata uang, kalkulator konversi valas interaktif, dan harga komoditas pasar dunia dari Alpha Vantage.
- **Environment & Air Quality (`/lingkungan`)**: Heatmap polusi global dan sensor lapangan AQI (PM2.5, PM10, O3) real-time dari Open-Meteo Air Quality API.
- **Desain Intelijen Bersih**: 100% bebas emoji, menggunakan kode teknis ISO negara, visualisasi neon cyber dark-theme, dan monospaced metadata.
- **Cloudflare Edge Deployment**: Didukung oleh Cloudflare Workers dengan asset serving global dan routing SPA fallback.

---

## Menjalankan Secara Lokal

1. Salin repository dan masuk ke direktori:
   ```bash
   git clone https://github.com/fxcomunity/exploreID.git
   cd exploreID
   ```

2. Konfigurasi Environment:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
   Isi file `frontend/.env` dengan API key Anda (MapTiler, ExchangeRate-API, Alpha Vantage).

3. Masuk ke folder frontend dan jalankan development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Buka [http://localhost:5173](http://localhost:5173).

---

## Deployment ke Cloudflare Workers

Aplikasi ini dapat langsung dideploy ke Cloudflare Workers hanya dengan:

```bash
cd frontend
npm run deploy
```
*(Menjalankan `vite build` dan mengunggah aset ke Cloudflare Workers).*
