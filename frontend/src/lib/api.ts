// src/lib/api.ts
// Semua API call terpusat di sini — 100% LIVE DATA TANPA DATA FIKTIF

const MAPTILER_KEY      = (import.meta.env.VITE_MAPTILER_KEY as string) || 'yOkVtwcO1iYENTiJvyrd';
const EXCHANGE_KEY      = (import.meta.env.VITE_EXCHANGERATE_KEY as string) || '87f19f9d738f50e5fa80514b';
const ALPHAVANTAGE_KEY  = (import.meta.env.VITE_ALPHAVANTAGE_KEY as string) || 'Z7Y5XPTQKUY8GZ2I';

export const MAP_STYLE = `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;

// ─── Gempa Bumi (USGS — LIVE) ────────────────────────────────────────────────
export async function fetchEarthquakes() {
  const res = await fetch(
    'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
  );
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.features.map((f: any) => ({
    id: f.id,
    title: f.properties.title,
    magnitude: f.properties.mag,
    place: f.properties.place,
    time: new Date(f.properties.time).toISOString(),
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    type: 'Gempa',
  }));
}

// ─── Bencana Global (NASA EONET — LIVE) ──────────────────────────────────────
export async function fetchDisasters() {
  const res = await fetch(
    'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=40'
  );
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.events.map((e: any) => ({
    id: e.id,
    title: e.title,
    category: e.categories?.[0]?.title ?? 'Lainnya',
    date: e.geometry?.[0]?.date ?? e.geometry?.date ?? null,
    lat: e.geometry?.[0]?.coordinates?.[1] ?? e.geometry?.coordinates?.[1] ?? null,
    lng: e.geometry?.[0]?.coordinates?.[0] ?? e.geometry?.coordinates?.[0] ?? null,
    source: 'NASA EONET',
  }));
}

// ─── Cuaca (Open-Meteo — LIVE) ───────────────────────────────────────────────
export async function fetchWeather(lat: number, lng: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,windspeed_10m`
  );
  return res.json();
}

// ─── Kualitas Udara Real-Time (Open-Meteo Air Quality — LIVE) ────────────────
export async function fetchAirQualityLive(lat: number, lng: number) {
  const res = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi`
  );
  const json = await res.json();
  return json.current;
}

// ─── Nilai Tukar Valas Real-Time (ExchangeRate API — LIVE) ───────────────────
export async function fetchExchangeRates(base = 'USD') {
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${EXCHANGE_KEY}/latest/${base}`
  );
  return res.json();
}

// ─── Saham & Kuotasi Forex (Alpha Vantage — LIVE) ────────────────────────────
export async function fetchStockPrice(ticker: string) {
  const res = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHAVANTAGE_KEY}`
  );
  return res.json();
}

// ─── Komoditas Pasar Real-Time (Alpha Vantage — LIVE) ────────────────────────
export async function fetchLiveCommodities() {
  try {
    const [wtiRes, gasRes, copperRes] = await Promise.allSettled([
      fetch(`https://www.alphavantage.co/query?function=WTI&interval=monthly&apikey=${ALPHAVANTAGE_KEY}`).then(r => r.json()),
      fetch(`https://www.alphavantage.co/query?function=NATURAL_GAS&interval=monthly&apikey=${ALPHAVANTAGE_KEY}`).then(r => r.json()),
      fetch(`https://www.alphavantage.co/query?function=COPPER&interval=monthly&apikey=${ALPHAVANTAGE_KEY}`).then(r => r.json()),
    ]);

    const results = [];
    if (wtiRes.status === 'fulfilled' && wtiRes.value?.data?.[0]) {
      const val = parseFloat(wtiRes.value.data[0].value);
      results.push({
        name: 'Minyak Mentah WTI',
        symbol: 'WTI',
        price: `$${val.toFixed(2)}`,
        unit: '/barrel',
        date: wtiRes.value.data[0].date,
        source: 'Alpha Vantage WTI',
      });
    }
    if (gasRes.status === 'fulfilled' && gasRes.value?.data?.[0]) {
      const val = parseFloat(gasRes.value.data[0].value);
      results.push({
        name: 'Gas Alam Henry Hub',
        symbol: 'NATGAS',
        price: `$${val.toFixed(2)}`,
        unit: '/MMBtu',
        date: gasRes.value.data[0].date,
        source: 'Alpha Vantage Henry Hub',
      });
    }
    if (copperRes.status === 'fulfilled' && copperRes.value?.data?.[0]) {
      const val = parseFloat(copperRes.value.data[0].value);
      results.push({
        name: 'Tembaga Global (Copper)',
        symbol: 'COPPER',
        price: `$${val.toFixed(2)}`,
        unit: '/metric ton',
        date: copperRes.value.data[0].date,
        source: 'Alpha Vantage Copper',
      });
    }
    return results;
  } catch (err) {
    console.error('Error fetching commodities:', err);
    return [];
  }
}

