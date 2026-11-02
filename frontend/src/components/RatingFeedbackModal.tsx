import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Smartphone, Monitor, X, Check, Heart, ShieldCheck, Sparkles, Lock } from 'lucide-react';

export interface FeedbackItem {
  id: string;
  deviceId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface FeedbackState {
  totalRatings: number;
  averageRating: number;
  ratingCounts: Record<number, number>;
  feedbacks: FeedbackItem[];
  identity?: { id: number; name: string; deviceType: string };
  myFeedback?: FeedbackItem | null;
}

/** Menghasilkan fingerprint hardware yang konsisten di semua browser dalam 1 perangkat fisik yang sama */
export function getDeviceHardwareFingerprint(): string {
  if (typeof window === 'undefined') return '';
  const sw = window.screen.width || 0;
  const sh = window.screen.height || 0;
  const cd = window.screen.colorDepth || 0;
  const tp = navigator.maxTouchPoints || 0;
  const hc = navigator.hardwareConcurrency || 0;
  const minDim = Math.min(sw, sh);
  const maxDim = Math.max(sw, sh);
  return `${minDim}x${maxDim}:${cd}:${tp}:${hc}`;
}

const RATING_LABELS: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'Buruk', color: 'text-red-400', desc: 'Perlu banyak perbaikan sistem' },
  2: { label: 'Kurang', color: 'text-amber-500', desc: 'Masih ada kekurangan fitur' },
  3: { label: 'Cukup', color: 'text-yellow-400', desc: 'Sudah lumayan stabil & bagus' },
  4: { label: 'Bagus', color: 'text-cyan-400', desc: 'Sangat bermanfaat dan informatif' },
  5: { label: 'Sangat Bagus!', color: 'text-emerald-400', desc: 'Luar biasa, intelijen kelas dunia!' },
};

