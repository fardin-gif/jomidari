// ====== জমিদার — গেম ইঞ্জিন (pure logic) ======
var COLORS=['#e63946','#1d7bd8','#2a9d4a','#f4a300','#8e44ad','#00a8a8','#ff6fb5','#5d4037','#9e9d24','#ff7043'];
var MAXP=10;
var GROUPS={brown:['#8b5a3c','বাদামি'],lblue:['#8fd3f4','আকাশি'],pink:['#e66fb0','গোলাপি'],orange:['#f39a2b','কমলা'],red:['#d93636','লাল'],yellow:['#f3d52b','হলুদ'],green:['#2e9d4f','সবুজ'],dblue:['#2b4cb3','গাঢ় নীল']};
var SQ=(function(){
  var P=function(n,g,p,h,r){return {t:'prop',n:n,g:g,p:p,h:h,r:r};};
  var CC={t:'cc',n:'কমিউনিটি চেস্ট'}, CH={t:'chance',n:'ভাগ্য পরীক্ষা'};
  return [
    {t:'go',n:'যাত্রা শুরু'},
    P('কুড়িগ্রাম','brown',60,50,[2,10,30,90,160,250]),
    CC,
    P('লালমনিরহাট','brown',60,50,[4,20,60,180,320,450]),
    {t:'tax',n:'আয়কর',amt:200},
    {t:'station',n:'কমলাপুর স্টেশন',p:200},
    P('বান্দরবান','lblue',100,50,[6,30,90,270,400,550]),
    CH,
    P('রাঙামাটি','lblue',100,50,[6,30,90,270,400,550]),
    P('খাগড়াছড়ি','lblue',120,50,[8,40,100,300,450,600]),
    {t:'jail',n:'জেলখানা (ভিজিট)'},
    P('সিরাজগঞ্জ','pink',140,100,[10,50,150,450,625,750]),
    {t:'util',n:'বিদ্যুৎ',p:150},
    P('পাবনা','pink',140,100,[10,50,150,450,625,750]),
    P('নাটোর','pink',160,100,[12,60,180,500,700,900]),
    {t:'station',n:'ঈশ্বরদী জংশন',p:200},
    P('ফরিদপুর','orange',180,100,[14,70,200,550,750,950]),
    CC,
    P('ময়মনসিংহ','orange',180,100,[14,70,200,550,750,950]),
    P('টাঙ্গাইল','orange',200,100,[16,80,220,600,800,1000]),
    {t:'park',n:'ফ্রি পার্কিং'},
    P('কুমিল্লা','red',220,150,[18,90,250,700,875,1050]),
    CH,
    P('নোয়াখালী','red',220,150,[18,90,250,700,875,1050]),
    P('ফেনী','red',240,150,[20,100,300,750,925,1100]),
    {t:'station',n:'চট্টগ্রাম স্টেশন',p:200},
    P('বরিশাল','yellow',260,150,[22,110,330,800,975,1150]),
    P('পটুয়াখালী','yellow',260,150,[22,110,330,800,975,1150]),
    {t:'util',n:'পানি',p:150},
    P('কুয়াকাটা','yellow',280,150,[24,120,360,850,1025,1200]),
    {t:'gojail',n:'জেলে যান'},
    P('রংপুর','green',300,200,[26,130,390,900,1100,1275]),
    P('দিনাজপুর','green',300,200,[26,130,390,900,1100,1275]),
    CC,
    P('বগুড়া','green',320,200,[28,150,450,1000,1200,1400]),
    {t:'station',n:'সিলেট স্টেশন',p:200},
    CH,
    P('কক্সবাজার','dblue',350,200,[35,175,500,1100,1300,1500]),
    {t:'tax',n:'বিলাস কর',amt:100},
    P('ঢাকা','dblue',400,200,[50,200,600,1400,1700,2000])
  ];
})();
var GM={}; SQ.forEach(function(q,i){ if(q.t==='prop'){(GM[q.g]=GM[q.g]||[]).push(i);} });
var STATIONS=[5,15,25,35], UTILS=[12,28];
var CHD=[
 {k:'goto',a:0,x:'সোজা "যাত্রা শুরু" ঘরে যান। ২০০ টাকা পান।'},
 {k:'goto',a:39,x:'ঢাকা ভ্রমণে যান। যাত্রা শুরু পার হলে ২০০ টাকা পাবেন।'},
 {k:'goto',a:21,x:'কুমিল্লায় যান। যাত্রা শুরু পার হলে ২০০ টাকা পাবেন।'},
 {k:'near',x:'নিকটতম রেলস্টেশনে যান। মালিক থাকলে দ্বিগুণ ভাড়া দিন।'},
 {k:'cash',a:50,x:'ব্যাংক থেকে লভ্যাংশ ৫০ টাকা পান।'},
 {k:'free',x:'জেল থেকে মুক্তির কার্ড। দরকার না হওয়া পর্যন্ত রেখে দিন।'},
 {k:'back',x:'৩ ঘর পিছিয়ে যান।'},
 {k:'jail',x:'সোজা জেলে যান। যাত্রা শুরুর বেতন পাবেন না।'},
 {k:'cash',a:-15,x:'দ্রুত গাড়ি চালানোর জরিমানা ১৫ টাকা দিন।'},
 {k:'goto',a:25,x:'চট্টগ্রাম স্টেশনে যান। যাত্রা শুরু পার হলে ২০০ টাকা পাবেন।'},
 {k:'each',a:50,x:'আপনি সভাপতি নির্বাচিত! প্রত্যেক খেলোয়াড়কে ৫০ টাকা দিন।'},
 {k:'cash',a:150,x:'পুরোনো ঋণ ফেরত এল, ১৫০ টাকা পান।'},
 {k:'repair',h:25,H:100,x:'বাড়ি মেরামত: প্রতি বাড়ি ২৫ টাকা, প্রতি হোটেল ১০০ টাকা দিন।'}
];
var CCD=[
 {k:'cash',a:200,x:'ব্যাংকের হিসাবে ভুল ছিল আপনার পক্ষে। ২০০ টাকা পান।'},
 {k:'cash',a:-50,x:'ডাক্তারের ফি ৫০ টাকা দিন।'},
 {k:'cash',a:50,x:'শেয়ার বিক্রি করে ৫০ টাকা পান।'},
 {k:'free',x:'জেল থেকে মুক্তির কার্ড। দরকার না হওয়া পর্যন্ত রেখে দিন।'},
 {k:'jail',x:'সোজা জেলে যান। যাত্রা শুরুর বেতন পাবেন না।'},
 {k:'collect',a:10,x:'আপনার জন্মদিন! প্রত্যেক খেলোয়াড়ের কাছ থেকে ১০ টাকা নিন।'},
 {k:'cash',a:100,x:'বীমার টাকা ১০০ পান।'},
 {k:'cash',a:-100,x:'হাসপাতালের বিল ১০০ টাকা দিন।'},
 {k:'cash',a:-50,x:'স্কুলের ফি ৫০ টাকা দিন।'},
 {k:'cash',a:25,x:'পরামর্শ ফি বাবদ ২৫ টাকা পান।'},
 {k:'goto',a:0,x:'সোজা "যাত্রা শুরু" ঘরে যান। ২০০ টাকা পান।'},
 {k:'repair',h:40,H:115,x:'রাস্তা মেরামত: প্রতি বাড়ি ৪০ টাকা, প্রতি হোটেল ১১৫ টাকা দিন।'},
 {k:'cash',a:20,x:'আয়কর ফেরত পেলেন, ২০ টাকা।'}
];
function rnd(n){return Math.floor(Math.random()*n);}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=rnd(i+1);var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function bn(n){try{return Number(n).toLocaleString('bn-BD');}catch(e){return String(n);}}
function pl(s,i){return s.players[i];}
function glog(s,m){s.log.push(m);if(s.log.length>80)s.log.shift();}
function alive(s){var r=[];s.players.forEach(function(p,i){if(!p.out)r.push(i);});return r;}

