// ====== জমিদার — বোর্ড, ঘুঁটি, ছক্কা ও অ্যানিমেশন ======
// ===== ৩ডি বাড়ি/হোটেল =====
function houseSVG(cls){return '<svg class="h3d'+cls+'" viewBox="0 0 20 22"><ellipse cx="10" cy="20.6" rx="8.5" ry="1.4" fill="#0004"/><polygon points="3,10 10,10 10,19.5 3,19.5" fill="#f7e8c4"/><polygon points="10,10 17,8.6 17,17.6 10,19.5" fill="#bda56f"/><polygon points="1,10.5 10,2 10,10.5" fill="#e5533e"/><polygon points="10,2 19,8.6 10,10.5" fill="#a52d1c"/><polygon points="1,10.5 10,10.5 10,12 1.6,12" fill="#c43f2b"/><rect x="4.6" y="13.2" width="2.6" height="6.3" fill="#6b3d1e"/><polygon points="12,12.4 15.2,11.8 15.2,14.8 12,15.4" fill="#8ecae6"/></svg>';}
function hotelSVG(cls){
  var off1=function(x){return (x-5)*0.2857;},off2=function(x){return 3-(x-20)*0.2857;},w='';
  for(var i=0;i<3;i++)for(var j=0;j<3;j++){
    var x0=7+i*4.2,y0=11+j*4.4;w+='<polygon points="'+x0+','+(y0+off1(x0))+' '+(x0+2.4)+','+(y0+off1(x0+2.4))+' '+(x0+2.4)+','+(y0+2.4+off1(x0+2.4))+' '+x0+','+(y0+2.4+off1(x0))+'" fill="#ffe08a"/>';
    var x1=22+i*4.2;w+='<polygon points="'+x1+','+(y0+off2(x1)-3)+' '+(x1+2.4)+','+(y0+off2(x1+2.4)-3)+' '+(x1+2.4)+','+(y0+2.4+off2(x1+2.4)-3)+' '+x1+','+(y0+2.4+off2(x1)-3)+'" fill="#ffd25a" opacity=".85"/>';}
  return '<svg class="ht3d'+cls+'" viewBox="0 0 40 34"><ellipse cx="20" cy="32" rx="17" ry="2" fill="#0004"/><polygon points="5,9 20,13 20,30 5,26" fill="#e2453c"/><polygon points="20,13 35,9 35,26 20,30" fill="#9c2a24"/><polygon points="5,9 20,5 35,9 20,13" fill="#f57f73"/>'+w+'<rect x="17" y="1" width="6" height="5" rx="1" fill="#fff"/><text x="20" y="5.3" font-size="4.4" text-anchor="middle" font-weight="700" fill="#b01f1f">H</text></svg>';}
