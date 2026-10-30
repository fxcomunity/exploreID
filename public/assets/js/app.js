const root = document.querySelector("#app");
const prefix = new URL("../../", document.currentScript.src).pathname;
const params = new URLSearchParams(window.location.search);
const detailKey = {
  osm_type: params.get("osm_type"),
  osm_id: params.get("osm_id"),
};
const page = document.body.dataset.page === "destinations" && detailKey.osm_type && detailKey.osm_id
  ? "detail"
  : document.body.dataset.page || "home";
const pageTitles = {
  home: "Temukan perjalananmu",
  destinations: "Jelajahi destinasi",
  categories: "Jelajahi kategori",
  map: "Peta Indonesia",
  about: "Tentang ExploreID",
  login: "Masuk",
  register: "Buat akun",
  wishlist: "Destinasi tersimpan",
  itinerary: "Rencana perjalanan",
  detail: "Detail tempat",
};
const pageState = { places: [], categories: [], error: null };

function categoryHue(value) {
  let hash = 0;
  for (const character of value || "") hash = (hash * 31 + character.codePointAt(0)) % 360;
  return 120 + hash % 100;
}

function placeKey(place) {
  return `${place.osm_type}:${place.osm_id}`;
}

function placeLabel(place) {
  return (place.category || "Kategori tidak tersedia")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("id"));
}

function humanizeCategory(category) {
  return (category || "Kategori tidak tersedia")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("id"));
}

function readList(key) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(stored) ? stored.filter((value) => typeof value === "string") : [];
  } catch (error) {
    console.error(`Tidak dapat membaca ${key} dari penyimpanan browser.`, error);
    return [];
  }
}

function writeList(key, values) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
    return true;
  } catch (error) {
    console.error(`Tidak dapat menyimpan ${key} ke penyimpanan browser.`, error);
    showToast("Browser tidak dapat menyimpan perubahan ini.");
    return false;
  }
}

function placeUrl(place) {
  const search = new URLSearchParams({ osm_type: place.osm_type, osm_id: place.osm_id });
  return `${prefix}destinasi.html?${search}`;
}

