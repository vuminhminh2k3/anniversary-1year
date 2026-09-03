/* ---------- PHẦN 4: phong bì + thư ---------- */
let yesScale=1, noCount=0, letterVoice=null, voiceCtx=null;
const VOICE_GAIN=4.2;                              // khuếch đại voice to hơn nhạc nền
function sayVoice(src){                             // phát 1 lời thoại (cắt lời trước), tone to
  try{ if(letterVoice){ letterVoice.pause(); } }catch(e){}
  letterVoice=new Audio(src); letterVoice.volume=1;
  try{                                             // khuếch đại qua Web Audio (bấm nút -> có cử chỉ)
    if(!voiceCtx) voiceCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(voiceCtx.state==='suspended') voiceCtx.resume();
    const s=voiceCtx.createMediaElementSource(letterVoice);
    const g=voiceCtx.createGain(); g.gain.value=VOICE_GAIN;
    s.connect(g); g.connect(voiceCtx.destination);
  }catch(e){}
  letterVoice.play().catch(()=>{});
  return letterVoice;
}
function initEnvelope(){                           // thấy phong bì ĐÓNG trước, rồi mới hỏi
  setTimeout(()=>{
    if(window.playSfx) playSfx('letter_question');
    if(window.duckBg) duckBg(0.28);                // hiện dialog -> hạ nhẹ nhạc nền
    document.getElementById('dlg4').classList.add('show');
  }, 5000);
}
function noLetter(){
  noCount++;
  const n=Math.min(noCount,5);                     // lần 1..5, từ lần 5 trở đi luôn voice 5
  sayVoice(`media/voice/an_khong_${n}.m4a`);
  yesScale+=0.18;
  document.getElementById('btnYes').style.transform=`scale(${yesScale})`;
}
let letterOpened=false;
function openLetter(){
  if(letterOpened) return;
  const v=sayVoice('media/voice/an_co.m4a');       // lời "ấn Có"
  document.getElementById('dlg4').classList.remove('show');
  if(window.duckBg) duckBg();                       // đóng dialog -> nhạc nền về mức cũ
  const doOpen=()=>{                                // ĐỢI HẾT VOICE rồi mới mở
    if(letterOpened) return; letterOpened=true;
    if(window.seekBgToClimax) seekBgToClimax();
    const s4=document.getElementById('scene4');
    s4.classList.add('open');                       // nắp mở
    setTimeout(()=>s4.classList.add('letter-out'), 700);   // thư trượt ra
  };
  if(v) v.addEventListener('ended', doOpen, {once:true});
  setTimeout(doOpen, 6000);                         // chốt: nếu voice không phát/không kết thúc
}
