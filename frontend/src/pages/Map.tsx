import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import Globe from 'globe.gl';
import {
  RefreshCw, Navigation, Layers, RotateCcw,
  ZoomIn, ZoomOut, Eye, EyeOff, Radio, Globe as GlobeIcon, X, Sun, Moon
} from 'lucide-react';
import { fetchDisasters, fetchEarthquakes } from '../lib/api';

// ─── Kategori & Styling Teknis ─────────────────────────────────────────────
interface CategoryMeta {
  color: string;
  badge: string;
  label: string;
  layerGroup: 'disaster' | 'weather' | 'energy' | 'other';
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  Wildfires: {
    color: '#ff5722',
    badge: 'FIRE',
    label: 'Wildfire Incident',
    layerGroup: 'disaster',
  },
  'Severe Storms': {
    color: '#00e5ff',
    badge: 'STORM',
    label: 'Tropical Storm',
    layerGroup: 'weather',
  },
  Volcanoes: {
    color: '#f44336',
    badge: 'VOLCANO',
    label: 'Volcano Eruption',
    layerGroup: 'disaster',
  },
  Floods: {
    color: '#38bdf8',
    badge: 'FLOOD',
    label: 'Flood Alert',
    layerGroup: 'weather',
  },
  Earthquakes: {
    color: '#ffb300',
    badge: 'SEISMIC',
    label: 'Earthquake M5+',
    layerGroup: 'disaster',
  },
  Landslides: {
    color: '#c084fc',
    badge: 'SLIDE',
    label: 'Landslide Anomaly',
    layerGroup: 'disaster',
  },
  'Sea and Lake Ice': {
    color: '#93c5fd',
    badge: 'ICE',
    label: 'Cryosphere Shift',
    layerGroup: 'weather',
  },
  default: {
    color: '#94a3b8',
    badge: 'EVENT',
    label: 'Global Anomaly',
    layerGroup: 'other',
  },
};

function getCategoryMeta(cat: string): CategoryMeta {
  return CATEGORY_MAP[cat] || CATEGORY_MAP.default;
}

interface WMEvent {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  magnitude?: number;
  source: string;
}

interface CountryFeature {
  properties: {
    ADMIN: string;
    NAME_LONG?: string;
    ISO_A2?: string;
    ISO_A3?: string;
    CONTINENT?: string;
    SUBREGION?: string;
    POP_EST?: number;
    GDP_MD_EST?: number;
    ECONOMY?: string;
    INCOME_GRP?: string;
  };
  geometry: any;
}

const LAYER_PRESETS = [
  { id: 'disaster', label: 'Bencana & Gempa', color: '#ff5722' },
  { id: 'weather',  label: 'Badai & Cuaca',   color: '#00e5ff' },
  { id: 'energy',   label: 'Energi Global',   color: '#ffb300' },
  { id: 'other',    label: 'Anomali Lain',    color: '#818cf8' },
];

