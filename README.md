# Cloud Network Academy - LMS MikroTik

Aplikasi Learning Management System (LMS) berbasis Next.js interaktif, dirancang khusus untuk mensimulasikan lingkungan belajar dan praktek router MikroTik langsung dari browser. Sistem ini memiliki 20 Modul pembelajaran lengkap (mulai dari dasar IP, Routing, Firewall, VLAN, hingga Troubleshooting), 500 Kuis, dan ratusan soal praktek Terminal interaktif (xterm.js).

## 🚀 Fitur Utama
- **20 Modul Terstruktur**: Kurikulum Jaringan "Kelas Berat" dari dasar hingga mahir.
- **Terminal Interaktif**: Praktek sintaks MikroTik CLI langsung di browser.
- **Auto-grading System**: Penilaian kuis dan praktek seketika (real-time).
- **Sertifikat Dinamis**: Terbuka dan bisa didownload saat semua 20 modul selesai dikerjakan.
- **Sistem LocalStorage**: Database berbasis lokal (tanpa perlu setting server database).

---

## 📦 Deployment ke LXC Proxmox (Disarankan)

Aplikasi ini sudah dilengkapi dengan script instalasi otomatis khusus untuk *container* LXC Proxmox berbasis Ubuntu atau Debian. 

### Langkah Instalasi
1. Buat dan jalankan sebuah **LXC (Ubuntu 22.04 / Debian 12)** baru di Proxmox Anda. 
2. Alokasikan minimal **1 Core CPU** dan **1 GB RAM**.
3. Buka tab **Console** LXC tersebut, lalu jalankan satu baris perintah sakti berikut:

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/kajurtkjsmkbp-hub/Cloud-Network-Academy/main/deploy-lxc.sh | bash
\`\`\`

Script tersebut akan secara otomatis:
- Mengupdate sistem operasi Anda.
- Menginstall Node.js versi 20.
- Menginstall dan mengonfigurasi PM2.
- Mengunduh repository ini (Git Clone).
- Melakukan Build Production.
- Menjalankan LMS di background dan menyimpannya agar otomatis menyala saat server restart.

### Mengakses Aplikasi
Setelah proses instalasi selesai, cukup akses IP lokal LXC Anda melalui browser:
\`\`\`
http://<ALAMAT_IP_LXC_ANDA>:3000
\`\`\`

*(Untuk melihat *log* aplikasi kapan saja, ketik `pm2 logs lms-academy` di console LXC).*

---

## 💻 Instalasi Lokal (Development)

Jika Anda ingin memodifikasi atau menjalankan secara lokal di PC Windows/Mac:

1. Clone repository:
   \`\`\`bash
   git clone https://github.com/kajurtkjsmkbp-hub/Cloud-Network-Academy.git
   cd Cloud-Network-Academy
   \`\`\`

2. Install NPM packages:
   \`\`\`bash
   npm install
   \`\`\`

3. Jalankan development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Buka [http://localhost:3000](http://localhost:3000) di browser.
