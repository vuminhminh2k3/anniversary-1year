/* ---------- PHẦN 1 ----------
   Trình tự: [1] video trao hoa -> [2] animation SVG trao hoa -> [3] veil "Bắt đầu" + xe đạp + ảnh
*/
const s1  = document.getElementById('scene1');
const p1v = s1.querySelector('.park-video');
const P1_CUT   = 4.3;    // giây: cắt video trước khúc cuối, chuyển sang câu hỏi. Chỉnh nếu cần.
const ANIM_DUR = 2600;   // ms: thời lượng animation trao hoa trước khi hiện "Bắt đầu"
let s1stage = 0;         // 0=video, 1=dialog hỏi, 2=đang trao hoa, 3=veil

function hideHint(){ const h=document.getElementById('s1hint'); if(h) h.style.display='none'; }

function s1quiz(){                            // [1] video xong -> mờ màn + hiện câu hỏi (video vẫn loop nền)
  if(s1stage >= 1) return; s1stage = 1;
  hideHint();
  if(window.playBg) playBg('quiz_playful');
  document.getElementById('dlgP1').classList.add('show');   // overlay mờ + dialog
}
function p1Answer(btn, correct){             // chọn đáp án
  const fb  = document.getElementById('dlgP1fb');
  const dlg = btn.closest('.dialog');
  if(!correct){                              // sai -> lắc + nhắc, chọn lại
    dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake');
    if(fb) fb.textContent = 'Hmm chưa đúng, đoán lại nha 😝';
    return;
  }
  if(fb) fb.textContent = 'Đúng rồi! 💕';
  if(window.playSfx) playSfx('correct_sparkle');
  p1Celebrate();                             // bắn confetti chúc mừng
  setTimeout(()=>{
    document.getElementById('dlgP1').classList.remove('show');
    s1give();
  }, 1100);
}
function p1Celebrate(){                       // burst tim/hoa/pháo giấy toả ra từ giữa màn
  const EMO = ['💕','💐','🎉','🌸','✨','💖','🎊'];
  const N = 30;
  for(let i=0;i<N;i++){
    const s = document.createElement('span');
    s.className = 'confetti-piece';
    s.textContent = EMO[i % EMO.length];
    const ang  = (Math.PI*2*i)/N + Math.random()*0.5;
    const dist = 120 + Math.random()*180;
    s.style.setProperty('--cx', Math.cos(ang)*dist + 'px');
    s.style.setProperty('--cy', Math.sin(ang)*dist + 'px');
    s.style.setProperty('--cr', (Math.random()*720-360) + 'deg');
    s.style.setProperty('--cd', (1 + Math.random()*0.6) + 's');
    s.style.fontSize = (18 + Math.random()*16) + 'px';
    s1.appendChild(s);
    setTimeout(()=>s.remove(), 1800);
  }
}
const P1_LINE  = 'Người con trai đã tặng hoa cho nàng, và';
const p1audio  = new Audio('media/p1voice.mp3');   // giọng đọc lời kể
p1audio.preload = 'auto';
function s1give(){                            // [2] hiện SVG + trao hoa + xoay người + lời kể
  if(s1stage !== 1) return; s1stage = 2;
  if(window.playBg) playBg('give_flower');
  try{ p1v.pause(); }catch(e){}              // dừng video, chuyển sang SVG
  s1.classList.add('anim');                  // ẩn video, hiện SVG
  s1.classList.add('give');
  const say = document.getElementById('p1say'); if(say) say.textContent = P1_LINE + '…';
  s1voice();                                 // phát voice; đọc hết ("và") -> hiện veil
}
function s1voice(){
  p1audio.addEventListener('ended', s1reveal, {once:true});  // "và" là chữ cuối -> hết voice thì veil
  try{ p1audio.currentTime = 0; }catch(e){}
  const p = p1audio.play();
  if(p && p.catch) p.catch(()=>setTimeout(s1reveal, ANIM_DUR));  // voice bị chặn -> theo thời gian
  setTimeout(s1reveal, 7000);                // chốt an toàn: chắc chắn veil hiện
}
function s1reveal(){                          // [3] veil mờ + khung ảnh + xe đạp
  if(s1stage >= 3) return; s1stage = 3;
  if(window.seekBgToClimax) seekBgToClimax();   // tua nhạc nền tới đoạn cao trào
  s1.classList.add('reveal');
  setTimeout(()=>s1.classList.add('arrived'), 4500);  // xe dừng -> hiện nút mũi tên
}

// tới mốc cắt: hiện câu hỏi (1 lần) + tua về 0 -> video loop CHỈ đoạn trao hoa dưới dialog
p1v.addEventListener('timeupdate', ()=>{
  if(p1v.currentTime >= P1_CUT){
    s1quiz();
    if(s1stage <= 1) p1v.currentTime = 0;   // còn ở video/dialog thì lặp lại; đã trao hoa thì thôi
  }
});
p1v.addEventListener('ended', s1quiz);       // phòng khi video ngắn hơn mốc cắt
p1v.addEventListener('playing', hideHint);

function startScene1(){ p1v.play().catch(()=>{}); }
// màn "Chạm để bắt đầu" -> mở khoá nhạc + phát video (nhạc đồng bộ từ đầu)
const startGate=document.getElementById('startGate');
if(startGate){
  startGate.addEventListener('click',()=>{
    startGate.classList.add('hide');
    setTimeout(()=>startGate.remove(), 650);
    if(window.playBg) playBg('video_park_wind');   // nhạc cảnh video
    try{ p1v.currentTime=0; }catch(e){}
    startScene1();                                 // phát video
  },{once:true});
}
s1.addEventListener('click',(e)=>{
  if(e.target.closest('.veil') || e.target.closest('.dialog-overlay')) return;
  if(s1stage === 0) startScene1();           // chạm phát video nếu bị chặn
});