export default function RatingFeedbackModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [data, setData] = useState<FeedbackState>({
    totalRatings: 0,
    averageRating: 5.0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    feedbacks: [],
  });

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const loadFeedbackData = async () => {
    setLoading(true);
    try {
      const hw = getDeviceHardwareFingerprint();
      const savedId = localStorage.getItem('wm_device_id') || '';
      const res = await fetch(`/api/feedback?hw=${encodeURIComponent(hw)}&deviceId=${savedId}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: FeedbackState = await res.json();
        setData(json);

        if (json.identity?.id) {
          localStorage.setItem('wm_device_id', String(json.identity.id));
          localStorage.setItem('wm_device_name', json.identity.name);
          if (!authorName) {
            setAuthorName(json.identity.name);
          }
        }

        if (json.myFeedback) {
          setRating(json.myFeedback.rating);
          setComment(json.myFeedback.comment || '');
          setAuthorName(json.myFeedback.authorName || json.identity?.name || '');
        } else if (json.identity?.name && !authorName) {
          setAuthorName(json.identity.name);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFeedbackData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const hw = getDeviceHardwareFingerprint();
      const savedId = localStorage.getItem('wm_device_id') || '';

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
          authorName: authorName.trim(),
          hw,
          deviceId: savedId,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setData(prev => ({
            ...prev,
            totalRatings: result.totalRatings,
            averageRating: result.averageRating,
            ratingCounts: result.ratingCounts,
            feedbacks: result.feedbacks,
            myFeedback: result.myFeedback,
            identity: result.identity,
          }));

          if (result.identity?.id) {
            localStorage.setItem('wm_device_id', String(result.identity.id));
            localStorage.setItem('wm_device_name', result.identity.name);
          }

          setSuccessMsg('Terima kasih! Suka & Ulasan Anda berhasil disimpan.');
          setTimeout(() => setSuccessMsg(''), 4000);
          // Beritahu widget global
          window.dispatchEvent(new CustomEvent('wm-feedback-updated'));
        }
      }
    } catch {
      setSuccessMsg('Gagal mengirim ulasan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;
  const ratingInfo = RATING_LABELS[currentDisplayRating] || RATING_LABELS[5];
  const deviceId = data.identity?.id || localStorage.getItem('wm_device_id') || '...';
  const isMobile = data.identity?.deviceType === 'mobile' || /Android|iPhone/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-mono animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#070D1E] border border-cyan-900/60 rounded-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/40 bg-[#0A122A]/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-950/50">
              <img
                src="/like-globe-icon.png"
                alt="Suka & Rating"
                className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.9)]"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Rating & Ulasan Sistem</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-normal">
                  Suka 1-5 Bintang
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Suara pengunjung & penilaian real-time sistem intelijen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/40 border border-cyan-900/50 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Card Identitas Perangkat Unik (1 HP 1 ID Konsisten di Chrome, Edge, Brave dll) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/50 via-[#0A1633] to-blue-950/40 border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/40 text-cyan-400 flex-shrink-0">
                {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Identitas Unik Anda:</span>
                  <span className="text-xs font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600/60">
                    Anonim {deviceId}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>1 {isMobile ? 'HP' : 'Perangkat'} = 1 ID Unik (Sama di Chrome, Edge, Brave, dll)</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 sm:text-right font-mono bg-black/40 px-2.5 py-1.5 rounded border border-cyan-950">
              Perangkat: <span className="text-white font-bold">{isMobile ? 'Mobile Smartphone' : 'Komputer / Laptop'}</span>
            </div>
          </div>

          {/* Ringkasan Skor & Statistik Bintang */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-cyan-900/40">
            <div className="text-center sm:border-r sm:border-cyan-900/40 pr-0 sm:pr-4 flex flex-col items-center justify-center">
              <div className="text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                <span>{data.averageRating.toFixed(1)}</span>
                <span className="text-sm font-normal text-gray-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map(st => (
                  <Star
                    key={st}
                    className={`w-4 h-4 ${
                      st <= Math.round(data.averageRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                Total <span className="text-cyan-300 font-bold">{data.totalRatings}</span> Pengunjung Suka
              </div>
            </div>

            {/* Bar Distribusi Rating 1-5 */}
            <div className="sm:col-span-2 space-y-1.5 text-[10px] font-mono justify-center flex flex-col pl-0 sm:pl-2">
              {[5, 4, 3, 2, 1].map(starNum => {
                const count = data.ratingCounts[starNum] || 0;
                const pct = data.totalRatings > 0 ? (count / data.totalRatings) * 100 : 0;
                return (
                  <div key={starNum} className="flex items-center gap-2">
                    <span className="w-6 text-gray-400 flex items-center gap-0.5 justify-end">
                      {starNum} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-black/60 border border-cyan-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Beri Nilai Suka (1-5 Bintang) & Komentar */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-5 rounded-xl bg-[#091126] border border-cyan-800/40 space-y-4 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2.5">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
                {data.myFeedback ? 'Ubah Penilaian & Komentar Anda' : 'Beri Penilaian & Komentar Anda'}
              </span>
              <span className="text-[10px] text-gray-400">
                {data.myFeedback ? 'Sudah dinilai sebelumnya' : 'Belum dinilai'}
              </span>
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Interaktif Pilihan Bintang 1-5 */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-cyan-950 space-y-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Pilih Bintang (1 Sampai 5 Suka):
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map(st => {
                  const isActive = st <= currentDisplayRating;
                  return (
                    <button
                      key={st}
                      type="button"
                      onMouseEnter={() => setHoverRating(st)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(st)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isActive
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Label Bintang Terpilih */}
              <div className="text-center pt-1">
                <span className={`text-xs font-bold ${ratingInfo.color}`}>
                  {currentDisplayRating} Bintang: {ratingInfo.label}
                </span>
                <p className="text-[10px] text-gray-500">{ratingInfo.desc}</p>
              </div>
            </div>

            {/* Nama Penampil (DIKUNCI OLEH SISTEM) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-gray-400 uppercase font-mono">Nama Penampil:</label>
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                  <Lock className="w-3 h-3" />
                  ID Dikunci Sistem
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`Anonim ${deviceId}`}
                  className="w-full px-3 py-2.5 rounded-lg bg-black/70 border border-cyan-900/60 text-xs text-cyan-300 font-bold font-mono cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Terkunci
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">
                ID unik dibuat otomatis oleh sistem dan terkunci permanen untuk perangkat ini.
              </p>
            </div>

            {/* Textarea Komentar / Ulasan */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-400 uppercase">
                Komentar / Masukan Anda:
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tulis pendapat Anda tentang World Monitor (fitur mana yang paling disukai, kritik, atau saran pengembangan)..."
                className="w-full px-3 py-2 rounded-lg bg-black/60 border border-cyan-900/50 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-cyan-400 font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 fill-black/20" />
                  <span>{data.myFeedback ? 'Perbarui Suka & Ulasan' : 'Kirim Suka & Komentar'}</span>
                </>
              )}
            </button>
          </form>

          {/* Daftar Komentar Pengunjung Lainnya */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Ulasan & Komentar Pengunjung ({data.feedbacks.length})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Real-Time Edge Feed</span>
            </div>

            {data.feedbacks.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 font-mono">
                Belum ada komentar. Jadilah yang pertama memberi suka dan ulasan!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {data.feedbacks.map(f => (
                  <div
                    key={f.id}
                    className={`p-3 rounded-xl border transition ${
                      f.deviceId === data.identity?.id
                        ? 'bg-cyan-950/30 border-cyan-600/60 shadow-sm'
                        : 'bg-black/40 border-cyan-950/80 hover:border-cyan-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {f.authorName}
                          {f.deviceId === data.identity?.id && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                              (Anda)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          {f.deviceType === 'mobile' ? (
                            <Smartphone className="w-3 h-3 text-cyan-500/70" />
                          ) : (
                            <Monitor className="w-3 h-3 text-blue-500/70" />
                          )}
                        </span>
                      </div>

                      {/* Stars badge */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            className={`w-3 h-3 ${
                              st <= f.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {f.comment && (
                      <p className="text-xs text-gray-300 leading-relaxed font-sans mt-1">
                        {f.comment}
                      </p>
                    )}

                    <div className="text-[9px] text-gray-500 mt-2 font-mono flex items-center justify-between">
                      <span>Perangkat #{f.deviceId}</span>
                      <span>
                        {new Date(f.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Widget tombol rating di Header atas sistem */
export function FeedbackHeaderWidget({ onClick }: { onClick: () => void }) {
  const [stats, setStats] = useState<{ rating: number; count: number }>({
    rating: 5.0,
    count: 4,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/feedback?summary=1');
      if (res.ok) {
        const d = await res.json();
        if (d.averageRating !== undefined) {
          setStats({
            rating: d.averageRating,
            count: d.totalRatings,
          });
        }
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchStats();
    const handler = () => fetchStats();
    window.addEventListener('wm-feedback-updated', handler);
    return () => window.removeEventListener('wm-feedback-updated', handler);
  }, []);

  return (
    <button
      onClick={onClick}
      type="button"
      className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-black/70 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white transition shadow-sm hover:shadow-cyan-950/60 cursor-pointer font-mono"
      title="Beri Suka & Ulasan Sistem"
    >
      <div className="flex items-center gap-1.5">
        <img
          src="/like-globe-icon.png"
          alt="Suka"
          className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.85)]"
        />
        <span className="text-xs font-bold text-cyan-300">{stats.rating.toFixed(1)}</span>
      </div>
      <span className="text-[10px] text-gray-400 hidden sm:inline">
        ({stats.count} Suka)
      </span>
      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 hidden md:inline">
        Beri Nilai
      </span>
    </button>
  );
}

/** Badge tombol rating di Hero Landing Page di atas sistem */
export function FeedbackHeroBadge({ onClick }: { onClick: () => void }) {
  const [stats, setStats] = useState<{ rating: number; count: number }>({
    rating: 5.0,
    count: 4,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/feedback?summary=1');
        if (res.ok) {
          const d = await res.json();
          if (d.averageRating !== undefined) {
            setStats({ rating: d.averageRating, count: d.totalRatings });
          }
        }
      } catch {
        // fallback
      }
    };
    fetchStats();
  }, []);

  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white transition text-xs font-mono shadow-lg shadow-cyan-950/40 cursor-pointer"
    >
      <img
        src="/like-globe-icon.png"
        alt="Suka"
        className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.85)]"
      />
      <span className="font-bold flex items-center gap-1">
        <span>{stats.rating.toFixed(1)} / 5.0</span>
      </span>
      <span className="text-gray-400">({stats.count} Ulasan Suka)</span>
      <span className="text-cyan-400 hover:underline ml-1">Beri Nilai →</span>
    </button>
  );
}
