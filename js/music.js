/* ---------- Nhạc nền + cue ----------
   1 NHẠC NỀN xuyên suốt cả trải nghiệm (intro_romantic). playSfx: cue ngắn đè lên nền.
   Autoplay bị chặn tới khi có tương tác -> mở khoá ở lần chạm đầu (màn "bắt đầu").
*/
const MUSIC_DIR='media/music/';
const FULL_BG='intro_romantic.mp3';          // nhạc nền full toàn bộ
const CUE={                                  // các cue NGẮN đè lên nền
  correct_sparkle:'03_correct_sparkle.mp3',  // trả lời đúng
  heart_burst:'09_heart_burst.mp3',          // chạm tim -> bung
  photo_open:'11_photo_open_cue.mp3',        // bấm ảnh -> phóng to
  dialog3:'12_dialog3_memories.mp3',         // hộp thoại "xem tiếp"
  letter_question:'14_letter_question.mp3',  // hộp thoại "mở thư?"
};
const BG_VOL=0.5, SFX_VOL=0.7, FADE=800;
const cache={};

function aud(name){
  if(!CUE[name]) return null;
  if(!cache[name]){
    const a=new Audio(MUSIC_DIR+CUE[name]);
    a.preload='auto'; a.addEventListener('error',()=>{});
    cache[name]=a;
  }
  return cache[name];
}
function fade(a,to,ms){
  if(!a) return;
  const from=a.volume, t0=performance.now();
  (function step(now){
    const k=Math.min(1,(now-t0)/ms);
    a.volume=from+(to-from)*k;
    if(k<1) requestAnimationFrame(step);
    else if(to===0){ try{a.pause();}catch(e){} }
  })(performance.now());
}

const BG_LOOP_END=70;                         // giây: lặp lại nhạc nền tại đây (cắt đuôi trống ~cuối bài)
let curBg=null, bgTarget=BG_VOL, bgSeeking=false;
function smoothSeek(to){                       // tua/lặp MƯỢT: hạ nhỏ -> nhảy -> fade lại (khỏi giật)
  if(!curBg || bgSeeking) return; bgSeeking=true;
  fade(curBg,0.02,180);
  setTimeout(()=>{
    try{ curBg.currentTime=to; }catch(e){}
    fade(curBg,bgTarget,480);
    setTimeout(()=>{ bgSeeking=false; }, 220);
  }, 190);
}
function ensureBg(){                          // đảm bảo nhạc nền đang chạy (loop sớm, bỏ đuôi trống)
  if(!curBg){
    curBg=new Audio(MUSIC_DIR+FULL_BG);
    curBg.loop=false; curBg.volume=0; curBg.preload='auto';
    curBg.addEventListener('error',()=>{});
    curBg.addEventListener('timeupdate',()=>{                     // gần mốc cắt -> lặp mượt về đầu
      if(BG_LOOP_END>0 && !bgSeeking && curBg.currentTime>=BG_LOOP_END-0.25) smoothSeek(0);
    });
    curBg.addEventListener('ended',()=>{ try{ curBg.currentTime=0; curBg.play(); }catch(e){} });
  }
  if(curBg.paused){ curBg.volume=0; curBg.play().then(()=>fade(curBg,bgTarget,FADE)).catch(()=>{}); }
}
function playBg(){ ensureBg(); }              // 1 nhạc nền xuyên suốt -> mọi call chỉ đảm bảo nó chạy
function stopBg(){ /* giữ nhạc nền chạy suốt, KHÔNG tắt khi chuyển cảnh */ }
function duckBg(level){                        // hạ/nâng nhạc nền (dùng khi có voice)
  bgTarget=(level==null?BG_VOL:level);
  if(curBg && !bgSeeking) fade(curBg,bgTarget,300);
}
window.duckBg=duckBg;
function playSfx(name){                        // tiếng cue ngắn, đè lên nền
  const a=aud(name); if(!a) return;
  try{ a.currentTime=0; }catch(e){}
  a.volume=SFX_VOL; a.play().catch(()=>{});
}
window.playBg=playBg; window.playSfx=playSfx; window.stopBg=stopBg;

// đoạn CAO TRÀO của nhạc nền: nếu đang trong khoảng này thì KHÔNG tua; ngoài thì tua tới đầu đoạn
const CLIMAX_START=48, CLIMAX_END=68;
function seekBgToClimax(){
  if(!curBg) return;
  const t=curBg.currentTime;
  if(t<CLIMAX_START || t>CLIMAX_END) smoothSeek(CLIMAX_START);   // chỉ tua khi KHÔNG ở đoạn cao trào
}
window.seekBgToClimax=seekBgToClimax;

/* ---- tiếng TIM ĐẬP: xếp chồng vài audio (to, chắc phát) + onBeat theo nhịp ---- */
const HB_BPM=70;                              // nhịp ước lượng của file heartbeat
const HB_STACK=4;                             // xếp chồng để to hơn (không cần Web Audio)
let hbAudios=[], hbRAF=0;
function startHeartbeat(onBeat){
  if(!hbAudios.length){
    for(let i=0;i<HB_STACK;i++){
      const a=new Audio(MUSIC_DIR+'heartbeat.mp3'); a.loop=true; a.preload='auto';
      a.addEventListener('error',()=>{}); hbAudios.push(a);
    }
  }
  const main=hbAudios[0];
  const begin=()=>{
    const dur=main.duration||11.28;
    const beats=Math.max(1,Math.round(dur/(60/HB_BPM)));
    const period=dur/beats;
    hbAudios.forEach(a=>{ try{a.currentTime=0;}catch(e){} a.volume=1; a.play().catch(()=>{}); });
    let last=-1;
    cancelAnimationFrame(hbRAF);
    (function loop(){
      const idx=Math.floor((main.currentTime%dur)/period);
      if(idx!==last){ last=idx; if(onBeat) onBeat(); }
      hbRAF=requestAnimationFrame(loop);
    })();
  };
  if(main.readyState>=1) begin();
  else main.addEventListener('loadedmetadata',begin,{once:true});
}
function bumpHeartbeat(){                       // gọi trong cử chỉ chạm -> chắc chắn tiếng tim đang phát
  hbAudios.forEach(a=>{ a.volume=1; if(a.paused) a.play().catch(()=>{}); });
}
function stopHeartbeat(){
  if(hbRAF){ cancelAnimationFrame(hbRAF); hbRAF=0; }
  hbAudios.forEach(a=>fade(a,0,500));
}
window.bumpHeartbeat=bumpHeartbeat;
window.startHeartbeat=startHeartbeat; window.stopHeartbeat=stopHeartbeat;

// mở khoá autoplay ở lần chạm đầu tiên
function unlock(){ ensureBg(); window.removeEventListener('pointerdown',unlock); }
window.addEventListener('pointerdown',unlock,{once:true});
window.addEventListener('DOMContentLoaded',()=>{ ensureBg(); });
