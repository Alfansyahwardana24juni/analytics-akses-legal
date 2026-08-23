# 🔐 Akseslegal Dashboard — Enkripsi & Pemisahan CS

## Apa yang dihasilkan

| File Output        | Untuk    | Isi                                     |
|--------------------|----------|-----------------------------------------|
| `output/index.html`| **Bos**  | Dashboard LENGKAP (semua tab)           |
| `output/cs.html`   | **Tim CS** | Hanya tab Data CS (tanpa Admin/Finance) |

Kedua file **terenkripsi AES-256-GCM**. Tanpa PIN yang benar, isi halaman 100% tidak terbaca — bahkan jika orang membuka source code di GitHub.

## Cara Pakai

### 1. Siapkan file

Taruh file dashboard HTML asli di folder ini dengan nama `dashboard.html`.

### 2. Jalankan build

```bash
bash build.sh
```

Hasilnya ada di folder `output/`.

### 3. Ganti PIN (opsional)

Buka `build.sh`, ubah baris:

```bash
PIN_FULL="102525"     # PIN untuk versi lengkap (Bos)
PIN_CS="240826"       # PIN untuk versi CS
```

Lalu jalankan ulang `bash build.sh`.

### 4. Deploy ke Vercel

```
output/
├── index.html    ← halaman utama (Bos)
└── cs.html       ← halaman CS (beri link terpisah ke tim CS)
```

Push folder `output/` ke GitHub, atau drag & drop ke Vercel.

**URL untuk Bos:** `https://nama-project.vercel.app/`
**URL untuk CS:**  `https://nama-project.vercel.app/cs.html`

## Tingkat Keamanan

| Aspek                    | Status |
|--------------------------|--------|
| Konten terenkripsi       | ✅ AES-256-GCM (standar militer) |
| PIN tidak tersimpan      | ✅ PIN jadi kunci dekripsi, bukan disimpan |
| Source code aman          | ✅ Buka source = lihat teks acak |
| Brute force dilindungi  | ✅ 600.000 iterasi PBKDF2 + lockout 60 detik |
| Batas percobaan          | ✅ Maks 5× salah → kunci 60 detik |

## Kapan Build Ulang?

Jalankan `bash build.sh` setiap kali:
- Dashboard HTML diperbarui
- Ingin mengganti PIN
- Ingin menambah/menghapus tab untuk versi CS

## File dalam Paket

| File         | Fungsi                                           |
|--------------|--------------------------------------------------|
| `encrypt.js` | Mengenkripsi HTML apa pun dengan PIN             |
| `make-cs.js` | Memotong dashboard jadi versi CS-only            |
| `build.sh`   | Menjalankan keduanya dan menghasilkan output/     |
