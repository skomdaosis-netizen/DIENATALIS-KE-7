# Twibbon Dies Natalis ke-7 SMK Telkom Sidoarjo

Website twibbon berbasis Vite + React (pakai preact-compat, ringan & cepat).
Fitur:
- Upload foto, geser & zoom (mouse scroll / pinch di HP)
- Rotate foto
- Frame Dies Natalis ke-7 otomatis nempel
- Download hasil sebagai `TWIBBON-DIESNATALIS-7.png`
- Tombol salin caption siap pakai

## Menjalankan di lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview   # opsional, buat cek hasil build
```

Hasil build ada di folder `dist/`.

## Deploy ke Vercel

**Cara paling gampang (tanpa install apa-apa):**
1. Buka https://vercel.com/new
2. Upload folder project ini (atau push dulu ke GitHub lalu import repo-nya)
3. Vercel otomatis mendeteksi Vite. Pastikan settingnya:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)
4. Klik **Deploy**, tunggu sampai selesai, dan website langsung online.

**Lewat CLI:**
```bash
npm i -g vercel
vercel login
vercel        # deploy preview
vercel --prod # deploy ke production
```

File `vercel.json` sudah disiapkan supaya routing tetap aman.

## Ganti-ganti konten

- Frame twibbon: `public/frame-diesnatalis.png`
- Logo header: `public/logo-diesnatalis.png`
- Judul, subtitle, caption, nama file download: `src/app.jsx`
- Warna tema (teal): `src/app.css` (bagian `:root`)

## Setelah deploy — jangan lupa

Ganti URL placeholder `https://ganti-dengan-domain-kamu.vercel.app` di `index.html`
(bagian `og:image`) dengan domain asli project kamu di Vercel, supaya preview link
di WhatsApp/Instagram menampilkan gambar logo dengan benar.

## Changelog perbaikan

- ✅ Tambah `.gitignore` (supaya `node_modules` tidak ikut ter-commit ke GitHub).
- ✅ Ganti keterangan lomba **SYNC** menjadi *"Skomda Youth Narative Cinema"* (ikon diganti 🎬, caption disesuaikan).
- ✅ Tombol **Reset** posisi & zoom foto (tanpa perlu upload ulang).
- ✅ Notifikasi (toast) setelah berhasil download.
- ✅ Penanganan error saat upload (file bukan gambar, lebih dari 15MB, atau gagal dibaca).
- ✅ Slider "Putar" disembunyikan di balik "Pengaturan lanjutan" biar tampilan lebih simpel.
- ✅ Tombol "Ganti Lomba" diperbesar (target tap lebih ramah jempol di HP).
- ✅ Step indicator ("Langkah 1/2/3 dari 3") di tiap kartu.
- ✅ Meta tag Open Graph di `index.html` untuk preview link yang lebih menarik saat dibagikan.
