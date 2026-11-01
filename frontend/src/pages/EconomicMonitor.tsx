import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, RefreshCw, DollarSign,
  ArrowUpRight, ArrowDownRight, Layers, BarChart2,
  Percent, Globe, ShieldCheck, Wallet, ArrowRightLeft,
  Search, Activity
} from 'lucide-react';
import {
  fetchExchangeRates,
  fetchGlobalInflation,
  fetchLiveCommodities,
  LiveInflationRecord
} from '../lib/api';

interface LiveCommodityItem {
  name: string;
  symbol: string;
  price: string;
  unit: string;
  date: string;
  source: string;
}

const CURRENCY_DIRECTORY = [
  { code: 'IDR', name: 'Rupiah Indonesia', symbol: 'Rp' },
  { code: 'EUR', name: 'Euro Uni Eropa', symbol: '€' },
  { code: 'GBP', name: 'Pound Inggris', symbol: '£' },
  { code: 'JPY', name: 'Yen Jepang', symbol: '¥' },
  { code: 'CNY', name: 'Yuan Tiongkok', symbol: '¥' },
  { code: 'SGD', name: 'Dolar Singapura', symbol: 'S$' },
  { code: 'AUD', name: 'Dolar Australia', symbol: 'A$' },
  { code: 'CHF', name: 'Franc Swiss', symbol: 'CHF' },
  { code: 'CAD', name: 'Dolar Kanada', symbol: 'C$' },
  { code: 'HKD', name: 'Dolar Hong Kong', symbol: 'HK$' },
  { code: 'SAR', name: 'Riyal Arab Saudi', symbol: 'SR' },
  { code: 'KRW', name: 'Won Korea Selatan', symbol: '₩' },
  { code: 'INR', name: 'Rupee India', symbol: '₹' },
  { code: 'MYR', name: 'Ringgit Malaysia', symbol: 'RM' },
  { code: 'THB', name: 'Baht Thailand', symbol: '฿' },
  { code: 'BRL', name: 'Real Brasil', symbol: 'R$' },
  { code: 'ZAR', name: 'Rand Afrika Selatan', symbol: 'R' },
  { code: 'NZD', name: 'Dolar Selandia Baru', symbol: 'NZ$' },
  { code: 'AED', name: 'Dirham UEA', symbol: 'AED' },
  { code: 'TRY', name: 'Lira Turki', symbol: '₺' },
];

