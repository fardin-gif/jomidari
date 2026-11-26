// ====== জমিদার — হোম, লবি, সেটআপ পাতা ======
function render(){
  if(scr==='home')renderHome();
  else if(scr==='join')renderJoin();
  else if(scr==='setup')renderSetup();
  else if(scr==='hot')renderHot();
  else if(scr==='lobby')renderLobby();
  else{renderGame();if(tradeDraft)renderTradeModal();}
}
// ধনী হবার মজার খেলা — লোগো (xl = হোম, sm = উপরের বার, bd = বোর্ডের মাঝে)
var LOGOOK=null;
function logoHTML(v){
  if(LOGOOK===true)return '<img class="lgimg lgimg-'+v+'" src="/assets/logo-horizontal.png" alt="ধনী হবার মজার খেলা" draggable="false">';
  return logoCSS(v);
}
function logoCSS(v){
  if(v==='sm')return '<span class="lg lg-sm"><span class="cn"></span><span class="dh">ধনী</span><span class="hb2">হবার মজার খেলা</span></span>';
  return '<div class="lg lg-'+v+'" role="img" aria-label="ধনী হবার মজার খেলা"><span class="l1"><span class="cn"></span><span class="dh">ধনী</span><span class="hb">হবার</span><span class="dc"></span></span><span class="rb">মজার খেলা</span></div>';
}
function topbar(){
  var inGame=scr==='game'||scr==='lobby';
  return '<div class="top"><div class="brand" onclick="G.home()">'+logoHTML('sm')+'</div><div class="row">'+
    (MODE==='online'&&CODE?'<span class="tag">ঘর: '+esc(CODE)+'</span>':(MODE==='local'&&scr==='game'?'<span class="tag">'+(setup.bots.length&&S&&S.players.some(function(p){return p.bot;})?'কম্পিউটারের সাথে':'একই ডিভাইস')+'</span>':''))+
    (LEVEL&&scr==='game'&&MODE==='local'?'<button class="sm alt" onclick="G.level()" title="স্তর বদলান">'+levelName(LEVEL)+'</button>':'')+
    '<button class="sm alt" onclick="G.sound()" title="সাউন্ড সেটিং">'+(muted?'🔇':'🔊')+'</button>'+
    (WATCH&&scr==='game'?'<span class="tag">👁️ দর্শক</span>':'')+(inGame?'<button class="sm alt" onclick="G.leave()">Home</button>':'')+'</div></div>';
}
function avPicker(){
  return '<div class="avgrid">'+HUMAN_AV.map(function(k){return '<button class="'+(k===MYAV?'on':'')+'" onclick="G.pickAv(\''+k+'\')" title="অবতার">'+avatar(k,52)+'</button>';}).join('')+'</div>';
}

