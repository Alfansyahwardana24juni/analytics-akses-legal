#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# build.sh — Membangun dua versi dashboard terenkripsi:
#   1. index.html  → Versi LENGKAP (Bos) — semua tab
#   2. cs.html     → Versi CS saja    — hanya tab Data CS
#
# Cara pakai:
#   1. Taruh file dashboard asli di folder yang sama, beri nama:
#      dashboard.html
#
#   2. Jalankan:
#      bash build.sh
#
#   3. Hasil di folder output/:
#      output/index.html  → deploy untuk Bos
#      output/cs.html     → deploy untuk CS
#
# Untuk mengganti PIN, edit variabel di bawah:
# ═══════════════════════════════════════════════════════════════

PIN_FULL="102525"     # PIN untuk versi lengkap (Bos)
PIN_CS="240826"       # PIN untuk versi CS

# ── Cek file sumber ──
if [ ! -f "dashboard.html" ]; then
  echo "❌ File 'dashboard.html' tidak ditemukan!"
  echo "   Taruh file dashboard asli di folder ini dengan nama dashboard.html"
  exit 1
fi

# ── Cek Node.js ──
if ! command -v node &> /dev/null; then
  echo "❌ Node.js belum terinstal. Install dulu: https://nodejs.org"
  exit 1
fi

# ── Cek script pendukung ──
for f in encrypt.js make-cs.js; do
  if [ ! -f "$f" ]; then
    echo "❌ File '$f' tidak ditemukan di folder ini!"
    exit 1
  fi
done

mkdir -p output

echo "📋 Membuat versi CS-only..."
node make-cs.js dashboard.html output/_cs_raw.html

echo "🔐 Mengenkripsi versi LENGKAP (PIN: $PIN_FULL)..."
node encrypt.js "$PIN_FULL" dashboard.html output/index.html "KPI Dashboard — Akseslegal.id"

echo "🔐 Mengenkripsi versi CS (PIN: $PIN_CS)..."
node encrypt.js "$PIN_CS" output/_cs_raw.html output/cs.html "Dashboard CS — Akseslegal.id"

# Hapus file sementara
rm -f output/_cs_raw.html

echo ""
echo "════════════════════════════════════════"
echo "✅ Selesai! File ada di folder output/"
echo ""
echo "  output/index.html  → Versi Lengkap (Bos)"
echo "    PIN: $PIN_FULL"
echo ""
echo "  output/cs.html     → Versi CS Saja"
echo "    PIN: $PIN_CS"
echo ""
echo "  Deploy ke Vercel:"
echo "    vercel output/"
echo "════════════════════════════════════════"
