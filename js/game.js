// ====== জমিদার — খেলার পর্দা, প্যানেল, সহায়ক, কম্পিউটারের চাল চালানো ======
function pname(i){return S.players[i]?S.players[i].name:'';}
function phaseMsg(){
  if(HOLD&&S.phase!=='over')return 'ঘুঁটি এগোচ্ছে…';
  var p=S.players[S.cur];
  switch(S.phase){
    case 'roll':return p.inJail?p.name+' জেলে — কীভাবে বেরোবে?':p.name+'-এর দান: ছক্কা চালুন';
    case 'buy':return p.name+' "'+SQ[p.pos].n+'"-এ — কিনবে?';
    case 'auction':return 'নিলাম: "'+SQ[S.auction.idx].n+'" — এখন '+S.players[S.auction.turn].name+'-এর ডাকার পালা';
    case 'debt':return p.name+'-কে '+money(S.debt.amt)+' দিতে হবে — টাকা জোগাড় করুন!';
    case 'post':return p.name+(S.again?': ডাবলস! আবার দান পাবে':': দান শেষ করতে পারে');
    case 'trade':return S.players[S.trade.from].name+'  '+S.players[S.trade.to].name+': বিনিময়ের প্রস্তাব';
    case 'over':return '🏆 '+S.players[S.winner].name+' জয়ী!';
  }return '';
}
function sayActive(){return S&&S.say&&Date.now()<sayUntil;}
function renderGame(){
  if(!disp||disp.length!==S.players.length)disp=S.players.map(function(p){return p.pos;});
  if(lastRoll===null||S.rollId<lastRoll){lastRoll=S.rollId;dicePrev=S.dice[0]?S.dice.slice():[1,1];cardN=S.lastCard?S.lastCard.n:0;}
  var rolled=S.rollId!==lastRoll;
  if(rolled)lastRoll=S.rollId;
  // ঘুঁটি/ছক্কা চলার সময় টাকা, লগ ও কাজ আগের অবস্থায় ধরে রাখি — চাল শেষ হলে হিসাব দেখাব
  HOLD=anim||rolled||S.players.some(function(p,i){return !p.out&&disp[i]!==p.pos;});
  if(!HOLD||!cashHold||cashHold.length!==S.players.length){cashHold=S.players.map(function(p){return p.cash;});logHold=S.log.length;}
  var faces=rolled?dicePrev:(S.dice[0]?S.dice:dicePrev);
  if(!rolled&&!diceBusy&&S.dice[0])dicePrev=S.dice.slice();
  if(evV===null||S.v<evV){evV=S.v;evQ=[];cashShown=S.players.map(function(p){return p.cash;});}
  else if(S.v!==evV){evV=S.v;(S.ev||[]).forEach(function(x){evQ.push(x);});}
  // বটের কথা
  if(S.say&&S.say.n!==sayShown){sayShown=S.say.n;sayUntil=Date.now()+4800;setTimeout(function(){if(scr==='game')render();},4900);}
  var cells='';for(var i=0;i<40;i++)cells+=sqHTML(i);
  var canRoll=S.phase==='roll'&&isMe(S.cur)&&!anim&&!rolled;
  var lc=S.lastCard,cardHTML='';
  if(cardN===null)cardN=lc?lc.n:0;
  if(lc&&lc.n>cardN&&!anim&&!rolled){cardN=lc.n;cardUntil=Date.now()+7000;cardFresh=true;setTimeout(whoosh,250);setTimeout(function(){if(scr==='game')render();},7100);}
  if(lc&&Date.now()<cardUntil){
    cardHTML='<div class="dwrap"><div class="dcard '+lc.deck+(cardFresh?' fly'+(lc.deck==='ch'?'c':'cc'):'')+'" onclick="G.hideCard()"><span class="ttl">'+(lc.deck==='ch'?' ভাগ্য পরীক্ষা':' কমিউনিটি চেস্ট')+'</span><div>'+esc(lc.text)+'</div><div class="who">'+esc(lc.who)+' এই কার্ড তুলেছে • বন্ধ করতে ক্লিক করুন</div></div></div>';
    cardFresh=false;
  }
  var sayHTML='';
  if(sayActive()&&S.players[S.say.i])sayHTML='<div class="sayc">'+avatarOf(S.players[S.say.i],60)+'<span><b>'+esc(pname(S.say.i))+':</b> '+esc(S.say.t)+'</span></div>';
  var center='<div class="center"><div class="deck ch">❓<br>ভাগ্য পরীক্ষা</div><div class="deck cc">📦<br>কমিউনিটি চেস্ট</div><div class="logo">জমিদার</div>'+
    '<div class="dice3'+(canRoll?' can':'')+'" id="dice" '+(canRoll?'onclick="G.diceClick()" title="ক্লিক করে ছক্কা চালুন"':'')+'>'+diceInner(faces)+'</div>'+
    (canRoll?'<div class="hint"> ছক্কায় ক্লিক করুন</div>':'')+
    '<div class="msg">'+esc(phaseMsg())+'</div>'+sayHTML+cardHTML+fxLayerHTML()[0]+'</div>';
  var scrollY=window.scrollY;
  app.innerHTML=topbar()+'<div class="wrap3"><div class="colL">'+panelLeft()+'</div><div class="colM">'+clockBox()+'<div class="board">'+cells+center+'<div class="tkl">'+tokensHTML()+'</div>'+fxLayerHTML()[1]+winOverlay()+'</div></div><div class="colR">'+panelRight()+'</div></div>';
  if(rolled)startDice(S.dice);
  afterRender();applyHL();
  drain();
  turnAlert();
  scheduleCleanup();
  botTick();
}