// ---------- হোম ----------
var RULES=[
[' খেলার লক্ষ্য','<ul><li>সবাই <b>৳১৫০০</b> নিয়ে শুরু করে। জায়গা কিনুন, ভাড়া আদায় করুন, বাড়ি-হোটেল বানান।</li><li>যে সবাইকে দেউলিয়া করে শেষ পর্যন্ত টিকে থাকবে, সে-ই <b>জমিদার</b>!</li></ul>'],
[' নিজের দানে কী করবেন','<ul><li>ছক্কায় ক্লিক করুন। দুটো ছক্কার যোগফল যত, ঘুঁটি তত ঘর এগোবে।</li><li>"যাত্রা শুরু" পার হলেই <b>৳২০০</b> পাবেন।</li><li><b>ডাবলস</b> (দুটোতেই এক সংখ্যা) এলে আবার দান পাবেন। কিন্তু পরপর ৩ বার ডাবলস এলে সোজা জেলে!</li></ul>'],
[' জায়গা কেনা ও নিলাম','<ul><li>খালি জায়গায় থামলে দাম দিয়ে কিনতে পারেন।</li><li>না কিনলে জায়গাটি <b>নিলামে</b> ওঠে — সবাই একে একে দাম হাঁকে, সবচেয়ে বেশি ডাকে যে সে-ই পায়। ডাকতে না চাইলে "পাস" করুন।</li></ul>'],
[' ভাড়া','<ul><li>অন্যের জায়গায় থামলে মালিককে ভাড়া দিতে হবে। জায়গার পাতা (ঘরে ক্লিক করলে) ভাড়ার তালিকা দেখায়।</li><li>একই রঙের সব জায়গা একজনের হলে ভাড়া <b>দ্বিগুণ</b>।</li><li>স্টেশন যত বেশি, ভাড়া তত বেশি (২৫  ৫০  ১০০  ২০০)।</li><li>বিদ্যুৎ/পানি: ভাড়া = ছক্কার যোগফল × ৪ (দুটো থাকলে × ১০)।</li></ul>'],
[' বাড়ি ও হোটেল','<ul><li>এক রঙের <b>সব</b> জায়গা পেলে সেখানে বাড়ি বানানো যায় (সমানভাবে — এক জায়গায় ৪টা, অন্যটায় ০ চলবে না)।</li><li>৪টি বাড়ির পর ৫ম ধাপে <b>হোটেল</b>। ব্যাংকে মোট ৩২টি বাড়ি ও ১২টি হোটেল আছে।</li><li>বাড়ি/হোটেল যত বেশি, ভাড়া তত আকাশছোঁয়া!</li></ul>'],
[' জেলখানা','<ul><li>"জেলে যান" ঘরে থামলে, ভাগ্য কার্ডে বা ৩ বার ডাবলসে জেলে যেতে হয়।</li><li>বের হওয়ার উপায়: ডাবলস ছক্কা (৩ বার চেষ্টা), ৳৫০ জরিমানা, অথবা "মুক্তির কার্ড"।</li><li>জেলে থেকেও ভাড়া আদায় করা যায়।</li></ul>'],
[' বন্ধক ও বিনিময়','<ul><li>টাকা কম পড়লে জায়গা <b>বন্ধক</b> রাখুন — ব্যাংক অর্ধেক দাম দেবে। ছাড়াতে লাগবে অর্ধেক দাম + ১০%। বন্ধকী জায়গায় ভাড়া মেলে না।</li><li>অন্য খেলোয়াড়ের সাথে জায়গা ও টাকা <b>বিনিময়</b> করা যায়। বাড়ি-ওঠা রঙের জায়গা বিনিময় চলে না।</li></ul>'],
[' দেউলিয়া ও জেতা','<ul><li>দেনা মেটাতে না পারলে আপনি দেউলিয়া — সব সম্পত্তি পাওনাদারের (বা ব্যাংকের)।</li><li>শেষ পর্যন্ত যে একা টিকে থাকে সে জমিদার! </li></ul>']
];
var FAQ=[
['এটা কি বিনা পয়সায় খেলা যায়?','হ্যাঁ, পুরোপুরি বিনামূল্যে। কোনো লগইন বা অ্যাপ ইনস্টল লাগে না।'],
['বন্ধুদের সাথে খেলব কীভাবে?','"বন্ধুদের সাথে অনলাইনে" চাপুন, ঘর বানান, তারপর লিংকটি WhatsApp বা মেসেঞ্জারে পাঠান। বন্ধু লিংকে ঢুকে নাম দিলেই যোগ দিতে পারবে — কোনো কোড টাইপ করতে হবে না।'],
['খেলার মাঝে নেট চলে গেলে কী হবে?','একই ব্রাউজারে লিংকটি আবার খুললে আপনি আগের জায়গা থেকেই ফিরে আসবেন। কেউ ৯০ সেকেন্ডের বেশি নিষ্ক্রিয় থাকলে হোস্টের পক্ষ থেকে অটোপাইলটে তার দান খেলা হবে, যাতে সবার খেলা আটকে না যায়।'],
['কম্পিউটার চরিত্ররা কারা?','মজুমদার সাহেব, রহিমা বেগম, ফটিক চাঁদ, কানাই বাবু ও নাজমা খালা। প্রত্যেকের খেলার ধরন আলাদা। মজুমদার সাহেব সবচেয়ে ধূর্ত — সাবধান!'],
['"প্রথমবার ক্রেতা" মানে কী?','আপনি খেলায় নতুন হলে এই স্তর বেছে নিন — প্রতিটি দানে একজন সহায়ক বলে দেবে কী করা ভালো আর কেন। অভিজ্ঞ হলে "উদ্যোক্তা" বা "জমিদার" বেছে নিন, তখন সহায়ক থাকবে না।']
];
function renderHome(){
  var saved=lsGet('jm_code');
  var online=DB&&UID;
  var h=topbar()+'<div class="wrapc">';
  h+='<div class="hero"><span class="floaty" style="left:6%;top:30px">🪙</span><span class="floaty" style="right:7%;top:50px;animation-delay:1s">🏠</span><span class="floaty" style="left:14%;top:150px;animation-delay:2s">🎲</span><span class="floaty" style="right:14%;top:170px;animation-delay:1.5s">🏨</span>'+
    ''+logoHTML('xl')+''+
    '<p>জমি কিনুন, ভাড়া আদায় করুন, দালানকোঠা তুলুন — আর হয়ে উঠুন গ্রামবাংলার সেরা <b>জমিদার</b>! </p>'+
    '<div class="namebox"><button class="avpick" onclick="G.avModal()" title="অবতার বদলান">'+avatar(MYAV,64)+'</button><input id="nm" placeholder="আপনার নাম লিখুন" maxlength="14" value="'+esc(NAME)+'" oninput="NAME=this.value"></div>'+
    '</div>';
  h+='<div class="modes">'+
   '<div class="mode c1"><div class="ic">🧑‍🤝‍🧑</div><h3>বন্ধুদের সাথে অনলাইনে</h3><p>ঘর বানিয়ে লিংক পাঠান। যে যার ফোন/কম্পিউটারে খেলুন — কোড লাগবে না!</p>'+
     (online?'<button class="big" onclick="G.createAsk()">ঘর বানান </button>'+(saved?'<button class="alt sm" onclick="G.rejoin()">আগের ঘরে ফিরুন ('+esc(saved)+')</button>':'')+'<div class="mut" style="margin-top:10px">কোড দিয়ে যোগ দিন</div><div class="codejoin" style="margin-top:4px"><input id="jc" placeholder="ঘরের কোড" maxlength="8" onkeydown="if(event.key===\'Enter\')G.joinCode()"><button class="sm" onclick="G.joinCode()">যোগ দিন</button></div>':'<div class="mut">'+esc(dbMsg||'অনলাইন সংযোগ প্রস্তুত হচ্ছে…')+'</div>')+'</div>'+
   '<div class="mode c2"><div class="ic">🤖</div><h3>কম্পিউটারের সাথে</h3><p>মজুমদার সাহেব ও তাঁর বন্ধুদের হারাতে পারবেন? একাই খেলুন, যেকোনো সময়।</p><button class="big gold" onclick="G.vsCom()">খেলুন </button></div>'+
   '<div class="mode c3"><div class="ic">📱</div><h3>একই ডিভাইসে</h3><p>একটাই ফোন বা ল্যাপটপ — পালা করে খেলুন, পরিবারের সবাই মিলে।</p><button class="big alt" onclick="G.hot()">শুরু করুন</button></div>'+
  '</div>';
  h+=liveBoxHTML();
  h+='<div class="sec"><h2>৬০ সেকেন্ডে শিখে নিন</h2><div class="sub">চারটা ধাপেই খেলা বোঝা শেষ!</div><div class="steps">'+
   '<div class="step"><span class="n">১</span><div class="e">🎲</div><b>ছক্কা চালুন</b><span>বোর্ডের ছক্কায় ক্লিক করুন, ঘুঁটি এগোবে</span></div>'+
   '<div class="step"><span class="n">২</span><div class="e">🏷️</div><b>জায়গা কিনুন</b><span>খালি জায়গা পেলে কিনুন, নইলে নিলাম</span></div>'+
   '<div class="step"><span class="n">৩</span><div class="e">💰</div><b>ভাড়া আদায় করুন</b><span>অন্য কেউ আপনার জায়গায় এলে ভাড়া পাবেন</span></div>'+
   '<div class="step"><span class="n">৪</span><div class="e">🏨</div><b>দালান তুলুন</b><span>একই রঙ মেলালে বাড়ি-হোটেল বানান</span></div></div></div>';
  h+='<div class="sec"><h2>খেলার নিয়ম</h2><div class="sub">ক্লিক করে খুলুন</div>'+RULES.map(function(r,i){return '<details class="acc"'+(i===0?' open':'')+'><summary>'+r[0]+'</summary><div class="bd">'+r[1]+'</div></details>';}).join('')+'</div>';
  h+='<div class="sec"><h2>আপনার প্রতিপক্ষরা</h2><div class="sub">একেকজনের খেলার ধরন একেক রকম</div><div class="chars">'+BOT_ORDER.map(function(k){var b=BOTS[k];return '<div class="chrm">'+avatar(k,84)+'<b>'+b.name+'</b><span class="mut">'+b.title+'</span><div style="font-size:13px;margin-top:3px">'+b.blurb+'</div></div>';}).join('')+'</div></div>';
  h+='<div class="sec"><h2>সাধারণ প্রশ্ন</h2>'+FAQ.map(function(q){return '<details class="acc"><summary>'+q[0]+'</summary><div class="bd">'+q[1]+'</div></details>';}).join('')+'</div>';
  h+='<div class="credit"><span class="cr-heart">💛</span> <span>Developed by</span> <span class="team" tabindex="0" onclick="this.classList.toggle(\'open\')">Team Chankharpool<span class="tpop"><span class="tr"><small>Vibe Coded By</small><a href="https://www.facebook.com/fardin.0112" target="_blank" rel="noopener">Fardin Hossain</a></span><span class="tr"><small>Ideation by</small><a href="https://www.facebook.com/tawkir.hossain.16" target="_blank" rel="noopener">Tawkir Hossain</a></span><span class="tr"><small>Ideation by</small><a href="https://www.facebook.com/a.is.mahi" target="_blank" rel="noopener">Ashraful Islam</a></span></span></span></div><div class="foot"><div> <b>ধনী হবার মজার খেলা</b> — jomidar.fun</div><div style="margin:6px 0"><a onclick="G.legal(\'p\')">গোপনীয়তা নীতি</a> • <a onclick="G.legal(\'t\')">ব্যবহারের শর্ত</a></div><div>এটি একটি স্বাধীন বাংলা বোর্ড গেম; কোনো বিদেশি বোর্ড গেম বা ব্র্যান্ডের সাথে এর সম্পর্ক নেই।</div></div>';
  h+='</div>';
  app.innerHTML=h;
  if(!NAME&&!modalEl.innerHTML)nameModal();
}
function levelCards(sel,fn){
  var L=[['new','🌱','প্রথমবার ক্রেতা','আমি নতুন — প্রতি ধাপে বলে দিন কী করব'],['ent','💼','উদ্যোক্তা','মোটামুটি জানি — নিজে খেলব, একটু ঠেকলে নিয়ম দেখব'],['zam','👑','জমিদার','পাকা খেলোয়াড় — কোনো সাহায্য লাগবে না!']];
  return '<div class="lvls">'+L.map(function(l){return '<div class="lvl'+(sel===l[0]?' on':'')+'" onclick="'+fn+'(\''+l[0]+'\')"><div class="e">'+l[1]+'</div><b>'+l[2]+'</b><span>'+l[3]+'</span></div>';}).join('')+'</div>';
}
function levelModal(first){
  modalEl.innerHTML='<div class="modalbg"><div class="modal" style="max-width:720px"><h2 style="text-align:center;font-size:26px">'+(first?'স্বাগতম! ':'আপনার স্তর বাছুন')+'</h2><p style="text-align:center">'+(first?'আসুন! ধনী হবার মজার খেলায় আপনাকে স্বাগতম! আগে বলুন, আপনি এই খেলায় কেমন?':'যেকোনো সময় বদলাতে পারবেন।')+'</p>'+levelCards(LEVEL,'G.setLevel')+'</div></div>';
}
function setLevel(l){
  LEVEL=l;lsSet('jm_level',l);setup.diff={new:'easy',ent:'med',zam:'hard'}[l];
  modalEl.innerHTML='';render();
  toast(l==='new'?'ঠিক আছে! খেলার মাঝে আমি পরামর্শ দেব ':(l==='ent'?'দারুণ! নিজের মতো খেলুন ':'জমিদারি চাল দেখাতে প্রস্তুত! '));
}

