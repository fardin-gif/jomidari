// ====== জমিদার — Firebase সংযোগ, ঘর, লিংক ======
// ---- ত্রুটি: দৈনিক সীমা শেষ হলে বন্ধুত্বপূর্ণ বার্তা ----
var quotaShown=false;
function isQuota(e){return !!e&&(e.code==='resource-exhausted'||/quota|exhausted/i.test(String(e.message||'')));}
function netErr(e,fallback){
  if(isQuota(e)){
    toast('আজকের অনলাইন সীমা শেষ');
    if(!quotaShown){quotaShown=true;
      modalEl.innerHTML='<div class="modalbg"><div class="modal" style="max-width:480px;text-align:center"><h2>আজকের অনলাইন সীমা শেষ</h2><p>অনেক মানুষ খেলছে, তাই আজকের জন্য অনলাইন খেলার সীমা পূর্ণ হয়ে গেছে। কম্পিউটারের সাথে বা একই ডিভাইসে এখনই খেলতে পারেন। অনলাইন সীমা প্রতিদিন বাংলাদেশ সময় দুপুরের দিকে (প্রায় ১–২টায়) নতুন হয়।</p><div class="acts" style="justify-content:center"><button onclick="G.close();G.vsCom()">কম্পিউটারের সাথে খেলুন</button><button class="alt" onclick="G.close()">ঠিক আছে</button></div></div></div>';}
    return true;
  }
  if(fallback)toast(fallback);
  return false;
}
function uidsOf(st){return st.players.filter(function(p){return p.uid;}).map(function(p){return p.uid;});}
function push(){
  if(MODE!=='online')return;
  var snap=JSON.stringify(S),v=S.v;
  WRITE=WRITE.then(function(){return DB.doc('games/'+CODE).update({s:snap,v:v,uids:uidsOf(S)});}).catch(function(e){
    if(netErr(e))return;
    if(e&&(e.code==='permission-denied'||e.code==='invalid_argument'))toast('লেখার অনুমতি নেই — Firestore rules ঠিকমতো publish করা হয়েছে কি দেখুন।');
    else toast('সংযোগে সমস্যা, আবার চেষ্টা করুন।');
  });
}
var guardT=0;
function noteChange(o,x){if(!o||o.phase!==x.phase||o.cur!==x.cur||(o.auction&&x.auction&&o.auction.bid!==x.auction.bid)||(!!o.trade)!==(!!x.trade))guardT=Date.now();}
var GUARDED={buy:1,auction:1,bid:1,pass:1,accept:1,decline:1,endTurn:1,payDebt:1};
function commit(ns){noteChange(S,ns);S=ns;bidVal='';lastChange=Date.now();render();push();}
function dispatch(a){
  if(!S)return;
  if(anim){toast('একটু অপেক্ষা করুন…');return;}
  if(GUARDED[a.type]&&Date.now()-guardT<600){return;} // বোতাম বদলে যাওয়ার মুহূর্তে ভুল ক্লিক ঠেকাতে
  var who=MODE==='local'?whoFor(S,a):myIdx();
  var r=apply(S,who,a);
  if(r.err){toast(r.err);return;}
  autoUid=null;
  commit(r.s);
}
window.A=function(type,extra){var a={type:type};if(extra)for(var k in extra)a[k]=extra[k];dispatch(a);};

function humanEntry(name,av){return {name:name,av:av};}
function startLocalBots(){
  var nm=(NAME||'আপনি');
  var list=[{name:nm,av:MYAV}];
  setup.bots.forEach(function(k){list.push({name:BOTS[k].name,bot:k});});
  MODE='local';S=newGame(list);S.diff=setup.diff;S.limit=setup.limit;resetFx();scr='game';render();
}
function startLocalHot(names,avs){
  MODE='local';S=newGame(names.map(function(n,i){return {name:n,av:avs[i]};}));S.diff='med';S.limit=setup.limit;resetFx();scr='game';render();
}
function resetFx(){CHEERLOG=[];cleanFor=null;clearTimeout(cleanTimer);evV=null;evQ=[];FX=[];draining=false;cashShown=null;disp=null;lastRoll=null;cardN=null;moving=[];anim=false;diceBusy=false;seenLvl={};sayShown=0;sayUntil=0;autoUid=null;lastChange=Date.now();}

