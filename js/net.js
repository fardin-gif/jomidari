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
function push(){
  if(MODE!=='online')return;
  var snap=JSON.stringify(S),v=S.v;
  WRITE=WRITE.then(function(){return DB.doc('games/'+CODE).update({s:snap,v:v});}).catch(function(e){
    if(netErr(e))return;
    if(e&&(e.code==='permission-denied'||e.code==='invalid_argument'))toast('লেখার অনুমতি নেই — Firestore rules ঠিকমতো publish করা হয়েছে কি দেখুন।');
    else toast('সংযোগে সমস্যা, আবার চেষ্টা করুন।');
  });
}
function commit(ns){S=ns;bidVal='';lastChange=Date.now();render();push();}
function dispatch(a){
  if(!S)return;
  if(anim){toast('একটু অপেক্ষা করুন…');return;}
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
function resetFx(){cleanFor=null;clearTimeout(cleanTimer);evV=null;evQ=[];FX=[];draining=false;cashShown=null;disp=null;lastRoll=null;cardN=null;moving=[];anim=false;diceBusy=false;seenLvl={};sayShown=0;sayUntil=0;autoUid=null;lastChange=Date.now();}

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
      collection:function(path){var c=fsM.collection(fs,path);return {orderBy:function(f){return {onSnapshot:function(n,e){return fsM.onSnapshot(fsM.query(c,fsM.orderBy(f)),function(s){n({docs:s.docs.map(function(d){return {data:function(){return d.data();}};})});},e);}};}};}
    };
    dbReady=true;
  }catch(e){console.error(e);DB=null;dbMsg='Firebase সংযোগ হয়নি ('+(e&&e.code?e.code:'নেটওয়ার্ক/কনফিগ')+')। Authentication-এ Anonymous চালু আছে কি এবং কনফিগ ঠিক আছে কি দেখুন।';}
  // লিংক দিয়ে এলে সরাসরি যোগ দেওয়ার পাতা
  if(JOINCODE&&DB){await prepareJoin(JOINCODE);}
  render();
}
function genCode(){var c='ABCDEFGHJKMNPQRSTUVWXYZ23456789',r='';for(var i=0;i<4;i++)r+=c[Math.floor(Math.random()*c.length)];return r;}
function readName(){var el=document.getElementById('nm');if(el){NAME=(el.value||'').trim();}NAME=NAME||'খেলোয়াড়';lsSet('jm_name',NAME);lsSet('jm_av',MYAV);return NAME;}

