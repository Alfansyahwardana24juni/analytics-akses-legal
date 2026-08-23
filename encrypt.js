/**
 * encrypt.js — Mengenkripsi file HTML dengan AES-256-GCM + PBKDF2.
 *
 * Cara pakai:
 *   node encrypt.js <PIN> <input.html> <output.html> [judul]
 *
 * Hasilnya: file HTML mandiri berisi PIN gate.
 * Konten asli BENAR-BENAR terenkripsi — tidak bisa dibaca
 * walau orang membuka source code di GitHub.
 */
const crypto = require('crypto');
const fs = require('fs');

const [,, pin, inputPath, outputPath, pageTitle] = process.argv;
if (!pin || !inputPath || !outputPath) {
  console.error('Usage: node encrypt.js <PIN> <input.html> <output.html> [title]');
  process.exit(1);
}

const htmlContent = fs.readFileSync(inputPath, 'utf8');
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const iterations = 600000;
const key = crypto.pbkdf2Sync(pin, salt, iterations, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

const encrypted = Buffer.concat([cipher.update(htmlContent, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

const payload = JSON.stringify({
  s: salt.toString('base64'),
  i: iv.toString('base64'),
  t: tag.toString('base64'),
  d: encrypted.toString('base64'),
  n: iterations
});

const title = pageTitle || 'Dashboard — Akseslegal.id';

const wrapper = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;
background:#0f172a;display:flex;align-items:center;justify-content:center;
min-height:100vh;-webkit-font-smoothing:antialiased;padding:20px}
.g{max-width:420px;width:100%;background:#fff;border-radius:24px;padding:44px 36px;
text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.45)}
.g-ico{font-size:52px;margin-bottom:14px}
.g-t{font-size:22px;font-weight:800;color:#0f172a;margin-bottom:6px;letter-spacing:-.3px}
.g-s{font-size:13px;color:#64748b;margin-bottom:32px;line-height:1.6}
.pr{display:flex;gap:10px;justify-content:center;margin-bottom:22px}
.pr input{width:50px;height:58px;text-align:center;font-size:26px;font-weight:700;
border:2px solid #e2e8f0;border-radius:14px;outline:none;color:#0f172a;
transition:.2s;background:#f8fafc;caret-color:transparent}
.pr input:focus{border-color:#3b5bdb;box-shadow:0 0 0 4px rgba(59,91,219,.15);background:#fff}
.pr input.f{border-color:#3b5bdb;background:#fff}
.pr input.w{border-color:#ef4444;background:#fef2f2;animation:shake .4s}
.er{font-size:12px;color:#ef4444;min-height:22px;margin-bottom:18px;font-weight:600}
.bt{background:linear-gradient(135deg,#3b5bdb,#2f49b3);color:#fff;border:none;
border-radius:14px;padding:15px;font-size:14px;font-weight:700;cursor:pointer;
width:100%;transition:.2s;letter-spacing:.2px}
.bt:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(59,91,219,.4)}
.bt:disabled{background:#94a3b8;cursor:not-allowed;transform:none;box-shadow:none}
.sp{display:inline-block;width:16px;height:16px;border:2.5px solid rgba(255,255,255,.3);
border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;
vertical-align:middle;margin-right:8px}
.at{font-size:11px;color:#94a3b8;margin-top:14px}
.lk{color:#ef4444;font-weight:700}
.lg{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:6px}
.lg-d{width:8px;height:8px;border-radius:50%;background:#22c55e}
.lg-t{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-9px)}75%{transform:translateX(9px)}}
</style>
</head>
<body>
<div class="g" id="G">
<div class="lg"><div class="lg-d"></div><div class="lg-t">Terenkripsi AES-256</div></div>
<div class="g-ico">🔐</div>
<div class="g-t">Akses Terlindungi</div>
<div class="g-s">Halaman ini terenkripsi. Masukkan PIN 6 digit untuk mendekripsi dan membuka dashboard.</div>
<div class="pr" id="P">
<input type="password" inputmode="numeric" maxlength="1" data-i="0" autofocus>
<input type="password" inputmode="numeric" maxlength="1" data-i="1">
<input type="password" inputmode="numeric" maxlength="1" data-i="2">
<input type="password" inputmode="numeric" maxlength="1" data-i="3">
<input type="password" inputmode="numeric" maxlength="1" data-i="4">
<input type="password" inputmode="numeric" maxlength="1" data-i="5">
</div>
<div class="er" id="er"></div>
<button class="bt" id="bt" onclick="U()">Buka Dashboard</button>
<div class="at" id="at"></div>
</div>
<script>
const E=${payload};
let F=0,L=0;const MX=5,LT=60;
function gi(i){return document.querySelector('#P input[data-i="'+i+'"]')}
document.querySelectorAll('#P input').forEach((inp,i)=>{
inp.addEventListener('input',e=>{
const v=e.target.value.replace(/[^0-9]/g,'');
e.target.value=v.slice(-1);
e.target.classList.toggle('f',!!e.target.value);
e.target.classList.remove('w');
if(v&&i<5){const n=gi(i+1);if(n)n.focus()}
if(i===5&&v)U();
});
inp.addEventListener('keydown',e=>{
if(e.key==='Backspace'&&!e.target.value&&i>0){const p=gi(i-1);if(p){p.focus();p.value='';p.classList.remove('f')}}
if(e.key==='Enter')U();
});
inp.addEventListener('paste',e=>{
e.preventDefault();
const t=(e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'');
for(let j=0;j<6&&j<t.length;j++){const el=gi(j);if(el){el.value=t[j];el.classList.add('f')}}
if(t.length>=6)setTimeout(U,100);
});
});
function rp(m){
document.querySelectorAll('#P input').forEach(inp=>{
if(m)inp.classList.add('w');
setTimeout(()=>{inp.value='';inp.classList.remove('f','w')},m?400:0);
});
if(!m)gi(0)?.focus();else setTimeout(()=>gi(0)?.focus(),500);
}
async function U(){
if(L>Date.now()){
const s=Math.ceil((L-Date.now())/1000);
document.getElementById('er').textContent='Terkunci. Coba lagi dalam '+s+' detik.';return;}
const pin=[...document.querySelectorAll('#P input')].map(b=>b.value).join('');
if(pin.length<6){document.getElementById('er').textContent='Masukkan 6 digit PIN.';return}
const bt=document.getElementById('bt');
bt.disabled=true;bt.innerHTML='<span class="sp"></span>Mendekripsi…';
document.getElementById('er').textContent='';
try{
const enc=new TextEncoder();
const salt=Uint8Array.from(atob(E.s),c=>c.charCodeAt(0));
const iv=Uint8Array.from(atob(E.i),c=>c.charCodeAt(0));
const tag=Uint8Array.from(atob(E.t),c=>c.charCodeAt(0));
const data=Uint8Array.from(atob(E.d),c=>c.charCodeAt(0));
const ct=new Uint8Array(data.length+tag.length);
ct.set(data);ct.set(tag,data.length);
const km=await crypto.subtle.importKey('raw',enc.encode(pin),{name:'PBKDF2'},false,['deriveKey']);
const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:E.n,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
const dec=await crypto.subtle.decrypt({name:'AES-GCM',iv},key,ct);
const html=new TextDecoder().decode(dec);
document.open();document.write(html);document.close();
}catch(e){
F++;
if(F>=MX){L=Date.now()+LT*1000;
document.getElementById('er').textContent='Terlalu banyak percobaan. Terkunci '+LT+' detik.';
document.getElementById('at').innerHTML='<span class="lk">'+F+' percobaan gagal</span>';
let t=setInterval(()=>{const s=Math.ceil((L-Date.now())/1000);
if(s<=0){clearInterval(t);document.getElementById('er').textContent='';
document.getElementById('at').textContent='Silakan coba lagi.';F=0}
else document.getElementById('er').textContent='Terkunci. Coba lagi dalam '+s+' detik.'},1000)}
else{document.getElementById('er').textContent='PIN salah. Konten tidak dapat didekripsi.';
document.getElementById('at').textContent='Percobaan: '+F+'/'+MX}
rp(true);bt.disabled=false;bt.innerHTML='Buka Dashboard';
}
}
gi(0)?.focus();
</script>
</body>
</html>`;

fs.writeFileSync(outputPath, wrapper, 'utf8');
const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(0);
console.log('✅ ' + outputPath + ' (' + sizeKB + ' KB) — PIN: ' + pin);