// ---------- ডান পাশের প্যানেল ----------
function panelLeft(){
  var h=propsCard();
  var lg=S.log.slice(0,HOLD?logHold:S.log.length).slice(-16).reverse();
  h+='<div class="card"><h3>খেলার লগ</h3><div class="log2">'+lg.map(function(l){return '<div>'+esc(l)+'</div>';}).join('')+'</div><div class="mut" style="margin-top:4px">ব্যাংকে বাড়ি: '+bn(S.houses)+' • হোটেল: '+bn(S.hotels)+'</div></div>';
  return h;
}
function panelRight(){
  var h=coachCard()+actionCard();
  h+='<div class="card"><h3>খেলোয়াড়</h3><div class="mut" style="margin:-4px 0 6px">পাশের "সমর্থন" বাটনে চাপ দিয়ে যে কাউকে উৎসাহ দিন</div>';
  S.players.forEach(function(p,i){
    var chips='';Object.keys(S.own).map(Number).sort(function(a,b){return a-b;}).forEach(function(k){var o=S.own[k];if(o.o===i){var q=SQ[k];var col=q.t==='prop'?GROUPS[q.g][0]:(q.t==='station'?'#444':'#ccc');chips+='<span class="chip'+(o.mort?' m':'')+'" style="background:'+col+'" title="'+esc(q.n)+'" onclick="G.deed('+k+')"></span>';}});
    var talk=sayActive()&&S.say.i===i?'<div class="bub">'+esc(S.say.t)+'</div>':'';
    var cashV=HOLD?cashHold[i]:p.cash;
    h+='<div class="pl'+(i===S.cur&&S.phase!=='over'?' cur':'')+(p.out?' out':'')+'" id="plr'+i+'"><div class="avw">'+avatarOf(p,46)+'<span class="dot" style="background:'+p.color+'"></span></div><div style="flex:1;min-width:0"><span class="nmx">'+esc(p.name)+'</span><span class="cfx" id="cf'+i+'">'+cheerFxHTML(i)+'</span>'+
      (p.bot?' <span class="mut">'+esc(BOTS[p.bot].title)+'</span>':'')+(MODE==='online'&&p.uid===UID?' <span class="mut">(আপনি)</span>':'')+(p.inJail?' 🔒':'')+(p.fc.length?' 🎫×'+p.fc.length:'')+
      '<div class="cash">'+money(cashV)+'</div><div class="chips">'+chips+'</div>'+talk+'</div>'+
      '<div class="pbtns">'+(p.out?'':'<button class="sm gold" onclick="G.cheer('+i+')" title="'+esc(p.name)+'-কে সমর্থন দিন">সমর্থন</button>')+
      (MODE==='online'&&HOST===UID&&!p.out&&p.uid!==UID&&!p.bot&&S.phase!=='over'?'<button class="sm warn" onclick="G.kick('+i+')" title="অনুপস্থিত খেলোয়াড়কে বাদ দিন">বাদ</button>':'')+'</div></div>';
  });
  h+='</div>';
  if(MODE==='online')h+='<div class="card" id="presbox">'+presHTML()+'</div>';
  return h;
}
function coachCard(){
  if(LEVEL!=='new'||!S||S.phase==='over'||HOLD)return '';
  var me=myIdx();if(me<0)return '';
  if(!COACH)return '<div class="card" style="padding:6px 12px"><span class="mut"> সহায়ক বন্ধ আছে।</span> <button class="sm alt" onclick="G.coach()">চালু করুন</button></div>';
  var who=actorOf(S);if(who!==me)return '<div class="card coach"><div class="hd"><div style="font-size:30px">🌱</div><div><div class="tx">একটু অপেক্ষা করুন…</div><div class="mut">অন্যের দান চলছে। দেখুন কী হয় — আপনার পালায় আমি বলে দেব!</div></div><button class="sm alt off" onclick="G.coach()">বন্ধ</button></div></div>';
  var a=advise(S,me);if(!a)return '';
  window.__hl=a.hl;
  return '<div class="card coach"><div class="hd"><div style="font-size:30px">🌱</div><div style="flex:1"><div class="tx">'+esc(a.t)+'</div></div><button class="sm alt off" onclick="G.coach()">বন্ধ</button></div><details style="margin-top:6px"><summary style="cursor:pointer;font-weight:600">কেন এটা করব?</summary><div class="why">'+esc(a.why)+'</div></details></div>';
}
function applyHL(){
  var hl=window.__hl;window.__hl=null;
  if(!hl||LEVEL!=='new'||!COACH)return;
  var el=app.querySelector('[data-a="'+hl+'"]:not(:disabled)');if(el)el.classList.add('hl');
  if(hl==='roll'||hl==='jailRoll'){}
}
function actionCard(){
  var s=S,cur=s.cur,p=s.players[cur],mine=isMe(cur);
  var yt=!HOLD&&s.phase!=='over'&&multiView()&&isMe(actorOf(s));
  var h='<div class="card'+(yt?' yourturn':'')+'"><h3>'+(yt?'আপনার পালা — এখনই কাজ করুন':'আপনার কাজ')+'</h3>';
  if(HOLD&&s.phase!=='over')return h+'<div class="mut">ঘুঁটি চলছে… চাল শেষ হলে হিসাব দেখানো হবে।</div></div>';
  var spectator=(MODE==='online'&&myIdx()<0);
  if(spectator)return h+'<div class="mut"> আপনি দর্শক — খেলা দেখছেন।</div></div>';
  if(s.phase==='over'){return h+'<b>🏆 '+esc(s.players[s.winner].name)+' জয়ী! অভিনন্দন!</b>'+(s.timeUp?'<div class="mut" style="margin-top:4px">সময় শেষ হয়েছে — মোট সম্পদে সেরা।</div>'+scoreHTML().replace('class="sc"','class="sc inl"'):'')+'<div class="acts"><button onclick="G.leave()">মেনুতে ফিরুন</button></div></div>';}
  var wait=function(t){return '<div class="mut">'+(p.bot?' ':'')+esc(t)+'</div>';};
  if(s.phase==='roll'){
    if(!mine)h+=wait(p.name+(p.bot?' ভাবছে…':'-এর দানের অপেক্ষা…'));
    else if(p.inJail)h+='<div class="acts"><button data-a="jailRoll" onclick="A(\'jailRoll\')">ডাবলসের চেষ্টা</button><button class="alt" data-a="payJail" onclick="A(\'payJail\')" '+(p.cash<50?'disabled':'')+'>৫০ টাকা দিয়ে বের হন</button>'+(p.fc.length?'<button class="alt" data-a="useCard" onclick="A(\'useCard\')">মুক্তির কার্ড</button>':'')+'</div><div class="mut">চেষ্টা '+bn(p.jt)+'/৩</div>';
    else h+='<div class="acts"><button data-a="roll" onclick="G.diceClick()">ছক্কা চালুন</button></div>';
  }else if(s.phase==='buy'){
    var q=SQ[p.pos];
    if(!mine)h+=wait(p.name+' সিদ্ধান্ত নিচ্ছে…');
    else h+='<div><b>'+esc(q.n)+'</b> — দাম '+money(q.p)+'</div><div class="acts"><button data-a="buy" onclick="A(\'buy\')" '+(p.cash<q.p?'disabled':'')+'>কিনুন</button><button class="alt" data-a="auction" onclick="A(\'auction\')">নিলামে তুলুন</button></div>';
  }else if(s.phase==='auction'){
    var a=s.auction,t=s.players[a.turn];
    h+='<div><b>'+esc(SQ[a.idx].n)+'</b> — সর্বোচ্চ ডাক: '+(a.hi===null?'নেই':money(a.bid)+' ('+esc(s.players[a.hi].name)+')')+'</div>';
    if(isMe(a.turn)){
      var base=a.bid;
      h+='<div class="mut" style="margin:4px 0">'+esc(t.name)+', আপনার নগদ '+money(t.cash)+'</div><div class="acts">'+
      [10,50,100].map(function(d){return '<button class="alt sm" onclick="G.bidQuick('+(base+d)+')">'+money(base+d)+'</button>';}).join('')+
      '<input id="bid" type="number" min="'+(base+1)+'" style="width:100px" placeholder="অন্য অঙ্ক" value="'+esc(bidVal)+'" oninput="G.bidIn(this.value)"><button data-a="bid" onclick="G.bid()">ডাকুন</button><button class="warn" data-a="pass" onclick="A(\'pass\')">পাস</button></div>';
    }else h+=wait(t.name+(t.bot?' ভাবছে…':'-এর অপেক্ষা…'));
  }else if(s.phase==='debt'){
    var d=s.debt;
    h+='<div style="color:var(--warn)"><b>'+esc(s.players[d.i].name)+'</b>-কে '+money(d.amt)+' দিতে হবে ('+esc(d.reason)+')। নগদ আছে '+money(s.players[d.i].cash)+'।</div>';
    if(isMe(d.i))h+='<div class="mut">নিচের তালিকা থেকে সম্পত্তি বন্ধক রাখুন বা বাড়ি বিক্রি করুন।</div><div class="acts"><button data-a="payDebt" onclick="A(\'payDebt\')" '+(s.players[d.i].cash<d.amt?'disabled':'')+'>দেনা শোধ করুন</button><button class="warn" onclick="G.retire()">দেউলিয়া ঘোষণা</button></div>';
  }else if(s.phase==='post'){
    if(!mine)h+=wait(p.name+' খেলছে…');
    else h+='<div class="acts"><button data-a="endTurn" onclick="A(\'endTurn\')">'+(s.again&&!p.inJail?' আবার ছক্কা (ডাবলস)':' দান শেষ করুন')+'</button></div>';
  }else if(s.phase==='trade'){
    var tr=s.trade;
    h+='<div>'+tradeText(tr)+'</div>';
    if(isMe(tr.to))h+='<div class="acts"><button onclick="A(\'accept\')">মেনে নিন</button><button class="warn" onclick="A(\'decline\')">ফিরিয়ে দিন</button></div>';
    else if(isMe(tr.from))h+='<div class="acts"><button class="warn" onclick="A(\'decline\')">প্রস্তাব বাতিল</button></div>';
    else h+=wait(S.players[tr.to].name+(S.players[tr.to].bot?' ভাবছে…':'-এর সিদ্ধান্তের অপেক্ষা…'));
  }
  if(mine&&(s.phase==='roll'||s.phase==='post'))h+='<div class="acts"><button class="alt sm" onclick="G.tradeOpen()">বিনিময়/বেচাকেনা</button><button class="warn sm" onclick="G.retire()">খেলা ছাড়ুন</button></div>';
  return h+'</div>';
}
function tradeText(t){
  var f=S.players[t.from],o=S.players[t.to];
  function list(c,ps){var a=[];if(c)a.push(money(c));ps.forEach(function(i){a.push(SQ[i].n);});return a.length?a.join(', '):'কিছু না';}
  return '<b>'+esc(f.name)+'</b> দেবে: '+esc(list(t.oc,t.op))+'<br><b>'+esc(o.name)+'</b> দেবে: '+esc(list(t.rc,t.rp));
}
function propsCard(){
  var v=viewer();if(v<0||S.players[v].out)return '';
  var s=S,p=s.players[v],keys=Object.keys(s.own).map(Number).filter(function(k){return s.own[k].o===v;}).sort(function(a,b){return a-b;});
  var can=isMe(s.cur)&&v===s.cur&&(s.phase==='roll'||s.phase==='post'||s.phase==='debt');
  var h='<div class="card"><h3>'+(MODE==='local'&&humanIdxs().length>1?esc(p.name)+'-এর সম্পত্তি':'আপনার সম্পত্তি')+'</h3>';
  if(!keys.length)return h+'<div class="mut">এখনও কিছু কেনেননি।</div></div>';
  var firstBuild=true;
  keys.forEach(function(k){
    var q=SQ[k],o=s.own[k],col=q.t==='prop'?GROUPS[q.g][0]:(q.t==='station'?'#444':'#bbb');
    var lv=q.t==='prop'?(o.lvl===5?'🏨':(o.lvl>0?'🏠×'+bn(o.lvl):'')):'';
    h+='<div class="prow"><div class="l"><span class="sw" style="background:'+col+'"></span><span onclick="G.deed('+k+')" style="cursor:pointer">'+esc(q.n)+'</span> '+lv+(o.mort?' <span class="mut">(বন্ধক)</span>':'')+'</div>';
    if(can){
      h+='<div class="row" style="gap:4px;flex:none">';
      if(q.t==='prop'&&s.phase!=='debt'&&hasMono(s,v,q.g)&&!o.mort){var ok=!apply(s,v,{type:'build',idx:k}).err;h+='<button class="sm alt" '+(ok&&firstBuild?'data-a="build" ':'')+'title="'+(o.lvl===4?'হোটেল':'বাড়ি')+' বানান ('+money(q.h)+')" onclick="A(\'build\',{idx:'+k+'})">＋</button>';if(ok)firstBuild=false;}
      if(q.t==='prop'&&o.lvl>0)h+='<button class="sm alt" title="অর্ধেক দামে বিক্রি" onclick="A(\'sell\',{idx:'+k+'})">−</button>';
      if(!o.mort&&!(q.t==='prop'&&groupBuilt(s,q.g)))h+='<button class="sm alt" '+(s.phase==='debt'?'data-a="mortgage" ':'')+'title="বন্ধক রেখে '+money(q.p/2)+' নিন" onclick="A(\'mortgage\',{idx:'+k+'})">বন্ধক</button>';
      if(o.mort&&s.phase!=='debt')h+='<button class="sm alt" onclick="A(\'unmortgage\',{idx:'+k+'})">ছাড়ান '+money(Math.ceil(q.p/2*1.1))+'</button>';
      h+='</div>';
    }
    h+='</div>';
  });
  return h+'</div>';
}

