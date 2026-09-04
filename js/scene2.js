/* ---------- PHẦN 2: cây ---------- */
let blowing=false;
function treeBlow(){                          // chạm cây -> CHÍNH tim trên cây toả ra -> thu về giữa; cây trượt góc
  if(blowing) return;
  const w=document.getElementById('treeWrap');
  if(w && !w.classList.contains('ready')) return;   // cây/tim chưa vẽ xong + chưa đợi 3s -> chưa cho chạm
  blowing=true;
  const h0=document.getElementById('s2hint');       // tắt "Chạm vào cây" khi toả (inline đè CSS)
  if(h0){ h0.style.opacity='0'; h0.textContent=''; }
  heartsFlySpread();                          // animate tim thật (không tạo tim mới)
  treeToCorner();                             // gom cành/thân -> trượt góc phải-dưới, mờ biến mất
  document.getElementById('scene2').classList.add('blow');
  // KHÔNG tự qua scene3 -> tim đập tới khi user chạm vào tim (xem heartsFlySpread)
}
let heartFlies=[], heartBeatTimer=0, heartCenter=[600,470], heartReady=false, heartBurst=false;
function pulseHearts(){                         // 1 nhịp: cả hình tim phình rồi co (dịch từng tim theo tâm)
  if(!heartFlies.length || heartBurst) return;  // đang bung -> ngừng đập hình (tiếng tim vẫn chạy)
  const CX=heartCenter[0], CY=heartCenter[1];
  heartFlies.forEach(({fly,wx,wy,tx,ty})=>{
    const P=(k)=>`translate(${(CX+(tx-CX)*k-wx).toFixed(1)}px,${(CY+(ty-CY)*k-wy).toFixed(1)}px)`;
    fly.animate([{transform:P(1)},{transform:P(1.13),offset:.30},{transform:P(1)}],
      {duration:520,easing:'ease-out'});
  });
}
function onHeartClick(e){                      // chạm vào trái tim -> nổ toả -> qua ảnh
  if(heartBurst || !heartReady) return; heartBurst=true;
  if(e){ e.stopPropagation(); }
  if(heartBeatTimer){ clearInterval(heartBeatTimer); heartBeatTimer=0; }
  if(window.bumpHeartbeat) bumpHeartbeat();   // chắc chắn tiếng tim đang phát lúc bung ảnh
  // KHÔNG dừng tiếng tim ở đây -> lúc bung ảnh vẫn nghe tim đập (dừng khi sang scene3)
  const h=document.getElementById('s2hint'); if(h) h.style.opacity='0';
  const CX=heartCenter[0], CY=heartCenter[1];
  if(window.playSfx) playSfx('heart_burst');
  heartFlies.forEach(({fly,wx,wy,tx,ty,gx,gy})=>{
    const ang=Math.atan2(ty-CY, tx-CX);
    const R=760+Math.random()*320;
    const ex=CX+Math.cos(ang)*R - wx, ey=CY+Math.sin(ang)*R - wy;   // bung ra xa theo hướng
    fly.animate([
      {transform:`translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`,opacity:1},
      {transform:`translate(${ex.toFixed(1)}px,${ey.toFixed(1)}px)`,opacity:0}
    ],{duration:820,easing:'cubic-bezier(.3,0,.3,1)',fill:'forwards'});
  });
  setTimeout(()=>go(3), 720);                 // sang cảnh ảnh
}
// CHÍNH các trái tim: toả ra -> thu vào XẾP HÌNH TRÁI TIM -> đập (dịch từng tim, KHÔNG reparent/scale container)
function heartsFlySpread(){
  const svg=document.querySelector('#scene2 .tree-svg');
  const inv=svg.getScreenCTM().inverse();
  const toUser=(x,y)=>{const p=svg.createSVGPoint();p.x=x;p.y=y;const u=p.matrixTransform(inv);return [u.x,u.y];};
  const NS='http://www.w3.org/2000/svg';
  const CX=600, CY=440, K=15;                  // tâm + cỡ TRÁI TIM (toạ độ view-box)
  // 1 điểm trên đường cong trái tim, bán kính scale sc (1=viền ngoài)
  const heartXY=(t,sc)=>{
    const x=16*Math.pow(Math.sin(t),3);
    const y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
    return [CX + sc*K*x, CY - sc*K*y];
  };
  const hearts=[...svg.querySelectorAll('.heart')];
  const N=hearts.length||1;
  // XẾP theo VÒNG ĐỒNG TÂM hình tim: ngoài -> trong (viền ngoài nhiều điểm -> silhouette rõ)
  const rings=[1.0, 0.80, 0.60, 0.42, 0.26, 0.12];
  const base=N/rings.reduce((a,b)=>a+b,0);
  const targets=[];
  rings.forEach((sc,ri)=>{
    const cnt=Math.max(3, Math.round(base*sc));
    for(let j=0;j<cnt;j++) targets.push(heartXY(Math.PI*2*(j+ri*0.5)/cnt, sc));   // lệch pha mỗi vòng
  });
  const target=(k)=> targets[k % targets.length];

  heartFlies=[]; heartCenter=[CX,CY]; heartReady=false; heartBurst=false;
  let placed=0;
  hearts.forEach((path,i)=>{
    let pos=path;                             // phần tử được định vị (path, hoặc wrapper scale của tim thêm)
    const pr=path.parentNode;
    if(pr&&pr.tagName==='g'&&/scale/.test(pr.getAttribute('transform')||'')) pos=pr;
    const r=pos.getBoundingClientRect(); if(r.width<2) return;   // ĐO TRƯỚC reparent (như bản gốc không đốm)
    const [wx,wy]=toUser(r.left+r.width/2, r.top+r.height/2);
    path.style.animation='none'; path.style.opacity='1'; path.style.transform='none';
    const fly=document.createElementNS(NS,'g'); fly.setAttribute('class','fly');
    pos.parentNode.insertBefore(fly,pos); fly.appendChild(pos);  // GIỮ nguyên parent -> không đốm đen
    const ang=Math.random()*Math.PI*2, dist=300+Math.random()*520;
    const sx=Math.cos(ang)*dist, sy=Math.sin(ang)*dist;         // toả radial
    const [tx,ty]=target(placed); placed++;                     // đích: 1 ô bên trong hình tim
    const gx=tx-wx, gy=ty-wy;
    fly.animate([
      {transform:'translate(0px,0px)',offset:0},
      {transform:`translate(${sx.toFixed(0)}px,${sy.toFixed(0)}px)`,offset:.55},   // toả ra
      {transform:`translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`,offset:1}       // thu vào -> lấp đầy tim
    ],{duration:3300,delay:i*6,easing:'cubic-bezier(.3,0,.4,1)',fill:'forwards'});
    heartFlies.push({fly,wx,wy,tx,ty,gx,gy});
  });
  // xếp xong -> phát TIẾNG TIM ĐẬP + hình tim đập ĐÚNG NHỊP nhạc
  setTimeout(()=>{
    if(window.duckBg) duckBg(0.3);                                  // tim đập -> nhạc nền nhỏ lại
    if(window.startHeartbeat) window.startHeartbeat(pulseHearts);   // mỗi nhịp tiếng tim -> 1 lần phình/co
    else heartBeatTimer=setInterval(pulseHearts, 860);              // fallback
    // đập vài nhịp rồi mới cho chạm vào trái tim
    setTimeout(()=>{
      heartReady=true;
      const wrap=document.getElementById('treeWrap');
      if(wrap) wrap.addEventListener('click', onHeartClick);    // chạm vào tim -> toả
      const h=document.getElementById('s2hint');
      if(h){ h.textContent='Chạm vào trái tim 💗'; h.style.opacity='.9'; }
    }, 2600);
  }, 3500);
}
// thân+cành+cành nhỏ trượt về góc phải-dưới rồi mờ biến mất
// (KHÔNG reparent -> tránh CSS animation vẽ lại cây; xoay quanh gốc chung 600,900)
function treeToCorner(){
  const svg=document.querySelector('#scene2 .tree-svg');
  ['#big-trunk','#branches','#twigs','#tree-shadow'].forEach(s=>{
    const el=svg.querySelector(s); if(!el) return;
    const op=(s==='#tree-shadow')?0.16:1;                    // giữ độ mờ gốc của bóng
    el.style.transformBox='view-box'; el.style.transformOrigin='600px 900px';
    el.animate([
      {transform:'translate(0px,0px) scale(1)',opacity:op,offset:0},
      {transform:'translate(0px,0px) scale(1)',opacity:op,offset:.22},       // trơ chút (hết lá tim)
      {transform:'translate(430px,40px) scale(.2)',opacity:0,offset:1}       // trượt góc phải-dưới + biến mất nhanh
    ],{duration:2000,easing:'cubic-bezier(.5,0,.8,1)',fill:'forwards'});      // nhanh hơn
  });
}
let treeDone=false;
function initTree(){
  if(treeDone) return; treeDone=true;
  const svg=document.querySelector('#scene2 .tree-svg');
  const wrap=document.getElementById('treeWrap');
  // thân (#big-trunk) + cành (#branches) tự mọc bằng CSS khi scene hiện.
  // các nhóm tim + highlight -> pop lần lượt sau khi thân+cành xong.
  const sels=['#top-heart','#upper-left-hearts','#upper-right-hearts','#left-large-hearts',
              '#right-large-hearts','#many-small-hearts','#falling-hearts'];   // KHÔNG gồm #tree-highlights (elip trắng, không phải tim)
  const items=[];
  sels.forEach(s=>{const g=svg.querySelector(s); if(g) items.push(...g.children);});
  const extra=spawnTwigs()||[];                                 // cành lẻ + tim thêm dọc cành
  const all=items.concat(extra);
  all.forEach(el=>el.classList.add('heart'));                   // ẩn ban đầu (scale 0)
  const hint0=document.getElementById('s2hint'); if(hint0) hint0.style.opacity='0';  // giấu gợi ý tới khi cho chạm
  // thân + cành + cành nhỏ vẽ xong (~2.4s) rồi tim mới bắt đầu hiện
  const HEART_START=2500;
  all.forEach((el,i)=>setTimeout(()=>el.classList.add('pop'), HEART_START + i*28));
  const DRAW_DONE=HEART_START + all.length*28 + 400;           // cây + toàn bộ tim hiện xong
  setTimeout(()=>{
    wrap.classList.add('ready');                               // giờ mới cho chạm sang P3
    const h=document.getElementById('s2hint');
    if(h){ h.textContent='Chạm vào cây 🌳💗'; h.style.opacity='.9'; }
  }, DRAW_DONE + 3000);                                        // đợi thêm 3s sau khi vẽ xong
  // hiệu ứng rơi/lấp lánh CHỈ bắt đầu sau khi cây + cành vẽ xong (cùng lúc tim hiện)
  setTimeout(spawnSparkles, HEART_START);
  setTimeout(()=>{ spawnTreeFx(); spawnBranchDrops(); }, HEART_START + 700);
}
// tim/hoa rơi P2
let fxBuilt=false;
function spawnTreeFx(){
  if(fxBuilt) return; fxBuilt=true;
  const fx=document.getElementById('treeFx');
  const cols=['#ff7ba7','#ff5c8a','#ffb3c9','#e11d48','#ffd9e0','#dba6d5','#f18b9d'];
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const mk=(cls,leftPct,topPct)=>{
    const d=document.createElement('div');
    d.className='fx-heart'+(cls?' '+cls:'');
    d.style.setProperty('--heart',HEART);
    d.style.left=leftPct+'%';
    if(topPct!=null) d.style.top=topPct+'%';
    d.style.setProperty('--s',rnd(14,30)+'px');
    d.style.setProperty('--c',cols[Math.floor(rnd(0,cols.length))]);
    d.style.setProperty('--d',rnd(7,13)+'s');
    d.style.setProperty('--dl',rnd(0,10)+'s');
    d.style.setProperty('--dx',rnd(-70,70)+'px');
    d.style.setProperty('--r',rnd(-260,260)+'deg');
    fx.appendChild(d);
  };
  for(let i=0;i<16;i++) mk('', rnd(0,100), null);                 // rơi nền khắp cảnh
}
// tim rơi TỪ CÀNH cây (đặt tại vị trí tim/cành trong SVG, rơi xuống)
function spawnBranchDrops(){
  const svg=document.querySelector('#scene2 .tree-svg'); if(!svg) return;
  const NS='http://www.w3.org/2000/svg', rnd=(a,b)=>a+Math.random()*(b-a);
  const cols=['#ff5c8a','#e11d48','#ff7ba7','#db6279','#f18b9d','#ffb3c9','#dba6d5'];
  const HD='M0 3 C-3 -2 -9 -1 -9 4 C-9 9 0 14 0 14 C0 14 9 9 9 4 C9 -1 3 -2 0 3 Z';
  // vị trí đầu cành / cụm tim trên cây (toạ độ viewBox 1200x1000)
  const src=[[115,460],[260,480],[350,360],[250,215],[345,270],[205,485],[300,510],
             [1080,460],[930,480],[820,360],[815,195],[720,255],[900,290],[700,555],
             [570,335],[620,160],[465,160],[535,440]];
  const g=document.createElementNS(NS,'g'); g.setAttribute('id','branch-drops'); svg.appendChild(g);
  src.forEach((p,i)=>{
    const s=rnd(1.4,2.6);
    const wrap=document.createElementNS(NS,'g');
    wrap.setAttribute('transform',`translate(${p[0]},${p[1]}) scale(${s})`);
    const path=document.createElementNS(NS,'path');
    path.setAttribute('class','svg-drop'); path.setAttribute('d',HD);
    path.setAttribute('fill',cols[Math.floor(rnd(0,cols.length))]);
    path.style.setProperty('--sd',rnd(5,9)+'s');
    path.style.setProperty('--sdl',rnd(0,8)+'s');
    path.style.setProperty('--sx',rnd(-30,30)+'px');
    path.style.setProperty('--sy',(rnd(260,380))+'px');
    path.style.setProperty('--sr',rnd(-220,220)+'deg');
    wrap.appendChild(path); g.appendChild(wrap);
  });
}
// cành lẻ nhỏ mọc ra đỡ mỗi trái tim cố định
function spawnTwigs(){
  const svg=document.querySelector('#scene2 .tree-svg'); if(!svg) return;
  const NS='http://www.w3.org/2000/svg', rnd=(a,b)=>a+Math.random()*(b-a);
  const anchors=[[510,530],[400,430],[325,390],[200,350],[80,325],
    [475,475],[400,360],[345,245],[300,175],[250,110],[335,390],[220,400],[55,405],
    [535,500],[665,405],[745,375],[925,345],[1110,330],
    [585,410],[695,275],[720,200],[770,130],[815,85],
    [550,360],[560,235],[570,170],[600,110],[620,75],[860,420],[920,420],[240,475],[185,495]];
  // TÂM mỗi trái tim cố định (cành xuyên qua tâm)
  const centers=[[115,378],[260,412],[350,302],[1080,378],[930,412],[820,302],
    [250,162],[345,216],[815,138],[720,202],[570,244],[620,108],
    [75,296],[170,271],[205,466],[300,491],[410,371],[465,146],[535,426],[620,381],
    [900,271],[1000,281],[1000,466],[895,491],[780,466],[380,541],[700,536]];
  const g=document.createElementNS(NS,'g'); g.setAttribute('id','twigs');
  svg.querySelector('#branches').after(g);      // sau cành chính, trước tim
  const eg=document.createElementNS(NS,'g'); eg.setAttribute('id','extra-hearts'); g.after(eg);
  const grads=['#pinkHeart','#redHeart','#lightHeart','#purpleHeart'];
  const HEARTC='M0 4 C-6 -6 -20 -2 -20 8 C-20 20 0 30 0 30 C0 30 20 20 20 8 C20 -2 6 -6 0 4 Z';
  const bez=(A,M,E,t)=>{const u=1-t;return [u*u*A[0]+2*u*t*M[0]+t*t*E[0], u*u*A[1]+2*u*t*M[1]+t*t*E[1]];};
  const extras=[];
  centers.forEach((c,i)=>{
    let best=anchors[0],bd=1e9;
    for(const a of anchors){const d=(a[0]-c[0])**2+(a[1]-c[1])**2; if(d<bd){bd=d;best=a;}}
    const dx=c[0]-best[0], dy=c[1]-best[1], len=Math.hypot(dx,dy)||1;
    const ux=dx/len, uy=dy/len;
    const end=[c[0]+ux*20, c[1]+uy*20];         // xuyên qua tâm, nhô nhẹ -> tim nằm giữa cành
    const mx=(best[0]+end[0])/2+rnd(-12,12), my=(best[1]+end[1])/2+rnd(-4,14);
    const p=document.createElementNS(NS,'path');
    p.setAttribute('class','twig');
    p.setAttribute('d',`M${best[0]} ${best[1]} Q ${mx} ${my} ${end[0]} ${end[1]}`);
    p.style.strokeWidth=(3.5+Math.random()*3).toFixed(1);
    p.style.animationDelay=(1.3+i*0.02)+'s';
    g.appendChild(p);
    // thêm 1-2 tim dọc cành (giữa cành) -> 1 cành nhiều tim
    const n=Math.random()<.55?2:1;
    for(let k=0;k<n;k++){
      const tt=0.46+k*0.24+rnd(-.05,.05);
      const pos=bez(best,[mx,my],end,tt);
      const s=rnd(1.5,3.0);
      const wrap=document.createElementNS(NS,'g');
      wrap.setAttribute('transform',`translate(${pos[0].toFixed(1)},${pos[1].toFixed(1)}) scale(${s.toFixed(2)}) rotate(${rnd(-16,16).toFixed(1)})`);
      const h=document.createElementNS(NS,'path');
      h.setAttribute('class','heart'); h.setAttribute('d',HEARTC);
      h.setAttribute('fill',`url(${grads[Math.floor(rnd(0,grads.length))]})`);
      wrap.appendChild(h); eg.appendChild(wrap); extras.push(h);
    }
  });
  return extras;
}
// sao lấp lánh trên tán
function spawnSparkles(){
  const g=document.getElementById('tree-sparkles'); if(!g) return;
  g.innerHTML='';
  const NS='http://www.w3.org/2000/svg', rnd=(a,b)=>a+Math.random()*(b-a);
  for(let i=0;i<26;i++){
    const x=rnd(60,1140), y=rnd(70,510), s=rnd(.55,1.7);
    const wrap=document.createElementNS(NS,'g');
    wrap.setAttribute('transform',`translate(${x},${y}) scale(${s})`);
    const st=document.createElementNS(NS,'path');
    st.setAttribute('class','twinkle-star');
    st.setAttribute('d','M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z');
    st.setAttribute('fill', Math.random()<.5?'#ffffff':'#ffe9a8');
    st.style.setProperty('--td',rnd(1.3,2.8)+'s');
    st.style.setProperty('--tdl',rnd(0,2.6)+'s');
    wrap.appendChild(st); g.appendChild(wrap);
  }
}
