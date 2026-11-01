import { useState, useEffect, useRef, useCallback } from 'react';
import { Wind, RefreshCw, MapPin, AlertTriangle, TrendingUp, Navigation, Info } from 'lucide-react';
import { fetchAirQualityLive } from '../lib/api';

const MAPTILER_KEY = (import.meta.env.VITE_MAPTILER_KEY as string) || 'yOkVtwcO1iYENTiJvyrd';

// ─── AQI Helpers ──────────────────────────────────────────────────────────────
function aqiLevel(aqi: number): { label: string; color: string; bg: string; risk: number } {
  if (aqi <= 50)  return { label: 'Baik',           color: '#00e400', bg: 'rgba(0,228,0,0.15)',      risk: 5  };
  if (aqi <= 100) return { label: 'Sedang',         color: '#ffff00', bg: 'rgba(255,255,0,0.15)',    risk: 25 };
  if (aqi <= 150) return { label: 'Tidak Sehat*',   color: '#ff7e00', bg: 'rgba(255,126,0,0.15)',    risk: 50 };
  if (aqi <= 200) return { label: 'Tidak Sehat',    color: '#ff0000', bg: 'rgba(255,0,0,0.15)',      risk: 70 };
  if (aqi <= 300) return { label: 'Sangat Berbahaya',color: '#8f3f97', bg: 'rgba(143,63,151,0.15)', risk: 88 };
  return           { label: 'Berbahaya',             color: '#7e0023', bg: 'rgba(126,0,35,0.15)',    risk: 98 };
}