function newGame(list){
  var s={v:1,players:list.map(function(p,i){return {uid:p.uid||null,bot:p.bot||null,av:p.av||null,name:p.name,color:COLORS[i%COLORS.length],pos:0,cash:1500,inJail:false,jt:0,fc:[],out:false,fr:false};}),
    own:{},cur:0,phase:'roll',dice:[0,0],dc:0,again:false,houses:32,hotels:12,log:[],debt:null,auction:null,trade:null,tradePrev:null,
    ch:shuffle(CHD.map(function(_,i){return i;})),cc:shuffle(CCD.map(function(_,i){return i;})),winner:null,lastCard:null,dbl:false,rollId:0,locked:false,ev:[],say:null,limit:0,endAt:0,timeUp:false,scores:null};
  // প্রথম দান: সবাই ছক্কা চালে, সর্বোচ্চ যোগফল শুরু করে
  var cand=s.players.map(function(_,i){return i;});
  while(cand.length>1){
    var rs=cand.map(function(i){return [i,rnd(6)+1+rnd(6)+1];});
    var mx=Math.max.apply(null,rs.map(function(r){return r[1];}));
    rs.forEach(function(r){glog(s,s.players[r[0]].name+' ছক্কা চালল: '+bn(r[1]));});
    cand=rs.filter(function(r){return r[1]===mx;}).map(function(r){return r[0];});
  }
  s.cur=cand[0];
  glog(s,'খেলা শুরু! '+s.players[s.cur].name+' প্রথম দান দেবে।');
  return s;
}