// ===== বোর্ডের স্থানাঙ্ক =====
function sqRC(i){var r,c;if(i===0){r=11;c=11;}else if(i<10){r=11;c=11-i;}else if(i===10){r=11;c=1;}else if(i<20){r=11-(i-10);c=1;}else if(i===20){r=1;c=1;}else if(i<30){r=1;c=1+(i-20);}else if(i===30){r=1;c=11;}else{r=1+(i-30);c=11;}return [r,c];}
function unitC(c){return c===1?0.75:(c===11?11.25:c);}
// ===== কোণাকৃতি ঘুঁটি =====
function shade(hex,p){var n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,f=function(v){return Math.max(0,Math.min(255,Math.round(p<0?v*(1+p):v+(255-v)*p)));};return 'rgb('+f(r)+','+f(g)+','+f(b)+')';}
function coneSVG(color,k){
  return '<svg viewBox="0 0 24 34"><defs><linearGradient id="cg'+k+'" x1="0" x2="1"><stop offset="0" stop-color="'+shade(color,-.45)+'"/><stop offset=".38" stop-color="'+shade(color,.45)+'"/><stop offset=".6" stop-color="'+color+'"/><stop offset="1" stop-color="'+shade(color,-.55)+'"/></linearGradient></defs>'+
  '<ellipse cx="12" cy="30.5" rx="10.5" ry="3.2" fill="#0006"/><path d="M12 1.5 L21.5 29 A9.5 3.6 0 0 1 2.5 29 Z" fill="url(#cg'+k+')" stroke="#0008" stroke-width=".7"/><ellipse cx="12" cy="29" rx="9.5" ry="3.4" fill="'+shade(color,-.35)+'" opacity=".9"/><ellipse cx="11" cy="6" rx="1.6" ry="2.4" fill="#fff" opacity=".65"/></svg>';
}
var OFFS=[[-1.5,-.4],[1.5,-.4],[-1.5,1.7],[1.5,1.7],[0,-1.6],[0,3],[-3.1,.7],[3.1,.7]];
function tokenXY(i){
  var pos=disp[i],rc=sqRC(pos),k=0;
  for(var j=0;j<i;j++)if(!S.players[j].out&&disp[j]===pos)k++;
  var o=OFFS[k%8];
  return [unitC(rc[1])/12*100+o[0], unitC(rc[0])/12*100+o[1]+1.8];
}
function tokensHTML(){
  var h='';
  S.players.forEach(function(p,i){if(p.out)return;var xy=tokenXY(i);
    h+='<div class="tkn'+(i===S.cur&&S.phase!=='over'?' act':'')+'" id="tk'+i+'" style="left:'+xy[0]+'%;top:'+xy[1]+'%" title="'+esc(p.name)+'"><div class="in">'+coneSVG(p.color,i)+'</div></div>';});
  return h;
}
function setBusy(){app.classList.toggle('busy',anim);}
function checkIdle(){var was=anim;anim=diceBusy||moving.some(Boolean);setBusy();if(was&&!anim)render();}
function setTokenPos(i,fly){
  var el=document.getElementById('tk'+i);if(!el)return;var xy=tokenXY(i);
  el.classList.toggle('fly',!!fly);el.style.left=xy[0]+'%';el.style.top=xy[1]+'%';el.style.zIndex=50;
  var inn=el.firstChild;if(inn&&!fly){inn.classList.remove('hop');void inn.offsetWidth;inn.classList.add('hop');}
  setTimeout(function(){el.style.zIndex='';},fly?650:200);
}
function stepToken(i){
  var tgt=moveTo[i];
  if(S.players[i].out){moving[i]=false;checkIdle();return;}
  if(disp[i]===tgt){moving[i]=false;thud();checkIdle();return;}
  var d=(tgt-disp[i]+40)%40,b=(disp[i]-tgt+40)%40,np,delay=175,fly=false;
  if(d<=12)np=(disp[i]+1)%40;else if(b<=3)np=(disp[i]+39)%40;else{np=tgt;fly=true;delay=680;}
  disp[i]=np;setTokenPos(i,fly);if(fly)whoosh();else tock();
  setTimeout(function(){stepToken(i);},delay);
}
function startMove(i){
  moving[i]=true;anim=true;setBusy();
  setTimeout(function(){stepToken(i);},Math.max(120,diceUntil-Date.now()+120));
}
function afterRender(){
  S.players.forEach(function(p,i){moveTo[i]=p.pos;if(!moving[i]&&disp[i]!==p.pos&&!p.out)startMove(i);});
  setBusy();
}