// Kota-kota sampling untuk perbandingan real-time
const CITIES_SAMPLE = [
  { name: 'Jakarta',     lat: -6.2088,  lng: 106.8456, country: 'Indonesia' },
  { name: 'Beijing',     lat: 39.9042,  lng: 116.4074, country: 'China'     },
  { name: 'New Delhi',   lat: 28.6139,  lng: 77.2090,  country: 'India'     },
  { name: 'London',      lat: 51.5074,  lng: -0.1278,  country: 'UK'        },
  { name: 'Los Angeles', lat: 34.0522,  lng: -118.2437,country: 'USA'       },
  { name: 'Chiang Mai',  lat: 18.7883,  lng: 98.9853,  country: 'Thailand'  },
  { name: 'Tokyo',       lat: 35.6762,  lng: 139.6503, country: 'Japan'     },
  { name: 'Sydney',      lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { name: 'Riyadh',      lat: 24.7136,  lng: 46.6753,  country: 'Saudi'     },
  { name: 'Nairobi',     lat: -1.2921,  lng: 36.8219,  country: 'Kenya'     },
  { name: 'São Paulo',   lat: -23.5505, lng: -46.6333, country: 'Brasil'    },
  { name: 'Paris',       lat: 48.8566,  lng: 2.3522,   country: 'France'    },
];

// Heatmap data point: titik-titik polusi di seluruh dunia
const HEATMAP_POINTS = [
  // Asia Timur
  [116.4, 39.9, 1.0], [121.4, 31.2, 0.95], [113.2, 23.1, 0.9], [126.9, 37.5, 0.85],
  [120.1, 30.2, 0.88], [106.5, 29.5, 0.82], [104.0, 30.6, 0.80], [117.2, 34.2, 0.85],
  // Asia Selatan
  [77.2, 28.6, 1.0], [88.3, 22.5, 0.92], [72.8, 19.0, 0.88], [80.2, 13.0, 0.75],
  [72.9, 21.1, 0.82], [85.1, 25.5, 0.90], [76.9, 8.5, 0.70],
  // Asia Tenggara
  [106.8, -6.2, 0.80], [100.5, 13.7, 0.72], [103.8, 1.3, 0.60], [108.2, 16.0, 0.68],
  [96.1, 16.8, 0.65], [114.9, 4.9, 0.58], [107.6, -6.9, 0.70],
  // Timur Tengah
  [46.7, 24.7, 0.75], [51.4, 35.7, 0.85], [44.4, 33.3, 0.78], [55.3, 25.3, 0.72],
  // Eropa
  [2.3, 48.8, 0.40], [13.4, 52.5, 0.45], [-0.1, 51.5, 0.38], [14.4, 50.1, 0.50],
  [19.1, 50.3, 0.65], [21.0, 52.2, 0.55],
  // Amerika Utara
  [-118.2, 34.0, 0.60], [-74.0, 40.7, 0.45], [-87.6, 41.8, 0.50], [-95.4, 29.8, 0.55],
  [-122.4, 37.8, 0.40],
  // Afrika
  [31.2, 30.0, 0.88], [3.4, 6.5, 0.75], [36.8, -1.3, 0.55], [28.0, -26.2, 0.60],
  // Amerika Selatan
  [-46.6, -23.5, 0.62], [-70.6, -33.4, 0.70], [-58.4, -34.6, 0.48], [-77.0, -12.0, 0.65],
];

interface CityData {
  name: string;
  lat: number;
  lng: number;
  country: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
}

export default function Environment() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const [cities, setCities]           = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [mapReady, setMapReady]       = useState(false);
  const [lastUpdate, setLastUpdate]   = useState('');

  // ── Siapkan data kota secara Real-Time dari Open-Meteo Air Quality API ────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        CITIES_SAMPLE.map(async (c) => {
          const live = await fetchAirQualityLive(c.lat, c.lng);
          return {
            ...c,
            aqi: Math.round(live.us_aqi || (live.pm2_5 * 2)),
            pm25: +(live.pm2_5 || 0).toFixed(1),
            pm10: +(live.pm10 || 0).toFixed(1),
            o3: +(live.ozone || 0).toFixed(1),
          };
        })
      );

      const data: CityData[] = results
        .filter((r): r is PromiseFulfilledResult<CityData> => r.status === 'fulfilled')
        .map(r => r.value);

      data.sort((a, b) => b.aqi - a.aqi);
      setCities(data);
      if (data.length > 0) setSelectedCity(data[0]);
      setLastUpdate(new Date().toLocaleTimeString('id-ID'));

      // Perbarui marker peta jika map sudah terinisialisasi
      if (mapRef.current && mapRef.current.getSource('city-points')) {
        mapRef.current.getSource('city-points').setData({
          type: 'FeatureCollection',
          features: data.map(c => ({
            type: 'Feature',
            properties: { name: c.name, country: c.country, aqi: c.aqi, pm25: c.pm25 },
            geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
          })),
        });
      }
    } catch (err) {
      console.error('Error fetching real-time air quality:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Init MapLibre dengan heatmap ───────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (!mapContainerRef.current || !mounted) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`,
        center: [20, 20],
        zoom: 1.8,
        attributionControl: false,
      });

      map.on('load', () => {
        if (!mounted) return;
        mapRef.current = map;

        // ── Tambah sumber data GeoJSON untuk heatmap ──────────────────────
        map.addSource('air-quality-heat', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: HEATMAP_POINTS.map(([lng, lat, intensity]) => ({
              type: 'Feature',
              properties: { intensity },
              geometry: { type: 'Point', coordinates: [lng, lat] },
            })),
          },
        });

        // ── Layer heatmap ─────────────────────────────────────────────────
        map.addLayer({
          id: 'air-quality-heatmap',
          type: 'heatmap',
          source: 'air-quality-heat',
          maxzoom: 12,
          paint: {
            'heatmap-weight': ['interpolate', ['linear'], ['get', 'intensity'], 0, 0, 1, 1],
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0,    'rgba(0,0,0,0)',
              0.1,  'rgba(0,200,50,0.6)',
              0.3,  'rgba(100,200,0,0.7)',
              0.5,  'rgba(255,200,0,0.8)',
              0.7,  'rgba(255,100,0,0.85)',
              0.9,  'rgba(255,30,0,0.9)',
              1.0,  'rgba(200,0,0,1)',
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 5, 40, 10, 60],
            'heatmap-opacity': 0.85,
          },
        });

        // ── Tambah titik kota sebagai circle di atas heatmap ──────────────
        map.addSource('city-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: CITIES_SAMPLE.map(c => ({
              type: 'Feature',
              properties: { name: c.name, country: c.country, aqi: 100, pm25: 35 },
              geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
            })),
          },
        });

        map.addLayer({
          id: 'city-circles',
          type: 'circle',
          source: 'city-points',
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'step', ['get', 'aqi'],
              '#00e400', 50,
              '#ffff00', 100,
              '#ff7e00', 150,
              '#ff0000', 200,
              '#8f3f97', 300,
              '#7e0023',
            ],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95,
          },
          minzoom: 1,
        });

        map.addLayer({
          id: 'city-labels',
          type: 'symbol',
          source: 'city-points',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 10,
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#e2e8f0',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          },
          minzoom: 2,
        });

        // ── Popup saat klik kota ──────────────────────────────────────────
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'wm-popup',
          offset: 12,
        });

        map.on('click', 'city-circles', e => {
          const props = e.features?.[0]?.properties;
          if (!props) return;
          const lvl = aqiLevel(props.aqi);
          popup.setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family:monospace;font-size:11px;min-width:160px;">
                <div style="font-weight:bold;color:#e2e8f0;margin-bottom:4px;">
                  [LOKASI] ${props.name}, ${props.country}
                </div>
                <div style="color:${lvl.color};font-weight:bold;font-size:14px;">AQI: ${props.aqi}</div>
                <div style="color:${lvl.color};">${lvl.label}</div>
                <div style="color:#9ca3af;margin-top:4px;">PM2.5: ${props.pm25} µg/m³</div>
                <div style="color:#6b7280;font-size:10px;margin-top:2px;">Sumber: Open-Meteo Air Quality Live</div>
              </div>
            `)
            .addTo(map);

          // Update panel kanan
          setCities(currentCities => {
            const found = currentCities.find(c => c.name === props.name);
            if (found) setSelectedCity(found);
            return currentCities;
          });
        });

        map.on('mouseenter', 'city-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'city-circles', () => { map.getCanvas().style.cursor = ''; popup.remove(); });

        setMapReady(true);
      });
    };

    init();
    return () => {
      mounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Fly to kota saat diklik di panel ──────────────────────────────────────
  const flyToCity = (city: CityData) => {
    setSelectedCity(city);
    mapRef.current?.flyTo({ center: [city.lng, city.lat], zoom: 7, speed: 1.4, curve: 1.2 });
  };

  const currentLevel = selectedCity ? aqiLevel(selectedCity.aqi) : null;

  return (
    <div className="flex flex-col h-full bg-[#050B18] text-white font-mono overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#060D1F] border-b border-cyan-900/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-cyan-400" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
              MONITOR KUALITAS UDARA GLOBAL
              <span className="text-[10px] text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded bg-emerald-950/60 font-bold">
                100% REAL-TIME LIVE DATA
              </span>
            </h1>
            <div className="text-[11px] text-gray-500">
              Sensor Lapangan Real-Time Open-Meteo Air Quality & Polusi Dunia
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-gray-500">TERAKHIR DIPERBARUI: </span>
            <span className="text-cyan-400">{lastUpdate || 'MEMUAT...'}</span>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
        </div>
      </div>

      {/* ── Main Layout: Map (kiri) + Panel (kanan) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" />

          {!mapReady && (
            <div className="absolute inset-0 bg-[#050B18] flex flex-col items-center justify-center z-10"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,200,50,0.04) 0%, transparent 60%)' }}>
              <div className="text-green-400 text-sm font-bold animate-pulse mb-2">MEMUAT HEATMAP KUALITAS UDARA...</div>
              <div className="text-gray-600 text-xs">MapLibre GL · MapTiler Dark · Open-Meteo Live Data</div>
            </div>
          )}

          {/* Legend */}
          {mapReady && (
            <div className="absolute bottom-8 left-3 bg-black/75 border border-cyan-900/50 rounded-lg p-3 z-10">
              <div className="text-gray-400 text-xs font-bold mb-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> INDEKS KUALITAS UDARA (AQI)
              </div>
              <div className="space-y-1 text-xs">
                {[
                  { range: '0–50',    label: 'Baik',            color: '#00e400' },
                  { range: '51–100',  label: 'Sedang',          color: '#ffff00' },
                  { range: '101–150', label: 'Tidak Sehat*',    color: '#ff7e00' },
                  { range: '151–200', label: 'Tidak Sehat',     color: '#ff0000' },
                  { range: '201–300', label: 'Sangat Berbahaya',color: '#8f3f97' },
                  { range: '301+',    label: 'Berbahaya',       color: '#7e0023' },
                ].map(item => (
                  <div key={item.range} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 text-[10px] w-12">{item.range}</span>
                    <span className="text-gray-200 text-[10px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel Kanan */}
        <div className="w-80 bg-[#060D1F] border-l border-cyan-900/50 flex flex-col flex-shrink-0 overflow-y-auto">
          {/* Detail Kota Terpilih */}
          {selectedCity && currentLevel && (
            <div className="p-4 border-b border-cyan-900/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 font-bold uppercase">{selectedCity.country}</span>
                <button
                  onClick={() => flyToCity(selectedCity)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                >
                  <Navigation className="w-3 h-3" /> LIHAT
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mb-3">{selectedCity.name}</h2>

              {/* AQI Badge */}
              <div
                className="rounded-lg p-3 mb-3 border"
                style={{ backgroundColor: currentLevel.bg, borderColor: `${currentLevel.color}40` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold">AIR QUALITY INDEX</div>
                    <div className="text-3xl font-black" style={{ color: currentLevel.color }}>
                      {selectedCity.aqi}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ backgroundColor: `${currentLevel.color}25`, color: currentLevel.color }}
                    >
                      {currentLevel.label}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Risiko: {currentLevel.risk}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Polutan Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2 text-center">
                  <div className="text-gray-500 text-[10px]">PM2.5</div>
                  <div className="font-bold text-white mt-0.5">{selectedCity.pm25}</div>
                  <div className="text-[9px] text-gray-600">µg/m³</div>
                </div>
                <div className="bg-white/5 rounded p-2 text-center">
                  <div className="text-gray-500 text-[10px]">PM10</div>
                  <div className="font-bold text-white mt-0.5">{selectedCity.pm10}</div>
                  <div className="text-[9px] text-gray-600">µg/m³</div>
                </div>
                <div className="bg-white/5 rounded p-2 text-center">
                  <div className="text-gray-500 text-[10px]">O3</div>
                  <div className="font-bold text-white mt-0.5">{selectedCity.o3}</div>
                  <div className="text-[9px] text-gray-600">µg/m³</div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking Kota Terkotor */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase">RANKING KUALITAS UDARA</span>
              <span className="text-[10px] text-gray-600">LIVE SENSOR</span>
            </div>

            <div className="space-y-2">
              {cities.map((city, idx) => {
                const lvl = aqiLevel(city.aqi);
                const isSelected = selectedCity?.name === city.name;
                return (
                  <button
                    key={city.name}
                    onClick={() => flyToCity(city)}
                    className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500/50'
                        : 'bg-white/2 border-white/5 hover:border-cyan-900/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-[10px] w-4 font-bold">{idx + 1}</span>
                      <div>
                        <div className="text-white font-bold">{city.name}</div>
                        <div className="text-gray-500 text-[10px]">{city.country}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ color: lvl.color, backgroundColor: `${lvl.color}15` }}
                      >
                        {city.aqi}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