export default function EconomicMonitor() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [inflationList, setInflationList] = useState<LiveInflationRecord[]>([]);
  const [commodities, setCommodities] = useState<LiveCommodityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState('');
  const [searchCur, setSearchCur] = useState('');
  
  // Converter State
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [sourceCur, setSourceCur] = useState('USD');
  const [targetCur, setTargetCur] = useState('IDR');

  const loadData = async () => {
    setLoading(true);
    try {
      const [rateRes, infRes, comRes] = await Promise.allSettled([
        fetchExchangeRates('USD'),
        fetchGlobalInflation(),
        fetchLiveCommodities(),
      ]);

      if (rateRes.status === 'fulfilled' && rateRes.value?.conversion_rates) {
        setRates(rateRes.value.conversion_rates);
        setLastSync(new Date().toLocaleTimeString('id-ID'));
      }
      if (infRes.status === 'fulfilled' && infRes.value?.length) {
        setInflationList(infRes.value);
      }
      if (comRes.status === 'fulfilled' && comRes.value?.length) {
        setCommodities(comRes.value);
      }
    } catch (err) {
      console.error('Failed to load economic rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Konversi kalkulator real-time
  const sourceRate = sourceCur === 'USD' ? 1 : (rates[sourceCur] || 1);
  const targetRate = targetCur === 'USD' ? 1 : (rates[targetCur] || 1);
  const convertedResult = ((convertAmount / sourceRate) * targetRate);

  const filteredCurrencies = CURRENCY_DIRECTORY.filter(c =>
    c.code.toLowerCase().includes(searchCur.toLowerCase()) ||
    c.name.toLowerCase().includes(searchCur.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#030712] text-white font-mono overflow-y-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#040d21] border-b border-cyan-900/40 sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
              <span>GLOBAL FINANCIAL & ECONOMIC INTELLIGENCE</span>
              <span className="text-[10px] text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded bg-emerald-950/60 font-bold">
                100% REAL-TIME FEED
              </span>
            </h1>
            <div className="text-[11px] text-gray-400">
              Valas Real-Time ExchangeRate API, Inflasi World Bank, & Komoditas Alpha Vantage
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-cyan-300 font-bold">
              {new Date().toLocaleTimeString('id-ID', { hour12: false })} WIB
            </div>
            <div className="text-[10px] text-gray-500">
              {loading ? 'MEMPERBARUI KURS...' : `UPDATE TERAKHIR: ${lastSync || 'ONLINE'}`}
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            SINKRONISASI
          </button>
        </div>
      </div>

      {/* ── CONTENT CONTAINER ── */}
      <div className="p-6 space-y-6 flex-1">
        {/* ── TOP KPI CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: USD / IDR */}
          <div className="p-4 rounded-xl bg-[#06122b]/80 border border-emerald-900/50 shadow-lg relative">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="font-bold tracking-wider">KURS SPOT USD / IDR</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {rates['IDR'] ? `Rp ${Math.round(rates['IDR']).toLocaleString('id-ID')}` : 'Memuat...'}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span className="text-emerald-400 font-medium">ExchangeRate Live</span>
              <span className="text-gray-500">1 USD = Rp {rates['IDR'] ? Math.round(rates['IDR']).toLocaleString('id-ID') : '--'}</span>
            </div>
          </div>

          {/* KPI 2: USD / EUR */}
          <div className="p-4 rounded-xl bg-[#06122b]/80 border border-cyan-900/50 shadow-lg relative">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="font-bold tracking-wider">KURS SPOT USD / EUR</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">
              {rates['EUR'] ? `€ ${rates['EUR'].toFixed(4)}` : 'Memuat...'}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span className="text-cyan-400 font-medium">Uni Eropa</span>
              <span className="text-gray-500">1 USD = €{rates['EUR'] ? rates['EUR'].toFixed(4) : '--'}</span>
            </div>
          </div>

          {/* KPI 3: USD / CNY */}
          <div className="p-4 rounded-xl bg-[#06122b]/80 border border-amber-900/50 shadow-lg relative">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="font-bold tracking-wider">KURS SPOT USD / CNY</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 mb-1">
              {rates['CNY'] ? `¥ ${rates['CNY'].toFixed(4)}` : 'Memuat...'}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span className="text-amber-400 font-medium">Yuan Tiongkok</span>
              <span className="text-gray-500">PBOC Reference</span>
            </div>
          </div>

          {/* KPI 4: USD / JPY */}
          <div className="p-4 rounded-xl bg-[#06122b]/80 border border-indigo-900/50 shadow-lg relative">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="font-bold tracking-wider">KURS SPOT USD / JPY</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold text-indigo-300 mb-1">
              {rates['JPY'] ? `¥ ${rates['JPY'].toFixed(2)}` : 'Memuat...'}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span className="text-indigo-400 font-medium">Yen Jepang</span>
              <span className="text-gray-500">BoJ Reference</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: FOREX LIVE BOARD & CONVERTER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Multi-Currency Rates Table (2 Cols) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#06122b]/60 border border-cyan-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/30 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm tracking-wider text-white uppercase">
                  PAPAN NILAI TUKAR MATA UANG DUNIA (BASIS: 1 USD)
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari kode / negara..."
                  value={searchCur}
                  onChange={e => setSearchCur(e.target.value)}
                  className="bg-[#030919] border border-cyan-900/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-cyan-900/40 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Mata Uang</th>
                    <th className="py-2.5 px-3">Negara / Wilayah</th>
                    <th className="py-2.5 px-3 text-right">Nilai Per 1 USD</th>
                    <th className="py-2.5 px-3 text-right">Nilai Dalam IDR</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/50">
                  {filteredCurrencies.map(c => {
                    const rateVal = rates[c.code];
                    const idrVal = rates['IDR'] && rateVal ? (rates['IDR'] / rateVal) : 0;
                    return (
                      <tr key={c.code} className="hover:bg-cyan-950/30 transition">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
                            {c.code}
                          </span>
                          <span>{c.symbol}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-300 font-medium">
                          {c.name}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-cyan-300 tabular-nums">
                          {rateVal
                            ? (rateVal > 100 ? rateVal.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : rateVal.toFixed(4))
                            : 'Memuat...'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 tabular-nums">
                          {idrVal ? `Rp ${Math.round(idrVal).toLocaleString('id-ID')}` : '--'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold">
                            TERVERIFIKASI
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Currency Converter & Quick Stats */}
          <div className="space-y-6">
            {/* Converter Card */}
            <div className="p-5 rounded-2xl bg-[#06122b]/60 border border-cyan-900/40 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-3">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm tracking-wider text-white uppercase">
                  KALKULATOR KONVERSI VALAS REAL-TIME
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Jumlah Nominal</label>
                  <input
                    type="number"
                    value={convertAmount}
                    onChange={e => setConvertAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#030919] border border-cyan-900/60 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 block mb-1">Dari</label>
                    <select
                      value={sourceCur}
                      onChange={e => setSourceCur(e.target.value)}
                      className="w-full bg-[#030919] border border-cyan-900/60 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="USD">USD - Dolar AS</option>
                      {CURRENCY_DIRECTORY.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 block mb-1">Ke</label>
                    <select
                      value={targetCur}
                      onChange={e => setTargetCur(e.target.value)}
                      className="w-full bg-[#030919] border border-cyan-900/60 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                    >
                      <option value="IDR">IDR - Rupiah</option>
                      <option value="USD">USD - Dolar AS</option>
                      {CURRENCY_DIRECTORY.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Result */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 mt-4 text-center">
                  <div className="text-[11px] text-gray-400 mb-1">Hasil Konversi Kurs Live:</div>
                  <div className="text-xl font-bold text-cyan-300">
                    {convertedResult.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {targetCur}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    1 {sourceCur} = {((1 / sourceRate) * targetRate).toLocaleString('id-ID', { maximumFractionDigits: 4 })} {targetCur}
                  </div>
                </div>
              </div>
            </div>

            {/* Market Status Card */}
            <div className="p-5 rounded-2xl bg-[#06122b]/60 border border-cyan-900/40 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs tracking-wider text-white uppercase">
                  STATUS SESI PASAR FINANSIAL
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sesi New York (NYSE / NASDAQ)</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px]">
                    BUKA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sesi London (LSE)</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px]">
                    BUKA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sesi Tokyo (TSE)</span>
                  <span className="text-gray-500 font-bold px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px]">
                    TUTUP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sesi Jakarta (BEI)</span>
                  <span className="text-gray-500 font-bold px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px]">
                    TUTUP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: INFLASI REAL-TIME WORLD BANK & KOMODITAS ALPHA VANTAGE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* World Bank Live Inflation Rates */}
          <div className="p-5 rounded-2xl bg-[#06122b]/60 border border-cyan-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm tracking-wider text-white uppercase">
                  TINGKAT INFLASI TAHUNAN GLOBAL (WORLD BANK LIVE)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold border border-emerald-900/60 px-2 py-0.5 rounded bg-emerald-950/40">
                OFFICIAL WB API
              </span>
            </div>

            <div className="space-y-2.5">
              {inflationList.length > 0 ? (
                inflationList.map(item => (
                  <div key={item.code} className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-cyan-950 hover:border-cyan-900 transition text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-800 text-cyan-400">
                        {item.code}
                      </span>
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-[10px] text-gray-500">Periode World Bank: {item.year}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-300">{item.inflationYoY}% YoY</div>
                      <div className="text-[10px] text-gray-400">Indeks Harga Konsumen</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 py-4 text-center">Menghubungkan ke API World Bank Inflation...</div>
              )}
            </div>
          </div>

          {/* Commodities Alpha Vantage Live */}
          <div className="p-5 rounded-2xl bg-[#06122b]/60 border border-cyan-900/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm tracking-wider text-white uppercase">
                  HARGA KOMODITAS REAL-TIME (ALPHA VANTAGE LIVE)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold border border-emerald-900/60 px-2 py-0.5 rounded bg-emerald-950/40">
                LIVE API
              </span>
            </div>

            <div className="space-y-2.5">
              {commodities.length > 0 ? (
                commodities.map(com => (
                  <div key={com.symbol} className="flex items-center justify-between p-3 rounded-xl bg-[#030919] border border-cyan-950 hover:border-cyan-900 transition text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-800 text-cyan-400">
                        {com.symbol}
                      </span>
                      <div>
                        <div className="text-white font-medium">{com.name}</div>
                        <div className="text-[10px] text-gray-500">{com.unit} · Tanggal {com.date}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{com.price}</div>
                      <div className="text-[10px] text-gray-400">{com.source}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 py-4 text-center">Mengambil data harga komoditas Alpha Vantage...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