// ---------- কম্পিউটারের চালনা ----------
var botTimer=null,botV=-1;
function canDrive(){return MODE==='local'||(MODE==='online'&&HOST===UID);}
function botTick(){
  if(scr!=='game'||!S||!canDrive()||S.phase==='over')return;
  var who=actorOf(S);if(who<0)return;
  var p=S.players[who],auto=false;
  if(!p.bot){
    if(MODE==='online'&&p.uid&&who!==myIdx()){
      if(autoUid===p.uid)auto=true;
      else if(Date.now()-lastChange>AUTO_MS){autoUid=p.uid;auto=true;toast(' '+p.name+' অনেকক্ষণ নিষ্ক্রিয় — অটোপাইলটে খেলা চলছে');}
    }
    if(!auto){autoUid=autoUid&&S.players.some(function(q){return q.uid===autoUid&&actorOf(S)===S.players.indexOf(q);})?autoUid:null;return;}
  }
  if(botTimer&&botV===S.v)return;
  clearTimeout(botTimer);botV=S.v;
  var delay=auto?500:(S.phase==='auction'||S.phase==='buy'?1100+Math.random()*700:850+Math.random()*750);
  botTimer=setTimeout(function(){
    botTimer=null;
    if(!S||S.v!==botV||anim||scr!=='game'){botV=-1;return;}
    var w=actorOf(S);if(w!==who){botV=-1;return;}
    var key=p.bot||'majumdar',a=botPlan(S,who,auto?'med':(S.diff||'med'),key);
    if(!a){botV=-1;return;}
    var say=p.bot?sayFor(a,key):null;
    var r=apply(S,who,a);
    if(r.err){r=apply(S,who,a.type==='bid'?{type:'pass'}:{type:'retire'});if(r.err){botV=-1;return;}}
    var ns=r.s;
    if(say)ns.say={i:who,t:say,n:((S.say&&S.say.n)||0)+1};
    if(ns.phase==='over'&&ns.winner!=null&&ns.players[ns.winner].bot){var wl=botSay(ns.players[ns.winner].bot,'win');if(wl)ns.say={i:ns.winner,t:wl,n:((ns.say&&ns.say.n)||0)+1};}
    commit(ns);
  },delay);
}

