/**
 * make-cs.js — Membuat versi CS-only dari dashboard lengkap.
 *
 * Menghapus: sidebar admin/desain/finance, page-overview, page-perorangan,
 * page-divisi, page-desain, page-finance, filter divisi, dan fungsi JS
 * yang tidak diperlukan. Menyetel halaman default ke 'cs'.
 *
 * Usage: node make-cs.js <input-full.html> <output-cs.html>
 */
const fs = require('fs');
const [,, input, output] = process.argv;
if (!input || !output) { console.error('Usage: node make-cs.js <input.html> <output.html>'); process.exit(1); }

let html = fs.readFileSync(input, 'utf8');

// ── 1. Sidebar: hapus item admin, desain, finance ──
// Hapus section "Divisi Admin" beserta 4 item-nya
html = html.replace(
  /<div class="sb-section">Divisi Admin<\/div>\s*<div class="sb-item active" data-page="overview">[\s\S]*?<\/div>\s*<div class="sb-item" data-page="perorangan">[\s\S]*?<\/div>\s*<div class="sb-item" data-page="divisi">[\s\S]*?<\/div>\s*<div class="sb-item" data-page="desain">[\s\S]*?<\/div>/,
  ''
);
// Hapus section "Keuangan" beserta item finance
html = html.replace(
  /<div class="sb-section" style="margin-top:8px">Keuangan<\/div>\s*<div class="sb-item" data-page="finance">[\s\S]*?<\/div>/,
  ''
);
// Jadikan CS item sebagai active
html = html.replace(
  '<div class="sb-item" data-page="cs">',
  '<div class="sb-item active" data-page="cs">'
);

// ── 2. Topbar: hapus filter divisi ──
html = html.replace(
  /<select class="fsel" id="fDivisi"[\s\S]*?<\/select>/,
  ''
);

// ── 3. Hapus page div non-CS ──
// Setiap page ditandai komentar HTML yang unik
function removeBetween(h, startMarker, endMarker) {
  const i = h.indexOf(startMarker);
  if (i === -1) return h;
  const j = h.indexOf(endMarker, i);
  if (j === -1) return h;
  return h.substring(0, i) + h.substring(j);
}

html = removeBetween(html, '<!-- OVERVIEW -->', '<!-- PER ORANG -->');
html = removeBetween(html, '<!-- PER ORANG -->', '<!-- PER DIVISI -->');
html = removeBetween(html, '<!-- PER DIVISI -->', '<!-- DESAIN -->');
html = removeBetween(html, '<!-- DESAIN -->', '<!-- ================= CS (DIROMBAK) ================= -->');
// Finance: cari awal dan akhir
const finStart = html.indexOf('<!-- FINANCE -->');
if (finStart !== -1) {
  // Finance page div berakhir dengan </div> sebelum </div> (content) dan </main>
  // Cari penutup: 3 </div> terakhir sebelum </main>
  const mainEnd = html.indexOf('</main>', finStart);
  if (mainEnd !== -1) {
    // Dari finStart, cari mundur dari mainEnd untuk 3 </div>
    let pos = mainEnd;
    // Kita perlu menghapus: <div class="page" id="page-finance">...</div>
    // yang ditutup sebelum closing </div> content dan </main>
    // Cari </div>\n    </div>\n  </main> pattern
    const finEnd = html.lastIndexOf('</div>', mainEnd);
    if (finEnd > finStart) {
      html = html.substring(0, finStart) + html.substring(finEnd + 6);
    }
  }
}

// ── 4. Loading view: hapus (data admin) ──
// Biarkan loading view — masih berguna untuk data CS

// ── 5. JS: set default page ke 'cs' ──
html = html.replace(
  "let selectedPerson = null, curPage = 'overview', firstLoad = true;",
  "let selectedPerson = null, curPage = 'cs', firstLoad = true;"
);

// ── 6. Judul ──
html = html.replace(
  '<title>KPI Dashboard — Akseslegal.id</title>',
  '<title>Dashboard CS — Akseslegal.id</title>'
);

// ── 7. Sidebar title ──
html = html.replace(
  '<div class="sb-logo-sub">KPI Dashboard</div>',
  '<div class="sb-logo-sub">Dashboard CS</div>'
);

// ── 8. showPage: batasi hanya 'cs' ──
html = html.replace(
  "const PAGE_TITLES = { overview: 'Overview', perorangan: 'Per Orang', divisi: 'Per Divisi', desain: 'Desain', cs: 'Data CS', finance: 'Finance' };",
  "const PAGE_TITLES = { cs: 'Data CS' };"
);

// ── 9. Di loadAllData, skip loading admin data & desain & finance ──
// Ganti bagian admin loading dengan array kosong
html = html.replace(
  'const adminResults = await Promise.all(ADMIN_SHEETS.map(s => fetchAdminSheet(SHEET_ID, s).catch(() => [])));',
  'const adminResults = []; // CS-only: skip admin'
);
// Skip arsip
html = html.replace(
  /const arsipResults = await Promise\.allSettled\(\s*ARSIP_TABS\.map[\s\S]*?\);\s*const arsipData = arsipResults[\s\S]*?\.flat\(\);/,
  'const arsipData = []; // CS-only: skip arsip'
);
// Skip desain
html = html.replace(
  "dataDesain = await fetchDesainSheet(SHEET_ID, DESAIN_SHEET).catch(() => []);",
  "dataDesain = []; // CS-only: skip desain"
);
// Skip finance (di allSettled)
html = html.replace(
  'await Promise.allSettled([loadCSData(), loadFinanceData()]);',
  'await loadCSData(); // CS-only: skip finance'
);

// ── 10. fMonth filter: sembunyikan (tidak relevan untuk CS) ──
// Biarkan saja, sudah display:none by default

// ── 11. PAGE_TITLES untuk pgTitle default ──
html = html.replace(
  "document.getElementById('pgTitle').textContent = PAGE_TITLES[id] || id;",
  "document.getElementById('pgTitle').textContent = 'Data CS';"
);

fs.writeFileSync(output, html, 'utf8');
const sizeKB = (fs.statSync(output).size / 1024).toFixed(0);
console.log('✅ CS-only version: ' + output + ' (' + sizeKB + ' KB)');