async function initNet(){
  var cfg=window.FIREBASE_CONFIG;
  if(!cfg||!cfg.apiKey||/YOUR_/.test(cfg.apiKey)){dbMsg='অনলাইন মোড চালু করতে firebase-config.js ফাইলে আপনার Firebase কনফিগ বসান (README দেখুন)। এখন কম্পিউটারের সাথে বা একই ডিভাইসে খেলতে পারেন।';render();return;}
  try{
    var V='10.14.1',B='https://www.gstatic.com/firebasejs/'+V+'/';
    var appM=await import(B+'firebase-app.js'),authM=await import(B+'firebase-auth.js'),fsM=await import(B+'firebase-firestore.js');
    var fapp=appM.initializeApp(cfg),auth=authM.getAuth(fapp),fs=fsM.getFirestore(fapp);
    var cred=await authM.signInAnonymously(auth);
    UID=cred.user.uid;
    var snapOf=function(s){return {exists:s.exists(),data:function(){return s.data();}};};
    DB={
      doc:function(path){var ref=fsM.doc(fs,path);return {
        get:async function(){return snapOf(await fsM.getDoc(ref));},
        set:function(d){return fsM.setDoc(ref,d);},
        update:function(d){return fsM.updateDoc(ref,d);},
        del:function(){return fsM.deleteDoc(ref);},
        onSnapshot:function(n,e){return fsM.onSnapshot(ref,function(s){n(snapOf(s));},e);}};},
      mutate:function(path,fn){var ref=fsM.doc(fs,path);return fsM.runTransaction(fs,async function(tx){var sn=await tx.get(ref);var r=fn(sn.exists()?sn.data():null);if(r&&r.write)tx.set(ref,r.write);return r?r.out:null;});},
      collection:function(path){var c=fsM.collection(fs,path);
        var wrap=function(q){return {onSnapshot:function(cb,e){return fsM.onSnapshot(q,function(s){cb({docs:s.docs.map(function(d){return {id:d.id,data:function(){return d.data();}};})});},e);}};};
        return {orderBy:function(f){return wrap(fsM.query(c,fsM.orderBy(f)));},
                where:function(f,op,v){return wrap(fsM.query(c,fsM.where(f,op,v)));},
                add:function(d){return fsM.addDoc(c,d);}};}
    };
    dbReady=true;
  }catch(e){console.error(e);DB=null;dbMsg='Firebase সংযোগ হয়নি ('+(e&&e.code?e.code:'নেটওয়ার্ক/কনফিগ')+')। Authentication-এ Anonymous চালু আছে কি এবং কনফিগ ঠিক আছে কি দেখুন।';}
  // লিংক দিয়ে এলে সরাসরি যোগ দেওয়ার পাতা
  if(JOINCODE&&DB){await prepareJoin(JOINCODE);}
  render();
  if(DB)refreshLive(true);
}
function genCode(){var c='ABCDEFGHJKMNPQRSTUVWXYZ23456789',r='';for(var i=0;i<4;i++)r+=c[Math.floor(Math.random()*c.length)];return r;}
function readName(){var el=document.getElementById('nm');if(el){NAME=(el.value||'').trim();}NAME=NAME||'খেলোয়াড়';lsSet('jm_name',NAME);lsSet('jm_av',MYAV);return NAME;}

