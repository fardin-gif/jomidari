// ====== জমিদার — কম্পিউটার খেলোয়াড়ের বুদ্ধি ও সহায়ক পরামর্শ ======
// এই ফাইল ইঞ্জিনের apply() দিয়ে নিজের চাল যাচাই করে, তাই নিয়মের বাইরে কিছু করতে পারে না।

function actorOf(s){
  if(!s||s.phase==='over')return -1;
  if(s.phase==='auction'&&s.auction)return s.auction.turn;
  if(s.phase==='debt'&&s.debt)return s.debt.i;
  if(s.phase==='trade'&&s.trade)return s.trade.to;
  return s.cur;
}
function tryA(s,i,a){var r=apply(s,i,a);return r.err?null:a;}
function nOwned(s,i,g){return GM[g].filter(function(k){return s.own[k]&&s.own[k].o===i;}).length;}
// কোনো জায়গা কিনলে/পেলে i-এর মনোপলি পূর্ণ হবে কি?
function completesSet(s,i,idx){var q=SQ[idx];if(q.t!=='prop')return false;return GM[q.g].every(function(k){return k===idx||(s.own[k]&&s.own[k].o===i);});}
// অন্য কারও মনোপলি আটকানো যাচ্ছে কি?
function blocksSet(s,i,idx){var q=SQ[idx];if(q.t!=='prop')return false;var by={};GM[q.g].forEach(function(k){if(k!==idx&&s.own[k])by[s.own[k].o]=(by[s.own[k].o]||0)+1;});
  return Object.keys(by).some(function(o){return +o!==i&&by[o]===GM[q.g].length-1;});}
function worth(s,i,idx,k){ // জায়গাটির আনুমানিক মূল্য (নিলাম/বিনিময়ের জন্য)
  var q=SQ[idx],v=q.p*(k||1);
  if(completesSet(s,i,idx))v*=1.5;else if(blocksSet(s,i,idx))v*=1.25;
  else if(q.t==='station')v*=1.15;else if(q.t==='util')v*=.85;
  return Math.round(v);
}
function buildCandidates(s,i){
  var out=[];Object.keys(s.own).map(Number).forEach(function(k){var o=s.own[k],q=SQ[k];if(o.o===i&&q.t==='prop'&&o.lvl<5)out.push(k);});
  out.sort(function(a,b){return (s.own[a].lvl-s.own[b].lvl)||(SQ[b].h-SQ[a].h)||(b-a);});
  return out;
}