// ---------- সময়সীমা বাছাই (হোস্ট) ----------
function limitPicker(){
  var L=setup.limit,pre=(L===20||L===30);
  return '<div class="seg limseg">'+[[20,'২০ মিনিট'],[30,'৩০ মিনিট']].map(function(x){return '<button class="'+(L===x[0]?'on':'')+'" onclick="G.setLimit('+x[0]+')">'+x[1]+'</button>';}).join('')+
    '<span class="limin'+(L>0&&!pre?' on':'')+'"><input type="number" min="5" max="600" placeholder="নিজে লিখুন" value="'+(L>0&&!pre?L:'')+'" onchange="G.setLimit(this.value)"> মিনিট</span>'+
    '<button class="'+(L===0?'on':'')+'" onclick="G.setLimit(0)">সীমাহীন</button></div>'+
    '<div class="mut" style="margin-top:6px">'+(L>0?'সব সম্পত্তি বিক্রি হলে পর্দায় '+bn(L)+' মিনিটের ঘড়ি চালু হবে। সময় শেষে যার মোট সম্পদ (নগদ + সম্পত্তি + বাড়ি-হোটেল) সবচেয়ে বেশি, সে-ই জমিদার।':'কোনো সময়সীমা নেই — একজন ছাড়া সবাই দেউলিয়া না হওয়া পর্যন্ত খেলা চলবে।')+'</div>';
}
function limitText(m){return m>0?bn(m)+' মিনিট (সব সম্পত্তি বিক্রি হলে ঘড়ি চালু)':'সীমাহীন';}

