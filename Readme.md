
# 🌐 gzbrilliAutomation Script

Script ini digunakan untuk **otomatisasi pendaftaran akun dan aktivitas harian** (seperti login, klaim, mining, dan airdrop submission) di situs [Brilliance Global](https://brilliance.global/). Script mendukung penggunaan **proxy**, penyimpanan akun ke file JSON, serta rotasi akun dan header secara otomatis.

---

## 🚀 Fitur

- ✅ Auto Register akun baru dengan email acak
- 🔐 Auto Login dan simpan token ke `accounts.json`
- ⛏️ Auto Mining harian dan klaim reward
- 📤 Auto Submit Airdrop
- 🌍 Mendukung Proxy (HTTP/HTTPS)
- 🎭 Random User-Agent dan Device Fingerprint
- 📦 Penyimpanan akun ke dalam file `accounts.json`

---

## 📦 Instalasi

1. **Clone repository atau simpan script:**

```bash
git clone https://github.com/Gusma-crypto/gzbrilliAutomation.git
cd gzbrilliAutomation
```

2. **Install dependensi:**

```bash
npm install 
```

---

## ⚙️ Cara Penggunaan

### 1. Menjalankan Script

```bash
node brilliance.js
```

Script akan:

- Mengambil proxy dari `proxies.txt` (jika ada)
- Mendaftarkan akun baru dengan email acak
- Menyimpan akun dan token ke `accounts.json`
- Menjalankan proses mining dan klaim otomatis

### 2. Struktur File

- `binc.js` → Script utama
- `proxies.txt` → (Opsional) Daftar proxy dalam format:
  ```
  http://username:password@host:port
  ```
- `accounts.json` → File penyimpanan akun dan token hasil pendaftaran

---

## 🛠️ Konfigurasi Opsional

- Gunakan proxy berbeda untuk tiap akun agar tidak terdeteksi duplikat.
- Tambahkan header `X-Forwarded-For` secara acak agar fingerprint IP unik.
- Gunakan email forwarder atau domain email acak jika ingin menggunakan email nyata.

---

## ⚠️ Catatan Penting

- Jangan menggunakan script ini untuk spam atau aktivitas ilegal.
- Script ini dibuat untuk tujuan edukasi dan eksperimen otomatisasi.
- Situs dapat memblokir IP/akun jika terdeteksi sebagai bot.

---

## 📬 Kontak

Jika kamu ingin berdiskusi atau butuh bantuan, hubungi:

**Telegram**: [@cuitme](https://t.me/cuitmeairdrop)  