// ---- কম্পিউটারের চাল ----
// diff: 'easy'|'med'|'hard'
function botPlan(s,i,diff,key){
  diff=diff||'med';var P=BOTS[key]||BOTS.majumdar,p=s.players[i],ph=s.phase;
  var easy=diff==='easy',hard=diff==='hard';
  var res=P.reserve+(hard?-20:0)+(easy?50:0);
  // বাড়ি বানানো (রোল বা পোস্ট ধাপে)
  var tryBuild=function(){
    if(easy&&Math.random()<.5)return null;
    if(Math.random()>P.build+(hard?.2:0))return null;
    var c=buildCandidates(s,i);
    for(var n=0;n<c.length;n++){var q=SQ[c[n]];if(p.cash-q.h<res+ (hard?0:40))continue;var a=tryA(s,i,{type:'build',idx:c[n]});if(a)return a;}
    return null;
  };
  if(ph==='roll'){
    if(p.inJail){
      if(p.fc.length)return {type:'useCard'};
      var late=Object.keys(s.own).length>=8; // শেষ দিকে জেলে থাকাই নিরাপদ
      if(p.cash>350&&!late&&!easy)return {type:'payJail'};
      return {type:'jailRoll'};
    }
    var b=tryBuild();if(b)return b;
    if(p.cash>900){var m=Object.keys(s.own).map(Number).filter(function(k){return s.own[k].o===i&&s.own[k].mort;});
      for(var n=0;n<m.length;n++){var u=tryA(s,i,{type:'unmortgage',idx:m[n]});if(u)return u;}}
    return {type:'roll'};
  }
  if(ph==='buy'){
    var q=SQ[p.pos];
    if(p.cash<q.p)return {type:'auction'};
    var need=res;
    if(completesSet(s,i,p.pos)||blocksSet(s,i,p.pos))need=0;
    else if(q.t==='station')need=Math.max(0,res-80);
    else if(q.t==='util')need=res+40;
    if(easy&&Math.random()<.2)return {type:'auction'};
    if(p.cash-q.p>=need)return {type:'buy'};
    return {type:'auction'};
  }
  if(ph==='auction'){
    var au=s.auction,qa=SQ[au.idx];
    var val=worth(s,i,au.idx)*P.bidK*(easy?(.7+Math.random()*.5):(hard?1.05:1));
    var cap=Math.min(p.cash-(hard?10:40),Math.floor(val));
    var next=au.bid+(au.bid<100?10:(Math.random()<.5?10:20));
    if(next<=cap&&au.hi!==i)return {type:'bid',amt:next};
    return {type:'pass'};
  }
  if(ph==='debt'){
    var d=s.debt;
    if(p.cash>=d.amt)return {type:'payDebt'};
    // টাকা জোগাড়: আগে বাড়ি বেচা, তারপর বন্ধক
    var own=Object.keys(s.own).map(Number).filter(function(k){return s.own[k].o===i;});
    var sells=own.filter(function(k){return s.own[k].lvl>0;}).sort(function(a,b){return s.own[b].lvl-s.own[a].lvl;});
    for(var n=0;n<sells.length;n++){var sa=tryA(s,i,{type:'sell',idx:sells[n]});if(sa)return sa;}
    var mg=own.filter(function(k){return !s.own[k].mort;}).sort(function(a,b){return SQ[a].p-SQ[b].p;});
    for(var m2=0;m2<mg.length;m2++){var ma=tryA(s,i,{type:'mortgage',idx:mg[m2]});if(ma)return ma;}
    return {type:'retire'};
  }
  if(ph==='post'){
    var b2=tryBuild();if(b2)return b2;
    return {type:'endTurn'};
  }
  if(ph==='trade'){
    var t=s.trade,gain=(t.oc-t.rc);
    t.op.forEach(function(k){gain+=worth(s,i,k)*.95;});
    t.rp.forEach(function(k){gain-=worth(s,i,k)*1.05;});
    return {type:gain>=(easy?-40:20)?'accept':'decline'};
  }
  return null;
}
// বটের মুখের কথা — ক্যাটাগরি অনুযায়ী
function botSay(key,cat){var P=BOTS[key];if(!P||!P.say[cat])return null;var l=P.say[cat];return l[Math.floor(Math.random()*l.length)];}
function sayFor(a,key){
  var t=a.type,c=null,pr=.5;
  if(t==='roll'||t==='jailRoll'){c='roll';pr=.3;}
  else if(t==='buy'){c='buy';pr=.7;}
  else if(t==='bid'){c='bid';pr=.45;}
  else if(t==='pass'){c='pass';pr=.5;}
  else if(t==='build'){c='build';pr=.7;}
  else if(t==='payDebt'){c='pay';pr=.6;}
  else if(t==='payJail'||t==='useCard'){c=null;}
  if(!c||Math.random()>pr)return null;
  return botSay(key,c);
}