async function createRoom(pub){
  if(!DB||!UID){toast('অনলাইন সংযোগ এখনো প্রস্তুত নয়');return;}
  readName();var code=genCode();
  try{
    await DB.doc('games/'+code).set({host:UID,started:false,created:Date.now(),bots:[],hostName:NAME,limit:setup.limit||0,pub:!!pub,ok:[]});
    await DB.doc('games/'+code+'/players/'+UID).set({name:NAME,av:MYAV,t:Date.now(),uid:UID});
  }catch(e){if(!netErr(e,'ঘর বানানো যায়নি — Firestore rules/সংযোগ পরীক্ষা করুন।'));return;}
  enterRoom(code);
}
// লিংকের ঘর আছে কি দেখে নেওয়া
async function prepareJoin(code){
  try{var snap=await DB.doc('games/'+code).get();roomExists=snap.exists?snap.data():false;}catch(e){roomExists=null;}
  scr='join';
  if(NAME&&roomExists){await joinRoom(code);}  // নাম মনে থাকলে সরাসরি ঢুকে পড়ুন
}
async function joinRoom(code){
  if(!DB||!UID)return;
  code=(code||'').trim().toUpperCase();readName();
  if(code.length<3){toast('ঘরের কোড দিন');return;}
  var snap;try{snap=await DB.doc('games/'+code).get();}catch(e){if(!netErr(e,'সংযোগে সমস্যা'));return;}
  if(!snap.exists){toast('এই ঘর পাওয়া যায়নি — লিংকটি ঠিক আছে কি?');return;}
  var d=snap.data();
  if(d.started){
    if((d.uids||[]).indexOf(UID)>=0){enterRoom(code,false);return;}   // আগে থেকেই খেলোয়াড়
    if(!d.pub){var ns=null;try{ns=JSON.parse(d.s);}catch(e){}if(!ns||ns.locked){toast('এটি প্রাইভেট ঘর — খেলা এগিয়ে গেছে, এখন ঢোকা যাবে না');return;}}
    enterRoom(code,true);return;                                        // দর্শক হিসেবে
  }
  try{await DB.doc('games/'+code+'/players/'+UID).set({name:NAME,av:MYAV,t:Date.now(),uid:UID});}
  catch(e){if(!netErr(e,'যোগ দেওয়া যায়নি — Firestore rules/সংযোগ পরীক্ষা করুন।'));return;}
  enterRoom(code,false);
}
function gameHandler(tm){
  return function(snap){
    clearTimeout(tm);
    if(!snap.exists){return;}
    var d=snap.data();HOST=d.host;lobbyBots=d.bots||[];lobbyLimit=d.limit||0;OKS=d.ok||[];ROOMPUB=!!d.pub;
    if(d.started&&d.s){
      var ns;try{ns=JSON.parse(d.s);}catch(e){return;}
      if(!S||ns.v>S.v){noteChange(S,ns);S=ns;started=true;scr='game';lastChange=Date.now();}
      var mine=ns.players.some(function(p){return p.uid===UID;});
      if(WATCH&&mine){becomeParticipant();}
      else if(!WATCH&&!mine){becomeWatcher();}
      render();
    }else{render();}
  };
}
function subGame(code){
  if(GUN){try{GUN();}catch(e){}GUN=null;}
  var tm=setTimeout(function(){toast('সংযোগ ধীর — একটু অপেক্ষা করুন…');},10000);
  GUN=DB.doc('games/'+code).onSnapshot(gameHandler(tm),function(e){netErr(e,'ঘরের সঙ্গে সংযোগ কেটে গেছে');});
}
function enterRoom(code,watch){
  MODE='online';CODE=code;lsSet('jm_code',code);unsubAll();started=false;S=null;resetFx();scr='lobby';lobbyPlayers=[];lobbyBots=[];OKS=[];REQ=null;DENIED={};
  WATCH=!!watch;WATCHP=false;WATCHT=Date.now();
  try{history.replaceState(null,'','?r='+code);}catch(e){}
  render();
  subGame(code);
  if(!WATCH){startParticipant(code);fetchLive().then(function(){if(scr==='lobby')render();});}
}
// অংশগ্রহণকারী: উপস্থিতি, চ্যাট, লবির তালিকা — দর্শক এগুলো শোনে না (পড়ার সংখ্যা বাঁচাতে)
function startParticipant(code){
  startPresence(code);
  try{startChat(code);}catch(e){}
  PUNS.push(DB.collection('games/'+code+'/players').orderBy('t').onSnapshot(function(snap){
    lobbyPlayers=snap.docs.map(function(d){return d.data();});
    if(scr==='lobby')render();else if(scr==='game'&&HOST===UID)updateAdmit();
  },function(){}));
}
function stopParticipant(){
  PUNS.forEach(function(f){try{f();}catch(e){}});PUNS=[];clearInterval(hbTimer);
  try{stopChat();}catch(e){}try{stopVoice();}catch(e){}
}
function becomeWatcher(){
  if(WATCH)return;WATCH=true;WATCHT=Date.now();stopParticipant();PRES=[];lobbyPlayers=[];
  toast('খেলা শুরু হয়ে গেছে — আপনি দর্শক হিসেবে দেখছেন');
}
function becomeParticipant(){
  if(!WATCH)return;WATCH=false;WATCHP=false;REQ=null;startParticipant(CODE);
  toast('স্বাগতম! আপনি এখন খেলোয়াড় 🎉');
}
// ---- দর্শকের বিরতি: ট্যাব লুকালে বা অনেকক্ষণ দেখলে লাইভ শোনা বন্ধ (পড়া বাঁচে) ----
function watchPause(why){
  if(!WATCH||WATCHP||!GUN)return;
  try{GUN();}catch(e){}GUN=null;WATCHP=true;if(scr==='game')render();
}
function watchResume(){
  if(!WATCH||!WATCHP)return;WATCHP=false;WATCHT=Date.now();subGame(CODE);if(scr==='game')render();
}
function watchTick(){
  if(!WATCH||WATCHP||MODE!=='online')return;
  if(document.hidden||Date.now()-WATCHT>LIM.watch*60000)watchPause();
}
// ---- দর্শক থেকে খেলোয়াড় হওয়ার অনুরোধ (প্রথম চাল শেষ না হওয়া পর্যন্ত) ----
async function askJoin(){
  if(!WATCH||!S||MODE!=='online')return;
  if(S.locked){toast('সবাই প্রথম চাল দিয়ে ফেলেছে — এখন আর যোগ দেওয়া যাবে না');return;}
  if(S.players.length>=MAXP){toast('ঘর পূর্ণ');return;}
  readName();
  try{await DB.doc('games/'+CODE+'/players/'+UID).set({name:NAME,av:MYAV,t:Date.now(),uid:UID});}catch(e){if(!netErr(e,'অনুরোধ পাঠানো যায়নি'));return;}
  REQ='p';REQT=Date.now();toast('হোস্টকে অনুরোধ পাঠানো হয়েছে — অপেক্ষা করুন');
  try{UNSUBS.push(DB.doc('games/'+CODE+'/players/'+UID).onSnapshot(function(sn){
    if(!sn.exists&&REQ==='p'&&Date.now()-REQT>2500){REQ='no';toast('হোস্ট এবার যোগ করেননি');if(scr==='game')render();}
  },function(){}));}catch(e){}
  if(scr==='game')render();
}
// ---- হোস্টের দিক: অনুরোধের তালিকা, অনুমতি/না ----
function pendingList(){
  if(!S)return [];var now=Date.now(),inG={};S.players.forEach(function(p){if(p.uid)inG[p.uid]=1;});
  return lobbyPlayers.filter(function(p){return p.uid&&!inG[p.uid]&&!DENIED[p.uid]&&now-(p.t||0)<8*60000;});
}
function updateAdmit(){var el=document.getElementById('admitbox');if(el)el.innerHTML=admitInner();}
async function admitOk(uid){
  if(HOST!==UID||!S||S.locked)return;
  if(S.players.length+OKS.filter(function(u){return !S.players.some(function(p){return p.uid===u;});}).length>=MAXP){toast('ঘর পূর্ণ');return;}
  var ok=OKS.filter(function(u){return !S.players.some(function(p){return p.uid===u;});});ok.push(uid);OKS=ok;
  try{await DB.doc('games/'+CODE).update({ok:ok});toast('অনুমতি দেওয়া হলো — পরের দানের ফাঁকে যোগ হবে');}catch(e){netErr(e,'সংযোগে সমস্যা');}
  updateAdmit();
}
async function admitNo(uid){
  if(HOST!==UID)return;DENIED[uid]=1;updateAdmit();
  try{await DB.doc('games/'+CODE+'/players/'+uid).del();}catch(e){}
}
// যার দান (বা হোস্ট, কম্পিউটারের দানে) অনুমোদিত খেলোয়াড়কে খেলায় বসায় — সবসময় একজনই লেখে, তাই সংঘর্ষ হয় না
function admitTick(){
  if(MODE!=='online'||WATCH||!S||S.phase==='over'||!OKS.length||anim||HOLD)return;
  var inG=function(u){return S.players.some(function(p){return p.uid===u;});};
  if(HOST===UID&&OKS.some(inG)){OKS=OKS.filter(function(u){return !inG(u);});DB.doc('games/'+CODE).update({ok:OKS}).catch(function(){});}
  if(S.locked||(S.phase!=='roll'&&S.phase!=='post'))return;
  var who=actorOf(S);if(who<0)return;var ap=S.players[who];
  var iAct=ap.uid===UID||(HOST===UID&&(ap.bot||autoUid===ap.uid));
  if(!iAct)return;
  var cand=OKS.filter(function(u){return !inG(u);})[0];if(!cand)return;
  var req=lobbyPlayers.filter(function(p){return p.uid===cand;})[0];if(!req)return;
  var r=apply(S,who,{type:'admit',uid:cand,name:req.name,av:req.av});
  if(r.err){return;}
  commit(r.s);
}
// ---- উপস্থিতি ও উৎসাহ ----
function startPresence(code){
  PRES=[];var pp='games/'+code+'/presence/'+UID;
  DB.doc(pp).set({uid:UID,name:NAME,av:MYAV,t:Date.now(),seen:Date.now()}).catch(function(){});
  clearInterval(hbTimer);hbTimer=setInterval(function(){DB.doc(pp).update({seen:Date.now(),name:NAME,av:MYAV}).catch(function(){});updatePres();},120000);
  PUNS.push(DB.collection('games/'+code+'/presence').orderBy('t').onSnapshot(function(snap){PRES=snap.docs.map(function(d){return d.data();});updatePres();},function(){}));
  var first=true;cheerSeen={};
  PUNS.push(DB.collection('games/'+code+'/cheers').orderBy('t').onSnapshot(function(snap){
    snap.docs.forEach(function(d){var c=d.data();if(cheerSeen[c.uid]===c.t)return;cheerSeen[c.uid]=c.t;if(!first)showCheer(c);});
    first=false;
  },function(){}));
}
// সমর্থন পেলে নামের পাশে বিস্ফোরণের ইমোজি ও গণনা
function cheerFxHTML(i){var on=Date.now()<(cheerUntil[i]||0),n=cheerCnt[i]||0;return (on?'<span class="cpop">💥</span>':'')+(n?'<span class="ccnt" title="মোট সমর্থন">সমর্থন '+bn(n)+'</span>':'');}
function markCheer(i){
  cheerUntil[i]=Date.now()+3200;cheerCnt[i]=(cheerCnt[i]||0)+1;
  var upd=function(){var el=document.getElementById('cf'+i);if(el)el.innerHTML=cheerFxHTML(i);};
  upd();setTimeout(upd,3300);
}
function updatePres(){var el=document.getElementById('presbox');if(el)el.innerHTML=presHTML();}
var CHEER_LINES=['জয় হোক!','দারুণ খেলছেন!','চালিয়ে যান!','সাবাশ!','ভাগ্য আপনার সাথে!','হেরে যাবেন না!','জমিদারি আপনারই!','একদম জমিয়ে দিন!'];
var lastCheer=0,CHEERLOG=[];
// নিজেকে সমর্থন করা যাবে না (অনলাইনে নিজের uid, কম্পিউটার-মোডে মানুষ খেলোয়াড়)
function isSelf(i){
  var p=S&&S.players[i];if(!p)return false;
  if(MODE==='online')return p.uid===UID;
  if(MODE==='local'&&S.players.some(function(q){return q.bot;}))return !p.bot;
  return false;
}
function cheerFeedHTML(){
  if(!CHEERLOG.length)return '<div class="mut">এখনও কেউ সমর্থন পাঠায়নি। ডানদিকে খেলোয়াড়ের পাশের "সমর্থন" চাপুন।</div>';
  return CHEERLOG.map(function(c){return '<div class="cfi"><span class="cav">'+avatar(c.fromAv,26)+'</span><span><b>'+esc(c.from)+'</b> → <b>'+esc(c.toName)+'</b> <span class="cl">'+esc(c.line)+'</span></span></div>';}).join('');
}
function sendCheer(i){
  if(!S||!S.players[i])return;
  if(isSelf(i)){toast('নিজেকে সমর্থন করা যায় না — অন্যকে দিন');return;}
  if(Date.now()-lastCheer<4000){toast('একটু থেমে আবার সমর্থন দিন');return;}
  lastCheer=Date.now();
  var c={uid:UID||'local',t:Date.now(),to:i,toName:S.players[i].name,toAv:S.players[i].bot||S.players[i].av||'h1',from:NAME||'একজন দর্শক',fromAv:MYAV,line:CHEER_LINES[Math.floor(Math.random()*CHEER_LINES.length)]};
  if(MODE==='online'&&DB){DB.doc('games/'+CODE+'/cheers/'+UID).set(c).catch(function(){toast('পাঠানো যায়নি');});cheerSeen[UID]=c.t;}
  showCheer(c,true);
}
function showCheer(c,mine){
  if(!mine&&c.uid===UID)return;
  CHEERLOG.unshift(c);if(CHEERLOG.length>12)CHEERLOG.pop();
  var el=document.getElementById('cheerfeed');if(el)el.innerHTML=cheerFeedHTML();
  if(!mine){try{SFX.cheer();}catch(e){}}
  markCheer(c.to);
}
// ---- খেলা শেষে ঘর পরিষ্কার (ফ্রি প্ল্যানের জায়গা ও কোটা বাঁচাতে) ----
var cleanTimer=null,cleanFor=null;
function scheduleCleanup(){
  if(MODE!=='online'||WATCH||!DB||!CODE||!S||S.phase!=='over'||cleanFor===CODE)return;
  cleanFor=CODE;clearInterval(hbTimer);liveRelease(CODE);
  var code=CODE,host=HOST===UID,uid=UID;
  var delOwn=function(){try{stopVoice();chatCleanup(host);}catch(e){}['players','presence','cheers','voice'].forEach(function(c){try{DB.doc('games/'+code+'/'+c+'/'+uid).del().catch(function(){});}catch(e){}});};
  clearTimeout(cleanTimer);
  cleanTimer=setTimeout(function(){
    delOwn();
    if(!host)return;
    // হোস্ট: অন্যদের নথি (rules অনুমতি দিলে) ও শেষে ঘরের মূল নথি মুছে দেয়
    var ids={};lobbyPlayers.forEach(function(p){ids[p.uid]=1;});PRES.forEach(function(p){ids[p.uid]=1;});Object.keys(cheerSeen).forEach(function(k){ids[k]=1;});
    var ps=[];Object.keys(ids).forEach(function(u){if(u===uid)return;['players','presence','cheers'].forEach(function(c){ps.push(DB.doc('games/'+code+'/'+c+'/'+u).del().catch(function(){}));});});
    Promise.all(ps).then(function(){return DB.doc('games/'+code).del();}).catch(function(){});
  },host?180000:60000);
}
function unsubAll(){clearInterval(hbTimer);UNSUBS.forEach(function(f){try{f();}catch(e){}});UNSUBS=[];PUNS.forEach(function(f){try{f();}catch(e){}});PUNS=[];if(GUN){try{GUN();}catch(e){}GUN=null;}slotCancel(true);}
async function addLobbyBot(key){
  if(HOST!==UID)return;
  var bots=lobbyBots.slice();
  if(lobbyPlayers.length+bots.length>=MAXP){toast('সর্বোচ্চ '+bn(MAXP)+' জন');return;}
  if(bots.indexOf(key)>=0){toast('এই চরিত্র আগেই আছে');return;}
  bots.push(key);
  try{await DB.doc('games/'+CODE).update({bots:bots});}catch(e){toast('যোগ করা যায়নি');}
}
async function removeLobbyBot(key){
  if(HOST!==UID)return;
  try{await DB.doc('games/'+CODE).update({bots:lobbyBots.filter(function(k){return k!==key;})});}catch(e){}
}
async function startOnline(auto){
  if(HOST!==UID||started)return;
  var list=lobbyPlayers.slice(0,MAXP).map(function(p){return {uid:p.uid,name:p.name,av:p.av};});
  lobbyBots.slice(0,MAXP-list.length).forEach(function(k){list.push({name:BOTS[k].name,bot:k});});
  if(list.length<2){toast('কমপক্ষে ২ জন লাগবে — বন্ধুকে লিংক পাঠান বা কম্পিউটার চরিত্র যোগ করুন');return;}
  // খেলা শুরুর মুহূর্তেই একটি "রুম-স্লট" নিতে হয় (ঘর তৈরি বা লবিতে অপেক্ষা স্লট নেয় না)
  var c=await slotClaim(list.length);
  if(!c)return;
  var s=newGame(list);s.diff=setup.diff;s.limit=setup.limit;
  S=s;started=true;scr='game';resetFx();lastChange=Date.now();render();
  try{await DB.doc('games/'+CODE).update({started:true,s:JSON.stringify(s),v:s.v,uids:uidsOf(s),pub:!!ROOMPUB,ok:[]});}
  catch(e){toast('শুরু করা যায়নি');started=false;S=null;scr='lobby';liveRelease(CODE);render();}
}
// ====== রুম-স্লট: একসাথে সর্বোচ্চ LIM.rooms টি চালু খেলা, দিনে সর্বোচ্চ LIM.perDay টি ======
// মেটা ডকুমেন্ট meta/live: {rooms:{CODE:{h,n,pub,st,t}}, day:'YYYY-MM-DD'(প্যাসিফিক), g: আজ শুরু হওয়া খেলা}
function pacDay(){try{return new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});}catch(e){return new Date().toISOString().slice(0,10);}}
function liveClean(d){
  d=d||{};var now=Date.now(),r=d.rooms||{},o={},n=0,day=pacDay();
  Object.keys(r).forEach(function(k){if(r[k]&&now-(r[k].t||0)<LIM.stale*60000){o[k]=r[k];n++;}});
  return {rooms:o,day:day,g:(d.day===day?(d.g||0):0),n:n};
}
function liveDoc(c){return {rooms:c.rooms,day:c.day,g:c.g};}
async function fetchLive(force){
  if(!DB)return LIVE;
  if(!force&&LIVE&&Date.now()-LIVET<60000)return LIVE;
  try{var sn=await DB.doc('meta/live').get();LIVE=liveClean(sn.exists?sn.data():null);LIVET=Date.now();}catch(e){}
  return LIVE;
}
async function refreshLive(force){
  if(scr!=='home'||document.hidden)return;
  await fetchLive(force);var el=document.getElementById('livebox');if(el&&scr==='home')el.outerHTML=liveBoxHTML();
}
function humansIn(st){return st?st.players.filter(function(p){return p.uid;}).length:0;}
async function liveClaim(code,n){
  return DB.mutate('meta/live',function(d){
    var c=liveClean(d);
    if(c.rooms[code]){c.rooms[code].t=Date.now();c.rooms[code].n=n;return {write:liveDoc(c),out:{ok:true,c:c}};}
    if(c.g>=LIM.perDay)return {write:null,out:{dayFull:true,c:c}};
    if(c.n>=LIM.rooms)return {write:null,out:{full:true,c:c}};
    c.rooms[code]={h:NAME||'',n:n,pub:ROOMPUB?1:0,st:Date.now(),t:Date.now()};c.n++;c.g++;
    return {write:liveDoc(c),out:{ok:true,c:c}};
  });
}
function liveRelease(code){
  if(!DB||!code)return;
  DB.mutate('meta/live',function(d){var c=liveClean(d);if(!d||!(d.rooms&&d.rooms[code]))return null;delete c.rooms[code];return {write:liveDoc(c),out:1};}).catch(function(){});
}
// সবাই (অংশগ্রহণকারী) অল্প অল্প দূরত্বে হার্টবিট দেয় — কিন্তু সদ্য দেওয়া থাকলে লেখা হয় না, শুধু ১টি পড়া
function liveBeat(){
  if(MODE!=='online'||WATCH||!started||!S||S.phase==='over'||!DB)return;
  var code=CODE,hum=humansIn(S),now=Date.now();
  DB.mutate('meta/live',function(d){
    var c=liveClean(d),r=c.rooms[code];
    if(r&&now-(r.t||0)<LIM.hb*60000*0.7)return null;
    if(!r){if(c.n>=LIM.rooms+2)return null;r={h:'',n:hum,pub:ROOMPUB?1:0,st:now};}
    r.t=now;r.n=S?S.players.length:hum;c.rooms[code]=r;return {write:liveDoc(c),out:1};
  }).catch(function(){});
}
// স্লট নেওয়ার চেষ্টা: সফল হলে true; নইলে ব্যাখ্যা-ডায়ালগ দেখিয়ে false
async function slotClaim(n){
  var r;
  try{r=await liveClaim(CODE,n);}
  catch(e){if(!netErr(e,'স্লট নেওয়া যায়নি — Firestore rules-এ meta/live যোগ করা হয়েছে কি দেখুন।'));return false;}
  if(!r)return false;
  LIVE=r.c;LIVET=Date.now();
  if(r.ok){slotCancel(true);return true;}
  if(SLOTW){return false;} // অপেক্ষার মধ্যে নীরবে আবার চেষ্টা
  slotModal(r);return false;
}
function slotModal(r){
  var c=r.c,old=Object.keys(c.rooms).map(function(k){return c.rooms[k].st||0;}).sort()[0];
  var mins=old?Math.max(1,Math.round((Date.now()-old)/60000)):0;
  if(r.dayFull){
    modalEl.innerHTML='<div class="modalbg"><div class="modal" style="max-width:480px;text-align:center"><div style="font-size:44px">🌙</div><h2>আজকের অনলাইন খেলার সীমা পূর্ণ</h2><p>ফ্রি সার্ভারের দৈনিক সীমা বাঁচাতে দিনে সর্বোচ্চ '+bn(LIM.perDay)+'টি অনলাইন খেলা চালু করা যায়। সীমা প্রতিদিন বাংলাদেশ সময় দুপুর ১–২টার দিকে নতুন হয়। ততক্ষণ কম্পিউটারের সাথে বা একই ডিভাইসে খেলতে পারেন, আর চলমান খেলা দর্শক হয়ে দেখতে পারেন।</p><div class="acts" style="justify-content:center"><button onclick="G.close();G.leave();G.vsCom()">কম্পিউটারের সাথে খেলুন</button><button class="alt" onclick="G.close()">ঠিক আছে</button></div></div></div>';
  }else{
    modalEl.innerHTML='<div class="modalbg"><div class="modal" style="max-width:480px;text-align:center"><div style="font-size:44px">🚦</div><h2>এই মুহূর্তে সব রুম ব্যস্ত</h2><p>একসাথে সর্বোচ্চ '+bn(LIM.rooms)+'টি খেলা চলতে পারে, এখন '+bn(c.n)+'টি চলছে'+(mins?' (সবচেয়ে পুরোনোটি শুরু হয়েছে প্রায় '+bn(mins)+' মিনিট আগে)':'')+'। চাইলে আপনার ঘর লবিতেই অপেক্ষা করুক — রুম খালি হলেই খেলা নিজে থেকে শুরু হবে। অপেক্ষার সময় বন্ধুরা লবিতেই থাকুক।</p><div class="acts" style="justify-content:center"><button class="big gold" onclick="G.slotWait()">অপেক্ষা করি ⏳</button><button class="alt" onclick="G.close()">পরে চেষ্টা করব</button></div></div></div>';
  }
}
function slotWait(){
  closeModal();if(SLOTW)return;
  SLOTW={t0:Date.now(),un:null,iv:null};
  var check=function(){
    if(!SLOTW||HOST!==UID||started){slotCancel(true);return;}
    if(Date.now()-SLOTW.t0>12*60000){slotCancel();toast('অনেকক্ষণ অপেক্ষা হলো — পরে আবার চেষ্টা করুন');return;}
    var c=LIVE;if(c&&c.n<LIM.rooms&&c.g<LIM.perDay)startOnline(true);else if(c&&c.g>=LIM.perDay){slotCancel();slotModal({dayFull:true,c:c});}
    if(scr==='lobby')render();
  };
  try{SLOTW.un=DB.doc('meta/live').onSnapshot(function(sn){LIVE=liveClean(sn.exists?sn.data():null);LIVET=Date.now();check();},function(){});}catch(e){}
  SLOTW.iv=setInterval(check,20000);
  if(scr==='lobby')render();
}
function slotCancel(quiet){
  if(!SLOTW)return;try{if(SLOTW.un)SLOTW.un();}catch(e){}clearInterval(SLOTW.iv);SLOTW=null;
  if(!quiet&&scr==='lobby')render();
}
function leaveRoom(){slotCancel(true);try{stopVoice();stopChat();}catch(e){}
  // শেষ মানুষটি চলে গেলে স্লট ছেড়ে দিই (নইলে ১২ মিনিট পরে নিজে থেকে ছাড়বে)
  if(MODE==='online'&&DB&&CODE&&!WATCH&&started&&S&&S.phase!=='over'){var now=Date.now(),others=PRES.filter(function(p){return p.uid!==UID&&now-(p.seen||0)<PRES_WIN;}).length;if(!others)liveRelease(CODE);}
  if(MODE==='online'&&DB&&CODE&&!WATCH){try{DB.doc('games/'+CODE+'/presence/'+UID).update({seen:0}).catch(function(){});}catch(e){}}PRES=[];resetFx();unsubAll();S=null;MODE=null;CODE=null;started=false;WATCH=false;WATCHP=false;REQ=null;scr='home';lobbyPlayers=[];lobbyBots=[];JOINCODE=null;try{history.replaceState(null,'',location.pathname.replace(/\/r\/[^/]*$/,'/'));}catch(e){}render();}
