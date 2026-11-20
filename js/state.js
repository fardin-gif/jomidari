// ====== জমিদার — সাধারণ অবস্থা ও সহায়ক ফাংশন ======
var app=document.getElementById('app'),modalEl=document.getElementById('modal');
var S=null;                 // বর্তমান গেম স্টেট
var MODE=null;              // 'local' | 'online'
var DB=null,UID=null,CODE=null,HOST=null,UNSUBS=[],WRITE=Promise.resolve(),dbReady=false;
var lobbyPlayers=[],lobbyBots=[],started=false,scr='home',dbMsg='',roomExists=null;
var NAME=lsGet('jm_name'),MYAV=lsGet('jm_av')||HUMAN_AV[Math.floor(Math.random()*HUMAN_AV.length)],LEVEL=lsGet('jm_level'),COACH=lsGet('jm_coach')!=='0';
var setup={n:1,bots:['majumdar'],diff:{new:'easy',ent:'med',zam:'hard'}[lsGet('jm_level')]||'med',hot:3};
var JOINCODE=null,lobbyLimit=0,clockWarn={};
setup.limit=parseInt(lsGet('jm_limit'),10)||0;
var bidVal='',tradeDraft=null,lastRoll=null,armed=null,disp=null,moveTo=[],moving=[],anim=false,diceBusy=false,diceUntil=0,dicePrev=[1,1],cardN=null,cardUntil=0,cardFresh=false,seenLvl={};
var lastChange=Date.now(),autoUid=null,sayShown=0,sayUntil=0;
var cashHold=null,logHold=0,HOLD=false,wasMine=false,lastCurSeen=-1,titleTimer=null,cheerUntil={},cheerCnt={};
var AUTO_MS=90000,PRES=[],hbTimer=null,cheerSeen={};

function arm(key,fn,msg){if(armed===key){armed=null;fn();}else{armed=key;toast(msg);setTimeout(function(){if(armed===key)armed=null;},4000);}}
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(m){var t=document.getElementById('toast');t.innerHTML='<div class="toast">'+esc(m)+'</div>';clearTimeout(toast.t);toast.t=setTimeout(function(){t.innerHTML='';},3600);}
function money(n){return '৳'+bn(n);}
function setBusy(){app.classList.toggle('busy',anim);}

// ---- আমি কোন খেলোয়াড়? ----
function humanIdxs(){return S.players.map(function(p,i){return p.bot?-1:i;}).filter(function(i){return i>=0;});}
function myIdx(){
  if(!S)return -1;
  if(MODE==='local'){var h=humanIdxs();return h.length===1?h[0]:-1;}
  if(!UID)return -1;
  return S.players.findIndex(function(p){return p.uid===UID;});
}
function isMe(i){if(!S||!S.players[i])return false;if(MODE==='local')return !S.players[i].bot;return i===myIdx();}
function viewer(){
  if(!S)return -1;
  if(MODE==='local'){if(!S.players[S.cur].bot)return S.cur;var h=humanIdxs();return h.length?h[0]:-1;}
  return myIdx();
}
function levelName(l){return {new:'প্রথমবার ক্রেতা',ent:'উদ্যোক্তা',zam:'জমিদার'}[l]||'';}
function shareLink(code){return location.origin+location.pathname.replace(/\/r\/[^/]*$/,'/').replace(/index\.html$/,'')+'?r='+code;}