var evV=null,evQ=[],FX=[],fxId=0,cashShown=null,draining=false;
function pname(i){return S.players[i]?S.players[i].name:'';}
function cellXY(pos){var rc=sqRC(pos);return [unitC(rc[1])/12*100,unitC(rc[0])/12*100];}
function fxEl(f){var el=Date.now()-f.t0;return 'style="animation-delay:-'+Math.max(0,el)+'ms;'+(f.dur?'animation-duration:'+f.dur+'ms;':'')+'"';}
function fxHTML(f){
  if(f.kind==='banner')return '<div class="bn '+f.cls+'" id="fx'+f.id+'" '+fxEl({t0:f.t0,dur:f.dur})+'><div class="e">'+f.e+'</div>'+(f.t?'<div class="t">'+esc(f.t)+'</div>':'')+(f.s?'<div class="s">'+esc(f.s)+'</div>':'')+'</div>';
  if(f.kind==='jail'){var bars='';for(var i=0;i<12;i++)bars+='<div class="bar" style="animation-delay:'+((i%3)*60-(Date.now()-f.t0))+'ms"></div>';return '<div class="fxb '+(f.out?'out':'')+'" id="fx'+f.id+'">'+bars+'<div class="lbl" style="animation-delay:-'+(Date.now()-f.t0)+'ms">'+f.lbl+'</div></div>';}
  return '';
}
function addFx(f){
  f.id=++fxId;f.t0=Date.now();FX.push(f);
  var host=document.querySelector(f.kind==='banner'?'.center':'.board');
  if(host)host.insertAdjacentHTML('beforeend',fxHTML(f));
  setTimeout(function(){FX=FX.filter(function(x){return x!==f;});var e=document.getElementById('fx'+f.id);if(e)e.remove();},f.dur+80);
}
function fxLayerHTML(){var now=Date.now(),b='',o='';FX=FX.filter(function(f){return now-f.t0<f.dur;});FX.forEach(function(f){var s=fxHTML(f);if(f.kind==='banner')b+=s;else o+=s;});return [b,o];}
function banner(e,t,s,cls,dur){addFx({kind:'banner',e:e,t:t,s:s,cls:cls||'',dur:dur||2200});}
function floatAt(x,y,txt,cls){var l=document.querySelector('.tkl');if(!l)return;var d=document.createElement('div');d.className='flt '+(cls||'n');d.textContent=txt;d.style.left=x+'%';d.style.top=y+'%';l.appendChild(d);setTimeout(function(){d.remove();},1900);}
function flyCoins(fp,tp,n){
  var l=document.querySelector('.tkl');if(!l||!l.animate)return;n=n||8;
  for(var k=0;k<n;k++){(function(k){var c=document.createElement('div');c.className='coin';c.textContent='🪙';l.appendChild(c);
    var a=l.animate?c.animate([{left:fp[0]+'%',top:fp[1]+'%',opacity:0,offset:0},{opacity:1,offset:.12},{left:(fp[0]+tp[0])/2+'%',top:Math.min(fp[1],tp[1])-7+'%',opacity:1,offset:.5},{left:tp[0]+'%',top:tp[1]+'%',opacity:1,offset:.9},{left:tp[0]+'%',top:tp[1]+'%',opacity:0,offset:1}],{duration:950,delay:k*70,fill:'both'}):null;
    var done=function(){c.remove();};if(a)a.onfinish=done;else setTimeout(done,1200);})(k);}
}
function flashCell(idx,color){var el=document.querySelector('.sq[data-i="'+idx+'"]');if(!el)return;el.style.setProperty('--fc',color||'#f5b400');el.classList.remove('flashc');void el.offsetWidth;el.classList.add('flashc');setTimeout(function(){el.classList.remove('flashc');},1400);}
function confetti(n,loop,host){
  var b=host||document.querySelector('.board');if(!b)return;var cols=['#e63946','#1d7bd8','#2a9d4a','#f4a300','#8e44ad','#00a8a8','#ff6fb5'],h='';
  for(var i=0;i<(n||50);i++)h+='<i class="cf'+(loop?' loop':'')+'" style="left:'+(Math.random()*100)+'%;background:'+cols[i%cols.length]+';animation-delay:'+(Math.random()*1.6)+'s;animation-duration:'+(1.8+Math.random()*1.6)+'s"></i>';
  var w=document.createElement('div');w.innerHTML=h;while(w.firstChild)b.appendChild(w.firstChild);
  if(!loop)setTimeout(function(){[].slice.call(b.querySelectorAll('.cf:not(.loop)')).forEach(function(x){x.remove();});},4200);
}
function cashFloats(){
  if(!cashShown||cashShown.length!==S.players.length)cashShown=S.players.map(function(p){return p.cash;});
  S.players.forEach(function(p,i){var d=p.cash-cashShown[i];cashShown[i]=p.cash;if(!d||p.out)return;var xy=cellXY(disp[i]);var o=OFFS[i%8];floatAt(xy[0]+o[0],xy[1]-1.5,(d>0?'+':'−')+'৳'+bn(Math.abs(d)),d>0?'g':'r');});
}
function playEvent(e){
  var P=function(i){return S.players[i];};
  switch(e.k){
    case 'auctionStart':SFX.auctionStart();banner('🔨','নিলাম শুরু!',SQ[e.idx].n,'auc',2300);break;
    case 'bid':SFX.bid();break;
    case 'sold':SFX.sold();banner('🔨','বিক্রি হলো!',SQ[e.idx].n+' → '+pname(e.i)+' • '+money(e.amt),'sold',2700);flashCell(e.idx,P(e.i)&&P(e.i).color);confetti(30);break;
    case 'unsold':SFX.unsold();break;
    case 'jail':SFX.jail();addFx({kind:'jail',lbl:'🚔 জেলে!',dur:2400});break;
    case 'free':SFX.free();addFx({kind:'jail',out:true,lbl:'🔓 মুক্ত!',dur:1300});break;
    case 'buy':SFX.buy();flashCell(e.idx,P(e.i)&&P(e.i).color);{var c=cellXY(e.idx);floatAt(c[0],c[1]-2,pname(e.i),'n');}break;
    case 'pay':{
      var mineFrom=isMe(e.from),mineTo=typeof e.to==='number'&&isMe(e.to)&&multiView();
      if(mineFrom)SFX.pay();else if(mineTo)SFX.get();else SFX.soft();
      if(typeof e.to==='number'&&e.kind==='rent'){flyCoins(cellXY(disp[e.from]),cellXY(disp[e.to]),8);}
      else flyCoins(cellXY(disp[e.from]),[50,50],6);
      break;}
    case 'go':SFX.go();flyCoins([88,92],cellXY(disp[e.i]),7);break;
    case 'build':SFX.build();{var c2=cellXY(e.idx);floatAt(c2[0],c2[1]-2,e.lvl===5?'হোটেল!':'বাড়ি','n');}break;
    case 'turn':if(!(multiView()&&isMe(e.i)))SFX.turn();break;
    case 'doubles':SFX.doubles();banner('🎲','ডাবলস!','','sm',1300);break;
    case 'mono':SFX.mono();banner('🌟','পুরো রঙ!',GROUPS[e.g][1]+' গ্রুপ — '+pname(e.i),'mono',2500);break;
    case 'clock':SFX.clock();banner('','ঘড়ি চালু!','সব সম্পত্তি বিক্রি — '+bn(e.min)+' মিনিট বাকি','sm',2800);break;
    case 'bankrupt':SFX.bankrupt();banner('💥',pname(e.i)+' দেউলিয়া!','','bk',2600);break;
    case 'win':SFX.win();confetti(70);break;
  }
}
function evGap(e){return {sold:1200,jail:1500,free:900,win:1400,mono:900,clock:1500,bankrupt:1100,auctionStart:700,bid:150,turn:300,pay:600}[e.k]||600;}
function drain(){
  if(anim)return;
  if(!evQ.length){cashFloats();return;}
  if(draining)return;
  draining=true;cashFloats();
  var e=evQ.shift();try{playEvent(e);}catch(x){console.error(x);}
  setTimeout(function(){draining=false;drain();},evGap(e));
}
function scoreHTML(){
  if(!S.timeUp||!S.scores)return '';
  return '<div class="sc">'+S.scores.map(function(x,r){return '<div'+(r===0?' class="top1"':'')+'><span>'+bn(r+1)+'. '+esc(pname(x.i))+'</span><b>'+money(x.net)+'</b></div>';}).join('')+'<small>মোট সম্পদ = নগদ + সম্পত্তি + বাড়ি-হোটেল</small></div>';
}
function winOverlay(){
  if(S.phase!=='over')return '';
  var cols=['#e63946','#1d7bd8','#2a9d4a','#f4a300','#8e44ad','#00a8a8','#ff6fb5'],c='';
  for(var i=0;i<45;i++)c+='<i class="cf loop" style="left:'+(Math.random()*100)+'%;background:'+cols[i%7]+';animation-delay:'+(Math.random()*2)+'s;animation-duration:'+(2+Math.random()*1.6)+'s"></i>';
  return '<div class="winov">'+c+'<div class="bn"><div class="e">🏆</div><div class="t">'+esc(pname(S.winner))+' জয়ী!</div><div class="s">'+(S.timeUp?'সময় শেষ — সম্পদে সবার সেরা':'অভিনন্দন!')+'</div>'+scoreHTML()+'</div></div>';
}
function sqHTML(i){
  var q=SQ[i],o=S.own[i],cls='sq'+(o&&o.mort?' mort':'');
  var rc=sqRC(i),r=rc[0],c=rc[1];
  var inner='';
  if(q.t==='prop'){
    var lv=o?o.lvl:0,bar='';
    var was=seenLvl[i]||0,pop=lv>was?' pop':'';seenLvl[i]=lv;
    if(lv===5)bar=hotelSVG(pop);else for(var h=0;h<lv;h++)bar+=houseSVG(pop&&h===lv-1?' pop':'');
    inner='<div class="bar" style="background:'+GROUPS[q.g][0]+'">'+bar+'</div><div class="nm">'+esc(q.n)+'</div><div class="pr">'+money(q.p)+'</div>';
  }else{
    var ic={go:'➡️',chance:'❓',cc:'📦',tax:'💸',jail:'🔒',park:'🅿️',gojail:'🚔',station:'🚂',util:q.n==='বিদ্যুৎ'?'💡':'🚰'}[q.t];
    inner='<div class="ic">'+ic+'</div><div class="nm">'+esc(q.n)+'</div>'+(q.p?'<div class="pr">'+money(q.p)+'</div>':(q.amt?'<div class="pr">'+money(q.amt)+'</div>':''));
  }
  if(o)inner+='<div class="own" style="background:'+S.players[o.o].color+'"></div>';
  return '<div class="'+cls+'" data-i="'+i+'" style="grid-area:'+r+'/'+c+'" onclick="G.deed('+i+')">'+inner+'</div>';
}
// ===== ৩ডি ঘুরন্ত ছক্কা =====
var CUBE_ROT={1:[0,0],6:[0,180],3:[0,-90],4:[0,90],2:[-90,0],5:[90,0]};
var PIPS=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
function cubeT(v,sp){var r=CUBE_ROT[v]||[0,0],a=sp||[0,0,0];
  return 'rotateX(-22deg) rotateY(-26deg) rotateX('+(r[0]+360*a[0])+'deg) rotateY('+(r[1]+360*a[1])+'deg) rotateZ('+(360*a[2])+'deg)';}