// ---------- মডাল ----------
function closeModal(){modalEl.innerHTML='';tradeDraft=null;}
function showDeed(i){
  var q=SQ[i],o=S?S.own[i]:null,h='';
  if(q.t==='prop'){
    h='<div class="deed"><div class="hd" style="background:'+GROUPS[q.g][0]+'">'+esc(q.n)+'</div><div class="mut">'+GROUPS[q.g][1]+' গ্রুপ</div><table>'+
    '<tr><td>ভাড়া</td><td>'+money(q.r[0])+'</td></tr><tr><td>পুরো গ্রুপ থাকলে (খালি)</td><td>'+money(q.r[0]*2)+'</td></tr>'+
    [1,2,3,4].map(function(n){return '<tr><td>'+bn(n)+' বাড়ি</td><td>'+money(q.r[n])+'</td></tr>';}).join('')+
    '<tr><td>হোটেল</td><td>'+money(q.r[5])+'</td></tr><tr><td>বাড়ি/হোটেল বানানোর খরচ</td><td>'+money(q.h)+'</td></tr><tr><td>বন্ধকি মূল্য</td><td>'+money(q.p/2)+'</td></tr><tr><td>দাম</td><td>'+money(q.p)+'</td></tr></table></div>';
  }else if(q.t==='station'){
    h='<div class="deed"><div class="hd" style="background:#ddd"> '+esc(q.n)+'</div><table><tr><td>১টি স্টেশন থাকলে</td><td>'+money(25)+'</td></tr><tr><td>২টি</td><td>'+money(50)+'</td></tr><tr><td>৩টি</td><td>'+money(100)+'</td></tr><tr><td>৪টি</td><td>'+money(200)+'</td></tr><tr><td>বন্ধকি মূল্য</td><td>'+money(100)+'</td></tr><tr><td>দাম</td><td>'+money(200)+'</td></tr></table></div>';
  }else if(q.t==='util'){
    h='<div class="deed"><div class="hd" style="background:#ddd">'+esc(q.n)+'</div><table><tr><td>১টি থাকলে</td><td>ছক্কার যোগফল ×৪</td></tr><tr><td>২টিই থাকলে</td><td>ছক্কার যোগফল ×১০</td></tr><tr><td>বন্ধকি মূল্য</td><td>'+money(75)+'</td></tr><tr><td>দাম</td><td>'+money(150)+'</td></tr></table></div>';
  }else h='<div class="deed"><div class="hd" style="background:#eee">'+esc(q.n)+'</div></div>';
  if(o&&S)h+='<p>মালিক: <b>'+esc(S.players[o.o].name)+'</b>'+(o.mort?' (বন্ধক)':'')+'</p>';
  modalEl.innerHTML='<div class="modalbg" onclick="G.close()"><div class="modal" style="max-width:420px" onclick="event.stopPropagation()">'+h+'<div class="acts"><button class="alt" onclick="G.close()">বন্ধ</button></div></div></div>';
}
function tradeOpen(){
  var v=S.cur;var others=S.players.map(function(p,i){return i;}).filter(function(i){return i!==v&&!S.players[i].out;});
  tradeDraft={to:others[0],oc:0,rc:0,op:[],rp:[]};renderTradeModal();
}
function tradable(who){return Object.keys(S.own).map(Number).filter(function(k){var o=S.own[k];return o.o===who&&!(SQ[k].t==='prop'&&groupBuilt(S,SQ[k].g));}).sort(function(a,b){return a-b;});}
function renderTradeModal(){
  var d=tradeDraft,v=S.cur;
  var others=S.players.map(function(p,i){return i;}).filter(function(i){return i!==v&&!S.players[i].out;});
  function plist(who,sel,key){var l=tradable(who);if(!l.length)return '<div class="mut">কোনো জায়গা নেই</div>';return l.map(function(k){return '<label><input type="checkbox" '+(sel.indexOf(k)>=0?'checked':'')+' onchange="G.tradeTog(\''+key+'\','+k+')"> <span class="sw" style="background:'+(SQ[k].t==='prop'?GROUPS[SQ[k].g][0]:'#999')+'"></span>'+esc(SQ[k].n)+(S.own[k].mort?' (বন্ধক)':'')+'</label>';}).join('');}
  modalEl.innerHTML='<div class="modalbg"><div class="modal"><h3>বিনিময়ের প্রস্তাব</h3>'+
  '<div class="row" style="margin:8px 0">কার সঙ্গে: <select onchange="G.tradeTo(this.value)">'+others.map(function(i){return '<option value="'+i+'" '+(i===d.to?'selected':'')+'>'+esc(S.players[i].name)+'</option>';}).join('')+'</select></div>'+
  '<div class="cols"><div class="box"><b>আপনি দেবেন</b><div style="margin:6px 0">নগদ ৳ <input type="number" min="0" style="width:90px" value="'+d.oc+'" onchange="G.tradeCash(\'oc\',this.value)"></div>'+plist(v,d.op,'op')+'</div>'+
  '<div class="box"><b>আপনি পাবেন</b><div style="margin:6px 0">নগদ ৳ <input type="number" min="0" style="width:90px" value="'+d.rc+'" onchange="G.tradeCash(\'rc\',this.value)"></div>'+plist(d.to,d.rp,'rp')+'</div></div>'+
  '<p class="mut">বাড়ি/হোটেল থাকা রঙের জায়গা বিনিময় করা যায় না।</p><div class="acts"><button onclick="G.tradeSend()">প্রস্তাব পাঠান</button><button class="alt" onclick="G.close()">বাতিল</button></div></div></div>';
}