// ─── GDP Real-Time (World Bank — LIVE) ───────────────────────────────────────
export interface LiveGDPRecord {
  code: string;
  iso3: string;
  name: string;
  gdpTrillion: number;
  year: string;
}

export async function fetchGlobalGDP(): Promise<LiveGDPRecord[]> {
  const codes = 'USA;CHN;DEU;JPN;IND;GBR;FRA;IDN';
  const nameMap: Record<string, { code: string; name: string }> = {
    USA: { code: 'US', name: 'Amerika Serikat' },
    CHN: { code: 'CN', name: 'Tiongkok' },
    DEU: { code: 'DE', name: 'Jerman' },
    JPN: { code: 'JP', name: 'Jepang' },
    IND: { code: 'IN', name: 'India' },
    GBR: { code: 'GB', name: 'Inggris' },
    FRA: { code: 'FR', name: 'Prancis' },
    IDN: { code: 'ID', name: 'Indonesia' },
  };

  try {
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${codes}/indicator/NY.GDP.MKTP.CD?format=json&mrv=1`
    );
    const json = await res.json();
    if (!json?.[1]) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json[1].map((item: any) => {
      const iso = item.countryiso3code;
      const meta = nameMap[iso] || { code: iso, name: item.country.value };
      return {
        code: meta.code,
        iso3: iso,
        name: meta.name,
        gdpTrillion: item.value ? +(item.value / 1e12).toFixed(2) : 0,
        year: item.date,
      };
    }).sort((a: LiveGDPRecord, b: LiveGDPRecord) => b.gdpTrillion - a.gdpTrillion);
  } catch (err) {
    console.error('Failed to load World Bank GDP:', err);
    return [];
  }
}

// ─── Inflasi Real-Time (World Bank — LIVE) ──────────────────────────────────
export interface LiveInflationRecord {
  code: string;
  name: string;
  inflationYoY: number;
  year: string;
}

export async function fetchGlobalInflation(): Promise<LiveInflationRecord[]> {
  const codes = 'USA;CHN;DEU;JPN;IND;GBR;FRA;IDN';
  const nameMap: Record<string, { code: string; name: string }> = {
    USA: { code: 'US', name: 'Amerika Serikat' },
    CHN: { code: 'CN', name: 'Tiongkok' },
    DEU: { code: 'DE', name: 'Jerman' },
    JPN: { code: 'JP', name: 'Jepang' },
    IND: { code: 'IN', name: 'India' },
    GBR: { code: 'GB', name: 'Inggris' },
    FRA: { code: 'FR', name: 'Prancis' },
    IDN: { code: 'ID', name: 'Indonesia' },
  };

  try {
    const res = await fetch(
      `https://api.worldbank.org/v2/country/${codes}/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1`
    );
    const json = await res.json();
    if (!json?.[1]) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json[1].map((item: any) => {
      const iso = item.countryiso3code;
      const meta = nameMap[iso] || { code: iso, name: item.country.value };
      return {
        code: meta.code,
        name: meta.name,
        inflationYoY: item.value !== null ? +Number(item.value).toFixed(2) : 0,
        year: item.date,
      };
    });
  } catch (err) {
    console.error('Failed to load World Bank Inflation:', err);
    return [];
  }
}

// ─── GDP Spesifik per Negara (World Bank) ────────────────────────────────────
export async function fetchGDP(countryCode: string, years = 5) {
  const res = await fetch(
    `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&mrv=${years}`
  );
  const json = await res.json();
  return json[1];
}

export async function fetchInflation(countryCode: string) {
  const res = await fetch(
    `https://api.worldbank.org/v2/country/${countryCode}/indicator/FP.CPI.TOTL.ZG?format=json&mrv=5`
  );
  const json = await res.json();
  return json[1];
}

// ─── Utilitas ─────────────────────────────────────────────────────────────────
export function categoryToIcon(category: string): string {
  const map: Record<string, string> = {
    Wildfires: 'FIRE',
    'Severe Storms': 'STORM',
    Volcanoes: 'VOLCANO',
    Floods: 'FLOOD',
    Earthquakes: 'SEISMIC',
    Landslides: 'LANDSLIDE',
    Drought: 'DROUGHT',
    'Sea and Lake Ice': 'ICE',
    default: 'EVENT',
  };
  return map[category] ?? map.default;
}

export function severityColor(magnitude: number | null): string {
  if (!magnitude) return 'text-gray-400';
  if (magnitude >= 7) return 'text-red-400';
  if (magnitude >= 5) return 'text-orange-400';
  return 'text-yellow-400';
}