function ev(s,o){(s.ev=s.ev||[]).push(o);}
function monoCheck(s,i,idx){var q=SQ[idx];if(q&&q.t==='prop'&&hasMono(s,i,q.g))ev(s,{k:'mono',i:i,g:q.g});}
function ownerOf(s,idx){var o=s.own[idx];return o?o.o:-1;}
function hasMono(s,who,g){return GM[g].every(function(i){return s.own[i]&&s.own[i].o===who;});}
function groupBuilt(s,g){return GM[g].some(function(i){return s.own[i]&&s.own[i].lvl>0;});}
function calcRent(s,idx){
  var q=SQ[idx],o=s.own[idx],r=0,k;
  if(q.t==='station'){var n=STATIONS.filter(function(i){return s.own[i]&&s.own[i].o===o.o;}).length;r=25*Math.pow(2,n-1);if(s.dbl)r*=2;}
  else if(q.t==='util'){var m=UTILS.filter(function(i){return s.own[i]&&s.own[i].o===o.o;}).length;r=(s.dice[0]+s.dice[1])*(m===2?10:4);}
  else{ if(o.lvl>0)r=q.r[o.lvl]; else r=q.r[0]*(hasMono(s,o.o,q.g)?2:1);}
  s.dbl=false;
  return r;
}

function settle(s,i,amt,to,per){
  pl(s,i).cash-=amt;
  if(to==='bank')return;
  if(to==='each'){alive(s).forEach(function(k){if(k!==i)pl(s,k).cash+=per;});return;}
  pl(s,to).cash+=amt;
}
function pay(s,i,amt,to,reason,then,per){
  if(amt<=0){cont(s,then);return;}
  if(pl(s,i).cash>=amt){
    settle(s,i,amt,to,per);
    ev(s,{k:'pay',from:i,to:to,amt:amt,kind:reason==='ভাড়া'?'rent':'other'});
    glog(s,pl(s,i).name+' দিল ৳'+bn(amt)+' ('+reason+')'+(to!=='bank'&&to!=='each'?' → '+pl(s,to).name:''));
    cont(s,then);
  }else{
    s.debt={i:i,amt:amt,to:to,per:per||0,reason:reason,then:then||null};
    s.phase='debt';
    glog(s,pl(s,i).name+'-এর ৳'+bn(amt)+' দিতে হবে ('+reason+'), কিন্তু নগদ কম! সম্পত্তি বন্ধক রাখুন/বাড়ি বিক্রি করুন, নয়তো দেউলিয়া।');
  }
}
function cont(s,then){ if(then&&then.move){ stepMove(s,s.cur,then.move); } }

function goJail(s,i){var p=pl(s,i);ev(s,{k:'jail',i:i});p.pos=10;p.inJail=true;p.jt=0;s.again=false;s.dc=0;s.phase='post';glog(s,p.name+' জেলে গেল!');}
function stepMove(s,i,n){var p=pl(s,i);var np=p.pos+n;if(np>=40){p.cash+=200;ev(s,{k:'go',i:i});glog(s,p.name+' "যাত্রা শুরু" পার হয়ে ৳২০০ পেল');}p.pos=np%40;land(s,i);}
function gotoSq(s,i,t){var p=pl(s,i);if(t<p.pos){p.cash+=200;ev(s,{k:'go',i:i});glog(s,p.name+' "যাত্রা শুরু" পার হয়ে ৳২০০ পেল');}p.pos=t;land(s,i);}