function header() {
  const active = page === "home" ? "home" : page === "detail" ? "destinations" : page;
  const links = [
    ["home", "Beranda", `${prefix}index.html`],
    ["destinations", "Destinasi", `${prefix}destinasi.html`],
    ["categories", "Kategori", `${prefix}kategori.html`],
    ["map", "Peta", `${prefix}peta.html`],
    ["about", "Tentang", `${prefix}tentang.html`],
    ["login", "Masuk", `${prefix}masuk.html`],
  ];
  return `
    <div class="topline"><span>INSPIRASI PERJALANAN, CERITA INDONESIA</span><a href="${prefix}tentang.html">Kenali ExploreID <span aria-hidden="true">↗</span></a></div>
    <header class="site-header">
      <a class="brand" href="${prefix}index.html" aria-label="ExploreID — Beranda">
        <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M5 23.5 13.2 7l4.2 8.3 2.2-4.1L27 23.5H5Z" fill="currentColor"/><path d="m9.2 23.5 5.3-7.2 3.8 7.2H9.2Z" fill="#F7F8F4"/></svg></span>
        <span>explore<span class="brand-id">ID</span></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Buka navigasi"><span></span><span></span></button>
      <nav class="primary-nav" id="primary-nav" aria-label="Navigasi utama">
        ${links.map(([key, label, href]) => `<a class="nav-link ${active === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <a class="icon-link ${page === "wishlist" ? "active" : ""}" href="${prefix}tersimpan.html" aria-label="Tempat tersimpan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z"/></svg></a>
        <a class="header-cta" href="${prefix}itinerary.html">Rencanakan perjalanan <span aria-hidden="true">↗</span></a>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-main">
        <div class="footer-brand-block"><a class="brand footer-brand" href="${prefix}index.html"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M5 23.5 13.2 7l4.2 8.3 2.2-4.1L27 23.5H5Z" fill="currentColor"/><path d="m9.2 23.5 5.3-7.2 3.8 7.2H9.2Z" fill="#143C32"/></svg></span><span>explore<span class="brand-id">ID</span></span></a><p>Discover Indonesia,<br/>One Journey at a Time.</p></div>
        <div class="footer-links"><div><strong>Jelajahi</strong><a href="${prefix}destinasi.html">Semua tempat</a><a href="${prefix}kategori.html">Kategori data</a><a href="${prefix}peta.html">Peta Indonesia</a></div><div><strong>Rencanakan</strong><a href="${prefix}tersimpan.html">Tempat tersimpan</a><a href="${prefix}itinerary.html">Itinerary saya</a><a href="${prefix}tentang.html">Tentang ExploreID</a></div></div>
      </div>
      <div class="footer-bottom"><span>© 2026 ExploreID</span><span>Data bersumber dari OpenStreetMap. Periksa sumber sebelum berkunjung.</span></div>
    </footer><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

function placeCard(place, index = 0, actions = true) {
  const key = placeKey(place);
  const saved = readList("exploreid-wishlist").includes(key);
  const planned = readList("exploreid-itinerary").includes(key);
  const location = [place.regency, place.province].filter(Boolean).join(" · ") || "Wilayah belum tersedia";
  return `
    <article class="destination-card">
      <a class="destination-image data-image" style="--category-hue:${categoryHue(place.category)}" href="${placeUrl(place)}" aria-label="Lihat ${escapeHtml(place.name)}">
        <span class="image-label">${escapeHtml(placeLabel(place))}</span><span class="image-index">${String(index + 1).padStart(2, "0")}</span>
      </a>
      <div class="destination-info"><div><p class="destination-country">${escapeHtml(location.toLocaleUpperCase("id"))}</p><h3><a href="${placeUrl(place)}">${escapeHtml(place.name)}</a></h3></div>
        ${actions ? `<div class="card-actions"><button class="round-action ${saved ? "is-saved" : ""}" type="button" data-action="wishlist" data-key="${escapeHtml(key)}" aria-label="${saved ? "Hapus dari" : "Simpan ke"} tempat tersimpan" aria-pressed="${saved}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z"/></svg></button><a class="round-action" href="${placeUrl(place)}" aria-label="Buka ${escapeHtml(place.name)}">↗</a></div>` : `<span class="destination-link" aria-hidden="true">↗</span>`}
      </div>
      ${actions ? `<button class="add-plan-link ${planned ? "is-added" : ""}" type="button" data-action="itinerary" data-key="${escapeHtml(key)}">${planned ? "Tersimpan di rencana" : "+ Tambahkan ke rencana"}</button>` : ""}
    </article>`;
}

function categoryCard(category) {
  return `<a class="category-card" style="--category-hue:${categoryHue(category.category)}" href="${prefix}destinasi.html?kategori=${encodeURIComponent(category.category)}"><span class="category-number">${category.places_count} TEMPAT</span><span class="category-title">${escapeHtml(humanizeCategory(category.category))}</span><span class="category-detail">Label kategori sesuai data OpenStreetMap.</span><span class="category-arrow">↗</span></a>`;
}

function errorPanel() {
  return `<div class="api-state api-error" role="alert"><strong>Data belum dapat dimuat.</strong><p>Pastikan Cloudflare Worker dan binding D1 sudah disiapkan, lalu coba muat ulang.</p><button class="button-outline" type="button" data-action="retry">Coba lagi</button></div>`;
}

function emptyPanel(title, description) {
  return `<div class="api-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
}

function homePage() {
  return `
    <main>
      <section class="home-hero">
        <div class="home-hero-image"></div><div class="home-hero-shade"></div>
        <div class="hero-copy">
          <p class="eyebrow eyebrow-light"><span></span> BANYAK CERITA, SATU INDONESIA</p>
          <h1>Temukan tempat<br/>yang terasa <em>seperti</em><br/><em>milikmu.</em></h1>
          <p class="hero-description">Jelajahi data tempat dari OpenStreetMap. Cari nama lokasi, kategori, atau wilayah untuk memulai.</p>
          <form class="hero-search" id="home-search">
            <label><span>NAMA ATAU WILAYAH</span><input name="q" type="search" placeholder="Cari tempat atau daerah..." autocomplete="off"/></label>
            <label class="hero-select"><span>KATEGORI DATA</span><select name="category" id="home-category"><option value="">Semua kategori</option></select></label>
            <button type="submit" aria-label="Cari tempat"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.3 4.3"/></svg></button>
          </form>
          <p class="hero-note">✦ Data memuat lokasi wisata dan kategori tempat sebagaimana tercatat di sumber.</p>
        </div>
        <div class="hero-caption"><span>01</span><i></i><span>JELAJAHI DATA NUSANTARA</span></div>
      </section>
      <section class="intro section-wrap"><div><p class="eyebrow"><span class="eyebrow-dot"></span> DATA DARI OPENSTREETMAP</p><h2>Mulai dari tempat<br/><em>yang tercatat.</em></h2></div><div class="intro-right"><p>Data ditampilkan mengikuti informasi sumber. Kelengkapan alamat, kategori, dan informasi kunjungan dapat berbeda untuk setiap tempat.</p><a class="text-link" href="${prefix}destinasi.html">Buka semua data <span>↗</span></a></div></section>
      <section class="section-wrap category-section"><div class="section-heading"><div><p class="eyebrow"><span class="eyebrow-dot"></span> KATEGORI SUMBER</p><h2>Jelajahi menurut <em>jenisnya.</em></h2></div><a class="text-link desktop-link" href="${prefix}kategori.html">Semua kategori <span>↗</span></a></div>
        <div class="category-grid" id="home-categories" aria-live="polite">${emptyPanel("Memuat kategori…", "Mengambil kategori dari database.")}</div>
      </section>
      <section class="section-wrap featured-section"><div class="section-heading"><div><p class="eyebrow"><span class="eyebrow-dot"></span> DARI DATABASE</p><h2>Beberapa tempat <em>tercatat.</em></h2></div><a class="text-link desktop-link" href="${prefix}destinasi.html">Buka direktori <span>↗</span></a></div><div class="destination-grid" id="home-places">${emptyPanel("Memuat data…", "Mengambil tempat dari database.")}</div><p class="data-note">Data dari OpenStreetMap. Ketersediaan informasi tidak menjamin status resmi atau kelayakan kunjungan.</p></section>
      <section class="home-map"><div class="home-map-copy"><p class="eyebrow eyebrow-light"><span></span> INFORMASI BERBASIS SUMBER</p><h2>Jelajahi data<br/>dengan <em>lebih jelas.</em></h2><p>Lokasi, kategori, dan sumber ditampilkan sesuai catatan OpenStreetMap yang disediakan.</p><a class="button-light" href="${prefix}peta.html">Buka peta ExploreID <span>↗</span></a></div><div class="home-map-art" role="img" aria-label="Ilustrasi peta abstrak Indonesia"></div></section>
      <section class="closing section-wrap"><p class="eyebrow"><span class="eyebrow-dot"></span> DATA TERSEDIA SETELAH DATABASE TERHUBUNG</p><div class="closing-row"><h2>Siap untuk <em>menjelajah?</em></h2><a class="button-outline" href="${prefix}destinasi.html">Buka direktori <span>↗</span></a></div></section>
    </main>`;
}

function destinationsPage() {
  const query = params.get("q") || "";
  const category = params.get("kategori") || "";
  return `
    <main>
      <section class="page-hero page-hero-green"><div class="page-hero-inner"><p class="eyebrow eyebrow-light"><span></span> DIREKTORI DATABASE</p><h1>Temukan tempat<br/><em>yang kamu cari.</em></h1><p>Hasil diambil dari data OpenStreetMap yang diimpor ke database ExploreID.</p></div><div class="hero-orbit" aria-hidden="true"></div></section>
      <section class="section-wrap listing-section">
        <div class="breadcrumbs"><a href="${prefix}index.html">Beranda</a><span>/</span><span>Direktori</span></div>
        <div class="listing-toolbar"><label class="listing-search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.3 4.3"/></svg><input id="listing-query" type="search" value="${escapeHtml(query)}" placeholder="Cari nama, alamat, atau wilayah..." autocomplete="off"/><button id="clear-search" type="button" aria-label="Hapus pencarian">×</button></label>
          <label class="select-wrap"><span>KATEGORI SUMBER</span><select id="listing-category"><option value="">Semua kategori</option></select></label><span class="result-count" id="listing-count"></span>
        </div>
        <div class="filter-chips" id="filter-chips"></div>
        <div class="destination-grid listing-grid" id="listing-grid">${emptyPanel("Memuat data…", "Mengambil daftar dari database.")}</div><p class="empty-state" id="listing-empty" hidden></p>
        <div class="pagination-controls" id="listing-pagination"></div>
        <p class="data-note">Sumber data: OpenStreetMap. Data tidak menyatakan verifikasi resmi dan dapat berisi akomodasi, tempat, atau objek lain sesuai kategori sumber.</p>
      </section>
    </main>`;
}

function categoriesPage() {
  return `<main><section class="page-hero page-hero-soft"><div class="page-hero-inner"><p class="eyebrow"><span class="eyebrow-dot"></span> KATEGORI DARI DATABASE</p><h1>Jelajahi menurut<br/><em>jenis data.</em></h1><p>Kategori diambil langsung dari nilai kategori yang tersedia pada dataset sumber—tanpa menambahkan kategori buatan.</p></div></section><section class="section-wrap category-page-section"><div class="breadcrumbs"><a href="${prefix}index.html">Beranda</a><span>/</span><span>Kategori</span></div><div class="category-large-grid" id="all-categories">${emptyPanel("Memuat kategori…", "Mengambil kategori dari database.")}</div></section></main>`;
}

function mapPage() {
  return `<main><section class="page-hero page-hero-green map-page-hero"><div class="page-hero-inner"><p class="eyebrow eyebrow-light"><span></span> KOORDINAT DARI DATA</p><h1>Jelajahi Indonesia,<br/><em>berdasarkan lokasi.</em></h1><p>Koordinat yang tersedia akan ditampilkan dari database. Lokasi tanpa koordinat tidak dapat muncul di peta.</p></div></section><section class="section-wrap map-page-section"><div class="breadcrumbs"><a href="${prefix}index.html">Beranda</a><span>/</span><span>Peta Indonesia</span></div><div class="map-frame-wrap"><div class="map-frame-heading"><div><p class="eyebrow"><span class="eyebrow-dot"></span> PETA DASAR OPENSTREETMAP</p><h2>Lokasi <em>dalam data.</em></h2></div><span class="map-legend"><i></i> Periksa sumber lokasi</span></div><iframe title="Peta dasar OpenStreetMap wilayah Indonesia" src="https://www.openstreetmap.org/export/embed.html?bbox=94%2C-11%2C141%2C6&layer=mapnik" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p class="map-disclaimer">Peta dasar dari OpenStreetMap. Marker lokasi akan ditambahkan setelah integrasi peta dengan data API.</p></div><div class="map-bottom"><div><p class="eyebrow"><span class="eyebrow-dot"></span> DATA TEMPAT</p><h2>Telusuri semua<br/><em>rekaman sumber.</em></h2></div><a class="button-dark" href="${prefix}destinasi.html">Buka direktori <span>↗</span></a></div></section></main>`;
}

function aboutPage() {
  return `<main><section class="page-hero page-hero-soft"><div class="page-hero-inner"><p class="eyebrow"><span class="eyebrow-dot"></span> TENTANG EXPLOREID</p><h1>Informasi tempat<br/><em>lebih mudah dijelajahi.</em></h1><p>ExploreID menampilkan data tempat yang diimpor dari OpenStreetMap dan menjaga sumbernya tetap terlihat.</p></div></section><section class="section-wrap about-content"><div class="about-intro"><p class="eyebrow"><span class="eyebrow-dot"></span> PRINSIP DATA</p><h2>Data yang tersedia ditampilkan sesuai sumber—tanpa mengisi informasi yang <em>tidak diberikan.</em></h2></div><div class="about-copy"><p>Dataset yang digunakan berisi rekaman OpenStreetMap dan atribut seperti nama, jenis objek, kategori, alamat, koordinat, tautan sumber, serta waktu pengumpulan. Nilai kosong tetap kosong dan tidak diisi dengan perkiraan.</p><p>Kategori mengikuti tag sumber. Beberapa rekaman dapat berupa akomodasi atau objek lain, bukan hanya destinasi wisata. Selalu buka tautan sumber untuk memeriksa informasi terbaru sebelum berkunjung.</p></div><div class="values-grid"><article><span>01</span><h3>Sumber tetap tercatat</h3><p>Setiap rekaman membawa tipe dan ID OpenStreetMap serta tautan sumber.</p></article><article><span>02</span><h3>Tidak menebak data</h3><p>Atribut yang tidak tersedia dibiarkan kosong, bukan dibuat-buat.</p></article><article><span>03</span><h3>Terhubung ke database</h3><p>Daftar tempat dan kategori dimuat lewat API dari Cloudflare D1.</p></article></div></section></main>`;
}

function detailPage() {
  return `<main><div id="place-detail">${emptyPanel("Memuat tempat…", "Mengambil detail dari database.")}</div></main>`;
}

function renderDetail(place) {
  const fields = [
    ["Tipe objek", place.osm_type],
    ["ID OpenStreetMap", place.osm_id],
    ["Kategori", placeLabel(place)],
    ["Provinsi", place.province],
    ["Kabupaten / kota", place.regency],
    ["Kecamatan", place.district],
    ["Desa / kelurahan", place.village],
    ["Alamat", place.address],
    ["Jalan", place.street],
    ["Jam buka", place.opening_hours],
    ["Telepon", place.phone],
    ["Website", place.website],
    ["Latitude", place.latitude],
    ["Longitude", place.longitude],
  ];
  const sourceUrl = safeUrl(place.source_url);
  document.querySelector("#place-detail").innerHTML = `
    <section class="detail-hero"><div class="detail-hero-overlay"></div><div class="section-wrap detail-hero-content"><div class="breadcrumbs breadcrumbs-light"><a href="${prefix}index.html">Beranda</a><span>/</span><a href="${prefix}destinasi.html">Direktori</a><span>/</span><span>${escapeHtml(place.name)}</span></div><p class="eyebrow eyebrow-light"><span></span> ${escapeHtml(placeLabel(place).toLocaleUpperCase("id"))}</p><h1>${escapeHtml(place.name)}</h1><p class="detail-location">${escapeHtml([place.regency, place.province].filter(Boolean).join(" · ") || "Wilayah tidak tersedia")}</p><div class="detail-actions"><button class="button-light" type="button" data-action="wishlist" data-key="${escapeHtml(placeKey(place))}">♡ Simpan tempat</button><button class="button-outline-light" type="button" data-action="itinerary" data-key="${escapeHtml(placeKey(place))}">+ Tambahkan ke rencana</button></div></div></section>
    <section class="section-wrap detail-body"><article class="detail-description"><p class="eyebrow"><span class="eyebrow-dot"></span> DATA SUMBER</p><h2>Informasi sesuai<br/><em>rekaman yang tersedia.</em></h2><p>${escapeHtml(place.description || "Deskripsi tidak tersedia pada dataset sumber.")}</p><div class="verification-box"><span>ⓘ</span><p><strong>Data OpenStreetMap, bukan verifikasi operasional.</strong><br/>Harga tiket dan status kunjungan tidak tersedia kecuali dicantumkan pada sumber. Konfirmasikan detail secara langsung sebelum berangkat.</p></div>${sourceUrl ? `<p class="source-link">Sumber: <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(place.source || "OpenStreetMap")} ↗</a></p>` : ""}</article><aside class="detail-side"><p class="eyebrow"><span class="eyebrow-dot"></span> ATRIBUT DATA</p><dl>${fields.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${value ? escapeHtml(String(value)) : "Tidak tersedia"}</dd></div>`).join("")}</dl>${sourceUrl ? `<a class="text-link" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">Buka rekaman sumber <span>↗</span></a>` : ""}</aside></section></main>`;
}

function wishlistPage() {
  return `<main><section class="page-hero page-hero-soft compact-hero"><div class="page-hero-inner"><p class="eyebrow"><span class="eyebrow-dot"></span> KOLEKSI PRIBADIMU</p><h1>Tempat <em>tersimpan.</em></h1><p>Simpan rekaman tempat dan kembali kapan saja.</p></div></section><section class="section-wrap saved-section"><div class="breadcrumbs"><a href="${prefix}index.html">Beranda</a><span>/</span><span>Tersimpan</span></div><div id="saved-grid" class="destination-grid"></div><div class="empty-panel" id="saved-empty" hidden><span class="empty-icon">♡</span><h2>Belum ada yang <em>tersimpan.</em></h2><p>Simpan tempat dari direktori untuk membuat koleksi browser ini.</p><a class="button-dark" href="${prefix}destinasi.html">Buka direktori <span>↗</span></a></div><p class="local-note">Koleksi tersimpan di browser ini. Sinkronisasi akun belum tersedia.</p></section></main>`;
}

function itineraryPage() {
  return `<main><section class="page-hero page-hero-green compact-hero"><div class="page-hero-inner"><p class="eyebrow eyebrow-light"><span></span> RENCANA PERJALANAN</p><h1>Susun cerita<br/><em>perjalananmu.</em></h1><p>Kumpulkan rekaman tempat untuk rencana perjalanan sederhana.</p></div></section><section class="section-wrap itinerary-section"><div class="breadcrumbs"><a href="${prefix}index.html">Beranda</a><span>/</span><span>Rencana perjalanan</span></div><div class="itinerary-layout"><div><div class="itinerary-heading"><div><p class="eyebrow"><span class="eyebrow-dot"></span> DRAF PERJALANAN</p><h2>Tempat pilihan</h2></div><button id="clear-itinerary" class="text-button" type="button">Hapus semua</button></div><div id="itinerary-list" class="itinerary-list"></div><div class="empty-panel itinerary-empty" id="itinerary-empty" hidden><span class="empty-icon">✳</span><h2>Rencanamu dimulai <em>dari sini.</em></h2><p>Tambahkan tempat dari direktori untuk membuat daftar.</p><a class="button-dark" href="${prefix}destinasi.html">Buka direktori <span>↗</span></a></div></div><aside class="itinerary-aside"><p class="eyebrow"><span class="eyebrow-dot"></span> CATATAN</p><h3>Satu langkah<br/>dalam satu waktu.</h3><p>Daftar ini disimpan pada browser. Pastikan informasi terbaru telah dicek pada sumber sebelum berkunjung.</p><a class="text-link" href="${prefix}peta.html">Lihat peta dasar <span>↗</span></a></aside></div><p class="local-note">Draf itinerary tersimpan di browser ini. Login dan sinkronisasi belum tersedia.</p></section></main>`;
}

function loginPage() {
  return `<main><section class="auth-page"><div class="auth-decoration"><p class="eyebrow eyebrow-light"><span></span> SELAMAT DATANG KEMBALI</p><h1>Perjalanan hebat<br/>dimulai dari <em>rencana.</em></h1><p>Simpan tempat dan susun inspirasi perjalananmu bersama ExploreID.</p><span class="auth-caption">DISCOVER INDONESIA, ONE JOURNEY AT A TIME.</span></div><div class="auth-panel"><a class="text-link back-link" href="${prefix}index.html">← Kembali ke beranda</a><p class="eyebrow"><span class="eyebrow-dot"></span> AKUN EXPLOREID</p><h2>Masuk ke <em>akunmu.</em></h2><p class="auth-description">Fitur akun belum dikonfigurasi.</p><form id="login-form"><label>Email<input type="email" name="email" placeholder="nama@email.com" required autocomplete="email"/></label><label>Kata sandi<input type="password" name="password" placeholder="Masukkan kata sandi" required autocomplete="current-password" minlength="8"/></label><button class="button-dark auth-submit" type="submit">Masuk <span>↗</span></button></form><p class="auth-notice">Autentikasi belum aktif. Jangan masukkan kredensial sungguhan.</p><p class="auth-switch">Belum punya akun? <a href="${prefix}daftar.html">Buat akun</a></p></div></section></main>`;
}

function registerPage() {
  return `<main><section class="auth-page"><div class="auth-decoration"><p class="eyebrow eyebrow-light"><span></span> RUANG UNTUK CERITA BARU</p><h1>Yuk, mulai<br/><em>menjelajah.</em></h1><p>Buat akun ExploreID untuk menyimpan tempat dan rencana perjalananmu.</p><span class="auth-caption">DISCOVER INDONESIA, ONE JOURNEY AT A TIME.</span></div><div class="auth-panel"><a class="text-link back-link" href="${prefix}index.html">← Kembali ke beranda</a><p class="eyebrow"><span class="eyebrow-dot"></span> BERGABUNG DENGAN EXPLOREID</p><h2>Buat akun <em>baru.</em></h2><p class="auth-description">Registrasi belum dikonfigurasi.</p><form id="login-form"><label>Nama lengkap<input type="text" name="name" placeholder="Nama kamu" required autocomplete="name"/></label><label>Email<input type="email" name="email" placeholder="nama@email.com" required autocomplete="email"/></label><label>Kata sandi<input type="password" name="password" placeholder="Minimal 8 karakter" required minlength="8" autocomplete="new-password"/></label><button class="button-dark auth-submit" type="submit">Buat akun <span>↗</span></button></form><p class="auth-notice">Autentikasi belum aktif. Formulir tidak mengirim atau menyimpan data.</p><p class="auth-switch">Sudah punya akun? <a href="${prefix}masuk.html">Masuk</a></p></div></section></main>`;
}

const renderers = {
  home: homePage,
  destinations: destinationsPage,
  categories: categoriesPage,
  map: mapPage,
  about: aboutPage,
  wishlist: wishlistPage,
  itinerary: itineraryPage,
  login: loginPage,
  register: registerPage,
  detail: detailPage,
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

async function requestJson(path) {
  const response = await fetch(`${prefix}api/${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API mengembalikan HTTP ${response.status}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result;
}

async function loadCategories() {
  const result = await requestJson("categories");
  return Array.isArray(result.data) ? result.data : [];
}

async function loadPlaces(search = new URLSearchParams()) {
  const result = await requestJson(`destinations?${search}`);
  return {
    data: Array.isArray(result.data) ? result.data : [],
    pagination: result.pagination || { total: 0, page: 1, per_page: 12, total_pages: 0 },
  };
}

async function loadPlace(type, id) {
  const search = new URLSearchParams({ osm_type: type, osm_id: id });
  const result = await requestJson(`destinations?${search}`);
  return result.data || null;
}

function renderCategories(target, categories, large = false) {
  const grid = document.querySelector(target);
  if (!grid) return;
  grid.innerHTML = categories.length
    ? categories.map((item) => large
      ? `<a class="category-large-card" style="--category-hue:${categoryHue(item.category)}" href="${prefix}destinasi.html?kategori=${encodeURIComponent(item.category)}"><span class="category-number">${item.places_count} TEMPAT</span><span class="category-large-bottom"><strong>${escapeHtml(humanizeCategory(item.category))}</strong><span>Label kategori sesuai data OpenStreetMap.</span></span><span class="category-arrow">↗</span></a>`
      : categoryCard(item)).join("")
    : emptyPanel("Belum ada kategori.", "Tidak ditemukan nilai kategori pada database.");
}

function renderCategorySelect(select, categories, allLabel) {
  if (!select) return;
  const selected = params.get("kategori") || "";
  select.innerHTML = `<option value="">${allLabel}</option>${categories.map((item) => `<option value="${escapeHtml(item.category)}">${escapeHtml(humanizeCategory(item.category))} (${item.places_count})</option>`).join("")}`;
  select.value = selected;
}

function renderFilterChips(categories) {
  const chips = document.querySelector("#filter-chips");
  if (!chips) return;
  const selected = params.get("kategori") || "";
  const visibleCategories = categories.slice(0, 7);
  if (selected && !visibleCategories.some((item) => item.category === selected)) {
    const selectedCategory = categories.find((item) => item.category === selected);
    if (selectedCategory) visibleCategories.push(selectedCategory);
  }
  const options = [{ category: "", label: "Semua" }, ...visibleCategories.map((item) => ({ category: item.category, label: humanizeCategory(item.category) }))];
  chips.innerHTML = options.map((item) => `<a class="${selected === item.category ? "active" : ""}" href="${prefix}destinasi.html${item.category ? `?kategori=${encodeURIComponent(item.category)}` : ""}">${escapeHtml(item.label)}</a>`).join("");
}

function renderPlaces(target, places, actions = true) {
  const grid = document.querySelector(target);
  if (!grid) return;
  grid.innerHTML = places.length
    ? places.map((place, index) => placeCard(place, index, actions)).join("")
    : emptyPanel("Belum ada data tempat.", "Pastikan dataset telah diimpor ke Cloudflare D1.");
}

async function renderListing() {
  const queryInput = document.querySelector("#listing-query");
  const categoryInput = document.querySelector("#listing-category");
  const grid = document.querySelector("#listing-grid");
  if (!grid || !queryInput || !categoryInput) return;

  const search = new URLSearchParams();
  const query = queryInput.value.trim();
  const category = categoryInput.value;
  const currentPage = Number(params.get("page") || "1");
  if (query) search.set("q", query);
  if (category) search.set("category", category);
  search.set("page", String(Number.isInteger(currentPage) && currentPage > 0 ? currentPage : 1));
  search.set("per_page", "12");

  grid.innerHTML = emptyPanel("Memuat data…", "Mengambil daftar dari database.");
  try {
    const result = await loadPlaces(search);
    renderPlaces("#listing-grid", result.data);
    document.querySelector("#listing-count").textContent = `${result.pagination.total} tempat`;
    const empty = document.querySelector("#listing-empty");
    if (empty) empty.hidden = result.data.length > 0 || !result.pagination.total;
    const pagination = document.querySelector("#listing-pagination");
    if (pagination) {
      const { page: activePage, total_pages: totalPages } = result.pagination;
      pagination.innerHTML = totalPages > 1
        ? `<button type="button" data-page="${Math.max(1, activePage - 1)}" ${activePage <= 1 ? "disabled" : ""}>← Sebelumnya</button><span>Halaman ${activePage} dari ${totalPages}</span><button type="button" data-page="${Math.min(totalPages, activePage + 1)}" ${activePage >= totalPages ? "disabled" : ""}>Berikutnya →</button>`
        : "";
    }
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category) next.set("kategori", category);
    if (currentPage > 1) next.set("page", String(currentPage));
    history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  } catch (error) {
    console.error("Gagal memuat direktori dari API.", error);
    grid.innerHTML = errorPanel();
  }
}

async function renderSavedList(storageKey, gridSelector, emptySelector) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  const savedKeys = readList(storageKey);
  if (!savedKeys.length) {
    grid.hidden = true;
    document.querySelector(emptySelector).hidden = false;
    return;
  }
  grid.innerHTML = emptyPanel("Memuat data…", "Mengambil tempat tersimpan dari database.");
  try {
    const places = (await Promise.all(savedKeys.map((key) => {
      const separator = key.indexOf(":");
      if (separator < 1) return Promise.resolve(null);
      return loadPlace(key.slice(0, separator), key.slice(separator + 1));
    }))).filter(Boolean);
    renderPlaces(gridSelector, places);
    grid.hidden = places.length === 0;
    document.querySelector(emptySelector).hidden = places.length > 0;
  } catch (error) {
    console.error("Gagal memuat daftar tersimpan dari API.", error);
    grid.innerHTML = errorPanel();
    grid.hidden = false;
    document.querySelector(emptySelector).hidden = true;
  }
}

async function renderItinerary() {
  const list = document.querySelector("#itinerary-list");
  if (!list) return;
  const keys = readList("exploreid-itinerary");
  if (!keys.length) {
    list.hidden = true;
    document.querySelector("#itinerary-empty").hidden = false;
    return;
  }
  list.innerHTML = emptyPanel("Memuat data…", "Mengambil tempat dari database.");
  try {
    const places = (await Promise.all(keys.map((key) => {
      const separator = key.indexOf(":");
      if (separator < 1) return Promise.resolve(null);
      return loadPlace(key.slice(0, separator), key.slice(separator + 1));
    }))).filter(Boolean);
    list.innerHTML = places.map((place, index) => `
      <article class="itinerary-item"><span class="itinerary-number">${String(index + 1).padStart(2, "0")}</span><div class="itinerary-thumb"></div><div class="itinerary-item-copy"><p>${escapeHtml(placeLabel(place))}</p><h3><a href="${placeUrl(place)}">${escapeHtml(place.name)}</a></h3><span>${escapeHtml(place.province || "Wilayah tidak tersedia")}</span></div><button class="remove-item" type="button" data-action="remove-itinerary" data-key="${escapeHtml(placeKey(place))}" aria-label="Hapus ${escapeHtml(place.name)} dari rencana">×</button></article>`).join("");
    list.hidden = places.length === 0;
    document.querySelector("#itinerary-empty").hidden = places.length > 0;
  } catch (error) {
    console.error("Gagal memuat itinerary dari API.", error);
    list.innerHTML = errorPanel();
  }
}

async function renderDetailFromApi() {
  const container = document.querySelector("#place-detail");
  try {
    const place = await loadPlace(detailKey.osm_type, detailKey.osm_id);
    if (!place) {
      container.innerHTML = emptyPanel("Tempat tidak ditemukan.", "Rekaman ini tidak tersedia pada database.");
      return;
    }
    document.title = `ExploreID — ${place.name}`;
    renderDetail(place);
  } catch (error) {
    console.error("Gagal memuat detail dari API.", error);
    container.innerHTML = errorPanel();
  }
}

async function refreshPageData() {
  pageState.error = null;
  try {
    if (page === "detail") {
      await renderDetailFromApi();
      return;
    }
    if (page === "wishlist") {
      await renderSavedList("exploreid-wishlist", "#saved-grid", "#saved-empty");
      return;
    }
    if (page === "itinerary") {
      await renderItinerary();
      return;
    }

    pageState.categories = await loadCategories();
    if (page === "home") {
      renderCategories("#home-categories", pageState.categories.slice(0, 6));
      const categorySelect = document.querySelector("#home-category");
      if (categorySelect) {
        categorySelect.innerHTML = `<option value="">Semua kategori</option>${pageState.categories.map((item) => `<option value="${escapeHtml(item.category)}">${escapeHtml(humanizeCategory(item.category))}</option>`).join("")}`;
      }
      const places = await loadPlaces(new URLSearchParams({ page: "1", per_page: "3", sort: "name" }));
      renderPlaces("#home-places", places.data);
      return;
    }
    if (page === "categories") {
      renderCategories("#all-categories", pageState.categories, true);
      return;
    }
    if (page === "destinations") {
      renderCategorySelect(document.querySelector("#listing-category"), pageState.categories, "Semua kategori");
      renderFilterChips(pageState.categories);
      await renderListing();
    }
  } catch (error) {
    pageState.error = error;
    console.error("Gagal memuat data halaman dari API.", error);
    const errorTarget = page === "home" ? "#home-places" : page === "categories" ? "#all-categories" : "#listing-grid";
    const target = document.querySelector(errorTarget);
    if (target) target.innerHTML = errorPanel();
    const categoryTarget = document.querySelector("#home-categories");
    if (categoryTarget && page === "home") categoryTarget.innerHTML = errorPanel();
  }
}

document.title = `ExploreID — ${pageTitles[page] || "Jelajahi Indonesia"}`;
root.innerHTML = `${header()}${(renderers[page] || homePage)()}${footer()}`;

document.addEventListener("submit", (event) => {
  if (event.target.id === "home-search") {
    event.preventDefault();
    const formData = new FormData(event.target);
    const search = new URLSearchParams();
    const query = String(formData.get("q") || "").trim();
    const category = String(formData.get("category") || "");
    if (query) search.set("q", query);
    if (category) search.set("kategori", category);
    window.location.href = `${prefix}destinasi.html${search.size ? `?${search}` : ""}`;
  }
  if (event.target.id === "login-form") {
    event.preventDefault();
    showToast("Autentikasi belum dikonfigurasi. Data formulir tidak disimpan.");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "listing-query") {
    params.delete("page");
    renderListing();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "listing-category") {
    params.delete("page");
    renderListing();
  }
});

document.addEventListener("click", async (event) => {
  if (event.target.closest(".menu-toggle")) {
    const toggle = document.querySelector(".menu-toggle");
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    document.querySelector("#primary-nav").classList.toggle("open", !expanded);
    return;
  }

  const retry = event.target.closest('[data-action="retry"]');
  if (retry) {
    await refreshPageData();
    return;
  }

  const pageButton = event.target.closest("[data-page]");
  if (pageButton && page === "destinations") {
    params.set("page", pageButton.dataset.page);
    await renderListing();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const { action, key } = actionButton.dataset;

  if (action === "wishlist" || action === "itinerary" || action === "remove-itinerary") {
    const storageKey = action === "wishlist" ? "exploreid-wishlist" : "exploreid-itinerary";
    const current = readList(storageKey);
    const exists = current.includes(key);
    const updated = action === "remove-itinerary" || (action === "wishlist" && exists)
      ? current.filter((value) => value !== key)
      : exists ? current : [...current, key];

    if (!writeList(storageKey, updated)) return;
    if (action === "wishlist") showToast(exists ? "Tempat dihapus dari koleksi." : "Tempat disimpan ke koleksi.");
    else showToast(action === "remove-itinerary" ? "Tempat dihapus dari rencana." : exists ? "Tempat sudah ada di rencanamu." : "Tempat ditambahkan ke rencana.");

    if (action === "wishlist" && page === "wishlist") await renderSavedList(storageKey, "#saved-grid", "#saved-empty");
    else if (action === "remove-itinerary" || (action === "itinerary" && page === "itinerary")) await renderItinerary();
    else {
      actionButton.classList.toggle("is-saved", action === "wishlist" && !exists);
      actionButton.classList.toggle("is-added", action === "itinerary");
      if (action === "itinerary" && !exists) actionButton.textContent = "Tersimpan di rencana";
      if (action === "wishlist") actionButton.setAttribute("aria-pressed", String(!exists));
    }
    return;
  }

  if (event.target.closest("#clear-search")) {
    const input = document.querySelector("#listing-query");
    input.value = "";
    params.delete("q");
    await renderListing();
    input.focus();
    return;
  }

  if (event.target.closest("#clear-itinerary")) {
    if (writeList("exploreid-itinerary", [])) {
      await renderItinerary();
      showToast("Daftar rencana dikosongkan.");
    }
  }
});

document.querySelector("#primary-nav").addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    document.querySelector("#primary-nav").classList.remove("open");
  }
});

refreshPageData();