// ---------- কম্পিউটারের সাথে: সেটআপ ----------
function renderSetup(){
  var h=topbar()+'<div class="wrapc" style="max-width:860px"><div class="card" style="margin-top:16px"><h2>কম্পিউটারের সাথে খেলুন</h2><p class="mut">স্তর, প্রতিপক্ষ ও কঠিনতা বেছে নিন।</p>';
  h+='<h3>১. আপনি কেমন খেলোয়াড়?</h3><p class="mut" style="margin:0 0 8px">প্রথমবার ক্রেতা বাছলে খেলার মাঝে প্রতিটি ধাপে পরামর্শ পাবেন।</p>'+levelCards(LEVEL,'G.setLevel2');
  h+='<hr class="hr"><h3>২. প্রতিপক্ষ বাছুন <span class="mut">(১–৭ জন)</span></h3><div class="cpick">'+BOT_ORDER.map(function(k){var b=BOTS[k],on=setup.bots.indexOf(k)>=0;return '<div class="cp'+(on?' on':'')+(k==='majumdar'?' star':'')+'" onclick="G.togBot(\''+k+'\')">'+avatar(k,76)+'<b>'+b.name+'</b><small>'+b.title+'</small><small>'+b.blurb+'</small></div>';}).join('')+'</div>';
  h+='<hr class="hr"><h3>৩. কম্পিউটার কত চালাক?</h3><div class="seg">'+[['easy',' সহজ'],['med',' মাঝারি'],['hard',' কঠিন']].map(function(d){return '<button class="'+(setup.diff===d[0]?'on':'')+'" onclick="G.setDiff(\''+d[0]+'\')">'+d[1]+'</button>';}).join('')+'</div>';
  h+='<hr class="hr"><h3>৪. খেলা কতক্ষণ চলবে?</h3>'+limitPicker();
  h+='<hr class="hr"><div class="row" style="justify-content:space-between"><div class="row">'+avatar(MYAV,44)+'<b>'+esc(NAME||'আপনি')+'</b><button class="sm alt" onclick="G.avModal()">অবতার</button></div><div class="acts" style="margin:0"><button class="alt" onclick="G.home()">ফিরে যান</button><button class="big gold" onclick="G.startCom()">খেলা শুরু </button></div></div></div></div>';
  app.innerHTML=h;
}