async function createRoom(){
  if(!DB||!UID){toast('অনলাইন সংযোগ এখনো প্রস্তুত নয়');return;}
  readName();var code=genCode();
  try{
    await DB.doc('games/'+code).set({host:UID,started:false,created:Date.now(),bots:[],hostName:NAME,limit:setup.limit||0});
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
  if(!d.started){
    try{await DB.doc('games/'+code+'/players/'+UID).set({name:NAME,av:MYAV,t:Date.now(),uid:UID});}
    catch(e){if(!netErr(e,'যোগ দেওয়া যায়নি — Firestore rules/সংযোগ পরীক্ষা করুন।'));return;}
  }
  enterRoom(code);
}
function enterRoom(code){
  MODE='online';CODE=code;lsSet('jm_code',code);unsubAll();started=false;S=null;resetFx();scr='lobby';lobbyPlayers=[];lobbyBots=[];
  try{history.replaceState(null,'','?r='+code);}catch(e){}
  render();
  var tm=setTimeout(function(){toast('সংযোগ ধীর — একটু অপেক্ষা করুন…');},10000);
  UNSUBS.push(DB.doc('games/'+code).onSnapshot(function(snap){
    clearTimeout(tm);
    if(!snap.exists){return;}
    var d=snap.data();HOST=d.host;lobbyBots=d.bots||[];lobbyLimit=d.limit||0;
    if(d.started&&d.s){
      var ns;try{ns=JSON.parse(d.s);}catch(e){return;}
      if(!S||ns.v>S.v){S=ns;started=true;scr='game';lastChange=Date.now();render();}
    }else{render();}
  },function(e){netErr(e,'ঘরের সঙ্গে সংযোগ কেটে গেছে');}));
  startPresence(code);
  UNSUBS.push(DB.collection('games/'+code+'/players').orderBy('t').onSnapshot(function(snap){
    lobbyPlayers=snap.docs.map(function(d){return d.data();});
    if(scr==='lobby')render();
  },function(){}));
}
// ---- উপস্থিতি ও উৎসাহ ----
function startPresence(code){
  PRES=[];var pp='games/'+code+'/presence/'+UID;
  DB.doc(pp).set({uid:UID,name:NAME,av:MYAV,t:Date.now(),seen:Date.now()}).catch(function(){});
  clearInterval(hbTimer);hbTimer=setInterval(function(){DB.doc(pp).update({seen:Date.now(),name:NAME,av:MYAV}).catch(function(){});updatePres();},60000);
  UNSUBS.push(DB.collection('games/'+code+'/presence').orderBy('t').onSnapshot(function(snap){PRES=snap.docs.map(function(d){return d.data();});updatePres();},function(){}));
  var first=true;cheerSeen={};
  UNSUBS.push(DB.collection('games/'+code+'/cheers').orderBy('t').onSnapshot(function(snap){
    snap.docs.forEach(function(d){var c=d.data();if(cheerSeen[c.uid]===c.t)return;cheerSeen[c.uid]=c.t;if(!first)showCheer(c);});
    first=false;
  },function(){}));
}
// সমর্থন পেলে নামের পাশে বিস্ফোরণের ইমোজি ও গণনা
function cheerFxHTML(i){var on=Date.now()<(cheerUntil[i]||0),n=cheerCnt[i]||0;return (on?'<span class="cpop">💥</span>':'')+(n?'<span class="ccnt" title="মোট সমর্থন">সমর্থন '+bn(n)+'</span>':'');}
function markCheer(i){
  cheerUntil[i]=Date.now()+3200;cheerCnt[i]=(cheerCnt[i]||0)+1;
  var upd=function(){var el=document.getElementById('cf'+i);if(el)el.innerHTML=cheerFxHTML(i);};
  upd();var row=document.getElementById('plr'+i);if(row){row.classList.remove('cheered');void row.offsetWidth;row.classList.add('cheered');}
  setTimeout(upd,3300);
}
function updatePres(){var el=document.getElementById('presbox');if(el)el.innerHTML=presHTML();}
var CHEER_LINES=['জয় হোক!','দারুণ খেলছেন!','চালিয়ে যান!','সাবাশ!','ভাগ্য আপনার সাথে!','হেরে যাবেন না!','জমিদারি আপনারই!','একদম জমিয়ে দিন!'];
var lastCheer=0;
function sendCheer(i){
  if(!S||!S.players[i])return;
  if(Date.now()-lastCheer<1500){toast('একটু থেমে থেমে উৎসাহ দিন');return;}
  lastCheer=Date.now();
  var c={uid:UID||'local',t:Date.now(),to:i,toName:S.players[i].name,toAv:S.players[i].bot||S.players[i].av||'h1',from:NAME||'একজন দর্শক',fromAv:MYAV,line:CHEER_LINES[Math.floor(Math.random()*CHEER_LINES.length)]};
  if(MODE==='online'&&DB){DB.doc('games/'+CODE+'/cheers/'+UID).set(c).catch(function(){toast('পাঠানো যায়নি');});showCheer(c);cheerSeen[UID]=c.t;}
  else showCheer(c);
}
function showCheer(c){
  var box=document.getElementById('cheers');if(!box)return;
  var d=document.createElement('div');d.className='cheer';
  d.innerHTML='<div class="cav">'+avatar(c.fromAv,40)+'</div><div><b>'+esc(c.from)+'</b> উৎসাহ দিলেন <b>'+esc(c.toName)+'</b>-কে<div class="cl">'+esc(c.line)+'</div></div><div class="cav">'+avatar(c.toAv,40)+'</div>';
  box.appendChild(d);while(box.children.length>5)box.removeChild(box.firstChild);
  try{SFX.cheer();}catch(e){}
  markCheer(c.to);
  setTimeout(function(){d.classList.add('out');setTimeout(function(){d.remove();},500);},6500);
}
// ---- খেলা শেষে ঘর পরিষ্কার (ফ্রি প্ল্যানের জায়গা ও কোটা বাঁচাতে) ----
var cleanTimer=null,cleanFor=null;
function scheduleCleanup(){
  if(MODE!=='online'||!DB||!CODE||!S||S.phase!=='over'||cleanFor===CODE)return;
  cleanFor=CODE;clearInterval(hbTimer);
  var code=CODE,host=HOST===UID,uid=UID;
  var delOwn=function(){['players','presence','cheers'].forEach(function(c){try{DB.doc('games/'+code+'/'+c+'/'+uid).del().catch(function(){});}catch(e){}});};
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
function unsubAll(){clearInterval(hbTimer);UNSUBS.forEach(function(f){try{f();}catch(e){}});UNSUBS=[];}
async function addLobbyBot(key){
  if(HOST!==UID)return;
  var bots=lobbyBots.slice();
  if(lobbyPlayers.length+bots.length>=6){toast('সর্বোচ্চ ৬ জন');return;}
  if(bots.indexOf(key)>=0){toast('এই চরিত্র আগেই আছে');return;}
  bots.push(key);
  try{await DB.doc('games/'+CODE).update({bots:bots});}catch(e){toast('যোগ করা যায়নি');}
}
async function removeLobbyBot(key){
  if(HOST!==UID)return;
  try{await DB.doc('games/'+CODE).update({bots:lobbyBots.filter(function(k){return k!==key;})});}catch(e){}
}
async function startOnline(){
  if(HOST!==UID)return;
  var list=lobbyPlayers.slice(0,6).map(function(p){return {uid:p.uid,name:p.name,av:p.av};});
  lobbyBots.slice(0,6-list.length).forEach(function(k){list.push({name:BOTS[k].name,bot:k});});
  if(list.length<2){toast('কমপক্ষে ২ জন লাগবে — বন্ধুকে লিংক পাঠান বা কম্পিউটার চরিত্র যোগ করুন');return;}
  var s=newGame(list);s.diff=setup.diff;s.limit=setup.limit;
  S=s;started=true;scr='game';resetFx();lastChange=Date.now();render();
  try{await DB.doc('games/'+CODE).update({started:true,s:JSON.stringify(s),v:s.v,uids:list.filter(function(p){return p.uid;}).map(function(p){return p.uid;})});}catch(e){toast('শুরু করা যায়নি');}
}
function leaveRoom(){if(MODE==='online'&&DB&&CODE){try{DB.doc('games/'+CODE+'/presence/'+UID).update({seen:0}).catch(function(){});}catch(e){}}PRES=[];resetFx();unsubAll();S=null;MODE=null;CODE=null;started=false;scr='home';lobbyPlayers=[];lobbyBots=[];JOINCODE=null;try{history.replaceState(null,'',location.pathname.replace(/\/r\/[^/]*$/,'/'));}catch(e){}render();}
