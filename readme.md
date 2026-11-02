<div align="center">
  <img src="./frontend/public/logo.png" alt="World Monitor Logo" width="120" height="120" style="border-radius: 20px;" />
  
  # 🌍 World Monitor
  ### Real-Time Global Intelligence & Situational Awareness Platform
  
  [![Live Production](https://img.shields.io/badge/🌐_LIVE-world--monitoring.jack--ai.my.id-00E5FF?style=for-the-badge&labelColor=0A0F24)](https://world-monitoring.jack-ai.my.id)
  [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
  [![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
  [![License MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

  <br />

  **Platform pemantauan intelijen global real-time berstandar enterprise.**
  <br />
  Mengintegrasikan satelit NASA EONET, seismograf USGS, monitor ekonomi, radar cuaca Windy,
  <br />
  YouTube Data API v3 untuk siaran bencana live, serta analisis AI multi-provider.

  <br />

  [🚀 **Open Live Platform**](https://world-monitoring.jack-ai.my.id) · [📖 Documentation](#-setup--installation) · [🛡️ Security](#️-security-features)
</div>

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| 🌐 **3D Interactive Globe** | Visualisasi bumi 3D dengan siklus siang/malam NASA, poligon negara HD, dan marker real-time |
| 📊 **Statistical Dashboard** | Agregasi KPI: PDB World Bank, gempa USGS, kurs valas, dan bencana NASA |
| 🔴 **Disaster & Seismic Monitor** | Pantauan gempa M4.5+ (USGS), bencana NASA EONET, siaran live YouTube 24/7 |
| 💹 **Financial Terminal** | Kurs valas 160+ mata uang, komoditas (WTI, Gas, Tembaga), sesi pasar global |
| 🌫️ **Air Quality Heatmap** | Sensor AQI, PM2.5, PM10, Ozon dari Open-Meteo untuk kota metropolitan |
| ⚡ **Energy Monitor** | Data energi EIA, intensitas karbon Electricity Maps |
| 🛰️ **Transport Radar** | Pelacakan penerbangan OpenSky ADS-B, data kapal AISStream |
| 🤖 **AI Multi-Provider** | Auto-failover: Groq → Gemini → DeepSeek → OpenAI → Mistral → OpenRouter |
| 🏴 **Country Intelligence** | Profil 19+ negara dengan flag emoji, skor stabilitas, dan analisis regional |
| 📡 **Live Weather Radar** | Radar cuaca interaktif Windy dengan data Doppler global |
| 🎥 **YouTube Live Streams** | Siaran bencana 24/7 via YouTube Data API v3 dengan filter topik |
| 🔔 **Browser Notifications** | Notifikasi bencana via Web Push (tanpa Telegram) |

---

## 📡 Real-Time Data Sources

| Source | Provider | Integration | Usage |
|:-------|:---------|:------------|:------|
| 🔬 Seismik & Gempa | **USGS Earthquake Hazards** | REST GeoJSON | Gempa M4.5+ global (7 hari) |
| 🛰️ Bencana Alam | **NASA EONET v3** | REST API | Kebakaran, siklon, erupsi, banjir |
| 💱 Valas & Kurs | **ExchangeRate-API** | REST API | 160+ mata uang live |
| 📈 PDB & Ekonomi | **World Bank Open Data** | REST JSON | PDB nominal & inflasi |
| 🛢️ Komoditas | **Alpha Vantage** | REST API | WTI, Gas Alam, Tembaga |
| 🌬️ Kualitas Udara | **Open-Meteo** | REST API | AQI, PM2.5, PM10, Ozon |
| ✈️ Penerbangan | **OpenSky Network** | REST API | ADS-B radar real-time |
| ⚡ Energi | **U.S. EIA** | REST API | Data minyak & gas global |
| 🎥 Video Live | **YouTube Data API v3** | REST API | Siaran bencana & berita |
| 🌦️ Radar Cuaca | **Windy.com** | Embed | Radar Doppler interaktif |
| 🗺️ Peta Vektor | **MapTiler Cloud** | Vector Tiles | Dark-theme GIS tiles |
| 🌍 Geopolitik | **GDELT Project** | REST GeoJSON | Konflik & krisis global |

---

## 🛡️ Security Features

| Layer | Protection |
|:------|:-----------|
| **L3/L4 DDoS** | Cloudflare built-in DDoS mitigation (automatic) |
| **L7 Rate Limiting** | IP-based rate awareness + Cloudflare WAF rules |
| **HSTS** | `Strict-Transport-Security` max-age 1 year + preload |
| **XSS Protection** | `X-XSS-Protection: 1; mode=block` + CSP headers |
| **Content Security** | `Content-Security-Policy` with strict frame-src |
| **Clickjacking** | `X-Frame-Options: SAMEORIGIN` |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` |
| **Referrer** | `strict-origin-when-cross-origin` |
| **Input Sanitization** | XSS/SQL injection vector stripping on all API inputs |
| **Auth** | Admin panel with timing-attack resistant login flow |
| **Permissions** | `Permissions-Policy` restricting camera/mic/geolocation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE NETWORK                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              worker.ts (Edge Gateway)                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │  │
│  │  │ Security │  │ API      │  │ SPA Fallback      │   │  │
│  │  │ Headers  │  │ Router   │  │ + Asset Serving   │   │  │
│  │  │ + Rate   │  │ + AI     │  │ + Cache Control   │   │  │
│  │  │ Limiting │  │ Failover │  │                   │   │  │
│  │  └──────────┘  └────┬─────┘  └───────────────────┘   │  │
│  └──────────────────────┼───────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
   │ NASA EONET  │ │ USGS Quake  │ │ YouTube API  │
   │ World Bank  │ │ Open-Meteo  │ │ ExchangeRate │
   │ GDELT       │ │ OpenSky     │ │ Alpha Vantage│
   │ EIA Energy  │ │ Elec. Maps  │ │ MapTiler     │
   └─────────────┘ └─────────────┘ └──────────────┘
```

---

## 🧭 All Pages & Routes

| Page | Route | Description |
|:-----|:------|:------------|
| Landing | `/` | Animated hero & platform overview |
| Country Intelligence | `/intelligence` | National stability scores with flag emojis |
| Dashboard | `/dashboard` | Real-time KPI aggregation center |
| 3D Globe | `/map` | Interactive Earth with day/night cycle |
| Financial Monitor | `/ekonomi` | Forex terminal & commodity tracker |
| Air Quality | `/lingkungan` | AQI heatmap & pollution sensors |
| Geopolitical | `/geopolitik` | GDELT conflict & UN crisis reports |
| Disaster Monitor | `/bencana` | Seismic + EONET + YouTube live streams |
| Energy | `/energi` | EIA petroleum & carbon intensity |
| Technology | `/teknologi` | Tech sector monitoring |
| Transport | `/transportasi` | Flight radar & vessel tracking |
| Data Explorer | `/data` | Raw data inspection tools |
| Notifications | `/notifikasi` | Browser push notification center |
| Settings | `/pengaturan` | Platform configuration |

---

## 💻 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/world-monitor.git
cd world-monitor/frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Required
VITE_MAPTILER_KEY=your_maptiler_key
VITE_EXCHANGERATE_KEY=your_exchangerate_key

# Optional (AI Multi-Provider)
VITE_GEMINI_KEY=your_gemini_key
VITE_GROQ_KEY=your_groq_key
VITE_DEEPSEEK_KEY=your_deepseek_key
VITE_OPENAI_KEY=your_openai_key

# Optional (Monitors)
VITE_YOUTUBE_KEY=your_youtube_data_api_v3_key
VITE_ALPHAVANTAGE_KEY=your_alphavantage_key
VITE_EIA_KEY=your_eia_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Cloudflare Workers
```bash
npm run deploy
```

---

## 📁 Project Structure

```
world-monitor/
├── README.md
├── frontend/
│   ├── worker.ts              # Cloudflare Edge Worker (API Gateway + Security)
│   ├── wrangler.toml           # Cloudflare Workers config
│   ├── vite.config.ts          # Vite bundler config
│   ├── index.html              # SPA entry + OG meta tags
│   ├── public/
│   │   ├── logo.png            # Platform logo
│   │   └── favicon.png         # Favicon
│   └── src/
│       ├── App.tsx             # Root layout (Sidebar + Mobile drawer)
│       ├── main.tsx            # React Router v6 routes
│       ├── index.css            # Global styles + scroll behavior
│       ├── lib/
│       │   └── api.ts          # Centralized API integration layer
│       ├── components/
│       │   └── Sidebar.tsx     # Desktop collapsible + mobile drawer
│       └── pages/
│           ├── Landing.tsx      # Hero landing page
│           ├── Home.tsx         # Country Intelligence (with flags)
│           ├── Dashboard.tsx    # Statistical KPI Dashboard
│           ├── Map.tsx          # 3D Globe (Three.js + globe.gl)
│           ├── EconomicMonitor.tsx
│           ├── Environment.tsx
│           ├── GeopoliticalMonitor.tsx
│           ├── DisasterMonitor.tsx
│           ├── EnergyMonitor.tsx
│           ├── TechMonitor.tsx
│           ├── TransportMonitor.tsx
│           ├── DataExplorer.tsx
│           ├── NotificationCenter.tsx
│           ├── Settings.tsx
│           └── AdminLogin.tsx   # Hidden admin auth (/auth/admin)
```

---

## 🤝 Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5, Tailwind CSS |
| **3D/GIS** | Three.js, globe.gl, MapLibre GL JS |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Runtime** | Cloudflare Workers (Edge Compute) |
| **AI** | Multi-provider failover (6 providers) |
| **Security** | CSP, HSTS, XSS Protection, Rate Limiting |

---

## 📄 License

Distributed under the **MIT License**. Free for research, academic, and situational awareness system development.

---

<div align="center">
  <br />
  <img src="./frontend/public/logo.png" alt="World Monitor" width="40" height="40" style="border-radius: 8px;" />
  <br />
  <b>World Monitor</b> — Global Real-Time Intelligence Platform
  <br />
  <a href="https://world-monitoring.jack-ai.my.id">world-monitoring.jack-ai.my.id</a>
  <br /><br />
  Built with ❤️ and ☕ for a safer world.
</div>