// ---------- একই ডিভাইস ----------
var hotNames=[];
function renderHot(){
  var n=setup.hot,h=topbar()+'<div class="wrapc" style="max-width:640px"><div class="card" style="margin-top:16px"><h2>একই ডিভাইসে পালা করে</h2><div class="row" style="margin:10px 0">কতজন খেলবেন? <div class="seg">'+[2,3,4,5,6,7,8,9,10].map(function(k){return '<button class="'+(k===n?'on':'')+'" onclick="G.hotN('+k+')">'+bn(k)+'</button>';}).join('')+'</div></div><div id="locnames">';
  for(var i=0;i<n;i++)h+='<div class="row" style="margin:6px 0">'+avatar(HUMAN_AV[i],40)+'<input class="ln" maxlength="14" placeholder="খেলোয়াড় '+bn(i+1)+'" value="'+esc(hotNames[i]||'')+'" oninput="hotNames['+i+']=this.value"></div>';
  h+='</div><h3 style="margin-top:12px">খেলা কতক্ষণ চলবে?</h3>'+limitPicker()+'<div class="acts"><button class="alt" onclick="G.home()">ফিরে যান</button><button class="big gold" onclick="G.startHot()">খেলা শুরু </button></div></div></div>';
  app.innerHTML=h;
}

// ---------- লিংক ধরে আসা বন্ধুর পাতা ----------
function renderJoin(){
  if(!DB){app.innerHTML=topbar()+'<div class="wrapc" style="max-width:560px"><div class="card" style="margin-top:22px;text-align:center"><div style="font-size:50px">🏰</div><h2>ধনী হবার মজার খেলা-য় আপনাকে ডাকা হয়েছে!</h2><p>'+esc(dbMsg||'সংযোগ হচ্ছে… একটু অপেক্ষা করুন')+'</p><div class="acts" style="justify-content:center"><button class="alt" onclick="G.home()">হোমে যান</button></div></div></div>';return;}
  var ok=roomExists&&!roomExists.started,gone=roomExists===false,running=roomExists&&roomExists.started;
  var h=topbar()+'<div class="wrapc" style="max-width:560px"><div class="card" style="margin-top:22px;text-align:center"><div style="font-size:50px">🏰</div><h2>ধনী হবার মজার খেলা-য় আপনাকে ডাকা হয়েছে!</h2>';
  if(gone)h+='<p>দুঃখিত, এই ঘরটি আর নেই বা লিংকে ভুল আছে। </p><div class="acts" style="justify-content:center"><button onclick="G.home()">হোমে যান</button></div>';
  else{
    h+='<p>'+(roomExists&&roomExists.hostName?'<b>'+esc(roomExists.hostName)+'</b> আপনাকে খেলতে ডেকেছেন।':'বন্ধুরা আপনার অপেক্ষায়।')+(running?' <span class="mut">(খেলা শুরু হয়ে গেছে — আগে থেকে থাকলে ফিরে আসবেন, নইলে দর্শক হয়ে দেখতে পারবেন)</span>':'')+'</p>'+
    '<div class="namebox"><button class="avpick" onclick="G.avModal()">'+avatar(MYAV,64)+'</button><input id="nm" placeholder="আপনার নাম লিখুন" maxlength="14" value="'+esc(NAME)+'" oninput="NAME=this.value" onkeydown="if(event.key===\'Enter\')G.joinLink()"></div>'+
    '<div class="acts" style="justify-content:center"><button class="big gold" onclick="G.joinLink()">'+(running?'ঢুকুন ':'যোগ দিন ')+'</button></div>';
  }
  app.innerHTML=h+'</div></div>';
}