function faceHTML(n){var h='<div class="f f'+n+(n===1?' r1':'')+'">';for(var k=0;k<9;k++)h+='<i'+(PIPS[n].indexOf(k)>=0?' class="on"':'')+'></i>';return h+'</div>';}
function cubeHTML(k,v){var h='<div class="dw d'+(k+1)+'" id="dw'+k+'"><div class="cube" id="cu'+k+'" style="transform:'+cubeT(v,[0,0,0])+'">';for(var n=1;n<=6;n++)h+=faceHTML(n);return h+'</div></div>';}
function diceInner(v){return cubeHTML(0,v[0])+cubeHTML(1,v[1]);}
function startDice(final){
  diceBusy=true;anim=true;setBusy();diceUntil=Date.now()+1400;rattle();
  var spins=[[2,3,1],[3,2,-1]];
  for(var k=0;k<2;k++){
    var dw=document.getElementById('dw'+k),cu=document.getElementById('cu'+k);if(!cu)continue;
    dw.classList.remove('throw');void dw.offsetWidth;dw.classList.add('throw');
    void cu.offsetWidth;cu.style.transform=cubeT(final[k],spins[k]);
  }
  setTimeout(function(){tock(180,.7*DICEV);},720);setTimeout(function(){thud();},1000);
  clearTimeout(startDice.t);startDice.t=setTimeout(function(){diceBusy=false;dicePrev=final.slice();checkIdle();},1300);
  clearTimeout(startDice.fs);startDice.fs=setTimeout(function(){diceBusy=false;moving=[];checkIdle();},9000);
}
function multiView(){return MODE==='online'||(S&&S.players.some(function(p){return p.bot;}));}