function land(s,i){
  var p=pl(s,i),q=SQ[p.pos];s.phase='post';
  if(q.t==='prop'||q.t==='station'||q.t==='util'){
    var o=s.own[p.pos];
    if(!o){s.phase='buy';glog(s,p.name+' "'+q.n+'"-এ থামল (দাম ৳'+bn(q.p)+')');s.dbl=false;return;}
    if(o.o===i){glog(s,p.name+' নিজের "'+q.n+'"-এ থামল');s.dbl=false;return;}
    if(o.mort){glog(s,'"'+q.n+'" বন্ধক আছে, ভাড়া লাগবে না');s.dbl=false;return;}
    var rent=calcRent(s,p.pos);
    glog(s,p.name+' "'+q.n+'"-এ থামল — মালিক '+pl(s,o.o).name);
    pay(s,i,rent,o.o,'ভাড়া');return;
  }
  if(q.t==='tax'){glog(s,p.name+' "'+q.n+'"-এ থামল');pay(s,i,q.amt,'bank',q.n);return;}
  if(q.t==='chance'){draw(s,i,'ch');return;}
  if(q.t==='cc'){draw(s,i,'cc');return;}
  if(q.t==='gojail'){goJail(s,i);return;}
  glog(s,p.name+' "'+q.n+'"-এ থামল');
}
function draw(s,i,deck){
  var p=pl(s,i),D=deck==='ch'?CHD:CCD;
  var id=s[deck].shift(),c=D[id];
  s.lastCard={deck:deck,text:c.x,who:p.name,n:(s.lastCard?s.lastCard.n:0)+1};
  glog(s,p.name+' '+(deck==='ch'?'ভাগ্য পরীক্ষা':'কমিউনিটি চেস্ট')+' কার্ড তুলল: '+c.x);
  var keep=false;
  switch(c.k){
    case 'cash': if(c.a>=0){p.cash+=c.a;}else pay(s,i,-c.a,'bank','কার্ড'); break;
    case 'goto': s[deck].push(id);keep=true;gotoSq(s,i,c.a);break;
    case 'near':{var t=STATIONS.filter(function(x){return x>p.pos;})[0];if(t===undefined)t=STATIONS[0];s.dbl=true;s[deck].push(id);keep=true;gotoSq(s,i,t);break;}
    case 'back': s[deck].push(id);keep=true;p.pos=(p.pos+37)%40;land(s,i);break;
    case 'jail': goJail(s,i);break;
    case 'free': p.fc.push([deck,id]);keep=true;break;
    case 'each':{var n=alive(s).length-1;pay(s,i,c.a*n,'each','কার্ড',null,c.a);break;}
    case 'collect':{alive(s).forEach(function(k){if(k!==i){var t2=Math.min(pl(s,k).cash,c.a);pl(s,k).cash-=t2;p.cash+=t2;}});break;}
    case 'repair':{var h=0,H=0;Object.keys(s.own).forEach(function(k){var o=s.own[k];if(o.o===i){if(o.lvl===5)H++;else h+=o.lvl;}});pay(s,i,h*c.h+H*c.H,'bank','মেরামত');break;}
  }
  if(!keep)s[deck].push(id);
}
function nextTurn(s){
  var n=s.players.length;
  do{s.cur=(s.cur+1)%n;}while(pl(s,s.cur).out);
  s.phase='roll';s.again=false;s.dc=0;s.debt=null;
  glog(s,'— '+pl(s,s.cur).name+'-এর দান —');
  ev(s,{k:'turn',i:s.cur});
}
function returnBuildings(s,o){ if(o.lvl===5)s.hotels++; else s.houses+=o.lvl; o.lvl=0; }
function liquidate(s,i,to){
  var p=pl(s,i);
  Object.keys(s.own).forEach(function(k){
    var o=s.own[k];if(o.o!==i)return;
    returnBuildings(s,o);
    if(to==='bank'){delete s.own[k];}else{o.o=to;}
  });
  if(to!=='bank'){pl(s,to).cash+=p.cash;p.fc.forEach(function(f){pl(s,to).fc.push(f);});}
  else{p.fc.forEach(function(f){s[f[0]].push(f[1]);});}
  p.cash=0;p.fc=[];p.out=true;ev(s,{k:'bankrupt',i:i});
  glog(s,p.name+' দেউলিয়া হয়ে খেলা থেকে বাদ পড়ল'+(to!=='bank'?' (সম্পত্তি '+pl(s,to).name+' পেল)':' (সম্পত্তি ব্যাংকে ফিরল)'));
  var al=alive(s);
  if(al.length===1){s.phase='over';s.winner=al[0];s.debt=null;s.auction=null;s.trade=null;glog(s,'🏆 '+pl(s,al[0]).name+' জয়ী!');ev(s,{k:'win',i:al[0]});return;}
  if(i===s.cur){s.auction=null;s.trade=null;nextTurn(s);}
}
function auctionAdvance(s){
  var a=s.auction,n=s.players.length;
  var act=alive(s).filter(function(k){return a.passed.indexOf(k)<0;});
  if(a.hi===null&&act.length===0){glog(s,'কেউ ডাকেনি — "'+SQ[a.idx].n+'" অবিক্রীত থাকল');ev(s,{k:'unsold'});s.auction=null;s.phase='post';return;}
  var t=a.turn,c=0;
  do{t=(t+1)%n;c++;}while(c<=n&&(pl(s,t).out||a.passed.indexOf(t)>=0));
  if(a.hi!==null&&(t===a.hi||act.length===1)){
    var w=a.hi;pl(s,w).cash-=a.bid;s.own[a.idx]={o:w,lvl:0,mort:false};
    glog(s,pl(s,w).name+' নিলামে "'+SQ[a.idx].n+'" পেল ৳'+bn(a.bid)+'-এ');
    ev(s,{k:'sold',i:w,idx:a.idx,amt:a.bid});monoCheck(s,w,a.idx);
    s.auction=null;s.phase='post';return;
  }
  a.turn=t;
}

