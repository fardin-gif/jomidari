// ====== জমিদার — অবতার ও কম্পিউটার চরিত্র ======
// প্রতিটি অবতার কোড দিয়ে আঁকা কার্টুন-মুখ (SVG), কোনো ছবির ফাইল লাগে না।

// ---- কম্পিউটার চরিত্র ----
// reserve = কেনার পরও হাতে রাখতে চাওয়া নগদ; bidK = নিলামে দামের গুণক; build = বাড়ি বানানোর আগ্রহ (০–১)
var BOTS={
  majumdar:{name:'মজুমদার সাহেব',title:'বনেদি জমিদার',reserve:150,bidK:1.05,build:.9,blurb:'চালাক, ধীরস্থির, ভাড়া আদায়ে ওস্তাদ। এই গেমের আসল প্রতিপক্ষ!',
    say:{roll:['চলো দেখি, ভাগ্য কী বলে…','আহা! পাশা তো আমার হাতেই নাচে।','একটু ধৈর্য ধরো হে, চাল দিচ্ছি।'],
         buy:['জমিই তো আসল সম্পদ, বুঝলে হে!','বাহ! এটা আমার জমিদারিতে মানাবে।','কিনে ফেললাম — হিসেবের টাকা, বেহিসেবি নই।'],
         bid:['আরে, ডাক বাড়াও দেখি!','এই দামে ছাড়ছি না হে।'],
         pass:['না না, এত দামে পোষাবে না।'],
         build:['এবার দালানকোঠা উঠুক!','বাড়ি বানালে ভাড়াও বাড়ে — সোজা হিসেব।'],
         pay:['উফ্‌, ভাড়া দিতে হলো… ঠিক আছে।'],
         jail:['হায় হায়! আমার মতো মানুষ হাজতে?'],
         win:['হা হা! জমিদারি আমারই থাকল, বুঝলে?'],
         lose:['আজ হার মানলাম — তবে কাল আবার দেখা হবে!']}},
  rahima:{name:'রহিমা বেগম',title:'দুঁদে ব্যবসায়ী',reserve:100,bidK:1.0,build:1,blurb:'হিসেবি ও সাহসী। রঙ মেলাতে পারলেই দালান তোলেন!',
    say:{roll:['দেখি, এবার কী ওঠে!','দান দিলাম, হিসেব মিলবে।'],buy:['ব্যবসার প্রথম নিয়ম — কিনে রাখো!','এই জায়গায় দোকান বসবে।'],bid:['আরেকটু বাড়াও, দেখি কে দমে!'],pass:['ছাড়লাম, লাভ নেই।'],build:['দোকান থেকে দালান — এটাই তো উন্নতি!'],pay:['ভাড়া দিলাম, পরেরবার আদায় করব।'],jail:['ধুর! সময় নষ্ট।'],win:['ব্যবসায় আমি হারি না!'],lose:['সাবাশ! এবার তুমি জিতলে।']}},
  fotik:{name:'ফটিক চাঁদ',title:'ফুর্তিবাজ তরুণ',reserve:30,bidK:1.25,build:.5,blurb:'হাতে টাকা এলেই কিনে ফেলেন! ঝুঁকি নিতে ভালোবাসেন।',
    say:{roll:['চল চল, ঝেড়ে দিই!','ভাগ্য আমার সাথেই!'],buy:['কিনে ফেললাম, পরে ভাবা যাবে!','জমি আবার বেশি কী!'],bid:['আরে ধুর, ডেকে দিলাম!','টাকা কি সঙ্গে নিয়ে যাব?'],pass:['এইবার থাক…'],build:['বাড়ি তোল বাড়ি!'],pay:['আহা রে, পকেট ফাঁকা!'],jail:['আরে! আমি তো কিছুই করিনি!'],win:['ইয়াহু! আমিই রাজা!'],lose:['ধুস, আরেকবার খেলব!']}},
  kanai:{name:'কানাই বাবু',title:'হিসেবি মহাজন',reserve:300,bidK:.8,build:.6,blurb:'টাকা খরচে ভীষণ কৃপণ। সহজে কেনেন না, কিন্তু একবার কিনলে ছাড়েন না।',
    say:{roll:['ধীরে ধীরে, তাড়া কীসের?','পাশা ফেলছি, হিসেব রাখছি।'],buy:['দামটা ঠিকঠাকই লাগছে।','কিনলাম, তবে পয়সা গুনে।'],bid:['এক পয়সাও বেশি নয়!'],pass:['এত দাম! অসম্ভব!'],build:['সাবধানে বানাতে হয়।'],pay:['হায় আমার টাকা!'],jail:['জরিমানা… ইশ্‌!'],win:['সঞ্চয়ই শেষ কথা, দেখলে তো?'],lose:['কপাল, সবই কপাল!']}},
  nazma:{name:'নাজমা খালা',title:'নিলামের রানি',reserve:80,bidK:1.35,build:.7,blurb:'নিলাম এলেই চোখ চকচক! দর হাঁকতে পারেন সবচেয়ে বেশি।',
    say:{roll:['দাও তো বাপু, পাশাটা!','আল্লাহ ভরসা!'],buy:['ও মা! কী সুন্দর জায়গা!'],bid:['আমি দিচ্ছি আরও বেশি!','নিলামে নাজমা খালাকে হারানো সহজ না!'],pass:['এইবার ছেড়ে দিলাম বাছা।'],build:['ঘর তুলব, নাতিপুতি থাকবে!'],pay:['এই নাও বাছা, ভাড়া।'],jail:['ওরে বাবা, হাজতে!'],win:['দেখলে তো, খালার বুদ্ধি!'],lose:['ভালোই খেললে, বাছা!']}}
};
var BOT_ORDER=['majumdar','rahima','fotik','kanai','nazma'];
var HUMAN_AV=['h1','h2','h3','h4','h5','h6','h7','h8'];

