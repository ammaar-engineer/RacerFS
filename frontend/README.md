# RacerFS Frontend (Landing Page)

Website landing page interaktif dan media pemasaran resmi untuk **RacerFS** — SaaS setup linux & manajemen berkas via terminal. Dibangun menggunakan teknologi modern dengan performa tinggi dan visual retro pixel art yang premium.

## 🛠️ Stack Teknologi

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Shadcn UI (Custom Themes)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Memulai (Local Development)

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas direkomendasikan) dan **npm** di mesin lokal Anda.

### 1. Instalasi Dependensi
Jalankan perintah berikut di dalam direktori `frontend`:
```bash
npm install
```

### 2. Menjalankan Server Pengembangan
Untuk menjalankan website dalam mode development lokal:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

### 3. Build untuk Produksi
Untuk melakukan build aset terkompilasi siap saji yang telah dioptimasi:
```bash
npm run build
```
Hasil build akan tersimpan di dalam folder `dist/` dan siap dideploy ke platform hosting seperti Vercel, Netlify, atau GitHub Pages.

### 4. Linting & Pemeriksaan Tipe data
Untuk memeriksa kualitas kode dan memastikan integritas TypeScript:
```bash
# Cek dengan ESLint
npm run lint

# Cek tipe data TypeScript
npm run typecheck
```

## 📂 Struktur Folder
```
frontend/
├── public/          # Aset statis global (favicon, dll)
├── src/
│   ├── components/  # Komponen UI umum & partikel kursor (Fx)
│   ├── hooks/       # Custom hooks (Eye tracking, theme, GitHub stats)
│   ├── pages/       # Halaman utama aplikasi (Home.tsx)
│   ├── pixel/       # Elemen pixel art (Kucing, Riverside Scene, dll)
│   ├── sections/    # Seksi halaman web (Hero, Architecture, Roadmap, dll)
│   ├── App.tsx      # Root component
│   └── index.css    # Gaya global & keyframes animasi
├── index.html       # HTML entry point (SEO tags)
└── package.json     # Konfigurasi dependensi & scripts
```
