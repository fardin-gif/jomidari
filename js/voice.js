// ====== জমিদার — ঘরের ভয়েস কল (WebRTC, ব্রাউজার থেকে ব্রাউজারে; অডিও সরাসরি যায়, সার্ভার খরচ নেই) ======
// সংযোগ ঠিক করার তথ্য (offer/answer) Firestore-এ games/{CODE}/sig/*-এ যায়, কলে কারা আছে games/{CODE}/voice/*-এ।
// কিছু নেটওয়ার্কে সরাসরি সংযোগ হয় না — তখন firebase-config.js-এ window.TURN_SERVERS দিতে হবে (README দেখুন)।
var VOICE={on:false,muted:false,stream:null,pcs:{},auds:{},lvl:{},state:{},members:{},myT:0,ids:[],busy:false},VUN=[],VSIG=null,VPOLL=null,VCTX=null,VAN={};
function iceList(){return [{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}].concat(window.TURN_SERVERS||[]);}
function startVoiceWatch(code){
  VOICE.members={};
  VUN.push(DB.collection('games/'+code+'/voice').orderBy('t').onSnapshot(function(snap){
    var m={};snap.docs.forEach(function(d){var x=d.data();if(x&&x.uid)m[x.uid]=x;});VOICE.members=m;
    if(VOICE.on)vSync();
    voiceUI();
  },function(){}));
}
function stopVoiceWatch(){VUN.forEach(function(f){try{f();}catch(e){}});VUN=[];VOICE.members={};}
function vGhost(u){var p=PRES.filter(function(x){return x.uid===u;})[0];return !!p&&Date.now()-(p.seen||0)>=PRES_WIN;}
function vActive(){return Object.keys(VOICE.members).filter(function(u){return !vGhost(u);}).map(function(u){return VOICE.members[u];});}
function vBefore(m){return m.t<VOICE.myT||(m.t===VOICE.myT&&m.uid<UID);}
// কলে থাকা অন্যদের সাথে মিলিয়ে সংযোগ খোলা/বন্ধ করা
function vSync(){
  Object.keys(VOICE.pcs).forEach(function(u){var m=VOICE.members[u];if(!m||m.t!==VOICE.pcs[u].mt)vClose(u);});
  vActive().forEach(function(m){if(m.uid===UID||VOICE.pcs[m.uid])return;if(vBefore(m))vOffer(m);});
}
function vNew(uid,mt){
  vClose(uid);
  var pc=new RTCPeerConnection({iceServers:iceList()});pc.mt=mt;VOICE.pcs[uid]=pc;VOICE.state[uid]='connecting';
  VOICE.stream.getTracks().forEach(function(t){pc.addTrack(t,VOICE.stream);});
  pc.ontrack=function(e){vAudio(uid,e.streams[0]);};
  pc.onconnectionstatechange=function(){
    var s=pc.connectionState;
    if(s==='connected')VOICE.state[uid]='ok';else if(s==='failed'){VOICE.state[uid]='failed';}else if(s==='disconnected')VOICE.state[uid]='connecting';
    voiceUI();
  };
  setTimeout(function(){if(VOICE.pcs[uid]===pc&&VOICE.state[uid]==='connecting'&&pc.connectionState!=='connected'){VOICE.state[uid]='failed';voiceUI();}},20000);
  return pc;
}
function vWait(pc){return new Promise(function(res){if(pc.iceGatheringState==='complete')return res();var f=function(){if(pc.iceGatheringState==='complete'){pc.removeEventListener('icegatheringstatechange',f);res();}};pc.addEventListener('icegatheringstatechange',f);setTimeout(res,3000);});}
function vPutSig(id,d){VOICE.ids.push(id);return DB.doc('games/'+CODE+'/sig/'+id).set(d);}
async function vOffer(m){
  try{
    var pc=vNew(m.uid,m.t);pc.sid=String(Date.now())+Math.random().toString(36).slice(2,6);
    await pc.setLocalDescription(await pc.createOffer());await vWait(pc);
    if(VOICE.pcs[m.uid]!==pc)return;
    await vPutSig('o_'+UID+'_'+m.uid,{from:UID,to:m.uid,type:'offer',sdp:pc.localDescription.sdp,t:VOICE.myT,sid:pc.sid});
  }catch(e){VOICE.state[m.uid]='failed';voiceUI();}
}
async function vOnSig(d){
  if(!VOICE.on||!d||d.to!==UID)return;
  try{
    if(d.type==='offer'){
      if(d.t<VOICE.myT)return;                    // পুরনো/বাসি অফার
      var old=VOICE.pcs[d.from];if(old&&old.sid===d.sid)return;
      var m=VOICE.members[d.from];var pc=vNew(d.from,m?m.t:d.t);pc.sid=d.sid;
      await pc.setRemoteDescription({type:'offer',sdp:d.sdp});
      await pc.setLocalDescription(await pc.createAnswer());await vWait(pc);
      if(VOICE.pcs[d.from]!==pc)return;
      await vPutSig('a_'+UID+'_'+d.from,{from:UID,to:d.from,type:'answer',sdp:pc.localDescription.sdp,sid:d.sid,t:Date.now()});
    }else if(d.type==='answer'){
      var p=VOICE.pcs[d.from];
      if(p&&p.sid===d.sid&&p.signalingState==='have-local-offer')await p.setRemoteDescription({type:'answer',sdp:d.sdp});
    }
  }catch(e){if(VOICE.pcs[d.from]){VOICE.state[d.from]='failed';voiceUI();}}
}
function vAudio(uid,stream){
  var a=VOICE.auds[uid];
  if(!a){a=document.createElement('audio');a.autoplay=true;a.setAttribute('playsinline','');a.style.display='none';document.body.appendChild(a);VOICE.auds[uid]=a;}
  a.srcObject=stream;var pr=a.play();if(pr&&pr.catch)pr.catch(function(){});
  vWatch(uid,stream);
}
function vWatch(key,stream){
  try{
    VCTX=VCTX||new (window.AudioContext||window.webkitAudioContext)();
    var src=VCTX.createMediaStreamSource(stream),an=VCTX.createAnalyser();an.fftSize=512;src.connect(an);VAN[key]={an:an,buf:new Uint8Array(an.fftSize)};
  }catch(e){}
  if(!VPOLL)VPOLL=setInterval(vLevels,250);
}
function vLevels(){
  var any=false;
  Object.keys(VAN).forEach(function(k){
    var o=VAN[k];o.an.getByteTimeDomainData(o.buf);var s=0;for(var i=0;i<o.buf.length;i++){var v=(o.buf[i]-128)/128;s+=v*v;}
    var on=Math.sqrt(s/o.buf.length)>0.04&&!(k===UID&&VOICE.muted);VOICE.lvl[k]=on;
  });
  document.querySelectorAll('[data-vuid]').forEach(function(el){el.classList.toggle('speaking',!!VOICE.lvl[el.getAttribute('data-vuid')]);});
}
function vClose(uid){
  var pc=VOICE.pcs[uid];if(pc){try{pc.ontrack=null;pc.onconnectionstatechange=null;pc.close();}catch(e){}delete VOICE.pcs[uid];}
  var a=VOICE.auds[uid];if(a){try{a.srcObject=null;a.remove();}catch(e){}delete VOICE.auds[uid];}
  delete VAN[uid];delete VOICE.lvl[uid];delete VOICE.state[uid];
}
async function joinVoice(){
  if(VOICE.on||VOICE.busy||!DB||!CODE)return;
  if(!window.RTCPeerConnection||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('এই ব্রাউজারে ভয়েস কল চলবে না — Chrome বা Safari-র নতুন সংস্করণ ব্যবহার করুন।');return;}
  VOICE.busy=true;voiceUI();
  try{VOICE.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});}
  catch(e){VOICE.busy=false;voiceUI();toast(e&&e.name==='NotAllowedError'?'মাইকের অনুমতি দেওয়া হয়নি — ব্রাউজারের ঠিকানা-বারের পাশে মাইক "Allow" করুন।':'মাইক পাওয়া যায়নি।');return;}
  VOICE.busy=false;VOICE.on=true;VOICE.muted=false;VOICE.myT=Date.now();VOICE.ids=[];
  vWatch(UID,VOICE.stream);
  try{await DB.doc('games/'+CODE+'/voice/'+UID).set({uid:UID,name:NAME||'খেলোয়াড়',av:MYAV,t:VOICE.myT,muted:false});}catch(e){stopVoice();toast('কলে যোগ দেওয়া যায়নি');return;}
  VSIG=DB.collection('games/'+CODE+'/sig').where('to','==',UID).onSnapshot(function(snap){snap.docs.forEach(function(d){vOnSig(d.data());});},function(){});
  VOICE.members[UID]={uid:UID,t:VOICE.myT};
  vSync();voiceUI();
}
function stopVoice(){
  var was=VOICE.on,code=CODE;
  Object.keys(VOICE.pcs).forEach(vClose);
  if(VSIG){try{VSIG();}catch(e){}VSIG=null;}
  if(VOICE.stream){VOICE.stream.getTracks().forEach(function(t){try{t.stop();}catch(e){}});VOICE.stream=null;}
  delete VAN[UID];
  if(was&&DB&&code){
    DB.doc('games/'+code+'/voice/'+UID).del().catch(function(){});
    VOICE.ids.forEach(function(id){DB.doc('games/'+code+'/sig/'+id).del().catch(function(){});});
  }
  VOICE.on=false;VOICE.ids=[];VOICE.state={};VOICE.lvl={};
  if(VPOLL&&!Object.keys(VAN).length){clearInterval(VPOLL);VPOLL=null;}
  voiceUI();
}
function toggleMute(){
  if(!VOICE.on||!VOICE.stream)return;
  VOICE.muted=!VOICE.muted;VOICE.stream.getAudioTracks().forEach(function(t){t.enabled=!VOICE.muted;});
  DB.doc('games/'+CODE+'/voice/'+UID).update({muted:VOICE.muted}).catch(function(){});
  voiceUI();
}
function voiceInner(){
  var act=vActive(),n=act.length;
  var h='<h3>ভয়েস কল'+(n?' <span class="mut">('+bn(n)+' জন কলে)</span>':'')+'</h3>';
  if(!VOICE.on){
    h+='<div class="mut" style="margin-bottom:8px">ঘরের সবাই মিলে কথা বলুন। হেডফোন লাগালে প্রতিধ্বনি হবে না।</div>';
    h+='<button class="sm gold" onclick="G.vjoin()" '+(VOICE.busy?'disabled':'')+'>'+(VOICE.busy?'মাইক খোঁজা হচ্ছে…':'কলে যোগ দিন')+'</button>';
  }else{
    h+='<div class="acts" style="margin:0 0 8px"><button class="sm'+(VOICE.muted?' warn':'')+'" onclick="G.vmute()">'+(VOICE.muted?'মাইক চালু করুন':'মাইক বন্ধ করুন')+'</button><button class="sm alt" onclick="G.vleave()">কল ছাড়ুন</button></div>';
  }
  if(n)h+='<div class="vlist">'+act.map(function(m){
    var me=m.uid===UID,st=VOICE.state[m.uid],txt=me?(VOICE.muted?'মাইক বন্ধ':'আপনি'):(VOICE.on?(st==='ok'?'সংযুক্ত':st==='failed'?'সংযোগ হয়নি':'সংযোগ হচ্ছে…'):'');
    if(!me&&m.muted&&st==='ok')txt='মাইক বন্ধ';
    return '<div class="vrow" data-vuid="'+esc(m.uid)+'">'+avatar(m.av||'h1',24)+'<span class="nmx">'+esc(m.name||'')+'</span><small class="mut'+(st==='failed'?' bad':'')+'">'+esc(txt)+'</small></div>';}).join('')+'</div>';
  if(VOICE.on&&Object.keys(VOICE.state).some(function(u){return VOICE.state[u]==='failed';}))h+='<div class="mut" style="font-size:12px;margin-top:6px">কারও সাথে সংযোগ না হলে নেটওয়ার্ক বদলে (ওয়াইফাই/মোবাইল ডেটা) আবার কলে যোগ দিন।</div>';
  return h;
}
function voiceCardHTML(){return MODE==='online'&&!WATCH?'<div class="card" id="voicebox">'+voiceInner()+'</div>':'';}
function voiceUI(){var el=document.getElementById('voicebox');if(el)el.innerHTML=voiceInner();}
document.addEventListener('click',function(){Object.keys(VOICE.auds).forEach(function(u){var a=VOICE.auds[u];if(a&&a.paused){var p=a.play();if(p&&p.catch)p.catch(function(){});}});if(VCTX&&VCTX.state==='suspended')VCTX.resume();});
window.addEventListener('beforeunload',function(){if(VOICE.on&&DB&&CODE){try{DB.doc('games/'+CODE+'/voice/'+UID).del();}catch(e){}}});