export default function GoogleEarthGlobeMap() {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeInstanceRef = useRef<any>(null);
  const shaderMatRef = useRef<THREE.ShaderMaterial | null>(null);

  // States
  const [events, setEvents] = useState<WMEvent[]>([]);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [activeLayers, setActiveLayers] = useState<string[]>(['disaster', 'weather', 'energy', 'other']);
  const [selectedEvent, setSelectedEvent] = useState<WMEvent | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryFeature['properties'] | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [showEventList, setShowEventList] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [sunAngle, setSunAngle] = useState<number>(45);

  // ─── 1. Load GeoJSON Batas Negara HD ──────────────────────────────────────
  useEffect(() => {
    fetch('https://unpkg.com/three-globe/example/country-polygons/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then(data => {
        if (data?.features) {
          setCountries(data.features);
        }
      })
      .catch(err => console.error('Error fetching country boundaries:', err));
  }, []);

  // ─── 2. Fetch Data Real (NASA + USGS) ────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [disRes, quakeRes] = await Promise.allSettled([
        fetchDisasters(),
        fetchEarthquakes(),
      ]);

      const items: WMEvent[] = [];

      if (disRes.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        disRes.value.forEach((d: any) => {
          if (d.lat != null && d.lng != null) {
            items.push({
              id: d.id,
              title: d.title,
              category: d.category,
              lat: Number(d.lat),
              lng: Number(d.lng),
              source: 'NASA EONET',
            });
          }
        });
      }

      if (quakeRes.status === 'fulfilled') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quakeRes.value.forEach((q: any) => {
          items.push({
            id: q.id,
            title: `M${q.magnitude.toFixed(1)} ${q.place}`,
            category: 'Earthquakes',
            lat: Number(q.lat),
            lng: Number(q.lng),
            magnitude: q.magnitude,
            source: 'USGS',
          });
        });
      }

      setEvents(items);
      if (items.length > 0 && !selectedEvent) {
        setSelectedEvent(items[0]);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── 3. Inisialisasi globe.gl dengan Day & Night Terminator Shader ─────────
  useEffect(() => {
    const container = globeContainerRef.current;
    if (!container) return;

    // Load Tekstur Siang & Malam NASA
    const textureLoader = new THREE.TextureLoader();
    const dayTex = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const nightTex = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
    dayTex.colorSpace = THREE.SRGBColorSpace;
    nightTex.colorSpace = THREE.SRGBColorSpace;

    // Sinar Matahari Awal
    const sunDir = new THREE.Vector3(1.2, 0.25, 0.9).normalize();

    // Custom Shader: Day/Night Terminator seperti Google Earth
    const dayNightMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        sunDirection: { value: sunDir },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main() {
          vUv = uv;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;

        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main() {
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);

          // Dot product antara normal permukaan bumi dengan arah datang sinar matahari
          float dProd = dot(vWorldNormal, sunDirection);

          // Transisi fajar/senja yang lembut (Terminator line)
          float dayFactor = smoothstep(-0.15, 0.20, dProd);

          // Pendaran oranye senja/fajar di perbatasan siang dan malam
          float twilight = (1.0 - abs(dProd * 4.5));
          twilight = clamp(twilight, 0.0, 1.0) * (1.0 - dayFactor);
          vec3 sunsetGlow = vec3(1.0, 0.45, 0.12) * twilight * 0.45;

          // Malam hari: lampu kota menyala berkilau
          vec3 finalColor = mix(nightColor.rgb * 1.6, dayColor.rgb, dayFactor) + sunsetGlow;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    shaderMatRef.current = dayNightMaterial;

    // Instance globe.gl
    const globe = new Globe(container)
      .globeMaterial(dayNightMaterial)
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.22)
      // ── Poligon Batas Negara Interaktif ──
      .polygonAltitude((feat: any) => (feat === hoveredCountry ? 0.05 : 0.012))
      .polygonCapColor((feat: any) => {
        if (feat === hoveredCountry) return 'rgba(0, 229, 255, 0.45)';
        if (selectedCountry && feat.properties.ADMIN === selectedCountry.ADMIN) {
          return 'rgba(0, 229, 255, 0.35)';
        }
        return 'rgba(2, 25, 60, 0.12)'; // Transparan halus agar siang/malam terlihat
      })
      .polygonSideColor(() => 'rgba(0, 229, 255, 0.25)')
      .polygonStrokeColor((feat: any) => {
        if (feat === hoveredCountry) return '#00e5ff';
        if (selectedCountry && feat.properties.ADMIN === selectedCountry.ADMIN) return '#38bdf8';
        return 'rgba(0, 229, 255, 0.35)'; // Batas negara neon
      })
      .polygonLabel(({ properties: d }: any) => `
        <div style="background: rgba(3,9,30,0.92); border: 1px solid #00e5ff; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #fff; box-shadow: 0 0 15px rgba(0,229,255,0.4);">
          <div style="color: #00e5ff; font-weight: bold; font-size: 13px;">${d.ADMIN}</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${d.REGION_UN || d.CONTINENT || 'Global'} • ${d.ISO_A2 || d.ISO_A3 || ''}</div>
          ${d.POP_EST ? `<div style="color: #cbd5e1; font-size: 10px; margin-top: 4px;">Populasi: ${(d.POP_EST / 1e6).toFixed(1)} Juta</div>` : ''}
          <div style="color: #38bdf8; font-size: 9px; margin-top: 4px;">KLIK NEGARA UNTUK INSPEKSI INTELIJEN &rarr;</div>
        </div>
      `)
      .onPolygonHover((feat: any) => {
        setHoveredCountry(feat || null);
      })
      .onPolygonClick(({ properties: d }: any) => {
        setSelectedCountry(d);
        setSelectedEvent(null);
      })
      // ── Pin Points ──
      .pointLat('lat')
      .pointLng('lng')
      .pointColor((d: any) => getCategoryMeta(d.category).color)
      .pointAltitude(0.06)
      .pointRadius(0.7)
      .pointResolution(24)
      .pointLabel((d: any) => {
        const meta = getCategoryMeta(d.category);
        return `
          <div style="background: rgba(3,9,30,0.95); border: 1px solid ${meta.color}; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #fff; box-shadow: 0 0 15px ${meta.color}40;">
            <div style="color: ${meta.color}; font-weight: bold; margin-bottom: 3px;">[${meta.badge}] ${meta.label.toUpperCase()}</div>
            <div style="font-size: 12px; max-width: 220px; line-height: 1.3;">${d.title}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 4px;">LAT/LNG: ${d.lat.toFixed(2)}, ${d.lng.toFixed(2)} • ${d.source}</div>
          </div>
        `;
      })
      .onPointClick((d: any) => {
        flyToEvent(d);
      })
      // ── Radar Rings ──
      .ringLat('lat')
      .ringLng('lng')
      .ringColor((d: any) => {
        const c = getCategoryMeta(d.category).color;
        return (t: number) => `rgba(${parseInt(c.slice(1,3),16)}, ${parseInt(c.slice(3,5),16)}, ${parseInt(c.slice(5,7),16)}, ${1 - t})`;
      })
      .ringMaxRadius(3.8)
      .ringPropagationSpeed(2.2)
      .ringRepeatPeriod(900);

    // Initial camera viewpoint
    globe.pointOfView({ lat: 10, lng: 115, altitude: 2.2 }, 0);

    // Controls
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }

    globeInstanceRef.current = globe;

    // Centering & Resize
    const updateCentering = () => {
      if (container && globe) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        globe.width(w);
        globe.height(h);

        const cam = globe.camera();
        if (cam) {
          if (showEventList && w > 1024) {
            cam.setViewOffset(w, h, -160, 0, w, h);
          } else {
            cam.clearViewOffset();
          }
          cam.updateProjectionMatrix();
        }
      }
    };

    updateCentering();
    window.addEventListener('resize', updateCentering);

    return () => {
      window.removeEventListener('resize', updateCentering);
      container.innerHTML = '';
      globeInstanceRef.current = null;
      shaderMatRef.current = null;
    };
  }, [showEventList]);

  // ─── Update Sinar Matahari Saat Angle Berubah ─────────────────────────────
  useEffect(() => {
    if (shaderMatRef.current) {
      const rad = (sunAngle * Math.PI) / 180;
      const x = Math.cos(rad) * 1.5;
      const z = Math.sin(rad) * 1.5;
      shaderMatRef.current.uniforms.sunDirection.value.set(x, 0.25, z).normalize();
    }
  }, [sunAngle]);

  // ─── Sync Country Polygons ────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || countries.length === 0) return;
    globe.polygonsData(countries);
  }, [countries]);

  // ─── Sync Events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    const visibleEvents = events.filter((ev) => {
      const meta = getCategoryMeta(ev.category);
      return activeLayers.includes(meta.layerGroup);
    });

    globe.pointsData(visibleEvents);
    globe.ringsData(visibleEvents);
  }, [events, activeLayers]);

  // ─── Sync Auto Rotate ─────────────────────────────────────────────────────
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (globe && globe.controls()) {
      globe.controls().autoRotate = isRotating;
    }
  }, [isRotating]);

  // ─── Fly to Event Camera Animation ────────────────────────────────────────
  const flyToEvent = (ev: WMEvent) => {
    setSelectedEvent(ev);
    setSelectedCountry(null);
    const globe = globeInstanceRef.current;
    if (!globe) return;

    globe.pointOfView(
      {
        lat: ev.lat,
        lng: ev.lng,
        altitude: 1.3,
      },
      1200
    );
  };

  const toggleLayer = (id: string) => {
    setActiveLayers(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const selectedMeta = selectedEvent ? getCategoryMeta(selectedEvent.category) : null;

  return (
    <div className="relative w-full h-full bg-[#020510] text-white font-mono overflow-hidden select-none">
      {/* ─── 1. KANVAS 3D GLOBE DENGAN DAY & NIGHT TERMINATOR ─── */}
      <div
        ref={globeContainerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* ─── 2. FLOATING HUD KIRI ATAS: BRANDING & KONTROL SIANG/MALAM ─── */}
      <div className="absolute top-5 left-5 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#040d21]/80 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <div>
            <div className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <span>WORLD MONITOR</span>
              <span className="text-[10px] text-amber-400 border border-amber-800/80 px-1.5 py-0.2 rounded bg-amber-950/60 font-bold">
                GOOGLE EARTH DAY/NIGHT
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              PANCARAN SIANG & MALAM • {countries.length} NEGARA DAPAT DIKLIK
            </div>
          </div>
        </div>

        {/* Rotasi, Arah Matahari & Layers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md transition-all ${
              isRotating
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.25)]'
                : 'bg-black/40 border-gray-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            {isRotating ? 'ROTASI: ON' : 'ROTASI: OFF'}
          </button>

          {/* Geser Posisi Matahari (Simulasi Siang & Malam) */}
          <button
            onClick={() => setSunAngle((prev) => (prev + 45) % 360)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-700/60 bg-amber-950/40 text-amber-300 hover:border-amber-400 backdrop-blur-md transition"
            title="Klik untuk mengubah posisi matahari / bayangan siang & malam"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            MATAHARI: {sunAngle}°
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-[#040d21]/80 border border-cyan-800/60 hover:border-cyan-400 backdrop-blur-md transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>

          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border backdrop-blur-md transition ${
              showLayerMenu
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                : 'bg-[#040d21]/80 border-cyan-800/60 text-cyan-400 hover:border-cyan-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            LAYERS
          </button>
        </div>

        {/* Floating Layer Dropdown */}
        {showLayerMenu && (
          <div className="p-3 rounded-xl bg-[#03091e]/90 backdrop-blur-xl border border-cyan-500/40 shadow-2xl space-y-1.5 w-52 mt-1">
            <div className="text-[10px] text-gray-400 font-bold tracking-wider mb-2">ACTIVE LAYERS FILTER</div>
            {LAYER_PRESETS.map((lp) => {
              const active = activeLayers.includes(lp.id);
              return (
                <button
                  key={lp.id}
                  onClick={() => toggleLayer(lp.id)}
                  style={{
                    borderColor: active ? lp.color : '#1e293b',
                    color: active ? lp.color : '#64748b',
                    background: active ? `${lp.color}15` : 'transparent',
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: active ? lp.color : '#334155' }}
                    />
                    {lp.label}
                  </span>
                  <span className="text-[9px] uppercase">{active ? 'ON' : 'OFF'}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. FLOATING VIEW CONTROLS (KANAN ATAS) ─── */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => {
            const globe = globeInstanceRef.current;
            if (globe) {
              const pov = globe.pointOfView();
              globe.pointOfView({ altitude: Math.max(0.3, pov.altitude - 0.45) }, 400);
            }
          }}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-[#040d21]/80 hover:bg-cyan-950/80 border border-cyan-800/60 hover:border-cyan-400 text-cyan-400 flex items-center justify-center backdrop-blur-md transition shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const globe = globeInstanceRef.current;
            if (globe) {
              const pov = globe.pointOfView();
              globe.pointOfView({ altitude: Math.min(4.5, pov.altitude + 0.45) }, 400);
            }
          }}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-[#040d21]/80 hover:bg-cyan-950/80 border border-cyan-800/60 hover:border-cyan-400 text-cyan-400 flex items-center justify-center backdrop-blur-md transition shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const globe = globeInstanceRef.current;
            if (globe) {
              globe.pointOfView({ lat: 10, lng: 115, altitude: 2.2 }, 800);
            }
          }}
          title="Reset Globe View"
          className="w-9 h-9 rounded-xl bg-[#040d21]/80 hover:bg-cyan-950/80 border border-cyan-800/60 hover:border-cyan-400 text-cyan-400 flex items-center justify-center backdrop-blur-md transition shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowEventList(!showEventList)}
          title={showEventList ? 'Sembunyikan Panel Informasi' : 'Tampilkan Panel Informasi'}
          className="w-9 h-9 rounded-xl bg-[#040d21]/80 hover:bg-cyan-950/80 border border-cyan-800/60 hover:border-cyan-400 text-cyan-400 flex items-center justify-center backdrop-blur-md transition shadow-lg"
        >
          {showEventList ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* ─── 4. FLOATING TARGET & COUNTRY INSPECTOR (KANAN MELAYANG) ─── */}
      {showEventList && (
        <div className="absolute bottom-5 right-5 top-20 w-80 z-20 flex flex-col gap-3 pointer-events-auto">
          {/* A. Country Inspector (Muncul Saat Negara di Globe Dipencet) */}
          {selectedCountry && (
            <div className="p-3.5 rounded-2xl border border-cyan-400/60 bg-[#03091e]/90 backdrop-blur-xl shadow-[0_0_25px_rgba(0,229,255,0.25)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 flex items-center gap-1.5">
                  <GlobeIcon className="w-3.5 h-3.5" />
                  NEGARA TERPILIH
                </span>
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-gray-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-base font-bold text-white leading-tight">
                {selectedCountry.ADMIN}
              </div>
              <div className="text-[11px] text-gray-400">
                {selectedCountry.NAME_LONG || selectedCountry.ADMIN} • ISO: {selectedCountry.ISO_A2 || selectedCountry.ISO_A3}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-white/10">
                <div>
                  <span className="text-gray-500 block">BENUA:</span>
                  <span className="text-white font-bold">{selectedCountry.CONTINENT || selectedCountry.SUBREGION}</span>
                </div>
                {selectedCountry.POP_EST && (
                  <div>
                    <span className="text-gray-500 block">POPULASI:</span>
                    <span className="text-cyan-300 font-bold">{(selectedCountry.POP_EST / 1e6).toFixed(1)} Juta</span>
                  </div>
                )}
              </div>

              {selectedCountry.ECONOMY && (
                <div className="text-[10px] text-gray-400 bg-white/5 p-1.5 rounded">
                  <span className="text-gray-500 block">STATUS EKONOMI:</span>
                  <span className="text-emerald-400 font-bold">{selectedCountry.ECONOMY}</span>
                </div>
              )}
            </div>
          )}

          {/* B. Incident Target Inspector (Muncul Saat Pin Event Dipencet) */}
          {selectedEvent && selectedMeta && !selectedCountry && (
            <div
              style={{
                borderColor: `${selectedMeta.color}66`,
                background: 'rgba(3, 9, 30, 0.88)',
                boxShadow: `0 0 25px ${selectedMeta.color}25`,
              }}
              className="p-3.5 rounded-2xl border backdrop-blur-xl transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{ color: selectedMeta.color }}
                  className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedMeta.color }}
                  />
                  {selectedMeta.label}
                </span>
                <span className="text-[10px] text-gray-500 font-bold">{selectedEvent.source}</span>
              </div>

              <div className="text-xs font-bold text-white leading-snug line-clamp-2 mb-2">
                {selectedEvent.title}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-white/5 pt-2">
                <span>
                  LAT/LNG: {selectedEvent.lat.toFixed(2)}, {selectedEvent.lng.toFixed(2)}
                </span>
                {selectedEvent.magnitude && (
                  <span className="text-amber-400 font-bold">
                    M{selectedEvent.magnitude.toFixed(1)}
                  </span>
                )}
              </div>

              <button
                onClick={() => flyToEvent(selectedEvent)}
                style={{
                  borderColor: selectedMeta.color,
                  color: selectedMeta.color,
                  background: `${selectedMeta.color}22`,
                }}
                className="w-full mt-2.5 py-1.5 rounded-lg border text-xs font-bold hover:brightness-125 transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5" />
                FOKUS KE TITIK LOKASI
              </button>
            </div>
          )}

          {/* C. Live Global Stream List */}
          <div className="flex-1 rounded-2xl bg-[#03091e]/85 backdrop-blur-xl border border-cyan-500/20 shadow-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-cyan-900/30 flex items-center justify-between bg-black/30">
              <span className="text-xs font-bold text-cyan-300 tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                STREAM INCIDENTS
              </span>
              <span className="text-[10px] text-gray-500">{events.length} NODES</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {events.map((ev) => {
                const meta = getCategoryMeta(ev.category);
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <button
                    key={ev.id}
                    onClick={() => flyToEvent(ev)}
                    style={{
                      borderColor: isSelected ? meta.color : 'rgba(255,255,255,0.05)',
                      background: isSelected ? `${meta.color}22` : 'rgba(10, 20, 45, 0.4)',
                    }}
                    className="w-full text-left p-2.5 rounded-xl border transition-all hover:border-cyan-400/50 block group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        style={{ color: meta.color }}
                        className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        {meta.badge}
                      </span>
                      <span className="text-[9px] text-gray-500">{ev.source}</span>
                    </div>

                    <div className="text-[11px] text-gray-200 line-clamp-1 group-hover:text-cyan-200 transition">
                      {ev.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. FOOTER INFORMATIF ─── */}
      <div className="absolute bottom-3 left-5 z-10 text-[10px] text-gray-500 pointer-events-none flex items-center gap-3">
        <span>DAY/NIGHT SUN TERMINATOR · GOOGLE EARTH PROJECTION</span>
        <span>•</span>
        <span>KLIK TOMBOL MATAHARI UNTUK MENGGESER WAKTU SIANG/MALAM</span>
      </div>
    </div>
  );
}
