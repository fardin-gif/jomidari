// ====== জমিদার — ঘরের চ্যাট (সবার জন্য + বেছে নেওয়া মানুষের জন্য গোপন বার্তা) ======
// সবার বার্তা: games/{CODE}/chat/*   গোপন বার্তা: games/{CODE}/dm/* (members তালিকার লোকেরাই পড়তে পারে)
var CHAT={pub:[],dm:[],open:false,read:Date.now(),to:[],re:null,last:0,loaded:false},CUNS=[];
function startChat(code){
  stopChat(true);CHAT={pub:[],dm:[],open:false,read:Date.now(),to:[],re:null,last:0,loaded:false};
  var first={a:true,b:true};
  CUNS.push(DB.collection('games/'+code+'/chat').orderBy('t').onSnapshot(function(snap){
    CHAT.pub=snap.docs.map(function(d){var x=d.data();x.id=d.id;return x;});
    if(first.a){first.a=false;CHAT.read=Math.max(CHAT.read,0);} chatRefresh();
  },function(){}));
  CUNS.push(DB.collection('games/'+code+'/dm').where('members','array-contains',UID).onSnapshot(function(snap){
    CHAT.dm=snap.docs.map(function(d){var x=d.data();x.id=d.id;return x;});
    first.b=false;chatRefresh();
  },function(){}));
  try{startVoiceWatch(code);}catch(e){}
  chatDock();
}
function stopChat(keep){
  CUNS.forEach(function(f){try{f();}catch(e){}});CUNS=[];
  try{stopVoiceWatch();}catch(e){}
  if(!keep){var d=document.getElementById('chatdock');if(d)d.innerHTML='';}
}
function chatAll(){return CHAT.pub.concat(CHAT.dm).sort(function(a,b){return a.t-b.t;});}
function chatUnread(){var n=0,dm=0;chatAll().forEach(function(m){if(m.from!==UID&&m.t>CHAT.read){n++;if(m.members)dm++;}});return {n:n,dm:dm};}
function chatPeople(){
  var seen={},out=[];
  var add=function(p){if(!p||!p.uid||p.uid===UID||seen[p.uid])return;seen[p.uid]=1;out.push(p);};
  lobbyPlayers.forEach(add);
  if(S)S.players.forEach(function(p){if(p.uid)add({uid:p.uid,name:p.name,av:p.av});});
  var now=Date.now();PRES.forEach(function(p){if(now-(p.seen||0)<150000)add(p);});
  return out;
}
function tfmt(t){var d=new Date(t);return pad2(d.getHours())+':'+pad2(d.getMinutes());}
function msgHTML(m){
  var mine=m.from===UID,priv=!!m.members;
  var tag='';
  if(priv){var names=(m.toN||[]).join(', ');tag='<div class="ctag">শুধু '+(mine?esc(names)+'-কে':'আপনার জন্য'+((m.toN||[]).length>1?' (সাথে '+esc(names)+')':''))+'</div>';}
  var quote=m.re?'<div class="cquote">'+esc(m.re.n)+': '+esc(m.re.x)+'</div>':'';
  return '<div class="cm'+(mine?' me':'')+(priv?' dm':'')+'"><div class="ch">'+avatar(m.av||'h1',22)+'<b>'+esc(mine?'আপনি':m.name)+'</b><span class="mut">'+tfmt(m.t)+'</span></div>'+tag+quote+'<div class="ct">'+esc(m.text)+'</div>'+
    (mine?'':'<button class="crep" onclick="G.chatReply(\''+m.id+'\')">উত্তর দিন</button>')+'</div>';
}
function chatRefresh(){
  var u=chatUnread();
  if(CHAT.open){
    CHAT.read=Date.now();
    var box=document.getElementById('cmsgs');
    if(box){var atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<60;box.innerHTML=chatAll().map(msgHTML).join('')||'<div class="mut" style="padding:10px">এখনও কোনো বার্তা নেই। প্রথম বার্তাটি আপনিই লিখুন!</div>';if(atEnd||CHAT.stick)box.scrollTop=box.scrollHeight;CHAT.stick=false;}
    u={n:0,dm:0};
  }
  var b=document.getElementById('cbtn');
  if(b){b.className='cbtn'+(u.dm?' dm':'');b.innerHTML='চ্যাট'+(u.n?' <span class="cbadge">'+bn(u.n)+'</span>':'');}
}
function chatDock(){
  var d=document.getElementById('chatdock');if(!d)return;
  if(MODE!=='online'){d.innerHTML='';return;}
  d.innerHTML='<div class="cpanel" id="cpanel" style="display:none"></div><button id="cbtn" class="cbtn" onclick="G.chatToggle()">চ্যাট</button>';
  chatRefresh();
}
function chatPanel(){
  var p=document.getElementById('cpanel');if(!p)return;
  if(!CHAT.open){p.style.display='none';return;}
  p.style.display='flex';
  p.innerHTML='<div class="chead"><b>ঘরের চ্যাট</b><button class="sm alt" onclick="G.chatToggle()">বন্ধ</button></div>'+
   '<div class="cmsgs" id="cmsgs"></div><div id="cwho"></div>'+
   '<div class="cin"><input id="cin" maxlength="300" placeholder="বার্তা লিখুন…" onkeydown="if(event.key===\'Enter\')G.chatSend()"><button onclick="G.chatSend()">পাঠান</button></div>';
  chatWho();CHAT.stick=true;chatRefresh();
}
function chatWho(){
  var el=document.getElementById('cwho');if(!el)return;
  var ppl=chatPeople(),h='';
  if(CHAT.re)h+='<div class="creply">উত্তর: <b>'+esc(CHAT.re.n)+'</b> — '+esc(CHAT.re.x)+' <button class="sm alt" onclick="G.chatReply(null)">বাদ</button></div>';
  h+='<div class="cto"><span class="mut">কাকে:</span><button class="cchip'+(CHAT.to.length?'':' on')+'" onclick="G.chatTo(null)">সবাইকে</button>'+
     ppl.map(function(p){return '<button class="cchip'+(CHAT.to.indexOf(p.uid)>=0?' on':'')+'" onclick="G.chatTo(\''+p.uid+'\')">'+esc(p.name)+'</button>';}).join('')+'</div>'+
     (CHAT.to.length?'<div class="mut" style="font-size:12px;padding:0 8px 4px">শুধু বাছাই করা ব্যক্তিরাই এই বার্তা দেখবে।</div>':'');
  el.innerHTML=h;
}
function chatToggle(){
  CHAT.open=!CHAT.open;CHAT.read=Date.now();chatPanel();chatRefresh();
  if(CHAT.open){var i=document.getElementById('cin');if(i)setTimeout(function(){i.focus();},50);}
}
function chatTo(uid){
  if(!uid)CHAT.to=[];else{var i=CHAT.to.indexOf(uid);if(i>=0)CHAT.to.splice(i,1);else CHAT.to.push(uid);}
  chatWho();
}
function chatReply(id){
  if(!id){CHAT.re=null;chatWho();return;}
  var m=chatAll().filter(function(x){return x.id===id;})[0];if(!m)return;
  CHAT.re={n:m.name,x:(m.text||'').slice(0,40)};
  if(m.members){CHAT.to=m.members.filter(function(u){return u!==UID;});}else CHAT.to=[];
  chatWho();var i=document.getElementById('cin');if(i)i.focus();
}
function chatSend(){
  var i=document.getElementById('cin');if(!i||!DB||!CODE)return;
  var t=(i.value||'').trim();if(!t)return;
  if(Date.now()-CHAT.last<700){return;}CHAT.last=Date.now();
  var m={from:UID,name:NAME||'খেলোয়াড়',av:MYAV,t:Date.now(),text:t.slice(0,300)};
  if(CHAT.re)m.re=CHAT.re;
  var path='games/'+CODE+'/chat';
  if(CHAT.to.length){
    var ppl=chatPeople();m.members=[UID].concat(CHAT.to);
    m.toN=CHAT.to.map(function(u){var p=ppl.filter(function(x){return x.uid===u;})[0];return p?p.name:'কেউ';});
    path='games/'+CODE+'/dm';
  }
  i.value='';CHAT.re=null;chatWho();CHAT.stick=true;
  DB.collection(path).add(m).catch(function(e){toast('বার্তা যায়নি');i.value=t;});
}
// খেলা শেষে নিজের বার্তা মুছে ফেলা (হোস্ট সবার জন্য খোলা বার্তাও মোছে) — ফ্রি কোটা বাঁচাতে
function chatCleanup(host){
  if(!DB||!CODE)return;var code=CODE;
  CHAT.dm.forEach(function(m){if(m.from===UID)DB.doc('games/'+code+'/dm/'+m.id).del().catch(function(){});});
  CHAT.pub.forEach(function(m){if(host||m.from===UID)DB.doc('games/'+code+'/chat/'+m.id).del().catch(function(){});});
}
