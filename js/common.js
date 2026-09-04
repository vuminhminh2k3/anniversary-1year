/* ============================================================
   CẤU HÌNH ẢNH — thêm đường dẫn ảnh vào đây (bỏ trong thư mục photos/)
   Ví dụ: const PHOTOS = ["photos/1.jpg","photos/2.jpg", ...];
   Để trống -> dùng lá tim màu (placeholder).
   ============================================================ */
const MISSING = [52,55,64,77,78,118];   // ảnh đã xoá (khớp file thật trong photos/)
const PHOTOS = Array.from({length:162},(_,i)=>i+1)
  .filter(n=>!MISSING.includes(n))
  .map(n=>`photos/p${String(n).padStart(3,'0')}.jpg`);

/* heart mask dùng chung cho lá ảnh */
const HEART = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 29'%3E%3Cpath d='M16 29S2 20 2 10a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 10-14 19-14 19z' fill='%23fff'/%3E%3C/svg%3E\")";
const PLACEHOLDER_GRAD = ["#ff8fab","#ffb3c9","#ff5c8a","#ffd0dd","#ff9ac0","#e83e73"];

/* Máy yếu / cảm ứng (iPad, iPhone...) -> giảm hiệu ứng SVG nặng cho mượt.
   Safari trên iPad rasterize lại SVG filter mỗi frame -> rất giật khi nhiều tim vừa bay vừa có glow. */
const LOW_POWER =
  (window.matchMedia && (matchMedia('(pointer: coarse)').matches ||
                         matchMedia('(prefers-reduced-motion: reduce)').matches)) ||
  ((navigator.hardwareConcurrency||8) <= 4) ||
  (navigator.deviceMemory!=null && navigator.deviceMemory <= 4);

let current = 1;

function go(n){
  document.querySelectorAll('.scene').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById('scene'+n);
  el.classList.add('active');
  current = n;
  if(window.stopHeartbeat && n!==3){ stopHeartbeat(); if(window.duckBg) duckBg(); }   // tắt tim + trả nhạc nền về mức cũ (giữ tim + nền nhỏ suốt scene3)
  if(n===2) initTree();
  if(n===3) initWind();
  if(n===4) initEnvelope();
}