function run(s,who,a){
  var cur=s.cur,p=pl(s,cur),ph=s.phase,k;
  if(ph==='over')return 'খেলা শেষ';
  var T=a.type;
  var mgmt=(ph==='roll'||ph==='post'||ph==='debt');
  switch(T){
  case 'timeUp':{
    if(!s.endAt||Date.now()<s.endAt-800)return 'সময় এখনও শেষ হয়নি';
    if(ph!=='roll')return 'এই দান শেষ হলে খেলা থামবে';
    var sc=scoreList(s);s.scores=sc;s.timeUp=true;s.phase='over';s.winner=sc[0].i;s.debt=null;s.auction=null;s.trade=null;
    glog(s,'সময় শেষ! সম্পদে সেরা: '+pl(s,sc[0].i).name+' (৳'+bn(sc[0].net)+')');ev(s,{k:'win',i:sc[0].i});break;}
  case 'admit':{
    if(s.locked)return 'খেলা এগিয়ে গেছে — আর কেউ যোগ হতে পারবে না';
    if(ph!=='roll'&&ph!=='post')return 'এখন যোগ করা যাবে না';
    if(s.players.length>=MAXP)return 'ঘর পূর্ণ (সর্বোচ্চ '+bn(MAXP)+' জন)';
    if(a.uid&&s.players.some(function(q){return q.uid===a.uid;}))return 'আগেই আছেন';
    var ni=s.players.length;
    s.players.push({uid:a.uid||null,bot:null,av:a.av||null,name:String(a.name||'খেলোয়াড়').slice(0,14),color:COLORS[ni%COLORS.length],pos:0,cash:1500,inJail:false,jt:0,fc:[],out:false,fr:false});
    glog(s,s.players[ni].name+' খেলায় যোগ দিল');ev(s,{k:'join',i:ni});break;}
  case 'roll':{
    if(who!==cur||ph!=='roll'||p.inJail)return 'এখন ছক্কা চালানো যাবে না';
    p.fr=true;var d1=rnd(6)+1,d2=rnd(6)+1;s.dice=[d1,d2];s.rollId++;
    var dbl=d1===d2;s.dc=dbl?s.dc+1:0;if(dbl)ev(s,{k:'doubles',i:cur});
    glog(s,p.name+' ছক্কা চালল: '+bn(d1)+' + '+bn(d2)+' = '+bn(d1+d2)+(dbl?' (ডাবলস!)':''));
    if(s.dc===3){glog(s,'পরপর ৩ বার ডাবলস!');goJail(s,cur);break;}
    s.again=dbl;
    stepMove(s,cur,d1+d2);break;}
  case 'payJail':
    if(who!==cur||ph!=='roll'||!p.inJail)return 'সম্ভব নয়';
    if(p.cash<50)return 'নগদ ৫০ টাকা নেই';
    p.cash-=50;p.inJail=false;p.jt=0;ev(s,{k:'free',i:cur});glog(s,p.name+' ৫০ টাকা জরিমানা দিয়ে জেল থেকে বের হল');break;
  case 'useCard':
    if(who!==cur||ph!=='roll'||!p.inJail||!p.fc.length)return 'সম্ভব নয়';
    var f=p.fc.pop();s[f[0]].push(f[1]);p.inJail=false;p.jt=0;ev(s,{k:'free',i:cur});glog(s,p.name+' মুক্তির কার্ড ব্যবহার করল');break;
  case 'jailRoll':{
    if(who!==cur||ph!=='roll'||!p.inJail)return 'সম্ভব নয়';
    p.fr=true;var e1=rnd(6)+1,e2=rnd(6)+1;s.dice=[e1,e2];s.rollId++;
    glog(s,p.name+' জেল থেকে বেরোতে ছক্কা চালল: '+bn(e1)+' + '+bn(e2));
    if(e1===e2){p.inJail=false;p.jt=0;s.again=false;ev(s,{k:'free',i:cur});glog(s,'ডাবলস! মুক্তি');stepMove(s,cur,e1+e2);}
    else{p.jt++;
      if(p.jt>=3){p.inJail=false;p.jt=0;s.again=false;ev(s,{k:'free',i:cur});glog(s,'৩ বারেও ডাবলস পড়েনি, ৫০ টাকা দিয়ে বের হতেই হবে');pay(s,cur,50,'bank','জেল জরিমানা',{move:e1+e2});}
      else{s.again=false;s.phase='post';glog(s,'ডাবলস পড়েনি');}
    }
    break;}
  case 'buy':{
    if(who!==cur||ph!=='buy')return 'সম্ভব নয়';
    var q=SQ[p.pos];if(p.cash<q.p)return 'নগদ কম';
    p.cash-=q.p;s.own[p.pos]={o:cur,lvl:0,mort:false};s.phase='post';ev(s,{k:'buy',i:cur,idx:p.pos,amt:q.p});monoCheck(s,cur,p.pos);glog(s,p.name+' "'+q.n+'" কিনল ৳'+bn(q.p)+'-এ');break;}
  case 'auction':{
    if(who!==cur||ph!=='buy')return 'সম্ভব নয়';
    s.auction={idx:p.pos,bid:0,hi:null,turn:cur,passed:[]};s.phase='auction';
    glog(s,'"'+SQ[p.pos].n+'" নিলামে উঠল!');ev(s,{k:'auctionStart',idx:p.pos});
    auctionAdvance2(s);break;}
  case 'bid':{
    if(ph!=='auction'||!s.auction||who!==s.auction.turn)return 'এখন আপনার ডাকার পালা নয়';
    var amt=Math.floor(Number(a.amt));
    if(!(amt>s.auction.bid))return 'ডাক আগের চেয়ে বেশি হতে হবে';
    if(amt>pl(s,who).cash)return 'নগদ টাকার বেশি ডাকা যাবে না';
    s.auction.bid=amt;s.auction.hi=who;ev(s,{k:'bid',i:who,amt:amt});glog(s,pl(s,who).name+' ডাকল ৳'+bn(amt));
    auctionAdvance(s);break;}
  case 'pass':{
    if(ph!=='auction'||!s.auction||who!==s.auction.turn)return 'এখন আপনার পালা নয়';
    s.auction.passed.push(who);glog(s,pl(s,who).name+' পাস করল');
    auctionAdvance(s);break;}
  case 'endTurn':
    if(who!==cur||ph!=='post')return 'এখন দান শেষ করা যাবে না';
    if(s.again&&!p.inJail){s.phase='roll';glog(s,p.name+' ডাবলস পেয়েছে, আবার ছক্কা চালবে');}
    else nextTurn(s);
    break;
  case 'payDebt':{
    var d=s.debt;
    if(ph!=='debt'||!d||who!==d.i)return 'সম্ভব নয়';
    if(pl(s,d.i).cash<d.amt)return 'এখনও নগদ কম';
    settle(s,d.i,d.amt,d.to,d.per);ev(s,{k:'pay',from:d.i,to:d.to,amt:d.amt,kind:d.reason==='ভাড়া'?'rent':'other'});glog(s,pl(s,d.i).name+' দেনা শোধ করল ৳'+bn(d.amt));
    s.debt=null;s.phase='post';cont(s,d.then);break;}
  case 'retire':{
    if(who!==cur||!mgmt)return 'সম্ভব নয়';
    var cr='bank';if(ph==='debt'&&s.debt&&typeof s.debt.to==='number')cr=s.debt.to;
    liquidate(s,cur,cr);break;}
  case 'kick':{
    var ki=a.i;if(typeof ki!=='number'||!pl(s,ki)||pl(s,ki).out)return 'সম্ভব নয়';
    s.auction=null;
    if(s.phase==='trade'){s.trade=null;s.phase=s.tradePrev||'post';}
    if(s.phase==='auction'){s.phase='post';}
    var wasCur=ki===s.cur;
    liquidate(s,ki,'bank');
    if(!wasCur&&s.phase==='debt'&&s.debt&&s.debt.i===ki){s.debt=null;}
    break;}
  case 'build':{
    if(who!==cur||(ph!=='roll'&&ph!=='post'))return 'এখন বাড়ি বানানো যাবে না';
    var bq=SQ[a.idx],bo=s.own[a.idx];
    if(!bq||bq.t!=='prop'||!bo||bo.o!==cur)return 'এটি আপনার জায়গা নয়';
    if(!hasMono(s,cur,bq.g))return 'পুরো রঙের মনোপলি দরকার';
    if(GM[bq.g].some(function(i){return s.own[i].mort;}))return 'গ্রুপে বন্ধক থাকলে বানানো যাবে না';
    if(bo.lvl>=5)return 'ইতিমধ্যে হোটেল আছে';
    var mn=Math.min.apply(null,GM[bq.g].map(function(i){return s.own[i].lvl;}));
    if(bo.lvl>mn)return 'সমানভাবে বানাতে হবে (আগে বাকি জায়গায় বানান)';
    if(p.cash<bq.h)return 'নগদ কম';
    if(bo.lvl===4){if(s.hotels<1)return 'ব্যাংকে হোটেল নেই';s.hotels--;s.houses+=4;}
    else{if(s.houses<1)return 'ব্যাংকে বাড়ি নেই';s.houses--;}
    p.cash-=bq.h;bo.lvl++;ev(s,{k:'build',i:cur,idx:a.idx,lvl:bo.lvl});glog(s,p.name+' "'+bq.n+'"-এ '+(bo.lvl===5?'হোটেল':'বাড়ি')+' বানাল');break;}
  case 'sell':{
    if(who!==cur||!mgmt)return 'সম্ভব নয়';
    var sq=SQ[a.idx],so=s.own[a.idx];
    if(!sq||sq.t!=='prop'||!so||so.o!==cur||so.lvl<1)return 'বিক্রি করার মতো কিছু নেই';
    var mx=Math.max.apply(null,GM[sq.g].map(function(i){return s.own[i].lvl;}));
    if(so.lvl<mx)return 'সবচেয়ে বেশি বাড়িওয়ালা জায়গা থেকে আগে বিক্রি করুন';
    if(so.lvl===5){if(s.houses<4)return 'ব্যাংকে ৪টি বাড়ি নেই (হোটেল ভাঙা যাবে না)';s.houses-=4;s.hotels++;}
    else s.houses++;
    so.lvl--;p.cash+=sq.h/2;glog(s,p.name+' "'+sq.n+'" থেকে অর্ধেক দামে ব্যাংকে বিক্রি করল');break;}
  case 'mortgage':{
    if(who!==cur||!mgmt)return 'সম্ভব নয়';
    var mq=SQ[a.idx],mo=s.own[a.idx];
    if(!mq||!mo||mo.o!==cur||mo.mort)return 'সম্ভব নয়';
    if(mq.t==='prop'&&groupBuilt(s,mq.g))return 'আগে এই গ্রুপের সব বাড়ি/হোটেল বিক্রি করুন';
    mo.mort=true;p.cash+=mq.p/2;glog(s,p.name+' "'+mq.n+'" বন্ধক রাখল (৳'+bn(mq.p/2)+')');break;}
  case 'unmortgage':{
    if(who!==cur||!mgmt)return 'সম্ভব নয়';
    var uq=SQ[a.idx],uo=s.own[a.idx];
    if(!uq||!uo||uo.o!==cur||!uo.mort)return 'সম্ভব নয়';
    var cost=Math.ceil(uq.p/2*1.1);if(p.cash<cost)return 'নগদ কম (দরকার ৳'+bn(cost)+')';
    p.cash-=cost;uo.mort=false;glog(s,p.name+' "'+uq.n+'" মুক্ত করল (৳'+bn(cost)+')');break;}
  case 'propose':{
    if(who!==cur||(ph!=='roll'&&ph!=='post'))return 'এখন প্রস্তাব দেওয়া যাবে না';
    var tr={from:cur,to:a.to,oc:Math.max(0,Math.floor(a.oc||0)),rc:Math.max(0,Math.floor(a.rc||0)),op:(a.op||[]).map(Number),rp:(a.rp||[]).map(Number)};
    var er=checkTrade(s,tr);if(er)return er;
    s.trade=tr;s.tradePrev=ph;s.phase='trade';glog(s,p.name+' '+pl(s,tr.to).name+'-কে বিনিময়ের প্রস্তাব দিল');break;}
  case 'accept':{
    if(ph!=='trade'||!s.trade||who!==s.trade.to)return 'সম্ভব নয়';
    var t=s.trade,er2=checkTrade(s,t);if(er2)return er2;
    pl(s,t.from).cash+=t.rc-t.oc;pl(s,t.to).cash+=t.oc-t.rc;
    t.op.forEach(function(i){s.own[i].o=t.to;});t.rp.forEach(function(i){s.own[i].o=t.from;});
    glog(s,pl(s,t.to).name+' প্রস্তাব মেনে নিল — বিনিময় সম্পন্ন');
    s.phase=s.tradePrev||'post';s.trade=null;break;}
  case 'decline':{
    if(ph!=='trade'||!s.trade||(who!==s.trade.to&&who!==s.trade.from))return 'সম্ভব নয়';
    glog(s,who===s.trade.to?pl(s,who).name+' প্রস্তাব ফিরিয়ে দিল':pl(s,who).name+' প্রস্তাব বাতিল করল');
    s.phase=s.tradePrev||'post';s.trade=null;break;}
  default: return 'অজানা কাজ';
  }
}
function auctionAdvance2(s){
  // নিলাম শুরু: যার দান তার পরের জন থেকে
  var a=s.auction,n=s.players.length,t=a.turn;
  do{t=(t+1)%n;}while(pl(s,t).out);
  a.turn=t;
}
function checkTrade(s,t){
  var f=pl(s,t.from),o=pl(s,t.to);
  if(!o||o.out||t.to===t.from)return 'ভুল খেলোয়াড়';
  if(t.oc>f.cash)return 'আপনার নগদ কম';
  if(t.rc>o.cash)return o.name+'-এর নগদ কম';
  if(!t.oc&&!t.rc&&!t.op.length&&!t.rp.length)return 'কিছু তো দিন!';
  var bad=null;
  t.op.forEach(function(i){var x=s.own[i];if(!x||x.o!==t.from)bad='আপনার নয় এমন জায়গা';else if(SQ[i].t==='prop'&&groupBuilt(s,SQ[i].g))bad='বাড়ি/হোটেল থাকা গ্রুপের জায়গা বিনিময় করা যায় না';});
  t.rp.forEach(function(i){var x=s.own[i];if(!x||x.o!==t.to)bad='তার নয় এমন জায়গা';else if(SQ[i].t==='prop'&&groupBuilt(s,SQ[i].g))bad='বাড়ি/হোটেল থাকা গ্রুপের জায়গা বিনিময় করা যায় না';});
  return bad;
}
// ---- সময়সীমা: সম্পদের হিসাব ও ঘড়ি ----
function ownableCount(){return SQ.filter(function(q){return q.t==='prop'||q.t==='station'||q.t==='util';}).length;}
function allSold(s){return Object.keys(s.own).length>=ownableCount();}
function netWorth(s,i){
  var n=s.players[i].cash;
  Object.keys(s.own).forEach(function(k){var o=s.own[k];if(o.o!==i)return;var q=SQ[k];n+=(o.mort?q.p/2:q.p)+((q.h||0)*(o.lvl||0));});
  return Math.round(n);
}
function scoreList(s){
  return s.players.map(function(p,i){return {i:i,net:netWorth(s,i),cash:p.cash,out:!!p.out};}).filter(function(x){return !x.out;})
    .sort(function(a,b){return (b.net-a.net)||(b.cash-a.cash);});
}
function apply(s0,who,a){
  var s=JSON.parse(JSON.stringify(s0)),err;s.ev=[];
  try{err=run(s,who,a);}catch(e){return {err:'ত্রুটি: '+e};}
  if(err)return {err:err};
  if(s.limit>0&&!s.endAt&&s.phase!=='over'&&allSold(s)){
    s.endAt=Date.now()+s.limit*60000;ev(s,{k:'clock',min:s.limit});
    glog(s,'সব সম্পত্তি বিক্রি হয়েছে! এখন ঘড়ি চালু — '+bn(s.limit)+' মিনিট বাকি।');
  }
  s.locked=s.players.every(function(q){return q.out||q.fr;});
  s.v=(s0.v||0)+1;
  return {s:s};
}
function whoFor(s,a){
  var T=a.type;
  if(T==='bid'||T==='pass')return s.auction?s.auction.turn:s.cur;
  if(T==='accept')return s.trade?s.trade.to:s.cur;
  if(T==='decline')return s.trade?s.trade.to:s.cur;
  if(T==='payDebt'&&s.debt)return s.debt.i;
  return s.cur;
}