// ---------- লবি ----------
function renderLobby(){
  var host=HOST===UID,link=shareLink(CODE),cnt=lobbyPlayers.length+lobbyBots.length;
  var h=topbar()+'<div class="wrapc" style="max-width:700px"><div class="card" style="margin-top:16px"><h2>ঘর তৈরি! <span class="codebox">'+esc(CODE)+'</span></h2>'+
  '<p>এই লিংকটি বন্ধুদের পাঠান — লিংকে ঢুকে নাম দিলেই তারা যোগ দিতে পারবে। চাইলে কোডটি (<b>'+esc(CODE)+'</b>) বললেও হবে — হোম পেজে "কোড দিয়ে যোগ দিন"-এ লিখলেই ঢুকবে।</p>'+
  '<div class="linkbox"><code id="lnk">'+esc(link)+'</code><button class="sm" onclick="G.copy()">কপি</button>'+(navigator.share?'<button class="sm gold" onclick="G.share()">শেয়ার</button>':'')+'<a href="https://wa.me/?text='+encodeURIComponent('ধনী হবার মজার খেলা খেলতে আসুন!  '+link)+'" target="_blank" rel="noopener"><button class="sm" style="background:#25d366">WhatsApp</button></a></div>'+
  '<div style="margin-top:12px">'+voiceCardHTML()+'</div>'+
  '<h3 style="margin-top:14px">খেলোয়াড় ('+bn(cnt)+'/'+bn(MAXP)+')</h3>'+
  lobbyPlayers.map(function(p,i){return '<div class="pl"><div class="avw">'+avatar(p.av||'h1',44)+'<span class="dot" style="background:'+COLORS[i%10]+'"></span></div><span class="nmx">'+esc(p.name)+'</span>'+(p.uid===HOST?' <span class="mut">(হোস্ট)</span>':'')+(p.uid===UID?' <span class="mut">(আপনি)</span>':'')+'</div>';}).join('')+
  lobbyBots.map(function(k,j){var b=BOTS[k];return '<div class="pl"><div class="avw">'+avatar(k,44)+'<span class="dot" style="background:'+COLORS[(lobbyPlayers.length+j)%10]+'"></span></div><span class="nmx">'+b.name+'</span> <span class="mut">(কম্পিউটার)</span>'+(host?' <button class="sm warn" onclick="G.rmBot(\''+k+'\')">সরান</button>':'')+'</div>';}).join('');
  if(host){
    h+='<hr class="hr"><h3>ঘরের ধরন</h3><div class="seg"><button class="'+(!ROOMPUB?'on':'')+'" onclick="G.setPub(false)">🔒 প্রাইভেট</button><button class="'+(ROOMPUB?'on':'')+'" onclick="G.setPub(true)">🌐 পাবলিক</button></div>';
    h+='<h3 style="margin-top:12px">কম্পিউটার চরিত্র যোগ করুন <span class="mut">(ইচ্ছা হলে)</span></h3><div class="row">'+BOT_ORDER.filter(function(k){return lobbyBots.indexOf(k)<0;}).map(function(k){return '<button class="sm alt" onclick="G.addBot(\''+k+'\')">'+avatar(k,26)+' '+BOTS[k].name+'</button>';}).join('')+'</div>'+
    '<h3 style="margin-top:12px">কম্পিউটার কত চালাক?</h3><div class="seg">'+[['easy',' সহজ'],['med',' মাঝারি'],['hard',' কঠিন']].map(function(d){return '<button class="'+(setup.diff===d[0]?'on':'')+'" onclick="G.setDiff(\''+d[0]+'\')">'+d[1]+'</button>';}).join('')+'</div>';
    h+='<h3 style="margin-top:12px">খেলা কতক্ষণ চলবে?</h3>'+limitPicker();
  }else h+='<hr class="hr"><div><b>খেলার সময়:</b> '+limitText(lobbyLimit)+'</div>';
  if(host&&SLOTW)h+='<div class="lnote warn" style="margin-top:12px">⏳ সব রুম ব্যস্ত — রুম খালি হলেই খেলা নিজে থেকে শুরু হবে। লবিতেই থাকুন। <button class="sm alt" onclick="G.slotCancel()">বাতিল</button></div>';
  else if(host&&LIVE&&LIVE.n>=LIM.rooms)h+='<div class="lnote warn" style="margin-top:12px">এখন সব রুম ব্যস্ত ('+bn(LIVE.n)+'/'+bn(LIM.rooms)+') — "শুরু করুন" চাপলে অপেক্ষার সুযোগ পাবেন।</div>';
  h+='<div class="acts">'+(host?'<button class="big gold" onclick="G.start()" '+(cnt<2?'disabled':'')+'>খেলা শুরু করুন </button>':'<span class="mut"> হোস্ট খেলা শুরু করার অপেক্ষায়…</span>')+'<button class="alt" onclick="G.leave()">বের হন</button></div></div></div>';
  app.innerHTML=h;
}

