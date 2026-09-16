# Cloud Network Academy - LMS MikroTik

Aplikasi Learning Management System (LMS) berbasis Next.js interaktif, dirancang khusus untuk mensimulasikan lingkungan belajar dan praktek router MikroTik langsung dari browser. Sistem ini memiliki 20 Modul pembelajaran lengkap (mulai dari dasar IP, Routing, Firewall, VLAN, hingga Troubleshooting), 500 Kuis, dan ratusan soal praktek Terminal interaktif (xterm.js).

## Fitur Utama
- **20 Modul Terstruktur**: Kurikulum Jaringan "Kelas Berat" dari dasar hingga mahir.
- **Terminal Interaktif**: Praktek sintaks MikroTik CLI langsung di browser dengan deteksi validasi sintaks secara *real-time* (Warna Hijau/Merah).
- **Auto-grading System**: Penilaian kuis dan praktek seketika (real-time).
- **Pemantauan & Rekam Jejak Detail**: Rekaman seluruh aktivitas belajar, riwayat login, skor kuis, dan perintah terminal yang bisa dipantau langsung oleh guru.
- **Sertifikat Dinamis**: Terbuka dan bisa diunduh saat semua 20 modul selesai dikerjakan.
- **Database Permanen (Prisma & SQLite)**: Data tersimpan secara aman dan tersentralisasi, tidak akan hilang walau siswa berganti komputer/browser.

---

## 🚀 Panduan Instalasi Detail di LXC Proxmox / VPS Linux

Untuk menjalankan aplikasi ini secara 24 jam non-stop di server sekolah atau instansi, sangat disarankan menggunakan **LXC (Linux Container)** di Proxmox atau VPS. Gunakan template **Ubuntu 22.04 / 24.04** atau **Debian 12** dengan alokasi minimal 1 Core CPU dan 1 GB RAM.

Buka menu **Console** pada LXC Anda, lalu ikuti langkah-langkah detail berikut secara berurutan:

### 1. Update Sistem & Install Paket Dasar
```bash
apt update && apt upgrade -y
apt install curl git build-essential -y
```

### 2. Install Node.js (Versi 20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```
*Pastikan Node.js sudah terinstal dengan mengecek: `node -v` dan `npm -v`.*

### 3. Install PM2 (Untuk menjaga aplikasi tetap hidup)
PM2 akan menjalankan aplikasi di *background* sehingga tidak mati saat console/SSH ditutup.
```bash
npm install -g pm2
```

### 4. Unduh (Clone) Source Code LMS
```bash
git clone https://github.com/kajurtkjsmkbp-hub/Cloud-Network-Academy.git
cd Cloud-Network-Academy
```

### 5. Install Dependencies, Generate Database, & Build Aplikasi
Langkah ini sangat **KRUSIAL**. Karena kita menggunakan database Prisma, kita harus menyesuaikan konfigurasi database dengan OS Linux dan memberikan hak akses agar *user* bisa menulis file database.
```bash
npm install
npx prisma generate
sudo chmod -R 777 prisma/
npm run build
```

### 6. Jalankan Aplikasi dengan PM2
```bash
pm2 start npm --name "lms-mikrotik" -- start
pm2 save
pm2 startup
```
Langkah `pm2 startup` biasanya akan memunculkan sebuah perintah baru di layar, *copy* perintah tersebut dan *paste* kembali ke console lalu tekan enter untuk memastikannya berjalan saat server *reboot*.

### 7. Selesai!
Aplikasi Anda sekarang aktif. Buka browser komputer Anda dan akses menggunakan IP dari LXC tersebut:
```
http://<ALAMAT_IP_LXC_ANDA>:3000
```
*(Login Default Guru - Email: `guru@sekolah.com` / Password: `admin`)*

---

## 🔄 Cara Memperbarui (Update) Aplikasi di LXC

Jika terdapat pembaruan kode terbaru di GitHub, Anda **tidak perlu** menginstal ulang LXC dari awal. Cukup ikuti langkah berikut di **Console LXC** Anda:

**1. Masuk ke folder aplikasi:**
```bash
cd Cloud-Network-Academy
```

**2. Tarik kode terbaru dari GitHub:**
```bash
git pull origin main
```

**3. Install pembaruan paket & Sesuaikan Database (PENTING):**
Jika tahap ini dilewati, aplikasi bisa *crash* (Internal Server Error) saat Anda mencoba Login.
```bash
npm install
npx prisma generate
sudo chmod -R 777 prisma/
npm run build
```

**4. Restart aplikasi di PM2 agar perubahan langsung aktif:**
```bash
pm2 restart lms-mikrotik
```

Aplikasi Anda kini sudah ter-update ke versi terbaru!

---

## 💻 Instalasi Lokal (Development / Uji Coba di PC/Windows)

Jika Anda hanya ingin memodifikasi atau menjalankan secara lokal di PC/Laptop (Windows/Mac):

1. Clone repository:
   ```bash
   git clone https://github.com/kajurtkjsmkbp-hub/Cloud-Network-Academy.git
   cd Cloud-Network-Academy
   ```

2. Install NPM packages & Generate Prisma:
   ```bash
   npm install
   npx prisma generate
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```

4. Buka [http://localhost:3000](http://localhost:3000) di browser.
