// ===== সাউন্ড (ব্রাউজারেই তৈরি, কোনো অডিও ফাইল লাগে না) =====
function lsGet(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
var AC=null,muted=lsGet('jm_mute')==='1';
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==='suspended'){try{AC.resume();}catch(e){}}return AC;}
document.addEventListener('click',function(){ac();});
function noiseBuf(c,sec){var b=c.createBuffer(1,Math.floor(c.sampleRate*sec),c.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);return b;}
function tock(f,vol){var c=ac();if(!c||muted)return;var t=c.currentTime,o=c.createOscillator(),g=c.createGain();
  o.type='triangle';o.frequency.setValueAtTime(f||230,t);o.frequency.exponentialRampToValueAtTime(65,t+.1);
  g.gain.setValueAtTime(vol||.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.13);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.14);
  var n=c.createBufferSource();n.buffer=noiseBuf(c,.03);var g2=c.createGain();g2.gain.value=(vol||.55)*.5;n.connect(g2);g2.connect(c.destination);n.start(t);}
function thud(){tock(130,.8);}
function rattle(){for(var k=0;k<9;k++)(function(k){setTimeout(function(){tock(280+Math.random()*260,.28);},k*85);})(k);}
function whoosh(){var c=ac();if(!c||muted)return;var t=c.currentTime,n=c.createBufferSource();n.buffer=noiseBuf(c,.45);var f=c.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(2400,t+.4);var g=c.createGain();g.gain.value=.35;n.connect(f);f.connect(g);g.connect(c.destination);n.start(t);}
function osc(type,f,t0,d,vol,f2){var c=ac();if(!c||muted)return;var t=c.currentTime+t0,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03);}
function nz(t0,d,ftype,ff,vol){var c=ac();if(!c||muted)return;var t=c.currentTime+t0,n=c.createBufferSource();n.buffer=noiseBuf(c,d);var f=c.createBiquadFilter();f.type=ftype;f.frequency.value=ff;var g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(f);f.connect(g);g.connect(c.destination);n.start(t);}
function bell(f,t0,d,vol){osc('sine',f,t0,d,vol);osc('sine',f*2.76,t0,d*.6,vol*.4);osc('sine',f*5.4,t0,d*.3,vol*.2);}
function knock(t0,vol){nz(t0,.06,'lowpass',1500,vol);osc('triangle',220,t0,.12,vol,70);}
function coinS(t0,vol){var f=2600+Math.random()*1800;osc('sine',f,t0,.2,vol);osc('sine',f*1.5,t0,.12,vol*.5);}
var SFX={
  auctionStart:function(){[0,.15,.3].forEach(function(t){bell(1250,t,.55,.28);});},
  bid:function(){bell(1800,0,.25,.16);},
  sold:function(){knock(0,.8);knock(.17,.95);bell(1500,.32,.9,.3);},
  unsold:function(){osc('triangle',200,0,.3,.3,90);},
  jail:function(){nz(0,.2,'lowpass',500,.9);osc('square',180,0,.35,.3,90);osc('sine',70,0,.55,.7,40);for(var k=0;k<4;k++)osc('sawtooth',k%2?700:950,.4+k*.22,.2,.1);},
  free:function(){nz(0,.04,'highpass',3000,.5);nz(.13,.04,'highpass',3000,.5);bell(1700,.3,.55,.25);},
  buy:function(){nz(0,.05,'bandpass',1800,.5);nz(.08,.05,'bandpass',2400,.5);bell(1800,.16,.8,.3);bell(2400,.16,.7,.16);},
  pay:function(){for(var k=0;k<8;k++)coinS(k*.07,.17*(1-k*.08));},
  get:function(){[0,.07,.14,.22].forEach(function(t,i){bell(1400+i*350,t,.42,.2);});},
  soft:function(){for(var k=0;k<3;k++)coinS(k*.09,.06);},
  go:function(){[523,659,784,1047].forEach(function(f,i){osc('triangle',f,i*.09,.42,.28);});bell(2093,.4,.8,.14);},
  build:function(){[0,.14,.28].forEach(function(t){knock(t,.55);});},
  turn:function(){osc('sine',880,0,.2,.2);osc('sine',1175,.13,.32,.2);},
  doubles:function(){osc('triangle',660,0,.1,.25);osc('triangle',880,.1,.2,.25);},
  mono:function(){[784,988,1175,1568].forEach(function(f,i){bell(f,i*.1,.6,.18);});},
  cheer:function(){osc('triangle',523,0,.12,.16);osc('triangle',659,.1,.12,.16);osc('triangle',784,.2,.25,.18);},
  clock:function(){bell(660,0,.7,.26);bell(880,.22,.7,.26);bell(1175,.44,1.0,.28);},
  warn:function(){osc('square',880,0,.09,.07);},
  myTurn:function(){bell(784,0,.55,.3);bell(988,.16,.55,.3);bell(1319,.32,.9,.34);osc('square',1319,.32,.12,.05);},
  win:function(){var n=[[523,.14],[523,.14],[523,.14],[659,.36],[523,.18],[659,.18],[784,.9]],t=0;n.forEach(function(x){osc('square',x[0],t,x[1]+.05,.09);osc('triangle',x[0]*2,t,x[1]+.05,.12);t+=x[1];});bell(1568,t-.3,1.2,.2);},
  bankrupt:function(){var n=[[311,.4],[294,.4],[277,.4],[233,1]],t=0;n.forEach(function(x,i){osc('sawtooth',x[0],t,x[1],.09,i===3?x[0]*.8:x[0]*.97);t+=x[1];});}
};
