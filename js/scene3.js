/* ---------- PHẦN 3: gió + lá ảnh ---------- */
let windBuilt=false, dlgTimer=null;
let windListener=false;
function initWind(){
  if(!windBuilt){ buildLeaves(Math.max(120, PHOTOS.length)); windBuilt=true; }  // >= số ảnh -> ảnh nào cũng hiện
  scheduleDialog();
  if(windListener) return; windListener=true;
  document.getElementById('scene3').addEventListener('click',(e)=>{
    if(e.target.closest('.dialog-overlay')) return;
    if(e.target.closest('.photo-lightbox')){ closeLightbox(); return; }   // bấm nền mờ -> đóng
    const leaf=e.target.closest('.leaf-photo');
    if(leaf && leaf.dataset.src){ openLightbox(leaf.dataset.src, leaf); return; } // bấm ảnh -> phóng to
    showDialog3();                                                          // bấm nền -> dialog
  });
}
// dừng/chạy lại toàn bộ lá đang trôi (WAAPI) -> mở ảnh thì nền tĩnh -> zoom mượt, không rớt frame
function pauseLeaves(p){
  const f=document.getElementById('windField'); if(!f) return;
  f.querySelectorAll('.leaf-photo').forEach(el=>el.getAnimations().forEach(a=>{ try{ p?a.pause():a.play(); }catch(_){} }));
}
function openLightbox(src, leaf){
  if(window.playSfx) playSfx('photo_open');
  const lb=document.getElementById('lightbox'), img=document.getElementById('lbImg');
  clearTimeout(dlgTimer);                        // đang xem ảnh thì tạm dừng dialog
  pauseLeaves(true);                             // dừng 156 lá trôi -> nhường CPU cho hiệu ứng zoom
  // bay từ vị trí ảnh vừa bấm -> phóng to vào giữa
  const r=leaf.getBoundingClientRect();
  const dx=(r.left+r.width/2)-window.innerWidth/2;
  const dy=(r.top+r.height/2)-window.innerHeight/2;
  const zoom=()=>{
    lb.classList.add('show');
    img.animate([
      {transform:`translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px) scale(.1) rotate(-6deg)`,opacity:.3,offset:0},
      {transform:'translate(0px,0px) scale(1) rotate(0deg)',opacity:1,offset:1}
    ],{duration:520,easing:'cubic-bezier(.2,.85,.3,1.2)',fill:'both'});
  };
  img.src=src;
  // decode ảnh full XONG rồi mới zoom -> không pop/khựng giữa hiệu ứng
  if(img.decode){ img.decode().then(zoom).catch(zoom); } else zoom();
}
function closeLightbox(){ document.getElementById('lightbox').classList.remove('show'); pauseLeaves(false); scheduleDialog(); }
// LOW_POWER (máy yếu / cảm ứng) khai báo ở common.js -> giảm tải để bung không giật
function buildLeaves(n){
  const field=document.getElementById('windField');
  const rand=(a,b)=>a+Math.random()*(b-a);
  const vpCx=window.innerWidth/2, vpCy=window.innerHeight/2;
  // cửa sổ bung GỌN (thumbnail nhẹ nên không cần giãn xa) -> nở liền mạch, không nhỏ giọt từng đợt
  const win=LOW_POWER?1200:700;
  for(let i=0;i<n;i++){
    const d=document.createElement('div');
    d.className='leaf-photo';
    const sz=rand(40,80);
    d.style.width=sz+'px'; d.style.height=sz+'px';
    d.style.setProperty('--heart',HEART);
    if(PHOTOS.length){
      const src=PHOTOS[i%PHOTOS.length];
      const thumb=src.replace('photos/','photos/thumb/');   // lá dùng ảnh nhỏ 240px -> decode nhẹ
      d.style.backgroundImage=`url("${thumb}")`;
      d.dataset.src=src;                                     // lightbox mở ảnh full
    }
    else{ d.style.background=`linear-gradient(135deg,${PLACEHOLDER_GRAD[i%PLACEHOLDER_GRAD.length]},#fff6)`; }
    // vị trí đích (toả khắp màn)
    const tx=rand(3,97)/100*window.innerWidth, ty=rand(6,92)/100*window.innerHeight;
    d.style.left=(tx-sz/2)+'px'; d.style.top=(ty-sz/2)+'px';
    const rr=rand(-30,30);
    d.style.setProperty('--rr',rr+'deg');
    d.style.setProperty('--dx',rand(-16,16)+'px');
    d.style.setProperty('--dy',rand(-22,22)+'px');
    d.style.setProperty('--fd',rand(3,6)+'s');
    if(LOW_POWER) d.style.filter='none';         // tắt drop-shadow -> compositing rẻ khi lá trôi
    field.appendChild(d);
    // NỞ RA TỪ GIỮA (tụ giữa -> toả từ từ)
    const cx=vpCx-tx, cy=vpCy-ty;
    d.classList.add('blooming');                             // bật will-change chỉ lúc bung
    const anim=d.animate([
      {transform:`translate(${cx.toFixed(0)}px,${cy.toFixed(0)}px) scale(.1)`,opacity:0,offset:0},
      {transform:`translate(${cx.toFixed(0)}px,${cy.toFixed(0)}px) scale(.35)`,opacity:1,offset:.12},
      {transform:`translate(0px,0px) scale(1) rotate(${rr}deg)`,opacity:1,offset:1}
    ],{duration:1900,delay:(i%24)*18+rand(0,win),easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
    anim.onfinish=()=>{
      anim.commitStyles(); anim.cancel();       // giữ vị trí, nhả quyền transform
      d.style.opacity='1';
      d.classList.remove('blooming');           // nhả will-change sau khi bung xong
      // trôi qua lại liên tục (di chuyển). Máy yếu: biên độ nhỏ + chậm hơn -> mượt mà vẫn bay
      const amp=LOW_POWER?85:150, era=LOW_POWER?12:22;
      const ex=rand(-amp,amp), ey=rand(-amp,amp), er=rand(-era,era);
      d.animate([
        {transform:`translate(0px,0px) rotate(${rr}deg)`},
        {transform:`translate(${ex.toFixed(0)}px,${ey.toFixed(0)}px) rotate(${(rr+er).toFixed(0)}deg)`}
      ],{duration:LOW_POWER?rand(10000,18000):rand(6000,13000),direction:'alternate',iterations:Infinity,easing:'ease-in-out'});
    };
  }
}
let dlgFirst=true;
function scheduleDialog(){ clearTimeout(dlgTimer); dlgTimer=setTimeout(showDialog3, dlgFirst?300000:60000); } // 5p lần đầu, sau 1p
function showDialog3(){ if(window.playSfx) playSfx('dialog3'); document.getElementById('dlg3').classList.add('show'); dlgFirst=false; }
function keepWatching(){ document.getElementById('dlg3').classList.remove('show'); scheduleDialog(); }  // Xem tiếp -> hẹn 1p