// ---- সহায়ক মোড: প্রথমবারের ক্রেতার জন্য পরামর্শ ----
// ফেরত: {t: কী করবেন, why: কেন, hl: কোন বাটন জ্বলবে ('roll','buy','auction','endTurn','payDebt','bid','pass','payJail','useCard','jailRoll','build','mortgage')}
function advise(s,i){
  var p=s.players[i],ph=s.phase,own=Object.keys(s.own).map(Number).filter(function(k){return s.own[k].o===i;});
  var bc=buildCandidates(s,i).filter(function(k){return apply(s,i,{type:'build',idx:k}).s;});
  var mono=own.some(function(k){return SQ[k].t==='prop'&&hasMono(s,i,SQ[k].g);});
  if(ph==='roll'){
    if(p.inJail){
      if(p.fc.length)return {t:'আপনার কাছে "মুক্তির কার্ড" আছে — সেটা ব্যবহার করুন!',why:'কার্ডটি কাজে লাগালে বিনা খরচে জেল থেকে বেরোনো যায়, আর টাকাও বাঁচে।',hl:'useCard'};
      if(p.cash>=300)return {t:'৫০ টাকা দিয়ে জেল থেকে বেরিয়ে আসুন।',why:'খেলার শুরুতে বাইরে থাকলে জায়গা কেনার সুযোগ বেশি। আপনার নগদ ভালো আছে, ৫০ টাকা কিছু না।',hl:'payJail'};
      return {t:'ডাবলস পাওয়ার চেষ্টা করুন (ছক্কা চালুন)।',why:'নগদ কম, তাই টাকা না দিয়ে আগে ডাবলসের চেষ্টা করাই ভালো। ৩ বারেও না পেলে ৫০ টাকা দিতেই হবে।',hl:'jailRoll'};
    }
    if(bc.length&&p.cash>=SQ[bc[0]].h+200)return {t:'আগে বাড়ি বানিয়ে নিন! ('+SQ[bc[0]].n+'-এ)',why:'একই রঙের সব জায়গা আপনার, তাই বাড়ি বানাতে পারেন। বাড়ি থাকলে অন্যরা সেখানে এলে অনেক বেশি ভাড়া দেবে। ডান পাশের "আপনার সম্পত্তি"-র + বাটন চাপুন।',hl:'build'};
    return {t:'ছক্কায় ক্লিক করে চাল দিন!',why:'প্রতিবার ছক্কার যোগফল যত, আপনার ঘুঁটি তত ঘর এগোবে।',hl:'roll'};
  }
  if(ph==='buy'){
    var q=SQ[p.pos],left=p.cash-q.p;
    if(p.cash<q.p)return {t:'টাকা কম — "নিলামে তুলুন" চাপুন।',why:'আপনার কাছে '+money(p.cash)+' আছে, কিন্তু দাম '+money(q.p)+'। নিলামে অন্যরাও দাম হাঁকবে, কমে পেলেও পেতে পারেন।',hl:'auction'};
    if(completesSet(s,i,p.pos))return {t:'এটা কিনে ফেলুন — এতে আপনার পুরো রঙ মিলে যাবে!',why:'একই রঙের সব জায়গা একজনের হলে সে বাড়ি বানাতে পারে, আর ভাড়া দ্বিগুণ হয়ে যায়।',hl:'buy'};
    if(left>=150)return {t:'কিনে ফেলুন — '+q.n+' ভালো সম্পত্তি।',why:'জায়গা কিনলে পরে অন্যরা এখানে এলে আপনি ভাড়া পাবেন। কেনার পরও আপনার হাতে '+money(left)+' থাকবে, তাই নিশ্চিন্ত।',hl:'buy'};
    return {t:'নগদ কমে যাবে — "নিলামে তুলুন" ভেবে দেখুন।',why:'কিনলে আপনার হাতে মাত্র '+money(left)+' থাকবে; তখন ভাড়া পড়লে বিপদ হতে পারে। তবু ইচ্ছা হলে কিনতেও পারেন।',hl:'auction'};
  }
  if(ph==='auction'){
    var a=s.auction,qa=SQ[a.idx];
    if(a.turn!==i)return {t:'অন্যদের ডাকার জন্য অপেক্ষা করুন।',why:'নিলামে একে একে সবাই ডাকে। যে সবচেয়ে বেশি ডাকবে, জায়গাটা সে-ই পাবে।',hl:''};
    var cap=Math.min(p.cash-60,Math.floor(qa.p*(completesSet(s,i,a.idx)?1.4:.95)));
    var nx=a.bid+10;
    if(nx<=cap)return {t:'ডাকুন — '+money(nx)+' বা একটু বেশি।',why:'জায়গার আসল দাম '+money(qa.p)+'। এর চেয়ে বেশি দিলে লাভ কম, তাই '+money(cap)+'-এর বেশি ডাকবেন না।',hl:'bid'};
    return {t:'"পাস" করুন।',why:'ডাক এখন '+money(a.bid)+'-এর ওপরে — এ দামে কিনলে লাভ হবে না, নগদও কমে যাবে।',hl:'pass'};
  }
  if(ph==='debt'){
    var d=s.debt;
    if(p.cash>=d.amt)return {t:'এবার "দেনা শোধ করুন" চাপুন।',why:'আপনার কাছে দেনা মেটানোর মতো নগদ আছে।',hl:'payDebt'};
    return {t:'টাকা কম! ডানের "আপনার সম্পত্তি" থেকে কিছু জায়গা বন্ধক রাখুন।',why:'বন্ধক রাখলে ব্যাংক অর্ধেক দাম নগদ দেয়, জায়গা আপনারই থাকে। পরে সামান্য বেশি দিয়ে ছাড়িয়ে নেওয়া যায়। কিছুতেই না হলে "দেউলিয়া ঘোষণা"।',hl:'mortgage'};
  }
  if(ph==='post'){
    if(s.again&&!p.inJail)return {t:'ডাবলস পেয়েছেন! "আবার ছক্কা" চাপুন।',why:'দুটো ছক্কায় একই সংখ্যা এলে আবার দান পাওয়া যায় (পরপর ৩ বার হলে কিন্তু জেল!)।',hl:'endTurn'};
    if(bc.length&&p.cash>=SQ[bc[0]].h+200)return {t:'চাইলে এখন বাড়ি বানাতে পারেন।',why:'আপনার পুরো রঙ আছে। বাড়ি বানালে ভাড়া বহুগুণ বাড়ে।',hl:'build'};
    return {t:'"দান শেষ করুন" চাপুন।',why:'আপনার কাজ শেষ। এবার পরের খেলোয়াড়ের পালা।',hl:'endTurn'};
  }
  if(ph==='trade'&&s.trade&&s.trade.to===i)return {t:'প্রস্তাবটা ভালো করে দেখে সিদ্ধান্ত নিন।',why:'যা পাচ্ছেন আর যা দিচ্ছেন — তুলনা করুন। নিজের পুরো রঙ মিললে বা ভালো টাকা পেলে মেনে নিতে পারেন।',hl:''};
  return null;
}