// ---------- মডাল: অবতার, আইন ----------
function nameModal(){
  modalEl.innerHTML='<div class="modalbg"><div class="modal" style="max-width:460px;text-align:center"><h2 style="font-size:26px">স্বাগতম!</h2><p>আপনার নাম আর পছন্দের অবতার বাছুন। এটি এই ডিভাইসে মনে রাখা হবে, পরের বার আর জিজ্ঞেস করব না।</p>'+avPicker()+
  '<input id="nm0" placeholder="আপনার নাম লিখুন" maxlength="14" style="width:80%" onkeydown="if(event.key===\'Enter\')G.saveName()"><div class="acts" style="justify-content:center"><button class="big gold" onclick="G.saveName()">শুরু করুন</button></div></div></div>';
  setTimeout(function(){var e=document.getElementById('nm0');if(e)e.focus();},50);
}
function presHTML(){
  var now=Date.now(),act=PRES.filter(function(p){return now-(p.seen||0)<PRES_WIN;});
  if(!act.length)return '';
  var pu={};if(S)S.players.forEach(function(p){if(p.uid)pu[p.uid]=1;});
  return '<h3>এখন লিংকে আছেন: '+bn(act.length)+' জন</h3><div class="pres">'+act.map(function(p){return '<span class="pchip">'+avatar(p.av||'h1',22)+esc(p.name)+(pu[p.uid]?'':' <small>(দর্শক)</small>')+'</span>';}).join('')+'</div>';
}
function avModal(){modalEl.innerHTML='<div class="modalbg" onclick="G.close()"><div class="modal" style="max-width:460px" onclick="event.stopPropagation()"><h3 style="text-align:center">আপনার অবতার বাছুন</h3>'+avPicker()+'<div class="acts" style="justify-content:center"><button onclick="G.close()">ঠিক আছে</button></div></div></div>';}
function legalModal(k){
  var t=k==='p'?'গোপনীয়তা নীতি':'ব্যবহারের শর্ত';
  var b=k==='p'?'<ul><li>আমরা আপনার নাম/ইমেইল/ফোন নম্বর সংগ্রহ করি না। অনলাইন খেলায় Firebase-এর "নামহীন (anonymous) পরিচয়" ব্যবহার হয়।</li><li>আপনার দেওয়া খেলার নাম ও অবতার শুধু ওই ঘরের খেলোয়াড়দের দেখানোর জন্য সংরক্ষিত হয়।</li><li>আপনার ব্রাউজারে শুধু নাম, স্তর ও সাউন্ড-সেটিংস মনে রাখা হয়।</li><li>বিজ্ঞাপন বা ট্র্যাকিং কুকি ব্যবহার করা হয় না।</li></ul>':'<ul><li>ধনী হবার মজার খেলা একটি বিনোদনমূলক খেলা; এখানে কোনো আসল টাকার লেনদেন নেই।</li><li>অন্যদের সাথে ভদ্র আচরণ করুন; অশালীন নাম ব্যবহার করবেন না।</li><li>খেলাটি "যেমন আছে তেমন" দেওয়া হয়; সার্ভার সাময়িক বন্ধ থাকতে পারে।</li></ul>';
  modalEl.innerHTML='<div class="modalbg" onclick="G.close()"><div class="modal" onclick="event.stopPropagation()"><h3>'+t+'</h3>'+b+'<div class="acts"><button onclick="G.close()">বন্ধ করুন</button></div></div></div>';
}