// ---------- পালা বদলের সংকেত ----------
function turnAlert(){
  if(!S)return;
  var a=actorOf(S),mine=S.phase!=='over'&&a>=0&&isMe(a);
  if(HOLD||anim){return;}
  document.body.classList.toggle('myturn-on',mine&&multiView());
  if(mine&&(!wasMine||S.cur!==lastCurSeen)){
    try{SFX.myTurn();}catch(e){}
    banner('',multiView()?'আপনার পালা!':S.players[S.cur].name+'-এর পালা',multiView()?'ছক্কা চালান বা সিদ্ধান্ত নিন':'','turnme',1900);
    flashTitle();
  }
  wasMine=mine;lastCurSeen=S.cur;
}
function flashTitle(){
  if(!document.hidden)return;
  var base='জমিদার',on=false;clearInterval(titleTimer);
  titleTimer=setInterval(function(){on=!on;document.title=on?'আপনার পালা! — জমিদার':base;},900);
  var stop=function(){clearInterval(titleTimer);document.title=base;document.removeEventListener('visibilitychange',stop);};
  document.addEventListener('visibilitychange',stop);
}

// ---------- সময়সীমার ঘড়ি ----------
function pad2(n){return (n<10?'০':'')+bn(n);}
function mmss(ms){var t=Math.max(0,Math.ceil(ms/1000));return pad2(Math.floor(t/60))+':'+pad2(t%60);}
function clockInfo(){
  if(!S.limit)return {cls:'off',lbl:'সময়সীমা',val:'নেই',sub:'শেষ জমিদার না থাকা পর্যন্ত খেলা চলবে'};
  if(S.phase==='over')return S.timeUp?{cls:'end',lbl:'সময়',val:'শেষ',sub:'মোট সম্পদে বিজয়ী ঠিক হয়েছে'}:{cls:'off',lbl:'সময়সীমা',val:bn(S.limit)+' মিনিট',sub:'খেলা শেষ'};
  if(!S.endAt){var left=ownableCount()-Object.keys(S.own).length;return {cls:'wait',lbl:'ঘড়ি চালু হবে সব সম্পত্তি বিক্রি হলে',val:bn(S.limit)+' মিনিট',sub:'বিক্রি বাকি: '+bn(left)+'টি'};}
  var rem=S.endAt-Date.now();
  if(rem<=0)return {cls:'end',lbl:'সময় শেষ',val:'০০:০০',sub:S.phase==='roll'?'খেলা থামছে…':'এই দান শেষ হলেই খেলা থামবে'};
  return {cls:rem<=60000?'run low':'run',lbl:'সময় বাকি',val:mmss(rem),sub:'সময় শেষে মোট সম্পদে সেরা জয়ী'};
}
function clockHTML(){var c=clockInfo();return '<div class="clk '+c.cls+'"><div class="cl1">'+c.lbl+'</div><div class="cl2">'+c.val+'</div><div class="cl3">'+c.sub+'</div></div>';}
function clockBox(){return S&&S.limit?'<div class="clockbox" id="clock">'+clockHTML()+'</div>':'';}
function tickClock(){
  if(scr!=='game'||!S)return;
  var el=document.getElementById('clock');if(el)el.innerHTML=clockHTML();
  if(S.limit&&S.endAt&&S.phase!=='over'){
    var rem=S.endAt-Date.now();
    if(rem>0&&rem<=60000&&!clockWarn['m'+S.endAt]){clockWarn['m'+S.endAt]=1;SFX.warn();banner('','এক মিনিট বাকি!','','sm',1800);}
    if(rem>0&&rem<=10000&&!HOLD)SFX.warn();
  }
  maybeTimeUp();
}
function maybeTimeUp(){
  if(!S||S.phase==='over'||!S.limit||!S.endAt||Date.now()<S.endAt)return;
  if(anim||HOLD||S.phase!=='roll')return;
  var late=Date.now()-S.endAt;
  var can=MODE==='local'||(MODE==='online'&&(HOST===UID||(late>10000&&myIdx()>=0)));
  if(!can)return;
  var r=apply(S,S.cur,{type:'timeUp'});if(r.err)return;
  commit(r.s);
}