// ---- অবতারের বিবরণ ----
var AVD={
  majumdar:{bg:'#f6d77a',skin:'#e0a56a',cloth:'#fffdf2',vest:'#3b2a20',pagri:'#ffffff',pagriBand:'#d4a017',glasses:'#c9951b',mus:'#f4f4f4',musBig:1,brow:'#cfcfcf',brooch:1,beard:0},
  rahima:{bg:'#ffb3c7',skin:'#d99b6c',cloth:'#c2185b',hair:'#2b1b17',hairStyle:'bun',bindi:'#c62828',earring:'#ffd54f',sari:'#fff3c4'},
  fotik:{bg:'#9be3ff',skin:'#e6b17e',cloth:'#2e7d32',hair:'#1c1c1c',hairStyle:'spiky',cap:'#ff7043',smile:'big'},
  kanai:{bg:'#c9e8b0',skin:'#d09a68',cloth:'#8d6e63',hair:'#555',hairStyle:'bald',glasses:'#6d4c41',mus:'#444',tilak:1,scarf:'#f5f0e1'},
  nazma:{bg:'#d7c2ff',skin:'#d9a273',cloth:'#6a1b9a',hair:'#bdbdbd',hairStyle:'bun',veil:'#e1bee7',glassesRound:'#7b1fa2',earring:'#ffd54f'},
  h1:{bg:'#ffd6a5',skin:'#e8b88a',cloth:'#e63946',hair:'#2b1b17',hairStyle:'short'},
  h2:{bg:'#caffbf',skin:'#c68642',cloth:'#1d7bd8',hair:'#1c1c1c',hairStyle:'curly'},
  h3:{bg:'#bde0fe',skin:'#f1c27d',cloth:'#2a9d4a',hair:'#6b3d1e',hairStyle:'long'},
  h4:{bg:'#ffc8dd',skin:'#8d5524',cloth:'#f4a300',hair:'#111',hairStyle:'bun',bindi:'#d81b60'},
  h5:{bg:'#fdffb6',skin:'#e0ac69',cloth:'#8e44ad',hair:'#3b2a20',hairStyle:'short',glasses:'#333'},
  h6:{bg:'#a0c4ff',skin:'#f0c8a0',cloth:'#00a8a8',hair:'#8a4b24',hairStyle:'spiky',cap:'#fff'},
  h7:{bg:'#ffadad',skin:'#b97a4a',cloth:'#ff6fb5',hair:'#222',hairStyle:'long',earring:'#ffd54f'},
  h8:{bg:'#d0f4de',skin:'#d9a066',cloth:'#37474f',hair:'#eee',hairStyle:'bald',mus:'#ddd',glasses:'#555'}
};
function _hair(o){
  var h=o.hair||'#222',s='';
  switch(o.hairStyle){
    case 'short':s='<path d="M18 30 C16 14 30 8 34 8 C44 8 52 14 50 30 C46 22 40 20 34 20 C28 20 22 22 18 30Z" fill="'+h+'"/>';break;
    case 'curly':s='<g fill="'+h+'"><circle cx="20" cy="22" r="7"/><circle cx="27" cy="14" r="7.5"/><circle cx="36" cy="11" r="8"/><circle cx="45" cy="15" r="7.5"/><circle cx="50" cy="23" r="6.5"/></g>';break;
    case 'long':s='<path d="M16 34 C12 10 28 6 34 6 C42 6 56 12 52 34 L52 50 L46 50 L46 26 C40 22 28 22 22 26 L22 50 L16 50Z" fill="'+h+'"/>';break;
    case 'bun':s='<circle cx="34" cy="6" r="6" fill="'+h+'"/><path d="M17 31 C15 14 28 9 34 9 C42 9 54 14 51 31 C46 21 40 19 34 19 C28 19 22 21 17 31Z" fill="'+h+'"/>';break;
    case 'spiky':s='<path d="M17 30 L18 14 L24 20 L27 8 L33 17 L38 6 L42 17 L49 10 L50 22 L52 30 C46 22 40 20 34 20 C28 20 22 22 17 30Z" fill="'+h+'"/>';break;
    default:s='';
  }
  return s;
}
function avatar(key,size){
  var o=AVD[key]||AVD.h1,sz=size||48,s='';
  var id='av'+Math.floor(Math.random()*1e6);
  s+='<svg class="avsvg" width="'+sz+'" height="'+sz+'" viewBox="0 0 68 68" role="img" aria-label="অবতার"><defs><clipPath id="'+id+'"><circle cx="34" cy="34" r="33"/></clipPath></defs><g clip-path="url(#'+id+')">';
  s+='<rect width="68" height="68" fill="'+o.bg+'"/>';
  // কাঁধ/পোশাক
  s+='<path d="M6 70 C8 54 20 50 34 50 C48 50 60 54 62 70Z" fill="'+o.cloth+'" stroke="#0003" stroke-width="1"/>';
  if(o.vest)s+='<path d="M16 70 C18 56 26 52 34 52 C42 52 50 56 52 70Z" fill="'+o.vest+'"/><path d="M34 52 L34 70" stroke="#d4a017" stroke-width="1.2"/><circle cx="34" cy="58" r="1.2" fill="#ffd54f"/><circle cx="34" cy="63" r="1.2" fill="#ffd54f"/>';
  if(o.sari)s+='<path d="M10 70 C14 56 24 52 34 52 L48 70Z" fill="'+o.sari+'" opacity=".9"/>';
  if(o.scarf)s+='<path d="M22 50 C28 56 40 56 46 50 L48 56 C40 62 28 62 20 56Z" fill="'+o.scarf+'" stroke="#0002"/>';
  // গলা ও মাথা
  s+='<rect x="29" y="42" width="10" height="10" rx="3" fill="'+o.skin+'" stroke="#0002"/>';
  if(o.hairStyle==='long')s+=_hair(o);
  s+='<ellipse cx="18.5" cy="33" rx="3" ry="4.2" fill="'+o.skin+'" stroke="#0003"/><ellipse cx="49.5" cy="33" rx="3" ry="4.2" fill="'+o.skin+'" stroke="#0003"/>';
  if(o.earring){s+='<circle cx="18.5" cy="38.4" r="1.6" fill="'+o.earring+'"/><circle cx="49.5" cy="38.4" r="1.6" fill="'+o.earring+'"/>';}
  s+='<ellipse cx="34" cy="31" rx="16" ry="18" fill="'+o.skin+'" stroke="#0003" stroke-width="1"/>';
  if(o.hairStyle&&o.hairStyle!=='long')s+=_hair(o);
  // গাল
  s+='<ellipse cx="24" cy="38" rx="3.4" ry="2.2" fill="#ff7b7b" opacity=".28"/><ellipse cx="44" cy="38" rx="3.4" ry="2.2" fill="#ff7b7b" opacity=".28"/>';
  // ভুরু
  var br=o.brow||o.hair||'#333';
  s+='<path d="M22 24.5 Q26.5 21.5 30.5 24" stroke="'+br+'" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M37.5 24 Q41.5 21.5 46 24.5" stroke="'+br+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
  // চোখ
  s+='<ellipse cx="26.5" cy="29" rx="3.1" ry="3.5" fill="#fff" stroke="#0004" stroke-width=".6"/><ellipse cx="41.5" cy="29" rx="3.1" ry="3.5" fill="#fff" stroke="#0004" stroke-width=".6"/><circle cx="27.1" cy="29.6" r="1.8" fill="#2b1b17"/><circle cx="41.9" cy="29.6" r="1.8" fill="#2b1b17"/><circle cx="27.7" cy="28.8" r=".6" fill="#fff"/><circle cx="42.5" cy="28.8" r=".6" fill="#fff"/>';
  // নাক
  s+='<path d="M34 31 Q32 36 34.5 37.5" stroke="#0005" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  // গোঁফ
  if(o.mus){
    if(o.musBig)s+='<path d="M34 40.2 C30 37 22 38 19 42.5 C24 41.5 28 42.5 34 41.6 C40 42.5 44 41.5 49 42.5 C46 38 38 37 34 40.2Z" fill="'+o.mus+'" stroke="#0003" stroke-width=".8"/><path d="M19 42.5 C17 42 16.5 40 18 39" stroke="'+o.mus+'" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M49 42.5 C51 42 51.5 40 50 39" stroke="'+o.mus+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    else s+='<path d="M34 39.8 C31 37.8 26 38.4 25 41 C28 40.4 31 41 34 40.8 C37 41 40 40.4 43 41 C42 38.4 37 37.8 34 39.8Z" fill="'+o.mus+'" stroke="#0003" stroke-width=".6"/>';
  }
  // মুখ
  if(o.smile==='big')s+='<path d="M27 42.5 Q34 50 41 42.5Z" fill="#8b1e2d" stroke="#0004" stroke-width=".8"/><path d="M29.5 44 Q34 46 38.5 44" stroke="#fff" stroke-width="1.6" fill="none"/>';
  else s+='<path d="M28.6 43.6 Q34 47.8 39.4 43.6" stroke="#7a2a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  if(o.bindi)s+='<circle cx="34" cy="21.2" r="1.7" fill="'+o.bindi+'"/>';
  if(o.tilak)s+='<path d="M34 16 L34 22" stroke="#e65100" stroke-width="2.2" stroke-linecap="round"/>';
  // চশমা
  if(o.glasses||o.glassesRound){var gc=o.glasses||o.glassesRound;
    s+='<g fill="#bfe9ff" fill-opacity=".35" stroke="'+gc+'" stroke-width="1.6"><circle cx="26.5" cy="29.2" r="5.2"/><circle cx="41.5" cy="29.2" r="5.2"/></g><path d="M31.7 29 Q34 27.5 36.3 29" stroke="'+gc+'" stroke-width="1.4" fill="none"/>';}
  // পাগড়ি (মজুমদার সাহেব)
  if(o.pagri){
    s+='<path d="M15 25 C13 8 26 3 34 3 C44 3 56 8 53 25 C48 18 41 16 34 16 C27 16 20 18 15 25Z" fill="'+o.pagri+'" stroke="#0003" stroke-width="1"/>';
    s+='<path d="M16 22 C26 14 42 14 52 22" stroke="'+o.pagriBand+'" stroke-width="3.2" fill="none"/>';
    s+='<path d="M20 12 C26 8 30 7 34 6 M26 9 C32 11 38 10 46 8" stroke="#0002" stroke-width="1" fill="none"/>';
    if(o.brooch)s+='<circle cx="34" cy="17.5" r="3" fill="#ffd54f" stroke="#a07b00" stroke-width=".8"/><circle cx="34" cy="17.5" r="1.2" fill="#d32f2f"/><path d="M34 14 C36 8 40 6 43 5" stroke="#d4a017" stroke-width="1.6" fill="none"/>';
  }
  if(o.cap){s+='<path d="M16 24 C16 10 52 10 52 24Z" fill="'+o.cap+'" stroke="#0004"/><rect x="14" y="22" width="26" height="3.6" rx="1.8" fill="'+o.cap+'" stroke="#0004"/>';}
  if(o.veil){s+='<path d="M13 40 C10 10 28 4 34 4 C42 4 58 10 55 40 C54 24 46 16 34 16 C22 16 14 24 13 40Z" fill="'+o.veil+'" stroke="#0003"/>';}
  s+='</g><circle cx="34" cy="34" r="32.6" fill="none" stroke="#3b2a20" stroke-width="2.4"/></svg>';
  return s;
}
function avatarOf(p,size){return avatar(p&&p.bot?p.bot:(p&&p.av)||'h1',size);}
