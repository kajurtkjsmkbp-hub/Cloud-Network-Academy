#!/bin/bash
# ==============================================================================
# Script Instalasi Otomatis Cloud Network Academy untuk LXC Proxmox (Debian/Ubuntu)
# ==============================================================================

set -e

echo "Memulai proses instalasi untuk LXC Proxmox..."

# 1. Update sistem dan install dependensi dasar
echo "1. Memperbarui sistem operasi..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# 2. Install Node.js (Versi 20 LTS)
if ! command -v node &> /dev/null
then
    echo "2. Menginstall Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "2. Node.js sudah terinstall: $(node -v)"
fi

# 3. Install PM2 (Process Manager)
if ! command -v pm2 &> /dev/null
then
    echo "3. Menginstall PM2 untuk menjalankan aplikasi di background..."
    sudo npm install -g pm2
else
    echo "3. PM2 sudah terinstall."
fi

# 4. Clone Repository
echo "4. Menyiapkan Source Code..."
if [ ! -d "Cloud-Network-Academy" ]; then
    git clone https://github.com/kajurtkjsmkbp-hub/Cloud-Network-Academy.git
    cd Cloud-Network-Academy
else
    cd Cloud-Network-Academy
    git pull origin main
fi

# 5. Install & Build Next.js
echo "5. Menginstall dependensi paket NPM..."
npm install

echo "6. Melakukan Build produksi aplikasi Next.js..."
npm run build

# 7. Start dengan PM2
echo "7. Mengaktifkan aplikasi dengan PM2..."
# Hapus instance pm2 yang lama jika ada (untuk restart bersih)
pm2 delete lms-academy 2>/dev/null || true
pm2 start npm --name "lms-academy" -- start

# 8. PM2 Startup (Agar otomatis jalan saat LXC di-restart)
echo "8. Menyimpan konfigurasi autostart PM2..."
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME || true

# Selesai
IP_LXC=$(hostname -I | awk '{print $1}')
echo "========================================================================"
echo "DEPLOYMENT SUKSES! 🚀"
echo "Aplikasi Cloud Network Academy telah berjalan di background."
echo ""
echo "Akses aplikasi melalui browser di jaringan Anda:"
echo "http://$IP_LXC:3000"
echo ""
echo "Gunakan perintah 'pm2 logs lms-academy' untuk melihat log server."
echo "Gunakan perintah 'pm2 status' untuk melihat status aplikasi."
echo "========================================================================"
