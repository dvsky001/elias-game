(function(){
'use strict';
var W=window.ELIAS_WORDS||{};
var app=document.getElementById('app'),ov=document.getElementById('overlay');
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ld(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}

var DECKS=[
 {id:'easy',name:'Простые',diff:'Лёгкие',cls:'',badge:'ПОПУЛЯРНОЕ'},
 {id:'medium',name:'Средние',diff:'Средние',cls:'dk-med'},
 {id:'hard',name:'Сложные',diff:'Сложные',cls:'dk-hard'},
 {id:'adult',name:'18+',diff:'Для взрослых · с подтверждением',cls:'dk-adult',adult:true,badge:'18+',red:true}
];
var PL_NAMES=['Саша','Маша','Дима','Аня','Макс','Лена','Игорь','Катя','Олег','Юля','Тимур','Вика'];
var TM_NAMES=['Ураганы','Искры','Пузырьки','Вулканы','Лисы','Кометы','Ниндзя','Совы','Тигры','Орбита','Фейерверк','Бумеранг'];

var prefs=Object.assign({mode:'ffa',ffa:['Игрок 1','Игрок 2','Игрок 3'],team:['Ураганы','Искры','Пузырьки'],
 ptsF:30,ptsT:50,time:60,penalty:true,lastAll:true,blitz:false,gest:false,draw:false,saves:0,sound:true,markWho:false,decks:['easy'],installHide:false},ld('elias.prefs',{}));
function savePrefs(){sv('elias.prefs',prefs)}
var played=ld('elias.played',{});
var custom=ld('elias.custom',[]);
var G=ld('elias.game',null);
if(G&&G.over)G=null;
function saveG(){if(G)sv('elias.game',G);else try{localStorage.removeItem('elias.game')}catch(e){}}

/* ---------- audio ---------- */
var AC=null;
function beep(f,d,v){if(!prefs.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
 var o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.value=v||.12;o.connect(g);g.connect(AC.destination);o.start();
 g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
function toast(t){var e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(function(){e.remove()},2600)}

/* ---------- words ---------- */
function deckWords(id){if(W[id])return W[id];for(var i=0;i<custom.length;i++)if(custom[i].id===id)return custom[i].words;return[]}
function poolFor(ids){var seen={},out=[];ids.forEach(function(id){deckWords(id).forEach(function(w){var k=w.toLowerCase();if(!seen[k]){seen[k]=1;out.push(w)}})});return out}
function drawWord(){
 var pool=poolFor(G.decks);
 var left=pool.filter(function(w){return !played[w.toLowerCase()]});
 if(!left.length){pool.forEach(function(w){delete played[w.toLowerCase()]});left=pool.slice();toast('Слова выбранных колод закончились — начинаем круг заново')}
 var w=pick(left);played[w.toLowerCase()]=1;sv('elias.played',played);return w}
function newCard(){
 var w=drawWord(),task=null,t=[];
 if(G.set.gest)t.push('gest');if(G.set.draw)t.push('draw');
 if(t.length&&Math.random()<.25)task=pick(t);
 return {w:w,task:task}}

/* ---------- scoring ---------- */
function unit(set){return set.blitz?2:1}
function calc(logs){
 var n=G.names.length,sc=[],used=[],i;for(i=0;i<n;i++){sc.push(0);used.push(0)}
 var v=unit(G.set);
 logs.forEach(function(t){t.items.forEach(function(it){
  if(it.st==='g'){if(G.mode==='ffa'&&G.set.markWho&&it.by!=null){sc[it.by]+=v;sc[t.e]+=v}else sc[it.by!=null?it.by:t.e]+=v}
  else if(it.st==='s'){if(G.set.penalty)sc[t.e]-=1}
  else if(it.st==='f'){used[t.e]++}})});
 return {sc:sc,used:used}}
function turnDelta(items){var v=unit(G.set),d=0;items.forEach(function(it){if(it.st==='g')d+=v;else if(it.st==='s'&&G.set.penalty)d-=1});return d}
function target(){return G.mode==='ffa'?G.set.ptsF:G.set.ptsT}
function curE(){return G.turnNo%G.names.length}

/* ---------- views ---------- */
function screen(html,cls){app.innerHTML='<div class="scr '+(cls||'')+'">'+html+'</div>'}
function hdr(title,back,right){return '<div class="hdr"><button class="back" data-act="'+(back||'menu')+'">'+(back==='menu'?'Меню':back==='players'?'Игроки':back==='settings'?'Настройки':back==='dicts'?'Словари':'Назад')+'</button><h1>'+title+'</h1><div class="right">'+(right||'')+'</div></div>'}
function closeOv(){ov.className='';ov.innerHTML=''}
function sheet(html,dismiss){ov.className='show';ov.innerHTML='<div class="bk"></div><div class="sheet">'+html+'</div>';if(dismiss!==false)$('.bk',ov).onclick=closeOv}
function modal(html,dismiss){ov.className='show';ov.innerHTML='<div class="bk"></div><div class="modal">'+html+'</div>';if(dismiss!==false)$('.bk',ov).onclick=closeOv}

function citySvg(){
 var cols=['#FFB84D','#FF7A59','#FFD966','#7BD389','#fff','#B58CF2','#FF8FB1','#5FD0E8'],x=-6,h='',seed=7;
 function r(){seed=(seed*9301+49297)%233280;return seed/233280}
 while(x<420){var w=34+r()*32,ht=110+r()*190,c=cols[Math.floor(r()*cols.length)],y=388-ht;
  h+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+(ht+10)+'" rx="3" fill="'+c+'"/>';
  if(r()>.5)h+='<path d="M'+(x-3)+' '+y+' L'+(x+w/2)+' '+(y-16)+' L'+(x+w+3)+' '+y+'Z" fill="#E4573D"/>';else h+='<rect x="'+(x-2)+'" y="'+(y-5)+'" width="'+(w+4)+'" height="6" rx="2" fill="rgba(0,0,0,.18)"/>';
  for(var wy=y+12;wy<372;wy+=26)for(var wx=x+8;wx<x+w-12;wx+=18)h+='<rect x="'+wx+'" y="'+wy+'" width="9" height="13" rx="2" fill="'+(r()>.35?'rgba(255,255,255,.75)':'rgba(40,90,140,.45)')+'"/>';
  x+=w+2+r()*4}
 h+='<rect x="0" y="366" width="420" height="40" fill="#fff"/>';
 return '<svg class="city" viewBox="0 0 420 400" preserveAspectRatio="xMidYMax meet">'+h+'</svg>'}
function skySvg(){return '<svg class="sky" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"><g fill="#fff" opacity=".85"><ellipse cx="70" cy="330" rx="46" ry="16"/><ellipse cx="98" cy="318" rx="30" ry="18"/><ellipse cx="330" cy="260" rx="52" ry="17"/><ellipse cx="300" cy="248" rx="30" ry="17"/><ellipse cx="350" cy="430" rx="40" ry="13"/><ellipse cx="46" cy="500" rx="38" ry="12"/></g>'+
 '<g transform="translate(335 430)"><ellipse cx="0" cy="0" rx="17" ry="21" fill="#FF6B6B"/><path d="M-17 0 Q0 -14 17 0" fill="#FFD93D" opacity=".9"/><path d="M-6 20 L-4 34 L4 34 L6 20Z" fill="#8a5a2b"/></g></svg>'}
function logoSvg(sz){return '<svg viewBox="0 0 230 170" width="'+(sz||210)+'"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB93A"/><stop offset="1" stop-color="#FB8E12"/></linearGradient></defs>'+
 '<path d="M30 6 H200 Q224 6 224 30 V100 Q224 124 200 124 H110 L66 160 L72 124 H30 Q6 124 6 100 V30 Q6 6 30 6Z" fill="url(#lg)"/>'+
 '<text x="115" y="88" text-anchor="middle" font-family="-apple-system,SF Pro Rounded,Arial Rounded MT Bold,Helvetica,Arial,sans-serif" font-weight="900" font-size="62" fill="#fff" letter-spacing="-1">элиас</text>'+
 '<circle cx="190" cy="34" r="6" fill="#fff" opacity=".9"/></svg>'}

function isStandalone(){return window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)}
function showMenu(){
 closeOv();
 var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),inst='';
 if(ios&&!isStandalone()&&!prefs.installHide)inst='<div class="install"><b>Поставь на экран:</b> нажми «Поделиться» <span>⬆︎</span> → «На экран “Домой”». Игра будет работать офлайн.<button class="x" data-act="hideinst">×</button></div>';
 screen(skySvg()+citySvg()+inst+'<div class="logo">'+logoSvg()+'</div><div class="tag">игра в слова для компании</div>'+
 '<div class="btns">'+(G?'<button class="obtn" data-act="continue">Продолжить</button>':'')+'<button class="obtn" data-act="new">Новая игра</button><button class="obtn" data-act="how">Как играть</button></div>','menu')}

function showHow(){
 screen(hdr('Как играть','menu')+'<div class="body"><div class="how">'+
 '<h2>Идея</h2><p>Один объясняет слово с карточки, остальные угадывают. Называть само слово и однокоренные нельзя.</p>'+
 '<h2>Все против всех</h2><ul><li>Объясняющий идёт по кругу.</li><li>Слово угадали: свайп <span class="sw">вверх ▲</span>, объясняющему +1.</li><li>Пропуск: свайп <span class="sw">вниз ▼</span>, объясняющему −1.</li><li>Когда время вышло, последнее слово: угадали или нет. Угадали — +1 объясняющему.</li><li>В настройках можно включить «Отмечать, кто угадал»: тогда очко получают и угадавший, и объясняющий.</li><li>Игра идёт до 30 очков (можно изменить).</li></ul>'+
 '<h2>Командная игра</h2><ul><li>Объясняет игрок из команды, угаданное слово +1 команде, пропуск −1.</li><li>Последнее слово после таймера может забрать любая команда.</li><li>Обычно играют до 50 очков, ход заканчивается кругом, чтобы у всех было поровну ходов.</li></ul>'+
 '<h2>Модификации</h2><ul><li><b>Без штрафа</b>: пропуск ничего не отнимает.</li><li><b>Блиц</b>: ход 30 секунд, +2 за слово.</li><li><b>Жесты / рисунок</b>: на некоторых карточках появляется задание.</li><li><b>Спасения</b>: 1–2 пропуска за игру без штрафа.</li></ul>'+
 '<h2>Слова</h2><p>Слова не повторяются: игра помнит сыгранные и показывает только новые. Можно добавить свою колоду, вставив слова списком.</p></div></div>')}

/* players */
function names(){return prefs[prefs.mode]}
function showPlayers(){
 var m=prefs.mode,list=names();
 var rows=list.map(function(n,i){return '<div class="row"><input class="nm" data-i="'+i+'" value="'+esc(n)+'" maxlength="24" autocomplete="off" autocapitalize="sentences"><button class="del" data-del="'+i+'" aria-label="Удалить">×</button></div>'}).join('');
 screen(hdr(m==='ffa'?'Игроки':'Команды','menu')+'<div class="seg"><button data-mode="ffa" class="'+(m==='ffa'?'on':'')+'">Все против всех</button><button data-mode="team" class="'+(m==='team'?'on':'')+'">Командная</button></div>'+
 '<div class="body" style="padding:0">'+rows+(list.length<12?'<button class="plus" data-act="add">+</button>':'')+
 '<div class="hint">'+(m==='ffa'?'Каждый играет сам за себя. Объясняющий идёт по кругу.':'Объясняет любой игрок команды.')+'<br>Нажми на имя, чтобы изменить. Двойной тап — случайное имя.</div></div>'+
 '<button class="next" data-act="settings">Далее</button>')}

/* settings */
function showSettings(){
 var m=prefs.mode,pk=m==='ffa'?'ptsF':'ptsT';
 function tg(k,t,s,x){return '<div class="set '+(x||'')+'"><div class="l1"><div><div class="t">'+t+'</div><div class="s">'+s+'</div></div><button class="tg '+(prefs[k]?'on':'')+'" data-tg="'+k+'" aria-label="'+t+'"></button></div></div>'}
 screen(hdr('Настройки','players')+'<div class="body">'+
 '<div class="set"><div class="l1"><div><div class="t">Очки до победы</div><div class="s">чтобы выиграть игру</div></div><div class="v" id="v1">'+prefs[pk]+'</div></div><input type="range" id="r1" min="10" max="'+(m==='ffa'?100:150)+'" step="5" value="'+prefs[pk]+'"></div>'+
 '<div class="set '+(prefs.blitz?'dim':'')+'" id="timeset"><div class="l1"><div><div class="t">Время хода</div><div class="s">длительность в секундах</div></div><div class="v" id="v2">'+(prefs.blitz?30:prefs.time)+'</div></div><input type="range" id="r2" min="15" max="120" step="5" value="'+prefs.time+'"></div>'+
 tg('penalty','Штраф за пропуск','−1 очко за каждое пропущенное слово')+
 tg('lastAll','Последнее слово всем','после таймера слово может угадать '+(m==='ffa'?'любой игрок':'любая команда'))+
 (m==='ffa'?tg('markWho','Отмечать, кто угадал','после каждого слова выбрать, кто угадал первым: +1 ему и +1 объясняющему'):'')+
 tg('blitz','Блиц','30 секунд на ход, +2 за слово')+
 tg('gest','Задания: жесты','на части карточек — показать слово без слов')+
 tg('draw','Задания: рисунок','на части карточек — нарисовать слово')+
 '<div class="set"><div class="l1"><div><div class="t">Спасения</div><div class="s">пропуски без штрафа за игру (на '+(m==='ffa'?'игрока':'команду')+')</div></div><div class="stp">'+[0,1,2].map(function(n){return '<button data-sv="'+n+'" class="'+(prefs.saves===n?'on':'')+'">'+n+'</button>'}).join('')+'</div></div></div>'+
 tg('sound','Звук','сигналы таймера')+
 '<div style="height:14px"></div></div><button class="next" data-act="dicts">Далее</button>')}

/* dictionaries */
var samples={};
function sampleOf(id){if(!samples[id]){var a=deckWords(id).slice(),o=[];while(o.length<3&&a.length)o.push(a.splice(rnd(a.length),1)[0]);samples[id]=o.join(', ')}return samples[id]}
function dkArt(id){
 if(id==='hard')return '<svg class="art" viewBox="0 0 160 110"><g fill="none" stroke="#fff" stroke-width="3" opacity=".8"><circle cx="100" cy="55" r="34"/><path d="M100 21 V89 M66 55 H134 M76 31 Q100 55 76 79 M124 31 Q100 55 124 79"/></g></svg>';
 if(id==='adult')return '<svg class="art" viewBox="0 0 160 110"><path d="M110 92 C60 60 70 22 100 38 C112 44 112 50 112 50 C112 50 114 44 126 38 C156 22 160 60 110 92Z" fill="#fff" opacity=".7"/></svg>';
 if(id==='medium')return '<svg class="art" viewBox="0 0 160 110"><g fill="#fff" opacity=".7"><circle cx="100" cy="40" r="22"/><circle cx="130" cy="72" r="16"/><circle cx="82" cy="78" r="10"/></g></svg>';
 return ''}
function showDicts(){
 var h=DECKS.map(function(d){var on=prefs.decks.indexOf(d.id)>-1;
  return '<button class="dk '+d.cls+(on?' on':'')+'" data-dk="'+d.id+'">'+dkArt(d.id)+'<div class="n">'+d.name+'</div><div class="d">'+d.diff+'</div><div class="ex">'+(d.adult&&!on?'Слова скрыты до подтверждения':esc(sampleOf(d.id)))+'</div><div class="cnt">'+W[d.id].length+'</div>'+(d.badge?'<span class="bd'+(d.red?' red':'')+'" style="right:54px">'+d.badge+'</span>':'')+'<span class="ck">'+(on?'✓':'')+'</span></button>'}).join('');
 h+=custom.map(function(c){var on=prefs.decks.indexOf(c.id)>-1;
  return '<button class="dk dk-cust'+(on?' on':'')+'" data-dk="'+c.id+'"><div class="n">'+esc(c.name)+'</div><div class="d">Своя колода</div><div class="ex">'+esc(c.words.slice(0,3).join(', '))+'</div><div class="cnt">'+c.words.length+'</div><span class="bd gr" style="right:54px">СВОЯ</span><span class="ck">'+(on?'✓':'')+'</span><span data-del="'+c.id+'" style="position:absolute;left:20px;bottom:10px;color:#c23;font-size:13px;font-weight:700;padding:4px 0">Удалить</span></button>'}).join('');
 var total=poolFor(prefs.decks).length,left=poolFor(prefs.decks).filter(function(w){return !played[w.toLowerCase()]}).length;
 screen(hdr('Словари','settings')+'<div class="body" style="padding:0">'+h+'<button class="addck" data-act="addck"><span style="font-size:26px;line-height:1">+</span> Своя колода (вставить слова)</button>'+
 '<div class="goal">Выбрано слов: '+total+' · новых: '+left+'</div><button class="rst" data-act="resetplayed">Забыть сыгранные слова</button></div><button class="next" data-act="start" '+(prefs.decks.length?'':'disabled')+'>Играть</button>')}
function askAdult(cb){modal('<h3>Колода 18+</h3><p>Слова на сексуальную тематику и взрослый юмор. Только для взрослых. Подтверди, что тебе есть 18 лет.</p><button class="opt r" data-ok>Мне 18+</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-ok]',ov).onclick=function(){closeOv();cb()};$('[data-no]',ov).onclick=closeOv}
function addDeckModal(){modal('<h3>Своя колода</h3><p>Вставь слова списком: каждое с новой строки или через запятую.</p><input class="tx" id="cn" placeholder="Название колоды" maxlength="24"><textarea id="cw" placeholder="слово 1&#10;слово 2&#10;слово 3"></textarea><button class="opt" data-ok>Сохранить</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){
  var nm=$('#cn').value.trim()||('Колода '+(custom.length+1)),seen={},ws=[];
  $('#cw').value.split(/[\n,;]+/).forEach(function(x){x=x.trim();if(x&&x.length<=60&&!seen[x.toLowerCase()]){seen[x.toLowerCase()]=1;ws.push(x)}});
  if(ws.length<5){toast('Нужно хотя бы 5 слов');return}
  var id='c'+Date.now();custom.push({id:id,name:nm,words:ws});sv('elias.custom',custom);prefs.decks.push(id);savePrefs();closeOv();showDicts()}}

/* ---------- game flow ---------- */
function startGame(){
 var m=prefs.mode,nm=names().map(function(n,i){return (n||'').trim()||((m==='ffa'?'Игрок ':'Команда ')+(i+1))});
 if(poolFor(prefs.decks).length<10){toast('В выбранных колодах слишком мало слов');return}
 G={mode:m,names:nm,set:{ptsF:prefs.ptsF,ptsT:prefs.ptsT,time:prefs.time,penalty:prefs.penalty,lastAll:prefs.lastAll,markWho:!!prefs.markWho,blitz:prefs.blitz,gest:prefs.gest,draw:prefs.draw,saves:prefs.saves,sound:prefs.sound},
 decks:prefs.decks.slice(),turnNo:0,logs:[],phase:'ready',over:false};
 saveG();showReady()}

function chipsHtml(){var s=G.set,c=['<span class="chip b">⏱ '+(s.blitz?30:s.time)+' с</span>','<span class="chip b">🎯 до '+target()+'</span>'];
 if(s.blitz)c.push('<span class="chip r">⚡ блиц +2</span>');
 c.push('<span class="chip">'+(s.penalty?'пропуск −1':'без штрафа')+'</span>');
 if(s.gest)c.push('<span class="chip">🤐 жесты</span>');if(s.draw)c.push('<span class="chip">✏️ рисунок</span>');
 return c.join('')}
function showReady(){
 closeOv();G.phase='ready';saveG();
 var e=curE(),cs=calc(G.logs),left=G.set.saves-cs.used[e];
 var info=G.mode==='ffa'?(G.set.markWho?'Остальные угадывают все сразу. Кто угадал первым: +1 ему и +1 тебе. Пропуск −1 тебе.':'Остальные угадывают все сразу. Угадали — +1 тебе. Пропуск −1 тебе.'):'Объясняет игрок команды, остальные угадывают.';
 if(!G.set.penalty)info=info.replace(/ Пропуск −1 тебе\./,' Пропуск без штрафа.').replace('Объясняет игрок команды, остальные угадывают.','Объясняет игрок команды, остальные угадывают. Пропуск без штрафа.');
 if(G.set.penalty&&G.set.saves>0)info+=' Спасений осталось: '+Math.max(0,left)+'.';
 screen('<div class="top"><button data-act="menu">‹ Меню</button><button data-act="board">Табло</button></div>'+
 '<div class="rcard"><div class="lab">'+(G.mode==='ffa'?'Объясняет':'Ход команды')+'</div><div class="who">'+esc(G.names[e])+'</div><div class="info">'+info+'</div><div class="chips">'+chipsHtml()+'</div></div>'+
 '<div class="bot"><button class="obtn" data-act="go">Старт</button></div>','ready')}

/* play */
var P=null;
function showPlay(){
 closeOv();G.phase='play';
 var e=curE(),dur=G.set.blitz?30:G.set.time;
 P={items:[],dur:dur,rem:dur*1000,end:0,paused:false,iv:null,card:newCard(),busy:false,lastBeep:99,sheet:false};
 screen('<div class="ptop"><button class="pa" data-act="pause" aria-label="Пауза"><i></i><i></i></button><div class="pt" id="tm">'+dur+'</div><div class="ps">очки хода<b id="pd">0</b></div></div>'+
 '<div class="pwho">'+esc(G.names[e])+(G.set.penalty&&G.set.saves>0?' · спасений: <span id="svl"></span>':'')+'</div><div class="pbar"><i id="pb"></i></div>'+
 '<div class="arena"><div class="hintup">УГАДАЛИ</div><div class="hintdn">ПРОПУСК</div><div id="cardhold" style="width:100%;display:flex;justify-content:center"></div></div>'+
 '<div class="pact"><button class="no" data-act="skip" aria-label="Пропуск">✕</button><button class="yes" data-act="ok" aria-label="Угадали">✓</button></div>','play');
 mountCard();updPlay();
 P.end=Date.now()+P.rem;P.iv=setInterval(tick,100);beep(660,.12)}
function usedNow(){var e=curE();return calc(G.logs).used[e]+P.items.filter(function(i){return i.st==='f'}).length}
function updPlay(){
 var d=$('#pd');if(d)d.textContent=(turnDelta(P.items)>0?'+':'')+turnDelta(P.items);
 var s=$('#svl');if(s)s.textContent=Math.max(0,G.set.saves-usedNow())}
function mountCard(){
 var hold=$('#cardhold');if(!hold)return;var c=P.card,len=c.w.length;
 var wcls=len>22?'xl':len>13?'long':'';
 var tk=c.task?'<div class="tk"><span class="chip r">'+(c.task==='gest'?'🤐 Покажи жестами':'✏️ Нарисуй')+'</span></div>':'';
 var free=(G.set.penalty&&G.set.saves-usedNow()>0)?'<div class="free">пропуск без штрафа (спасение)</div>':'';
 hold.innerHTML='<div class="wcard" id="wc">'+tk+'<div class="stamp g">УГАДАЛИ</div><div class="stamp s">ПРОПУСК</div><div class="w '+wcls+'">'+esc(c.w)+'</div>'+free+'</div>';
 var el=$('#wc');el.style.animation='cardin .22s ease-out';bindDrag(el)}
function bindDrag(el){
 var sy=0,dy=0,act=false,id=null;
 var sg=$('.stamp.g',el),ss=$('.stamp.s',el);
 el.addEventListener('pointerdown',function(ev){if(P.busy||P.paused||P.sheet)return;act=true;sy=ev.clientY;dy=0;id=ev.pointerId;try{el.setPointerCapture(id)}catch(e){}el.style.transition='none'});
 el.addEventListener('pointermove',function(ev){if(!act)return;dy=ev.clientY-sy;el.style.transform='translateY('+dy+'px) rotate('+(dy/40)+'deg)';
  var a=Math.min(1,Math.abs(dy)/90);el.classList.toggle('g',dy<-20);el.classList.toggle('s',dy>20);sg.style.opacity=dy<0?a:0;ss.style.opacity=dy>0?a:0});
 function end(){if(!act)return;act=false;
  if(dy<-80)fling(el,-1);else if(dy>80)fling(el,1);
  else{el.style.transition='transform .18s';el.style.transform='';el.classList.remove('g','s');sg.style.opacity=0;ss.style.opacity=0}}
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)}
function fling(el,dir){
 if(P.busy)return;P.busy=true;
 el.style.transition='transform .2s ease-in,opacity .2s';el.style.transform='translateY('+(dir*520)+'px) rotate('+(dir*10)+'deg)';el.style.opacity='0';
 setTimeout(function(){P.busy=false;if(!P||!$('#wc'))return;dir<0?onGuess():onSkip()},190)}
function btnFling(dir){var el=$('#wc');if(!el||P.busy||P.paused||P.sheet)return;el.classList.add(dir<0?'g':'s');fling(el,dir)}
function advance(){P.card=newCard();mountCard();updPlay()}
function onGuess(){
 if(P.over)return;
 if(G.mode==='ffa'&&G.set.markWho){
  var e=curE(),opts=G.names.map(function(n,i){return i===e?'':'<button class="opt b" data-by="'+i+'">'+esc(n)+'</button>'}).join('');
  P.sheet=true;
  sheet('<h3>Кто угадал первым?</h3><div class="sub">«'+esc(P.card.w)+'»</div><div class="opts">'+opts+'<button class="opt gy w" data-by="-1">Никто · вернуть слово</button></div>',false);
  $$('[data-by]',ov).forEach(function(b){b.onclick=function(){var by=+b.getAttribute('data-by');P.sheet=false;closeOv();
   if(P.over)return;
   if(by<0){var el=$('#wc');if(el){el.style.transition='';el.style.transform='';el.style.opacity='';el.classList.remove('g','s');$$('.stamp',el).forEach(function(s){s.style.opacity=0})}return}
   P.items.push({w:P.card.w,st:'g',by:by});beep(880,.08);advance()}})
 }else{P.items.push({w:P.card.w,st:'g',by:curE()});beep(880,.08);advance()}}
function onSkip(){
 var free=G.set.penalty&&(G.set.saves-usedNow())>0;
 P.items.push({w:P.card.w,st:free?'f':'s'});beep(300,.12);advance()}
function tick(){
 if(P.paused)return;
 var rem=P.end-Date.now(),s=Math.max(0,Math.ceil(rem/1000));
 var t=$('#tm');if(t){t.textContent=s;t.classList.toggle('low',s<=5&&s>0)}
 var pb=$('#pb');if(pb)pb.style.width=Math.max(0,rem/(P.dur*1000)*100)+'%';
 if(s<=5&&s>0&&s!==P.lastBeep){P.lastBeep=s;beep(520,.1)}
 if(rem<=0)timeUp()}
function stopTimer(){if(P&&P.iv){clearInterval(P.iv);P.iv=null}}
function timeUp(){
 stopTimer();P.over=true;P.sheet=false;closeOv();beep(220,.7,.2);
 var el=$('#wc');if(el)el.style.transform='';
 if(G.set.lastAll)showLast();else showResults()}
function pauseGame(){
 if(!P||P.paused||P.over)return;P.paused=true;P.rem=Math.max(0,P.end-Date.now());
 modal('<h3>Пауза</h3><p>Таймер остановлен.</p><button class="opt" data-r>Продолжить</button><button class="opt gy" data-e>Закончить ход</button><button class="opt gy" data-m>Выйти в меню</button>',false);
 $('[data-r]',ov).onclick=function(){closeOv();P.paused=false;P.end=Date.now()+P.rem};
 $('[data-e]',ov).onclick=function(){closeOv();stopTimer();P.over=true;showResults()};
 $('[data-m]',ov).onclick=function(){closeOv();stopTimer();P=null;showMenu()}}
document.addEventListener('visibilitychange',function(){if(document.hidden&&P&&!P.over&&!P.paused&&$('#tm'))pauseGame()});

function showLast(){
 var e=curE();
 if(G.mode==='ffa'&&!G.set.markWho){
  screen('<h2>Время вышло!</h2><div class="q">Последнее слово</div><div class="lw">'+esc(P.card.w)+'</div><div class="q">Угадали?</div><div class="chs"><button class="opt" data-ok="1">Угадали</button><button class="opt gy" data-ok="0">Нет</button></div>','last');
  $$('[data-ok]',app).forEach(function(b){b.onclick=function(){var ok=b.getAttribute('data-ok')==='1';
   P.items.push(ok?{w:P.card.w,st:'g',by:e,last:true}:{w:P.card.w,st:'n',last:true});showResults()}});
  return}
 var opts=G.names.map(function(n,i){return (G.mode==='ffa'&&i===e)?'':'<button class="opt" data-by="'+i+'">'+esc(n)+(G.mode==='team'&&i===e?' (свои)':'')+'</button>'}).join('');
 screen('<h2>Время вышло!</h2><div class="q">Последнее слово</div><div class="lw">'+esc(P.card.w)+'</div><div class="q">Кто угадал?</div><div class="chs">'+opts+'<button class="opt gy" data-by="-1">Никто</button></div>','last');
 $$('[data-by]',app).forEach(function(b){b.onclick=function(){var by=+b.getAttribute('data-by');
  P.items.push(by<0?{w:P.card.w,st:'n',last:true}:{w:P.card.w,st:'g',by:by,last:true});showResults()}})}

function icon(it){return it.st==='g'?'<span class="ic g">✓</span>':it.st==='s'?'<span class="ic s">✕</span>':it.st==='f'?'<span class="ic f">✕</span>':'<span class="ic n">–</span>'}
function showResults(){
 closeOv();G.phase='results';var items=P.items,e=curE(),d=turnDelta(items),v=unit(G.set);
 var g=items.filter(function(i){return i.st==='g'}).length,s=items.filter(function(i){return i.st==='s'||i.st==='f'}).length;
 var rows=items.map(function(it,i){
  var sub=it.st==='g'?(G.mode==='ffa'&&G.set.markWho&&it.by!=null?'угадал(а): '+esc(G.names[it.by]):(G.mode==='team'&&it.by!=null&&it.by!==e?'забрала: '+esc(G.names[it.by]):'')):it.st==='f'?'спасение, без штрафа':it.st==='n'?'не засчитано':'';
  var pt=it.st==='g'?'<span style="color:var(--g)">+'+v+'</span>':it.st==='s'&&G.set.penalty?'<span style="color:var(--r)">−1</span>':'<span style="color:#bbb">0</span>';
  return '<button class="rs" data-i="'+i+'"><div class="w">'+esc(it.w)+(it.last?' <small>последнее слово</small>':'')+(sub?'<small>'+sub+'</small>':'')+'</div><div class="pt">'+pt+'</div>'+icon(it)+'</button>'}).join('');
 screen(hdr('Итоги хода','menu',esc(G.names[e]))+'<div class="sum"><div><b class="p" id="sg">'+g+'</b>угадано</div><div><b class="m" id="ss">'+s+'</b>пропущено</div><div><b id="sd">'+(d>0?'+':'')+d+'</b>очки '+(G.mode==='ffa'?'объясняющего':'команды')+'</div></div>'+
 '<div class="body" style="padding:0">'+(rows||'<div class="hint">Слов не было</div>')+'<div class="hint">Нажми на слово, чтобы поправить отметку.</div></div><button class="next" data-act="commit">Далее</button>');
 var bk=$('.hdr .back');if(bk)bk.style.visibility='hidden'}
function editItem(i){
 var it=P.items[i],e=curE(),o='';
 if(G.mode==='ffa'&&G.set.markWho){G.names.forEach(function(n,k){if(k!==e)o+='<button class="opt b" data-st="g" data-by="'+k+'">Угадал(а): '+esc(n)+'</button>'})}
 else if(G.mode==='team'){G.names.forEach(function(n,k){o+='<button class="opt b" data-st="g" data-by="'+k+'">Угадали: '+esc(n)+(k===e?' (свои)':'')+'</button>'})}
 else o+='<button class="opt b" data-st="g" data-by="'+e+'">Угадали (+'+(G.set.blitz?2:1)+' объясняющему)</button>';
 o+='<button class="opt r" data-st="s">Пропуск'+(G.set.penalty?' (−1)':'')+'</button><button class="opt gy" data-st="f">Пропуск без штрафа</button><button class="opt gy" data-st="n">Не засчитывать</button>';
 sheet('<h3>'+esc(it.w)+'</h3><div class="sub">Поправить отметку</div><div class="opts">'+o+'</div>');
 $$('[data-st]',ov).forEach(function(b){b.onclick=function(){var st=b.getAttribute('data-st'),by=b.getAttribute('data-by');
  it.st=st;if(st==='g')it.by=+by;else delete it.by;closeOv();showResults()}})}
function commit(){
 G.logs.push({e:curE(),items:P.items});P=null;var cs=calc(G.logs),sc=cs.sc,n=sc.length,mx=Math.max.apply(null,sc),T=target();
 var top=sc.filter(function(x){return x===mx}).length;
 var roundDone=(G.turnNo+1)%n===0;
 var over=mx>=T&&top===1&&(G.mode==='ffa'||roundDone);
 G.turnNo++;
 if(over){G.over=true;sv('elias.game',null);try{localStorage.removeItem('elias.game')}catch(e){}showFinal(sc);return}
 saveG();showBoard(true)}

/* board */
function showBoard(next){
 closeOv();var cs=calc(G.logs),sc=cs.sc,T=target();
 var last=G.logs.length?G.logs[G.logs.length-1]:null,prevSc=G.logs.length?calc(G.logs.slice(0,-1)).sc:sc.map(function(){return 0});
 var order=sc.map(function(s,i){return i}).sort(function(a,b){return sc[b]-sc[a]||a-b}),ne=curE();
 var rows=order.map(function(i,r){var dd=sc[i]-prevSc[i],pc=Math.max(0,Math.min(100,sc[i]/T*100));
  return '<div class="brow '+(sc[i]<0?'neg':'')+'"><div class="bar" style="width:'+pc+'%"></div><div class="in"><div class="pos">'+(r+1)+'</div><div class="nm">'+esc(G.names[i])+(i===ne?'<small>ходит следующим</small>':'')+'</div>'+(last&&dd!==0?'<span class="d '+(dd>0?'p':'m')+'">'+(dd>0?'+':'')+dd+'</span>':'')+'<div class="sc">'+sc[i]+'</div></div></div>'}).join('');
 var note=G.mode==='team'&&Math.max.apply(null,sc)>=T?'<div class="goal">Цель достигнута: доигрываем круг, чтобы у всех было поровну ходов.</div>':'<div class="goal">Играем до '+T+' очков</div>';
 screen(hdr('Счёт','menu',next?'Ход '+G.turnNo:'')+'<div class="body" style="padding:0">'+rows+note+'</div><button class="next" data-act="'+(next?'ready':'back2ready')+'">Далее</button>');
 if(next){var b=$('.hdr .back');if(b){b.setAttribute('data-act','menu')}}}

function showFinal(sc){
 closeOv();var order=sc.map(function(s,i){return i}).sort(function(a,b){return sc[b]-sc[a]||a-b});
 var conf='';var cc=['#fff','#FFE08A','#13B9F5','#F2504B','#7BD389'];for(var i=0;i<28;i++)conf+='<i style="left:'+rnd(100)+'%;background:'+pick(cc)+';animation-duration:'+(2.5+Math.random()*3)+'s;animation-delay:'+(-Math.random()*5)+'s"></i>';
 var rows=order.map(function(i,r){return '<div class="fr"><span class="'+(r===0?'n1':'')+'">'+(r===0?'🏆':(r+1))+'</span><span>'+esc(G.names[i])+'</span><span>'+sc[i]+'</span></div>'}).join('');
 var tr='<svg class="tr" viewBox="0 0 120 120" width="120"><path d="M34 14h52v34c0 20-12 34-26 34S34 68 34 48z" fill="#FFE08A" stroke="#fff" stroke-width="4"/><path d="M34 24H16c0 22 8 30 20 32M86 24h18c0 22-8 30-20 32" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><rect x="52" y="82" width="16" height="14" fill="#fff"/><rect x="38" y="96" width="44" height="10" rx="4" fill="#fff"/><path d="M60 26l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#FB931A"/></svg>';
 screen('<div class="conf">'+conf+'</div>'+tr+'<h2>Победа: '+esc(G.names[order[0]])+'!</h2><div class="sub">'+sc[order[0]]+' очков</div><div class="tbl">'+rows+'</div><div class="bot"><button class="obtn cy" data-act="new">Новая игра</button><button class="obtn" data-act="menu">В меню</button></div>','final');
 beep(660,.15);setTimeout(function(){beep(880,.2)},180);setTimeout(function(){beep(1100,.35)},400);G=null}

/* ---------- events ---------- */
document.addEventListener('click',function(ev){
 var t=ev.target.closest('[data-act],[data-mode],[data-tg],[data-sv],[data-dk],[data-del],[data-i]');
 if(!t||!app.contains(t)&&!ov.contains(t))return;
 if(t.hasAttribute('data-del')&&t.closest('.dk')){ev.stopPropagation();var id=t.getAttribute('data-del');
  modal('<h3>Удалить колоду?</h3><p>Слова этой колоды будут удалены с устройства.</p><button class="opt r" data-ok>Удалить</button><button class="opt gy" data-no>Отмена</button>');
  $('[data-no]',ov).onclick=closeOv;$('[data-ok]',ov).onclick=function(){custom=custom.filter(function(c){return c.id!==id});sv('elias.custom',custom);prefs.decks=prefs.decks.filter(function(x){return x!==id});savePrefs();closeOv();showDicts()};return}
 var a=t.getAttribute('data-act');
 if(t.hasAttribute('data-mode')){prefs.mode=t.getAttribute('data-mode');savePrefs();return showPlayers()}
 if(t.hasAttribute('data-del')&&t.closest('.row')){var l=names();if(l.length<=2){toast('Нужно минимум два '+(prefs.mode==='ffa'?'игрока':'команды'));return}l.splice(+t.getAttribute('data-del'),1);savePrefs();return showPlayers()}
 if(t.hasAttribute('data-tg')){var k=t.getAttribute('data-tg');prefs[k]=!prefs[k];savePrefs();var sc=$('.body').scrollTop;showSettings();$('.body').scrollTop=sc;return}
 if(t.hasAttribute('data-sv')){prefs.saves=+t.getAttribute('data-sv');savePrefs();var s2=$('.body').scrollTop;showSettings();$('.body').scrollTop=s2;return}
 if(t.hasAttribute('data-dk')){var id2=t.getAttribute('data-dk'),i=prefs.decks.indexOf(id2);
  var tog=function(){if(i>-1)prefs.decks.splice(i,1);else prefs.decks.push(id2);savePrefs();var s3=$('.body').scrollTop;showDicts();$('.body').scrollTop=s3};
  if(i===-1&&id2==='adult')askAdult(tog);else tog();return}
 if(t.classList.contains('rs')&&t.hasAttribute('data-i')){return editItem(+t.getAttribute('data-i'))}
 switch(a){
  case 'menu':if(P){stopTimer();P=null}closeOv();return showMenu();
  case 'hideinst':prefs.installHide=true;savePrefs();return showMenu();
  case 'continue':if(G){return G.phase==='board'?showBoard(true):showReady()}return showMenu();
  case 'new':return showPlayers();
  case 'how':return showHow();
  case 'players':return showPlayers();
  case 'add':var l2=names();l2.push(prefs.mode==='ffa'?'Игрок '+(l2.length+1):TM_NAMES.filter(function(x){return l2.indexOf(x)<0})[0]||'Команда '+(l2.length+1));savePrefs();showPlayers();var ins=$$('input.nm');if(ins.length){var li=ins[ins.length-1];li.focus();li.select()}$('.body').scrollTop=9999;return;
  case 'settings':return showSettings();
  case 'dicts':return showDicts();
  case 'addck':return addDeckModal();
  case 'resetplayed':played={};sv('elias.played',played);toast('История слов очищена');return showDicts();
  case 'start':return startGame();
  case 'board':return showBoard(false);
  case 'back2ready':return showReady();
  case 'ready':return showReady();
  case 'go':beep(1,.01,.001);return showPlay();
  case 'pause':return pauseGame();
  case 'ok':return btnFling(-1);
  case 'skip':return btnFling(1);
  case 'commit':return commit();
 }});
document.addEventListener('input',function(ev){var t=ev.target;
 if(t.classList.contains('nm')){names()[+t.getAttribute('data-i')]=t.value;savePrefs()}
 if(t.id==='r1'){var pk=prefs.mode==='ffa'?'ptsF':'ptsT';prefs[pk]=+t.value;$('#v1').textContent=t.value;savePrefs()}
 if(t.id==='r2'){prefs.time=+t.value;if(!prefs.blitz)$('#v2').textContent=t.value;savePrefs()}});
document.addEventListener('dblclick',function(ev){var t=ev.target;if(t.classList&&t.classList.contains('nm')&&t.closest('.row')){var l=names(),src=prefs.mode==='ffa'?PL_NAMES:TM_NAMES;var c=src.filter(function(x){return l.indexOf(x)<0});if(c.length){var v=pick(c);l[+t.getAttribute('data-i')]=v;t.value=v;savePrefs()}}});
document.addEventListener('contextmenu',function(e){e.preventDefault()});
var st=document.createElement('style');st.textContent='@keyframes cardin{from{transform:translateY(40px) scale(.94);opacity:0}to{transform:none;opacity:1}}';document.head.appendChild(st);

showMenu();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){navigator.serviceWorker.register('sw.js').catch(function(){});var __re=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(__re)return;__re=true;location.reload()})}
window.__elias={get G(){return G},get P(){return P}};
})();
