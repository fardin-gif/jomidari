// ====== জমিদার — ইভেন্ট হ্যান্ডলার ও চালু ======
window.G={
  diceClick:function(){if(!S||anim||S.phase!=='roll'||!isMe(S.cur))return;ac();A(S.players[S.cur].inJail?'jailRoll':'roll');},
  hideCard:function(){cardUntil=0;render();},
  mute:function(){muted=!muted;lsSet('jm_mute',muted?'1':'0');render();},
  home:function(){if(scr==='game'||scr==='lobby'){leaveRoom();}else{scr='home';render();}},
  level:function(){levelModal(false);},
  setLevel:setLevel,
  setLevel2:function(l){LEVEL=l;lsSet('jm_level',l);setup.diff={new:'easy',ent:'med',zam:'hard'}[l];render();},
  coach:function(){COACH=!COACH;lsSet('jm_coach',COACH?'1':'0');render();},
  avModal:avModal,
  pickAv:function(k){MYAV=k;lsSet('jm_av',k);var n=document.getElementById('nm');if(n)NAME=n.value;avModal();setTimeout(function(){},0);},
  legal:legalModal,
  create:function(){if(!LEVEL){levelModal(true);return;}createRoom();},
  rejoin:function(){readName();joinRoom(lsGet('jm_code'));},
  joinLink:function(){joinRoom(JOINCODE);},
  vsCom:function(){if(!LEVEL)levelModal(true);scr='setup';render();},
  togBot:function(k){var i=setup.bots.indexOf(k);if(i>=0){if(setup.bots.length>1)setup.bots.splice(i,1);else toast('কমপক্ষে ১ জন প্রতিপক্ষ লাগবে');}else if(setup.bots.length<5)setup.bots.push(k);render();},
  setDiff:function(d){setup.diff=d;render();},
  startCom:function(){if(!LEVEL){levelModal(true);return;}NAME=NAME||'আপনি';lsSet('jm_name',NAME);startLocalBots();},
  hot:function(){scr='hot';render();},
  hotN:function(n){setup.hot=n;render();},
  startHot:function(){var n=setup.hot,names=[],avs=[];for(var i=0;i<n;i++){names.push((hotNames[i]||'').trim()||('খেলোয়াড় '+bn(i+1)));avs.push(HUMAN_AV[i]);}startLocalHot(names,avs);},
  addBot:addLobbyBot,rmBot:removeLobbyBot,
  start:startOnline,leave:leaveRoom,
  copy:function(){var l=shareLink(CODE);if(navigator.clipboard)navigator.clipboard.writeText(l).then(function(){toast('লিংক কপি হয়েছে ✅ এবার বন্ধুদের পাঠান');},function(){toast(l);});else toast(l);},
  share:function(){var l=shareLink(CODE);navigator.share({title:'জমিদার',text:'জমিদার খেলতে আসুন! 🏰',url:l}).catch(function(){});},
  deed:showDeed,close:function(){closeModal();if(scr==='home'||scr==='join'||scr==='setup'||scr==='lobby')render();},
  bidIn:function(v){bidVal=v;},
  bidQuick:function(a){A('bid',{amt:a});},
  bid:function(){var v=Number(document.getElementById('bid').value);if(!v){toast('ডাকের অঙ্ক লিখুন');return;}A('bid',{amt:v});},
  retire:function(){arm('r',function(){A('retire');},'নিশ্চিত? আবার চাপুন — খেলা ছাড়লে আপনি বাদ পড়বেন');},
  kick:function(i){arm('k'+i,function(){A('kick',{i:i});},'নিশ্চিত? আবার চাপুন — এই খেলোয়াড় বাদ পড়বে');},
  tradeOpen:tradeOpen,
  tradeTo:function(v){tradeDraft.to=+v;tradeDraft.rp=[];tradeDraft.rc=0;renderTradeModal();},
  tradeCash:function(k,v){tradeDraft[k]=Math.max(0,Math.floor(+v||0));},
  tradeTog:function(key,k){var l=tradeDraft[key],j=l.indexOf(k);if(j>=0)l.splice(j,1);else l.push(k);},
  tradeSend:function(){var d=tradeDraft;var a={type:'propose',to:d.to,oc:d.oc,rc:d.rc,op:d.op,rp:d.rp};var r=apply(S,MODE==='local'?S.cur:myIdx(),a);if(r.err){toast(r.err);return;}closeModal();commit(r.s);}
};
document.addEventListener('click',function(){ac();});
(function boot(){
  // লিংক থেকে ঘরের কোড: ?r=ABCD অথবা /r/ABCD
  var m=location.search.match(/[?&]r=([A-Za-z0-9]+)/)||location.pathname.match(/\/r\/([A-Za-z0-9]+)/);
  if(m){JOINCODE=m[1].toUpperCase();scr='join';}
  render();
  initNet();
  setInterval(function(){if(scr==='game')botTick();},4000);
})();