function soundModal(){
  var pc=function(v){return Math.round(v*100);};
  modalEl.innerHTML='<div class="modalbg" onclick="if(event.target===this)G.close()"><div class="modal" style="max-width:420px"><h2>সাউন্ড সেটিং</h2>'+
  '<label class="srow">মোট আওয়াজ <input type="range" min="0" max="100" value="'+pc(VOL)+'" oninput="G.vol(this.value)"></label>'+
  '<label class="srow">ছক্কা ও ঘুঁটির ধুপধাপ <input type="range" min="0" max="100" value="'+pc(DICEV)+'" oninput="G.dvol(this.value)"></label>'+
  '<label class="srow">সমর্থনের টুংটাং <input type="checkbox" '+(CHEERSND?'checked':'')+' onchange="G.csnd(this.checked)"></label>'+
  '<div class="acts"><button class="alt" onclick="G.mute();G.sound()">'+(muted?'সব শব্দ চালু করুন':'সব শব্দ বন্ধ করুন')+'</button><button onclick="G.close()">ঠিক আছে</button></div></div></div>';
}

// ---------- চলমান খেলা (পাবলিক ঘরের তালিকা ও রুমের অবস্থা) ----------
function liveBoxHTML(){
  if(!DB||!UID)return '';
  var L=LIVE;
  if(!L)return '<div class="sec live" id="livebox"><h2>🔴 এখন চলছে</h2><div class="mut">লোড হচ্ছে…</div></div>';
  var ks=Object.keys(L.rooms),full=L.n>=LIM.rooms,dayFull=L.g>=LIM.perDay,dots='';
  for(var i=0;i<LIM.rooms;i++)dots+='<i class="dot'+(i<L.n?' on':'')+'"></i>';
  var pubs=ks.filter(function(k){return L.rooms[k].pub;}).sort(function(a,b){return (L.rooms[b].st||0)-(L.rooms[a].st||0);});
  var h='<div class="sec live" id="livebox"><h2>🔴 এখন চলছে</h2><div class="slots">'+dots+'<span>'+bn(L.n)+'/'+bn(LIM.rooms)+' রুম ব্যস্ত</span><button class="sm alt" onclick="G.liveRefresh()" title="আবার দেখুন">🔄</button></div>';
  if(dayFull)h+='<div class="lnote warn">আজকের অনলাইন খেলার সীমা পূর্ণ — নতুন অনলাইন খেলা শুরু হবে না, তবে নিচের খেলা দেখতে পারেন। কম্পিউটারের সাথে খেলা চালু আছে।</div>';
  else if(full)h+='<div class="lnote warn">এই মুহূর্তে সব রুম ব্যস্ত — নতুন খেলা শুরু করতে একটু অপেক্ষা করতে হতে পারে। ততক্ষণ চলমান খেলা দেখুন!</div>';
  else h+='<div class="lnote">রুম খালি আছে — ঘর বানিয়ে বন্ধুদের ডাকুন।</div>';
  if(pubs.length){
    h+='<div class="lrooms">'+pubs.map(function(k){var r=L.rooms[k],m=Math.max(1,Math.round((Date.now()-(r.st||Date.now()))/60000));
      return '<div class="lr"><div class="lri"><b>'+esc(r.h||'একটি ঘর')+'-এর ঘর</b><span class="mut">'+bn(r.n||0)+' জন খেলছে • '+bn(m)+' মিনিট আগে শুরু</span></div><button class="sm" onclick="G.watch(\''+k+'\')">👁️ দেখুন</button></div>';}).join('')+'</div>';
  }else h+='<div class="mut" style="margin-top:6px">এখন কোনো পাবলিক খেলা চলছে না।</div>';
  return h+'</div>';
}
function createModal(){
  modalEl.innerHTML='<div class="modalbg" onclick="if(event.target===this)G.close()"><div class="modal" style="max-width:520px;text-align:center"><h2>কেমন ঘর বানাবেন?</h2><div class="pubpick">'+
  '<button onclick="G.create(false)"><span class="e">🔒</span><b>প্রাইভেট</b><small>শুধু লিংক/কোড যাদের কাছে আছে তারাই ঢুকবে। তালিকায় দেখা যাবে না।</small></button>'+
  '<button onclick="G.create(true)"><span class="e">🌐</span><b>পাবলিক</b><small>খেলা শুরু হলে সবাই তালিকায় দেখে দর্শক হতে পারবে (প্রথম চাল পর্যন্ত চাইলে যোগও দিতে পারবে)।</small></button></div>'+
  '<div class="acts" style="justify-content:center"><button class="alt" onclick="G.close()">থাক</button></div></div></div>';
}
