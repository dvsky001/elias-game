(function(){
'use strict';
var W=window.ELIAS_WORDS||{};
var app=document.getElementById('app'),ov=document.getElementById('overlay');
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function wordText(w){return typeof w==='string'?w:(w&&(w.t||w.w))||''}
function wordArtist(w){return (w&&typeof w==='object'&&w.a)?w.a:''}
function wordKey(w){return wordText(w).toLowerCase()}
function wordCardHtml(w){var t=wordText(w),a=wordArtist(w),len=t.length,wcls=len>22?'xl':len>13?'long':'';return '<div class="w '+wcls+'">'+esc(t)+'</div>'+(a?'<div class="artn">'+esc(a)+'</div>':'')}
function wordLine(w){var a=wordArtist(w);return esc(wordText(w))+(a?' <small>'+esc(a)+'</small>':'')}
function ld(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}

var DECKS=[
 {id:'easy',name:'Простые',diff:'Лёгкие',cls:'',badge:'ПОПУЛЯРНОЕ'},
 {id:'medium',name:'Средние',diff:'Средние',cls:'dk-med'},
 {id:'hard',name:'Сложные',diff:'Сложные',cls:'dk-hard'},
 {id:'adult',name:'18+',diff:'Для взрослых · общий набор',cls:'dk-adult',adult:true,badge:'18+',red:true},
 {id:'passion',name:'18+ Страсть',diff:'Для взрослых · возбуждающие слова',cls:'dk-adult dk-passion',adult:true,badge:'18+',red:true},
 {id:'bdsm',name:'18+ БДСМ',diff:'Для взрослых · простые слова',cls:'dk-adult dk-bdsm',adult:true,badge:'18+',red:true},
 {id:'hints',name:'18+ Намёки',diff:'Для взрослых · двусмысленные слова и пары',cls:'dk-adult dk-hints',adult:true,badge:'18+',red:true},
 {id:'hits',name:'18+ Пошлые хиты',diff:'Для взрослых · короткие строки припевов',cls:'dk-adult dk-hits',adult:true,badge:'18+',red:true}
];
var PL_NAMES=['Саша','Маша','Дима','Аня','Макс','Лена','Игорь','Катя','Олег','Юля','Тимур','Вика'];
var TM_NAMES=['Ураганы','Искры','Пузырьки','Вулканы','Лисы','Кометы','Ниндзя','Совы','Тигры','Орбита','Фейерверк','Бумеранг'];

var MUSIC=[
 {id:'fun',name:'Весёлый',hint:'для обычных колод',links:[
  {id:'apple',name:'Apple Music',url:'https://music.apple.com/ru/search?term=party%20playlist'},
  {id:'yandex',name:'Яндекс Музыка',url:'https://music.yandex.ru/search?text=%D0%B2%D0%B5%D1%87%D0%B5%D1%80%D0%B8%D0%BD%D0%BA%D0%B0&type=playlists'},
  {id:'vk',name:'ВК Музыка',url:'https://vk.com/audio?q=%D0%B2%D0%B5%D1%87%D0%B5%D1%80%D0%B8%D0%BD%D0%BA%D0%B0'}
 ]},
 {id:'sex',name:'Секс / чувственный',hint:'Страсть и Намёки',links:[
  {id:'apple',name:'Apple Music',url:'https://music.apple.com/ru/search?term=sexy%20playlist'},
  {id:'yandex',name:'Яндекс Музыка',url:'https://music.yandex.ru/search?text=%D1%81%D0%B5%D0%BA%D1%81%20%D0%BF%D0%BB%D0%B5%D0%B9%D0%BB%D0%B8%D1%81%D1%82&type=playlists'},
  {id:'vk',name:'ВК Музыка',url:'https://vk.com/audio?q=%D1%81%D0%B5%D0%BA%D1%81%20%D0%BF%D0%BB%D0%B5%D0%B9%D0%BB%D0%B8%D1%81%D1%82'}
 ]},
 {id:'hard',name:'Жёсткий / Rammstein',hint:'БДСМ, Пошлые хиты и Наказание',links:[
  {id:'apple',name:'Apple Music',url:'https://music.apple.com/ru/search?term=Rammstein'},
  {id:'yandex',name:'Яндекс Музыка',url:'https://music.yandex.ru/search?text=Rammstein'},
  {id:'vk',name:'ВК Музыка',url:'https://vk.com/audio?q=Rammstein'}
 ]},
 {id:'hush',name:'Hush Hush и похожие',hint:'выбирается вручную',rows:[
  {label:'Трек: Hush, Hush, Hush, Here Comes the Bogeyman — Henry Hall',links:[
   {id:'apple',name:'Apple Music',url:'https://music.apple.com/ru/album/hush-hush-hush-here-comes-the-bogey-man/1502731499'},
   {id:'yandex',name:'Яндекс Музыка',url:'https://music.yandex.ru/search?text=Hush%20Hush%20Hush%20Here%20Comes%20the%20Bogeyman%20Henry%20Hall'},
   {id:'vk',name:'ВК Музыка',url:'https://vk.com/audio?q=Hush%20Hush%20Hush%20Here%20Comes%20the%20Bogeyman%20Henry%20Hall'}
  ]},
  {label:'Похожие — по исполнителю Henry Hall (публичной волны/радио по треку нет)',links:[
   {id:'apple',name:'Apple Music',url:'https://music.apple.com/ru/artist/henry-hall-and-his-orchestra/157778285'},
   {id:'yandex',name:'Яндекс Музыка',url:'https://music.yandex.ru/search?text=Henry%20Hall'},
   {id:'vk',name:'ВК Музыка',url:'https://vk.com/audio?q=Henry%20Hall'}
  ]}
 ]}
];
function suggestedMusic(){var decks=(G&&G.decks)||prefs.decks||[];var punish=(G&&G.set&&G.set.punish)||!!prefs.punish;if(punish||decks.indexOf('bdsm')>-1||decks.indexOf('hits')>-1)return 'hard';if(decks.indexOf('passion')>-1||decks.indexOf('hints')>-1||decks.indexOf('adult')>-1)return 'sex';return 'fun'}
function activeMusic(){return(prefs.musicAuto===false&&prefs.musicPick)?prefs.musicPick:suggestedMusic()}
var DARES=[
 {t:'Поцеловать в щёку',lv:1,opp:1},
 {t:'Обнять 10 секунд',lv:1,opp:1},
 {t:'Сказать комплимент на ухо',lv:1,opp:1},
 {t:'Сделать массаж плеч 30 секунд',lv:1,opp:1},
 {t:'Сделать массаж ступней 30 секунд',lv:1,opp:1},
 {t:'Сделать массаж ладоней 30 секунд',lv:1,opp:1},
 {t:'Поцеловать руку',lv:1,opp:1},
 {t:'Посмотреть в глаза 15 секунд и не засмеяться',lv:1,opp:1},
 {t:'Назвать, что нравится во внешности партнёра',lv:1,opp:1},
 {t:'Покормить с рук конфету или фрукт',lv:1,opp:1},
 {t:'Держать за руку до конца следующего хода',lv:1,opp:1},
 {t:'Поцеловать в лоб',lv:1,opp:1},
 {t:'Обнять сзади на 5 секунд',lv:1,opp:1},
 {t:'Станцевать 20 секунд для компании',lv:1,opp:0},
 {t:'Показать самую соблазнительную улыбку',lv:1,opp:1},
 {t:'Изобразить страстный взгляд 10 секунд',lv:1,opp:1},
 {t:'Спеть куплет томным голосом',lv:1,opp:0},
 {t:'Снять обувь и остаться босиком до конца хода',lv:1,opp:0},
 {t:'Нарисовать сердечко на руке партнёра',lv:1,opp:1},
 {t:'Пройтись как по подиуму к выбранному игроку',lv:1,opp:1},
 {t:'Шепнуть нежный комплимент на ухо',lv:1,opp:1},
 {t:'Сделать лёгкий массаж шеи поверх одежды 20 секунд',lv:1,opp:1},
 {t:'Поцеловать в шею',lv:2,opp:1},
 {t:'Укусить мочку уха',lv:2,opp:1},
 {t:'Облизать палец партнёра',lv:2,opp:1},
 {t:'Шепнуть пошлость на ухо',lv:2,opp:1},
 {t:'Снять одну вещь',lv:2,opp:0},
 {t:'Станцевать приват 30 секунд',lv:2,opp:1},
 {t:'Сидеть на коленях у партнёра до конца следующего хода',lv:2,opp:1},
 {t:'Поцеловать пальцы ног',lv:2,opp:1},
 {t:'Провести кубик льда по шее и ключицам',lv:2,opp:1},
 {t:'Поцелуй с языком 10 секунд',lv:2,opp:1},
 {t:'Поцеловать ключицу',lv:2,opp:1},
 {t:'Медленный танец 30 секунд',lv:2,opp:1},
 {t:'Сделать массаж шеи 30 секунд',lv:2,opp:1},
 {t:'Подуть на шею',lv:2,opp:1},
 {t:'Поцеловать плечо',lv:2,opp:1},
 {t:'Провести пальцами по спине поверх одежды',lv:2,opp:1},
 {t:'Шепнуть фантазию на ухо',lv:2,opp:1},
 {t:'Поцеловать в ямку шеи',lv:2,opp:1},
 {t:'Обнять так, чтобы руки лежали на талии',lv:2,opp:1},
 {t:'Намекнуть стриптизом 15 секунд, без полного раздевания',lv:2,opp:0},
 {t:'Покормить с губ ягоду или конфету',lv:2,opp:1},
 {t:'Расстегнуть на себе одну пуговицу',lv:2,opp:0},
 {t:'Поцеловать ниже пупка через одежду',lv:3,opp:1},
 {t:'Провести кубик льда по телу поверх одежды (шея, ключицы, живот)',lv:3,opp:1},
 {t:'Поцелуй с языком 15 секунд',lv:3,opp:1},
 {t:'Приват-танец на коленях 30 секунд',lv:3,opp:1},
 {t:'Снять две вещи',lv:3,opp:0},
 {t:'Поцеловать живот через одежду',lv:3,opp:1},
 {t:'Шепнуть самую пошлую фантазию на ухо',lv:3,opp:1},
 {t:'Поцеловать поясницу через одежду',lv:3,opp:1},
 {t:'Лечь головой на колени партнёра на 30 секунд',lv:3,opp:1},
 {t:'Сделать дорожку поцелуев от руки до плеча',lv:3,opp:1},
 {t:'Облизать мочку уха',lv:3,opp:1},
 {t:'Поцеловать внутреннюю сторону запястья и локтя',lv:3,opp:1},
 {t:'Медленно снять с партнёра один аксессуар или кофту — только с разрешения',lv:3,opp:1},
 {t:'Сесть на колени партнёру верхом, в одежде, на 20 секунд',lv:3,opp:1},
 {t:'Назвать часть тела и поцеловать её поверх одежды',lv:3,opp:1},
 {t:'Завязать глаза и поцеловать партнёра в щёку',lv:3,opp:1},
 {t:'Сделать массаж бёдер поверх одежды 15 секунд',lv:3,opp:1},
 {t:'Провести льдом по губам и ключицам',lv:3,opp:1},
 {t:'Приспустить элемент своей одежды и потанцевать 20 секунд',lv:3,opp:0},
 {t:'Сделать массаж ягодиц поверх одежды 10 секунд, только с согласия',lv:3,opp:1},
 {t:'Снять трусы, не снимая штанов',lv:3,opp:0},
 {t:'Дать понюхать свои трусы игроку противоположного пола',lv:3,opp:1},
 {t:'Снять трусы и отдать их партнёру до конца хода, только с согласия',lv:3,opp:1},
 {t:'Понюхать трусы партнёра, только с его согласия',lv:3,opp:1},
 {t:'Снять трусы под штанами и продолжить ход без них',lv:3,opp:0},
 {t:'Дать партнёру снять с тебя трусы под штанами, только с согласия',lv:3,opp:1},
 {t:'Положить свои трусы партнёру на колени до конца хода, только с согласия',lv:3,opp:1},
 {t:'Вывернуть свои трусы и показать компании',lv:3,opp:0},
 {t:'Возьми свои трусы в рот на 10 секунд',lv:3,opp:0},
 {t:'Подержать край своих трусов во рту 10 секунд и показать партнёру',lv:3,opp:1},
 {t:'Зажать свои трусы зубами на 10 секунд',lv:3,opp:0},
 {t:'Передать свои трусы партнёру изо рта в руку, только с согласия',lv:3,opp:1},
 {t:'Объяснить следующее слово с завязанными глазами',lv:3,opp:0,fx:'blind'},
 {t:'Объяснить следующее слово только стонами',lv:3,opp:0,fx:'moan'},
 {t:'Погладить партнёра противоположного пола по бедру',lv:2,opp:1},
 {t:'Потрогать грудь партнёра через одежду',lv:3,opp:1},
 {t:'Потрогать ягодицы партнёра через одежду',lv:3,opp:1},
 {t:'Провести рукой под футболкой по спине',lv:2,opp:1},
 {t:'Провести рукой под футболкой по животу',lv:3,opp:1},
 {t:'Найди точку: партнёр ставит маркер, ты с закрытыми глазами ищешь её 30 секунд',lv:3,opp:1,fx:'dot'},
 {t:'Погладить внутреннюю сторону бедра поверх одежды',lv:3,opp:1},
 {t:'Обнять, заведя руки под футболку на спину',lv:2,opp:1},
 {t:'Провести ладонями по бокам под одеждой от талии вверх',lv:3,opp:1},
 {t:'С закрытыми глазами на ощупь найти губы партнёра и поцеловать',lv:2,opp:1}
];
var TRUTHS=[
 'Расскажи самую смелую сексуальную фантазию.',
 'Где самое неожиданное место, где ты занимался(ась) любовью или очень этого хотел(а)?',
 'Что тебя заводит быстрее всего?',
 'Какую часть тела партнёра ты целуешь чаще всего?',
 'Был ли у тебя секс на один раз? Что запомнилось?',
 'Что ты никогда не пробовал(а) в постели, но хочешь?',
 'Кому из присутствующих ты бы сделал(а) комплимент с намёком и какой?',
 'Какое бельё ты надеваешь, когда хочешь соблазнить?',
 'Расскажи о самом долгом поцелуе в своей жизни.',
 'Что ты обычно пишешь в переписке, когда флиртуешь?',
 'Какая поза тебе нравится больше всего? Можно не называть подробности, если не хочешь.',
 'Ты когда-нибудь снимал(а) интимное фото или видео для кого-то?',
 'Что тебя смущает в сексе до сих пор?',
 'Был ли у тебя секс на природе, в машине или в другом необычном месте?',
 'Какой комплимент в постели ты хочешь слышать?',
 'Расскажи о своём самом страстном утре.',
 'Что ты делаешь, чтобы настроиться на близость?',
 'Какая зона на твоём теле самая чувствительная?',
 'Ты предпочитаешь вести или отдавать инициативу?',
 'Был ли случай, когда тебя застали в интимный момент?',
 'Что из взрослого белья или игрушек ты пробовал(а) или хочешь попробовать?',
 'Какой поцелуй тебя заводит сильнее: в шею, в губы или ниже?',
 'Расскажи о фантазии, которую ты ещё никому не говорил(а).',
 'Что ты хочешь, чтобы партнёр делал руками чаще?',
 'Ты когда-нибудь ревновал(а) так, что это заводило?',
 'Какая песня или фильм сразу включают тебе нужное настроение?',
 'Что ты снял(а) бы с себя первым, если бы сейчас началась игра на раздевание?',
 'Расскажи о самом неловком, но возбуждающем моменте.',
 'Какое слово на ухо тебя мгновенно заводит?',
 'Ты больше любишь свет или полумрак?',
 'Был ли у тебя поцелуй с человеком, с которым вы только что поссорились?',
 'Что ты обычно делаешь после близости?',
 'Какой запах на партнёре тебе нравится больше всего?',
 'Ты когда-нибудь хотел(а) одного из присутствующих? Можно не называть имя, если неловко.',
 'Что для тебя важнее: нежность или страсть?',
 'Расскажи правило «можно / нельзя» в постели, которое у тебя есть.'
];
function isSolo(){return (G?G.mode:prefs.mode)!=='team'}
function isPair(){return (G?G.mode:prefs.mode)==='pair'}
function sexKey(){return prefs.mode==='team'?'teamSex':prefs.mode==='pair'?'pairSex':'ffaSex'}
function sexes(){var k=sexKey();if(!prefs[k])prefs[k]=[];var n=names().length;while(prefs[k].length<n)prefs[k].push(prefs[k].length%2?'f':'m');if(prefs[k].length>n)prefs[k]=prefs[k].slice(0,n);return prefs[k]}
/* Бесплатный Supabase: подставь URL проекта и anon-ключ, чтобы включить общий рейтинг.
   service_role сюда не класть. Пока пусто — вкладка «Топ» показывает заглушку. */
var APP_VER='9.0';
var SUPABASE={url:'https://zzuyvlzraykibovxsfvc.supabase.co',anon:'sb_publishable_YIMP4FCnDx2cXFbqEz9sdA_E0NuRKpp'};
function sbOn(){return !!(SUPABASE&&SUPABASE.url&&SUPABASE.anon)}
function sbHeads(){return {'apikey':SUPABASE.anon,'Authorization':'Bearer '+SUPABASE.anon,'Content-Type':'application/json','Prefer':'return=representation'}}
function deviceId(){var id=ld('elias.device','');if(!id||typeof id!=='string'){id='d'+Math.random().toString(36).slice(2)+Date.now().toString(36);sv('elias.device',id)}return id}
function sugQ(){var q=ld('elias.sugq',[]);return Array.isArray(q)?q:[]}
function saveSugQ(q){sv('elias.sugq',q)}
function sugLimit(body,contact){body=(body||'').trim().replace(/\s+/g,' ');contact=(contact||'').trim();if(body.length<4)return 'Напиши чуть подробнее (от 4 символов)';if(body.length>500)return 'Текст — до 500 символов';if(contact.length>80)return 'Контакт — до 80 символов';return ''}
function sugSpam(){var log=ld('elias.suglog',[]);if(!Array.isArray(log))log=[];var day=Date.now()-86400000;log=log.filter(function(x){return x>day});sv('elias.suglog',log);if(log.length>=5)return 'Лимит: 5 предложений в сутки с этого устройства';if(log.length&&Date.now()-log[log.length-1]<30000)return 'Подожди полминуты перед следующим';return ''}
function markSugSent(){var log=ld('elias.suglog',[]);if(!Array.isArray(log))log=[];log.push(Date.now());sv('elias.suglog',log)}
function sendSuggestion(body,contact,cb){
 var err=sugLimit(body,contact)||sugSpam();if(err){toast(err);if(cb)cb(false);return}
 body=body.trim().replace(/\s+/g,' ');contact=(contact||'').trim();
 var item={body:body,contact:contact,t:Date.now(),dev:deviceId()};
 function queued(msg){var q=sugQ();q.push(item);saveSugQ(q);toast(msg||'Сохранил на этом телефоне, отправлю, когда появится связь');if(cb)cb(true)}
 if(!sbOn()){queued();return}
 sbRpc('add_suggestion',{p_body:body,p_contact:contact,p_dev:deviceId()}).then(function(s){
  if(s==='ok'){markSugSent();toast('Спасибо, отправили');if(cb)cb(true)}
  else if(s==='limit'){toast('Лимит: 5 предложений в сутки');if(cb)cb(false)}
  else{toast('Не приняли текст, проверь длину');if(cb)cb(false)}
 }).catch(function(){queued('Нет связи с базой — сохранил на телефоне и отправлю позже')})
}
function flushSugQ(){
 if(!sbOn())return;var q=sugQ();if(!q.length)return;var left=[],i=0;
 function next(){if(i>=q.length){saveSugQ(left);return}var it=q[i++];
  sbRpc('add_suggestion',{p_body:it.body,p_contact:it.contact||'',p_dev:it.dev||deviceId()}).then(function(s){
   if(s==='ok')markSugSent();else if(s!=='limit')left.push(it);next()
  }).catch(function(){left.push(it);left=left.concat(q.slice(i));saveSugQ(left)})}
 next();
}
function showSuggest(){
 modal('<h3>Предложить улучшение</h3><p>Напиши, что улучшить в игре. Имя или контакт — по желанию.</p><textarea class="tx" id="sgb" maxlength="500" placeholder="Идея или замечание"></textarea><input class="tx" id="sgc" placeholder="Имя или контакт (необязательно)" maxlength="80"><button class="opt" data-ok>Отправить</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){var body=$('#sgb').value,contact=$('#sgc').value;sendSuggestion(body,contact,function(ok){if(ok)closeOv()})}
}
var likedPl=ld('elias.likes',[]);if(!Array.isArray(likedPl))likedPl=[];
function saveLikes(){sv('elias.likes',likedPl)}
function plLimit(nm,u){nm=(nm||'').trim();u=(u||'').trim();if(nm.length<1||nm.length>60)return 'Название — от 1 до 60 символов';if(u.length<12||u.length>500)return 'Ссылка слишком короткая или длинная';if(!plHost(u))return 'Нужна ссылка Apple Music, Яндекс Музыки или ВК';return ''}
var musicTab='list';
function plHost(u){try{var x=new URL(u);if(x.protocol!=='https:')return null;var h=x.hostname.toLowerCase();if(h==='music.apple.com'||h==='itunes.apple.com')return {svc:'apple',svcName:'Apple Music'};if(h==='music.yandex.ru'||h==='music.yandex.com')return {svc:'yandex',svcName:'Яндекс Музыка'};if(h==='vk.com'||h==='www.vk.com'||h==='m.vk.com'||h==='vk.ru')return {svc:'vk',svcName:'ВК Музыка'};return null}catch(e){return null}}
function addPlModal(){var pub=sbOn()?'<label class="chk"><input type="checkbox" id="ppub" checked> Отправить в общий рейтинг</label>':'<div class="mh" style="margin:0 0 8px">В общий рейтинг попадёт, когда подключим бесплатную базу.</div>';
 modal('<h3>Свой плейлист</h3><p>Ссылка на плейлист из Apple Music, Яндекс Музыки или ВК. Сохраняется на этом телефоне.</p><input class="tx" id="pn" placeholder="Название" maxlength="60"><input class="tx" id="pu" placeholder="https://…" maxlength="500" inputmode="url">'+pub+'<button class="opt" data-ok>Сохранить</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){
  var nm=$('#pn').value.trim(),u=$('#pu').value.trim(),err=plLimit(nm,u),info=plHost(u);
  if(err){toast(err);return}
  if(myPl.length>=20){toast('Слишком много своих плейлистов');return}
  myPl.push({id:'pl'+Date.now(),name:nm,url:u,svc:info.svc,svcName:info.svcName});savePl();
  var want=$('#ppub')&&$('#ppub').checked;
  closeOv();
  if(want&&sbOn())publishTop(nm,u,function(){musicPanel()});else musicPanel()}}
function musicLinks(links){return '<div class="opts">'+(links||[]).map(function(l){return '<a class="opt b" target="_blank" rel="noopener noreferrer" href="'+l.url+'">'+esc(l.name)+'</a>'}).join('')+'</div>'}
function musicPanel(){var sug=suggestedMusic(),act=activeMusic(),auto=prefs.musicAuto!==false;
 var h=MUSIC.map(function(g){var on=g.id===act,rec=g.id===sug;var body=g.rows?g.rows.map(function(r){return '<div class="mrow"><div class="ml">'+esc(r.label)+'</div>'+musicLinks(r.links)+'</div>'}).join(''):musicLinks(g.links);return '<div class="mg'+(on?' on':'')+'" data-mpick="'+g.id+'"><div class="mt">'+esc(g.name)+(rec?' <span class="rec">рекомендуем</span>':'')+'</div><div class="mh">'+esc(g.hint||'')+(on&&!auto?' · выбран вручную':'')+'</div>'+body+'</div>'}).join('');
 var mine=myPl.map(function(g){var on=g.id===act;return '<div class="mg'+(on?' on':'')+'" data-mpick="'+g.id+'"><div class="mt">'+esc(g.name)+(on&&!auto?' <span class="rec">свой</span>':'')+'</div><div class="mh">Свой плейлист'+(on&&!auto?' · выбран вручную':'')+'</div>'+musicLinks([{name:g.svcName||'Открыть',url:g.url}])+'<button type="button" class="pldel" data-delpl="'+g.id+'">Удалить</button></div>'}).join('');
 var tabs='<div class="seg mseg"><button type="button" data-act="mtab-list" class="'+(musicTab==='list'?'on':'')+'">Плейлисты</button><button type="button" data-act="mtab-top" class="'+(musicTab==='top'?'on':'')+'">Топ плейлистов</button></div>';
 if(musicTab==='top'){sheet('<h3>Музыка</h3>'+tabs+'<div id="toplist" class="toplist"><div class="sub">Загружаю…</div></div>');loadTop();return}
 var bar=auto?'<div class="sub">Подсвечен плейлист под текущие колоды и «Наказание». Можно выбрать другой, в том числе «Hush Hush и похожие» или свой.</div>':'<div class="sub">Выбран вручную. <button class="optb" data-act="mauto">Авто по колоде</button></div>';
 sheet('<h3>Музыка</h3>'+tabs+bar+h+mine+'<button type="button" class="addck" data-act="addpl" style="margin-top:8px"><span style="font-size:22px;line-height:1">+</span> Свой плейлист</button>')}
function loadTop(){
 var box=$('#toplist');if(!box)return;
 if(!sbOn()){box.innerHTML='<div class="sub">Общий рейтинг появится, когда подключим бесплатную базу Supabase. Свои плейлисты уже сохраняются на этом телефоне. Один лайк с устройства — после подключения.</div>';return}
 fetch(SUPABASE.url.replace(/\/$/,'')+'/rest/v1/playlists?select=*&order=likes.desc,created_at.desc&limit=30',{headers:sbHeads()}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(rows){
  if(!box.isConnected)return;
  if(!rows||!rows.length){box.innerHTML='<div class="sub">Пока пусто. Добавь свой плейлист и отметь «в общий рейтинг».</div>';return}
  box.innerHTML=rows.map(function(g,i){var liked=likedPl.indexOf(g.id)>-1;return '<div class="mg"><div class="mt">'+(i+1)+'. '+esc(g.name)+'</div><div class="mh">❤ '+(g.likes||0)+'</div><div class="opts"><a class="opt b" target="_blank" rel="noopener noreferrer" href="'+esc(g.url)+'">Открыть</a><button type="button" class="opt'+(liked?' gy':'')+'" data-like="'+g.id+'" '+(liked?'disabled':'')+'>'+(liked?'Ты уже лайкнул':'Лайк')+'</button></div></div>'}).join('');
 }).catch(function(){if(box.isConnected)box.innerHTML='<div class="sub">Не удалось загрузить топ. Попробуй позже.</div>'})}
function sbBase(){return SUPABASE.url.replace(/\/$/,'')}
function sbRpc(fn,body){return fetch(sbBase()+'/rest/v1/rpc/'+fn,{method:'POST',headers:sbHeads(),body:JSON.stringify(body)}).then(function(r){if(!r.ok)throw new Error('http');return r.json()})}
function publishTop(nm,u,cb){
 var err=plLimit(nm,u);if(err){toast(err);if(cb)cb();return}
 sbRpc('add_playlist',{p_name:nm,p_url:u,p_dev:deviceId()}).then(function(s){
  if(s==='dup')toast('Такой плейлист уже в рейтинге');else if(s==='limit')toast('Лимит: 5 плейлистов в сутки');else if(s==='ok')toast('Плейлист отправлен в общий топ');else toast('Плейлист не принят')
 }).catch(function(){toast('Не вышло отправить в рейтинг')}).then(function(){if(cb)cb()})}
function likeTop(id){if(!sbOn())return;if(likedPl.indexOf(id)>-1){toast('С этого устройства уже есть лайк');return}
 sbRpc('like_playlist',{p_id:id,p_dev:deviceId()}).then(function(n){if(n<0)throw new Error('bad');likedPl.push(id);saveLikes();toast('Лайк засчитан');loadTop()}).catch(function(){toast('Не вышло поставить лайк')})}
/* ---------- общая база слов (Supabase) ---------- */
var GW=ld('elias.gwords',[]);if(!Array.isArray(GW))GW=[];
var gwVotes=ld('elias.gvotes',{});if(!gwVotes||typeof gwVotes!=='object')gwVotes={};
var gwAt=0;
function gwVisible(w){return (w.dislikes||0)-(w.likes||0)<5&&(!w.adult||!!prefs.adultOk)}
function globalWords(){return GW.filter(gwVisible).map(function(w){return w.txt})}
function loadGlobal(cb){
 if(!sbOn()){if(cb)cb(false);return}
 gwAt=Date.now();
 fetch(sbBase()+'/rest/v1/words?select=id,txt,adult,likes,dislikes&order=created_at.desc&limit=1000',{headers:sbHeads()}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).then(function(rows){
  if(!Array.isArray(rows))throw new Error('fmt');var ch=JSON.stringify(rows)!==JSON.stringify(GW);GW=rows;sv('elias.gwords',GW);if(cb)cb(ch)
 }).catch(function(){if(cb)cb(false)})}
function addWordModal(){
 modal('<h3>Слово в общую базу</h3><p>Слово или короткая фраза (2–40 символов). Увидят все игроки. Без ссылок. До 10 слов в сутки.</p><input class="tx" id="gw" placeholder="Слово" maxlength="40"><label class="chk"><input type="checkbox" id="gad"> 18+ (только для взрослых)</label><button class="opt" data-ok>Добавить</button><button class="opt gy" data-no>Закрыть</button>');
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){
  var t=$('#gw').value.trim().replace(/\s+/g,' '),ad=$('#gad').checked;
  if(t.length<2){toast('Слишком короткое слово');return}
  if(ad&&!prefs.adultOk){closeOv();askAdult(addWordModal);return}
  var k=t.toLowerCase().replace(/ё/g,'е');
  if(GW.some(function(w){return (w.txt||'').toLowerCase().replace(/ё/g,'е')===k})){toast('Такое слово уже есть');return}
  sbRpc('add_word',{p_txt:t,p_adult:ad,p_dev:deviceId()}).then(function(s){
   if(s==='ok'){toast('Слово добавлено в общую базу');closeOv();loadGlobal(function(){showDicts()})}
   else if(s==='dup')toast('Такое слово уже есть');
   else if(s==='limit')toast('Лимит: 10 слов в сутки');
   else toast('Слово не принято (коротко, длинно или со ссылкой)')
  }).catch(function(){toast('Нет связи с базой')})}}
function votePanel(){
 var list=GW.filter(function(w){return gwVisible(w)&&!gwVotes[w.id]}).slice(0,30);
 var h='<h3>Оцени слова</h3><div class="sub">Если слов с минусом много — слово пропадает из колоды. Один голос с устройства.</div>';
 if(!list.length)h+='<div class="sub">Нет слов для оценки.</div>';
 h+=list.map(function(w){return '<div class="mg"><div class="mt">'+esc(w.txt)+(w.adult?' <span class="rec">18+</span>':'')+'</div><div class="opts"><button type="button" class="opt" data-gv="'+w.id+'|1">👍 '+(w.likes||0)+'</button><button type="button" class="opt gy" data-gv="'+w.id+'|-1">👎 '+(w.dislikes||0)+'</button></div></div>'}).join('');
 sheet(h)}
function voteWord(id,val){
 sbRpc('vote_word',{p_id:id,p_dev:deviceId(),p_val:val}).then(function(s){
  if(s==='ok'||s==='already'){gwVotes[id]=val;sv('elias.gvotes',gwVotes);
   if(s==='ok')GW.forEach(function(w){if(w.id===id){if(val===1)w.likes=(w.likes||0)+1;else w.dislikes=(w.dislikes||0)+1}});
   sv('elias.gwords',GW);toast(s==='ok'?'Голос принят':'Ты уже голосовал');votePanel()}
  else toast('Голос не принят')
 }).catch(function(){toast('Нет связи с базой')})}

function lastTurnScores(){var last=G.logs[G.logs.length-1],n=G.names.length,a=[],i;for(i=0;i<n;i++)a.push(0);if(!last)return a;var v=unit(G.set);last.items.forEach(function(it){if(it.st==='g'){if(isSolo()&&G.set.markWho&&it.by!=null){a[it.by]+=v;a[last.e]+=v}else a[it.by!=null?it.by:last.e]+=v}else if(it.st==='s'&&G.set.penalty)a[last.e]-=1});return a}
function pickOpp(loser){var sex=G.sex||[],mine=sex[loser],c=[];for(var i=0;i<G.names.length;i++)if(i!==loser&&mine&&sex[i]&&sex[i]!==mine)c.push(i);return c.length?pick(c):-1}
var DareNext=null,DareLoser=-1,DareNow=null,DareKind=null,DotIv=null,usedTruths=[];
function currentHeat(){if(G&&G.set&&G.set.pairEscalate)return Math.min(3,Math.max(1,G.logs.length));return (G&&G.set&&G.set.heat)||prefs.heat||1}
function stopDot(){if(DotIv){clearInterval(DotIv);DotIv=null}}
function alcoholNote(lv){if(!(G&&G.set&&G.set.alcohol))return '';return '<div class="alc">Пейте ответственно. '+(lv>=3?'Проигравший пьёт штрафной шот.':'Проигравший пьёт глоток.')+'</div>'}
function dareBtns(okLab){var h='<div class="bot darebtns"><button class="obtn" data-act="dareok">'+(okLab||'Выполнено')+'</button><button class="obtn cy" data-act="dareko">Отказ (−2 очка)</button>';if(G.set&&G.set.alcohol)h+='<button class="obtn" data-act="daredrink">Выпить вместо −2</button>';return h+'</div>'}
function pickDareCard(){var heat=currentHeat();G.usedDares=G.usedDares||[];var pool=allDares().filter(function(d){return (d.lv||1)<=heat&&G.usedDares.indexOf(d.t)<0});if(!pool.length){G.usedDares=[];pool=allDares().filter(function(d){return (d.lv||1)<=heat})}var d=pick(pool);G.usedDares.push(d.t);return d}
function dareOppHtml(d){if(!d||!d.opp)return '';var opp=pickOpp(DareLoser);return opp>=0?'<div class="opp">Партнёр противоположного пола: <b>'+esc(G.names[opp])+'</b></div>':'<div class="opp">Игрока противоположного пола нет — выберите партнёра сами, только по согласию.</div>'}
function showDare(next,kind){closeOv();stopDot();DareNext=next;DareKind=kind;DareNow=null;
 var scs=kind==='game'?calc(G.logs).sc:lastTurnScores();
 var min=Math.min.apply(null,scs),cands=[],i;for(i=0;i<scs.length;i++)if(scs[i]===min)cands.push(i);
 DareLoser=pick(cands);
 if(G.set.tod)return showTodChoice();
 return startDareAction()}
function showTodChoice(){var pep='🌶'.repeat(currentHeat());
 screen('<div class="top"><div></div><div style="font-weight:800">Правда или действие '+pep+'</div></div><div class="dcard"><div class="lab">Проиграл(а)</div><div class="who">'+esc(G.names[DareLoser])+'</div><div class="task">Выбери: ответить на вопрос или выполнить задание.</div><div class="info">Только по взаимному согласию взрослых. Можно отказаться.</div>'+alcoholNote(currentHeat())+'</div><div class="bot darebtns"><button class="obtn" data-act="todtruth">Правда</button><button class="obtn" data-act="toddare">Действие</button></div>','ready dare')}
function showTruth(){if(usedTruths.length>=TRUTHS.length)usedTruths=[];var left=TRUTHS.filter(function(q){return usedTruths.indexOf(q)<0});var q=pick(left);usedTruths.push(q);DareNow={t:q,lv:currentHeat(),truth:1};
 screen('<div class="top"><div></div><div style="font-weight:800">Правда '+('🌶'.repeat(DareNow.lv))+'</div></div><div class="dcard"><div class="lab">Вопрос для</div><div class="who">'+esc(G.names[DareLoser])+'</div><div class="task">'+esc(q)+'</div><div class="info">Отвечай честно, только если готов(а). Можно отказаться.</div>'+alcoholNote(DareNow.lv)+'</div>'+dareBtns('Ответил(а)'),'ready dare')}
function startDareAction(){var d=pickDareCard();DareNow=d;if(d.fx==='dot')return showDotPrep(d);return renderDare(d)}
function renderDare(d){var pep='🌶'.repeat(d.lv||currentHeat());
 screen('<div class="top"><div></div><div style="font-weight:800">Наказание '+pep+'</div></div><div class="dcard"><div class="lab">Проиграл(а)</div><div class="who">'+esc(G.names[DareLoser])+'</div><div class="task">'+esc(d.t)+'</div>'+dareOppHtml(d)+'<div class="info">Только по взаимному согласию взрослых. Можно отказаться.</div>'+alcoholNote(d.lv||currentHeat())+'</div>'+dareBtns(),'ready dare')}
function showDotPrep(d){var pep='🌶'.repeat(d.lv||3);
 screen('<div class="top"><div></div><div style="font-weight:800">Найди точку '+pep+'</div></div><div class="dcard"><div class="lab">Ищет</div><div class="who">'+esc(G.names[DareLoser])+'</div><div class="task">Сначала ищущий закрывает глаза. Партнёр ставит маркером маленькую точку на своём теле — под одеждой или на открытом месте. Потом ищущий с закрытыми глазами ищет её на ощупь 30 секунд.</div>'+dareOppHtml(d)+'<div class="info">Только по взаимному согласию. Можно отказаться.</div>'+alcoholNote(d.lv)+'</div><div class="bot darebtns"><button class="obtn" data-act="dotgo">Точка поставлена — начать поиск</button><button class="obtn cy" data-act="dareko">Отказ (−2 очка)</button>'+(G.set&&G.set.alcohol?'<button class="obtn" data-act="daredrink">Выпить вместо −2</button>':'')+'</div>','ready dare')}
function showDotSearch(){stopDot();var rem=30;
 screen('<div class="top"><div></div><div style="font-weight:800">Поиск 30 с</div></div><div class="dcard"><div class="lab">Ищет</div><div class="who">'+esc(G.names[DareLoser])+'</div><div class="task" id="dott">30</div><div class="info">Глаза закрыты. Ищи точку на ощупь.</div></div><div class="bot darebtns"><button class="obtn" data-act="dotok">Нашёл</button><button class="obtn cy" data-act="dotno">Не нашёл</button></div>','ready dare');
 DotIv=setInterval(function(){rem--;var el=$('#dott');if(el)el.textContent=String(Math.max(0,rem));if(rem<=0){stopDot();dotFail()}},1000)}
function finishDareThen(fn){var n=DareNext;DareNext=null;DareNow=null;if(n)n();else if(fn)fn()}
function dotWin(){stopDot();G.fines=G.fines||[];if(DareLoser>=0)G.fines.push({p:DareLoser,d:1});if(!G.over)saveG();toast('+1 за найденную точку');finishDareThen()}
function dotFail(){stopDot();toast('Точку не нашли — ещё одно задание');startDareAction()}


var prefs=Object.assign({mode:'ffa',ffa:['Игрок 1','Игрок 2','Игрок 3'],team:['Ураганы','Искры','Пузырьки'],pair:['Я','Партнёр'],
 ptsF:30,ptsT:50,time:60,penalty:true,lastAll:true,blitz:false,gest:false,draw:false,saves:0,sound:true,markWho:false,decks:['easy'],installHide:false,punish:false,punishWhen:'turn',heat:1,tod:false,alcohol:false,ffaSex:['m','f','m'],teamSex:['m','f','m'],pairSex:['m','f']},ld('elias.prefs',{}));
if(!prefs.pair||prefs.pair.length<2)prefs.pair=['Я','Партнёр'];
var myDares=ld('elias.mydares',[]);if(!Array.isArray(myDares))myDares=[];
function saveMyDares(){sv('elias.mydares',myDares)}
function allDares(){return DARES.concat(myDares)}
function savePrefs(){sv('elias.prefs',prefs)}
var played=ld('elias.played',{});
var custom=ld('elias.custom',[]);
var myPl=ld('elias.playlists',[]);if(!Array.isArray(myPl))myPl=[];
function savePl(){sv('elias.playlists',myPl)}
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
function deckWords(id){if(W[id])return W[id];if(id==='global')return globalWords();for(var i=0;i<custom.length;i++)if(custom[i].id===id)return custom[i].words;return[]}
function poolFor(ids){var seen={},out=[];ids.forEach(function(id){deckWords(id).forEach(function(w){var k=wordKey(w);if(!seen[k]){seen[k]=1;out.push(w)}})});return out}
function drawWord(){
 var pool=poolFor(G.decks);
 var left=pool.filter(function(w){return !played[wordKey(w)]});
 if(!left.length){pool.forEach(function(w){delete played[wordKey(w)]});left=pool.slice();toast('Слова выбранных колод закончились — начинаем круг заново')}
 var w=pick(left);played[wordKey(w)]=1;sv('elias.played',played);return w}
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
  if(it.st==='g'){if(isSolo()&&G.set.markWho&&it.by!=null){sc[it.by]+=v;sc[t.e]+=v}else sc[it.by!=null?it.by:t.e]+=v}
  else if(it.st==='s'){if(G.set.penalty)sc[t.e]-=1}
  else if(it.st==='f'){used[t.e]++}})});
 if(G.fines)G.fines.forEach(function(f){if(f.p>=0&&f.p<sc.length)sc[f.p]+=f.d});
 return {sc:sc,used:used}}
function turnDelta(items){var v=unit(G.set),d=0;items.forEach(function(it){if(it.st==='g')d+=v;else if(it.st==='s'&&G.set.penalty)d-=1});return d}
function target(){return isSolo()?G.set.ptsF:G.set.ptsT}
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

var ADS=[
 {slot:'billboard',text:'Здесь может быть ваша реклама',url:'',img:''},
 {slot:'truck',text:'Здесь может быть ваша реклама',url:'',img:''}
];
var CityAds={};
function adsOf(slot){return (ADS||[]).filter(function(a){return a&&a.slot===slot&&!a.adult})}
function pickAd(slot){var a=adsOf(slot);return a.length?a[rnd(a.length)]:{slot:slot,text:'Здесь может быть ваша реклама',url:'',img:''}}
function adSafeUrl(u){try{var x=new URL(u);return x.protocol==='https:'?u:''}catch(e){return ''}}
function adFace(ad){ad=ad||{};var src=adSafeUrl(ad.img||'');if(src)return '<img alt="" src="'+esc(src)+'">';return '<span>'+esc(ad.text||'Здесь может быть ваша реклама')+'</span>'}
function adClickable(){return !(P&&!P.over&&!P.paused&&G&&G.phase==='play')}
function openAd(url){if(!adClickable())return;url=adSafeUrl(url||'');if(url){window.open(url,'_blank','noopener,noreferrer');return}toast('Это место для рекламы')}
function truckSvg(){return '<svg class="truckic" viewBox="0 0 160 58" aria-hidden="true"><rect x="2" y="16" width="96" height="30" rx="3" fill="#f6f6f6" stroke="#333" stroke-width="2"/><rect x="98" y="22" width="44" height="24" rx="3" fill="#FFB02E" stroke="#333" stroke-width="2"/><rect x="118" y="26" width="16" height="10" rx="2" fill="#9ad8f5"/><circle cx="24" cy="48" r="8" fill="#333"/><circle cx="74" cy="48" r="8" fill="#333"/><circle cx="124" cy="48" r="8" fill="#333"/></svg>'}
function cityScene(mute){
 var bb=pickAd('billboard'),tr=pickAd('truck');CityAds={billboard:bb,truck:tr};
 return '<div class="citywrap'+(mute?' mute':'')+'">'+citySvg()+
  '<button type="button" class="adhot ad-bb" data-ad="billboard" aria-label="Реклама">'+adFace(bb)+'</button>'+
  '<div class="ad-truck-track"><button type="button" class="adhot ad-truck" data-ad="truck" aria-label="Реклама">'+truckSvg()+'<span class="ad-side">'+adFace(tr)+'</span></button></div></div>'}
function bindAds(){
 syncAdsHot();
 $$('[data-ad]',app).forEach(function(el){el.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(!adClickable())return;var ad=CityAds[el.getAttribute('data-ad')]||{};openAd(ad.url)}})}
function syncAdsHot(){if(app)app.classList.toggle('ads-off',!adClickable())}

function isPremium(){return ld('elias.premium',false)===true}
function voiceOn(){return !!(prefs.voice&&isPremium()&&window.speechSynthesis)}
var VoiceRec=null,VoiceLock=0;
function stopVoice(){
 try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
 stopListen();
}
function speak(text){
 if(!voiceOn()||!text)return;
 try{
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(String(text));u.lang='ru-RU';u.rate=1;u.pitch=1;
  var vs=speechSynthesis.getVoices()||[],ru=null,i;
  for(i=0;i<vs.length;i++)if(/^ru/i.test(vs[i].lang)){ru=vs[i];break}
  if(ru)u.voice=ru;
  speechSynthesis.speak(u);
 }catch(e){}
}
function stopListen(){if(!VoiceRec)return;try{VoiceRec.onend=null;VoiceRec.onerror=null;VoiceRec.onresult=null;VoiceRec.stop()}catch(e){}VoiceRec=null}
function startListen(){
 stopListen();
 if(!voiceOn())return;
 var Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(typeof Rec!=='function')return;
 try{
  var rec=new Rec();VoiceRec=rec;rec.lang='ru-RU';rec.continuous=true;rec.interimResults=true;
  rec.onresult=function(ev){var i,tx='';for(i=ev.resultIndex;i<ev.results.length;i++)tx+=' '+(ev.results[i][0]&&ev.results[i][0].transcript||'');voiceCommand(tx)};
  rec.onerror=function(){};
  rec.onend=function(){if(VoiceRec===rec){VoiceRec=null;if(voiceOn()&&((P&&!P.over)||(G&&(G.phase==='ready'||G.phase==='results'))))setTimeout(startListen,400)}}
  rec.start();
 }catch(e){VoiceRec=null}
}
function voiceCommand(raw){
 var t=(' '+String(raw||'').toLowerCase().replace(/ё/g,'е')+' ');
 var now=Date.now();if(now<VoiceLock)return;
 function go(fn){VoiceLock=now+1200;try{fn()}catch(e){}}
 if(/ угадал[аи]? | плюс | да | взяли /.test(t)){
  if(P&&!P.over&&!P.paused&&!P.sheet&&!P.busy)return go(function(){btnFling(-1)});
 }
 if(/ пропуск | пропусти | минус | нет /.test(t)){
  if(P&&!P.over&&!P.paused&&!P.sheet&&!P.busy)return go(function(){btnFling(1)});
 }
 if(/ дальше | старт | начали | поехали | следующий /.test(t)){
  if(G&&G.phase==='ready'&&!P)return go(showPlay);
  if(G&&G.phase==='results'&&P&&P.over)return go(commit);
 }
}
function speakTurn(){if(!G)return;var e=curE();speak((isSolo()?'Ход. Объясняет ':'Ход команды ')+G.names[e]+'.')}
function speakResults(){
 if(!P||!G)return;
 var items=P.items,d=turnDelta(items),g=items.filter(function(i){return i.st==='g'}).length,s=items.filter(function(i){return i.st==='s'||i.st==='f'}).length;
 var pts=d>=0?('плюс '+d):('минус '+(-d));
 speak('Итог хода. Угадано '+g+', пропущено '+s+'. '+pts+' '+(isSolo()?'объясняющему.':'команде.'));
}
function showPremiumSoon(){
 screen(hdr('Скоро · Премиум','settings')+'<div class="body prem"><div class="crown">👑</div><h2>Голосовой ведущий</h2><p>Платная функция. Ведущий объявляет ход, оставшееся время и очки. Если браузер умеет распознавание речи, работают команды «угадали», «пропуск» и «дальше». На iPhone может быть только озвучка.</p><p>Оплата появится позже. Сейчас платежей нет.</p><button type="button" class="obtn sm" data-act="premdemo">Для теста на этом устройстве</button></div>','premium')}

function skySvg(){return '<svg class="sky" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"><g fill="#fff" opacity=".85"><ellipse cx="70" cy="330" rx="46" ry="16"/><ellipse cx="98" cy="318" rx="30" ry="18"/><ellipse cx="330" cy="260" rx="52" ry="17"/><ellipse cx="300" cy="248" rx="30" ry="17"/><ellipse cx="350" cy="430" rx="40" ry="13"/><ellipse cx="46" cy="500" rx="38" ry="12"/></g>'+
 '<g transform="translate(335 430)"><ellipse cx="0" cy="0" rx="17" ry="21" fill="#FF6B6B"/><path d="M-17 0 Q0 -14 17 0" fill="#FFD93D" opacity=".9"/><path d="M-6 20 L-4 34 L4 34 L6 20Z" fill="#8a5a2b"/></g></svg>'}
function logoSvg(sz){return '<svg viewBox="0 0 230 170" width="'+(sz||210)+'"><defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB93A"/><stop offset="1" stop-color="#FB8E12"/></linearGradient></defs>'+
 '<path d="M30 6 H200 Q224 6 224 30 V100 Q224 124 200 124 H110 L66 160 L72 124 H30 Q6 124 6 100 V30 Q6 6 30 6Z" fill="url(#lg)"/>'+
 '<text x="115" y="88" text-anchor="middle" font-family="-apple-system,SF Pro Rounded,Arial Rounded MT Bold,Helvetica,Arial,sans-serif" font-weight="900" font-size="62" fill="#fff" letter-spacing="-1">элиас</text>'+
 '<circle cx="190" cy="34" r="6" fill="#fff" opacity=".9"/></svg>'}

function isStandalone(){return window.navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)}
function showMenu(){
 closeOv();stopVoice();
 var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),inst='';
 if(ios&&!isStandalone()&&!prefs.installHide)inst='<div class="install"><b>Поставь на экран:</b> нажми «Поделиться» <span>⬆︎</span> → «На экран “Домой”». Игра будет работать офлайн.<button class="x" data-act="hideinst">×</button></div>';
 screen(skySvg()+cityScene(false)+inst+'<div class="logo">'+logoSvg()+'</div><div class="tag">игра в слова для компании</div>'+
 '<div class="btns">'+(G?'<button class="obtn" data-act="continue">Продолжить</button>':'')+'<button class="obtn" data-act="new">Новая игра</button><button class="obtn" data-act="how">Как играть</button><button class="obtn cy sm" data-act="music">Музыка вкл/выкл</button><button class="obtn sm" data-act="suggest">Предложить улучшение</button></div>','menu');bindAds()}

function showHow(){
 screen(hdr('Как играть','menu')+'<div class="body"><div class="how">'+
 '<h2>Идея</h2><p>Один объясняет слово с карточки, остальные угадывают. Называть само слово и однокоренные нельзя.</p>'+
 '<h2>Все против всех</h2><ul><li>Объясняющий идёт по кругу.</li><li>Слово угадали: свайп <span class="sw">вверх ▲</span>, объясняющему +1.</li><li>Пропуск: свайп <span class="sw">вниз ▼</span>, объясняющему −1.</li><li>Когда время вышло, последнее слово: угадали или нет. Угадали — +1 объясняющему.</li><li>В настройках можно включить «Отмечать, кто угадал»: тогда очко получают и угадавший, и объясняющий.</li><li>Игра идёт до 30 очков (можно изменить).</li></ul>'+
 '<h2>Командная игра</h2><ul><li>Объясняет игрок из команды, угаданное слово +1 команде, пропуск −1.</li><li>Последнее слово после таймера может забрать любая команда.</li><li>Обычно играют до 50 очков, ход заканчивается кругом, чтобы у всех было поровну ходов.</li></ul>'+
 '<h2>Модификации</h2><ul><li><b>Без штрафа</b>: пропуск ничего не отнимает.</li><li><b>Блиц</b>: ход 30 секунд, +2 за слово.</li><li><b>Жесты / рисунок</b>: на некоторых карточках появляется задание.</li><li><b>Спасения</b>: 1–2 пропуска за игру без штрафа.</li></ul>'+
 '<h2>Наказание</h2><p>Опция 18+. Проигравший тянет карточку-действие. Если нужно «противоположному полу», приложение выбирает партнёра по указанному полу. Всё только по согласию: «Отказ» стоит −2 очка. Нет боли и опасности. Можно включить «Правда или действие», режим «Для пары» (жаркость растёт с каждым раундом), свои задания и модификатор «Алкоголь» (глоток или шот, при отказе можно выпить вместо −2). Рядом предупреждение: пейте ответственно. Задание «Найди точку»: партнёр ставит маркер, ищущий с закрытыми глазами ищет её 30 секунд; нашёл — +1, не нашёл — ещё одно задание.</p><h2>Музыка</h2><p>Кнопка «Музыка» открывает плейлисты: «Весёлый» для обычных колод, «Секс / чувственный» для Страсти и Намёков, «Жёсткий / Rammstein» для БДСМ, Пошлых хитов и Наказания. Отдельный плейлист «Hush Hush и похожие» выбирается только вручную. Можно добавить свой плейлист ссылкой из Apple Music, Яндекс Музыки или ВК — он хранится на этом телефоне, а в общий топ попадёт после подключения бесплатной базы. Один лайк с устройства. Рекомендуемый подсвечивается сам. Треки в приложение не встроены.</p><h2>Слова</h2><p>Слова не повторяются: игра помнит сыгранные и показывает только новые. Можно добавить свою колоду, вставив слова списком.</p></div></div>')}

/* players */
function names(){return prefs[prefs.mode]}
function showPlayers(){
 var m=prefs.mode;if(m==='pair'){if(!prefs.pair||prefs.pair.length!==2)prefs.pair=['Я','Партнёр'];if(!prefs.pairSex||prefs.pairSex.length!==2)prefs.pairSex=['m','f']}
 var list=names();
 var sx=sexes();var rows=list.map(function(n,i){return '<div class="row"><input class="nm" data-i="'+i+'" value="'+esc(n)+'" maxlength="24" autocomplete="off" autocapitalize="sentences"><div class="sex"><button type="button" data-sex="m" data-i="'+i+'" class="'+(sx[i]==='m'?'on':'')+'">М</button><button type="button" data-sex="f" data-i="'+i+'" class="'+(sx[i]==='f'?'on':'')+'">Ж</button></div>'+(m==='pair'?'':'<button class="del" data-del="'+i+'" aria-label="Удалить">×</button>')+'</div>'}).join('');
 var title=m==='team'?'Команды':m==='pair'?'Пара':'Игроки';
 var hint=m==='pair'?'Игра вдвоём, 18+. Наказания становятся острее с каждым раундом: 🌶, потом 🌶🌶, потом 🌶🌶🌶.':(m==='ffa'?'Каждый играет сам за себя. Объясняющий идёт по кругу.':'Объясняет любой игрок команды.');
 screen(hdr(title,'menu')+'<div class="seg"><button data-mode="ffa" class="'+(m==='ffa'?'on':'')+'">Все против всех</button><button data-mode="team" class="'+(m==='team'?'on':'')+'">Командная</button><button data-mode="pair" class="'+(m==='pair'?'on':'')+'">Для пары</button></div>'+
 '<div class="body" style="padding:0">'+rows+(m!=='pair'&&list.length<12?'<button class="plus" data-act="add">+</button>':'')+
 '<div class="hint">'+hint+'<br>Нажми на имя, чтобы изменить. Двойной тап — случайное имя. Пол нужен для режима «Наказание».</div></div>'+
 '<button class="next" data-act="settings">Далее</button>')}

/* settings */
function showSettings(){
 var m=prefs.mode,solo=m!=='team',pk=solo?'ptsF':'ptsT';
 function tg(k,t,s,x){return '<div class="set '+(x||'')+'"><div class="l1"><div><div class="t">'+t+'</div><div class="s">'+s+'</div></div><button class="tg '+(prefs[k]?'on':'')+'" data-tg="'+k+'" aria-label="'+t+'"></button></div></div>'}
 var punishExtra='';
 if(prefs.punish){
  punishExtra+='<div class="set"><div class="l1"><div><div class="t">Когда наказывать</div><div class="s">после хода или в конце игры</div></div><div class="stp pwhen">'+[{k:'turn',l:'Ход'},{k:'game',l:'Финал'}].map(function(x){return '<button data-pwhen="'+x.k+'" class="'+(prefs.punishWhen===x.k?'on':'')+'">'+x.l+'</button>'}).join('')+'</div></div></div>';
  if(m==='pair')punishExtra+='<div class="set"><div class="l1"><div><div class="t">Жаркость</div><div class="s">растёт сама с каждым раундом: 🌶 → 🌶🌶 → 🌶🌶🌶</div></div></div></div>';
  else punishExtra+='<div class="set"><div class="l1"><div><div class="t">Жаркость</div><div class="s">задания до выбранного уровня</div></div><div class="stp">'+[1,2,3].map(function(n){return '<button data-heat="'+n+'" class="'+(prefs.heat===n?'on':'')+'">'+'🌶'.repeat(n)+'</button>'}).join('')+'</div></div></div>';
  punishExtra+=tg('tod','Правда или действие 18+','проигравший выбирает: вопрос или задание');
  punishExtra+=tg('alcohol','Алкоголь','проигравший пьёт глоток, на 🌶🌶🌶 — шот. При отказе можно выпить вместо −2. Пейте ответственно');
  var mine=myDares.map(function(d,i){return '<div class="mydare"><span>'+esc(d.t)+' · '+'🌶'.repeat(d.lv||1)+'</span><button type="button" data-deldare="'+i+'">Удалить</button></div>'}).join('');
  punishExtra+='<div class="set col"><div class="l1"><div><div class="t">Свои задания</div><div class="s">попадают в общий пул наказаний, хранятся на этом телефоне</div></div></div>'+(mine||'<div class="hint" style="padding:0 0 8px">Пока своих заданий нет.</div>')+'<button type="button" class="optb" data-act="adddare">+ Своё задание</button></div>';
 }
 screen(hdr('Настройки','players')+'<div class="body"><div class="sub" style="text-align:center">Версия '+APP_VER+' · обновляется само</div>'+
 '<div class="set"><div class="l1"><div><div class="t">Очки до победы</div><div class="s">чтобы выиграть игру</div></div><div class="v" id="v1">'+prefs[pk]+'</div></div><input type="range" id="r1" min="10" max="'+(solo?100:150)+'" step="5" value="'+prefs[pk]+'"></div>'+
 '<div class="set '+(prefs.blitz?'dim':'')+'" id="timeset"><div class="l1"><div><div class="t">Время хода</div><div class="s">длительность в секундах</div></div><div class="v" id="v2">'+(prefs.blitz?30:prefs.time)+'</div></div><input type="range" id="r2" min="15" max="120" step="5" value="'+prefs.time+'"></div>'+
 tg('penalty','Штраф за пропуск','−1 очко за каждое пропущенное слово')+
 tg('lastAll','Последнее слово всем','после таймера слово может угадать '+(solo?'любой игрок':'любая команда'))+
 (solo?tg('markWho','Отмечать, кто угадал','после каждого слова выбрать, кто угадал первым: +1 ему и +1 объясняющему'):'')+
 tg('blitz','Блиц','30 секунд на ход, +2 за слово')+
 tg('gest','Задания: жесты','на части карточек — показать слово без слов')+
 tg('draw','Задания: рисунок','на части карточек — нарисовать слово')+
 '<div class="set"><div class="l1"><div><div class="t">Спасения</div><div class="s">пропуски без штрафа за игру (на '+(solo?'игрока':'команду')+')</div></div><div class="stp">'+[0,1,2].map(function(n){return '<button data-sv="'+n+'" class="'+(prefs.saves===n?'on':'')+'">'+n+'</button>'}).join('')+'</div></div></div>'+
 tg('sound','Звук','сигналы таймера')+
 tg('voice','Голосовой ведущий 👑','объявляет ход, время и очки. Платная функция')+
 tg('punish','Наказание','18+: проигравший тянет карточку-действие. Только по согласию')+
 punishExtra+
 '<div class="set"><div class="l1"><div><div class="t">Музыка</div><div class="s">плейлисты во внешних приложениях, без встроенных треков</div></div><button class="optb" data-act="music">Вкл/выкл</button></div></div>'+
 '<div style="height:14px"></div></div><button class="next" data-act="dicts">Далее</button>')}
function addDareModal(){modal('<h3>Своё задание</h3><p>Только для взрослых, по согласию и без вреда здоровью. Попадёт в общий пул наказаний на этом телефоне.</p><textarea id="dt" maxlength="80" placeholder="Текст задания"></textarea><div class="stp" style="justify-content:center;margin:8px 0">'+[1,2,3].map(function(n){return '<button type="button" data-dlv="'+n+'" class="'+(n===2?'on':'')+'">'+'🌶'.repeat(n)+'</button>'}).join('')+'</div><label class="chk"><input type="checkbox" id="dopp"> Нужен партнёр противоположного пола</label><button class="opt" data-ok>Сохранить</button><button class="opt gy" data-no>Отмена</button>');
 var lv=2;$$('[data-dlv]',ov).forEach(function(b){b.onclick=function(){lv=+b.getAttribute('data-dlv');$$('[data-dlv]',ov).forEach(function(x){x.classList.toggle('on',+x.getAttribute('data-dlv')===lv)})}});
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){var tx=($('#dt').value||'').trim();if(tx.length<4){toast('Напиши задание покороче, но не пустое');return}if(tx.length>80){toast('До 80 символов');return}if(myDares.length>=40){toast('Слишком много своих заданий');return}myDares.push({t:tx,lv:lv,opp:$('#dopp')&&$('#dopp').checked?1:0});saveMyDares();closeOv();showSettings()}}

/* dictionaries */
var samples={};
function sampleOf(id){if(!samples[id]){var a=deckWords(id).slice(),o=[];while(o.length<3&&a.length)o.push(wordText(a.splice(rnd(a.length),1)[0]));samples[id]=o.join(', ')}return samples[id]}
function dkArt(id){
 if(id==='hard')return '<svg class="art" viewBox="0 0 160 110"><g fill="none" stroke="#fff" stroke-width="3" opacity=".8"><circle cx="100" cy="55" r="34"/><path d="M100 21 V89 M66 55 H134 M76 31 Q100 55 76 79 M124 31 Q100 55 124 79"/></g></svg>';
 if(id==='adult'||id==='passion')return '<svg class="art" viewBox="0 0 160 110"><path d="M110 92 C60 60 70 22 100 38 C112 44 112 50 112 50 C112 50 114 44 126 38 C156 22 160 60 110 92Z" fill="#fff" opacity=".7"/></svg>';
 if(id==='bdsm')return '<svg class="art" viewBox="0 0 160 110"><g fill="#fff" opacity=".7"><rect x="78" y="28" width="44" height="54" rx="6"/><circle cx="100" cy="22" r="10"/><path d="M90 82 L90 98 L110 98 L110 82" stroke="#fff" stroke-width="6" fill="none"/></g></svg>';
 if(id==='hints')return '<svg class="art" viewBox="0 0 160 110"><g fill="#fff" opacity=".75"><circle cx="88" cy="48" r="8"/><circle cx="112" cy="48" r="8"/><circle cx="136" cy="48" r="8"/></g></svg>';
 if(id==='hits')return '<svg class="art" viewBox="0 0 160 110"><g fill="#fff" opacity=".8"><circle cx="118" cy="78" r="16"/><circle cx="86" cy="86" r="12"/><rect x="130" y="28" width="6" height="50" rx="2"/><rect x="94" y="42" width="5" height="44" rx="2"/></g></svg>';
 if(id==='medium')return '<svg class="art" viewBox="0 0 160 110"><g fill="#fff" opacity=".7"><circle cx="100" cy="40" r="22"/><circle cx="130" cy="72" r="16"/><circle cx="82" cy="78" r="10"/></g></svg>';
 return ''}
function showDicts(){
 var h=DECKS.map(function(d){var on=prefs.decks.indexOf(d.id)>-1;
  return '<button class="dk '+d.cls+(on?' on':'')+'" data-dk="'+d.id+'">'+dkArt(d.id)+'<div class="n">'+d.name+'</div><div class="d">'+d.diff+'</div><div class="ex">'+(d.adult&&!on?'Слова скрыты до подтверждения':esc(sampleOf(d.id)))+'</div><div class="cnt">'+W[d.id].length+'</div>'+(d.badge?'<span class="bd'+(d.red?' red':'')+'" style="right:54px">'+d.badge+'</span>':'')+'<span class="ck">'+(on?'✓':'')+'</span></button>'}).join('');
 h+=custom.map(function(c){var on=prefs.decks.indexOf(c.id)>-1;
  return '<button class="dk dk-cust'+(on?' on':'')+'" data-dk="'+c.id+'"><div class="n">'+esc(c.name)+'</div><div class="d">Своя колода</div><div class="ex">'+esc(c.words.slice(0,3).join(', '))+'</div><div class="cnt">'+c.words.length+'</div><span class="bd gr" style="right:54px">СВОЯ</span><span class="ck">'+(on?'✓':'')+'</span><span data-del="'+c.id+'" style="position:absolute;left:20px;bottom:10px;color:#c23;font-size:13px;font-weight:700;padding:4px 0">Удалить</span></button>'}).join('');
 if(sbOn()){var gon=prefs.decks.indexOf('global')>-1,gl=globalWords();h+='<button class="dk dk-cust'+(gon?' on':'')+'" data-dk="global"><div class="n">Общая база</div><div class="d">Слова всех игроков</div><div class="ex">'+esc(gl.slice(0,3).join(', ')||'пока пусто')+'</div><div class="cnt">'+gl.length+'</div><span class="bd gr" style="right:54px">ОБЩАЯ</span><span class="ck">'+(gon?'✓':'')+'</span></button>';if(Date.now()-gwAt>60000)loadGlobal(function(ch){if(ch&&$('[data-dk="global"]'))showDicts()})}
 var total=poolFor(prefs.decks).length,left=poolFor(prefs.decks).filter(function(w){return !played[wordKey(w)]}).length;
 screen(hdr('Словари','settings')+'<div class="body" style="padding:0">'+h+'<button class="addck" data-act="addck"><span style="font-size:26px;line-height:1">+</span> Своя колода (вставить слова)</button>'+(sbOn()?'<button class="addck" data-act="gadd"><span style="font-size:26px;line-height:1">+</span> Слово в общую базу</button><button class="addck" data-act="gvote">👍👎 Оценить слова других</button>':'')+
 '<div class="goal">Выбрано слов: '+total+' · новых: '+left+'</div><button class="rst" data-act="resetplayed">Забыть сыгранные слова</button></div><button class="next" data-act="start" '+(prefs.decks.length?'':'disabled')+'>Играть</button>')}
function isAdultDeck(id){for(var i=0;i<DECKS.length;i++)if(DECKS[i].id===id)return !!DECKS[i].adult;return false}
function askAdult(cb){modal('<h3>Колода 18+</h3><p>Слова на сексуальную тематику и взрослый юмор. Только для взрослых. Подтверди, что тебе есть 18 лет.</p><button class="opt r" data-ok>Мне 18+</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-ok]',ov).onclick=function(){prefs.adultOk=true;savePrefs();closeOv();cb()};$('[data-no]',ov).onclick=closeOv}
function addDeckModal(){modal('<h3>Своя колода</h3><p>Вставь слова списком: каждое с новой строки или через запятую.</p><input class="tx" id="cn" placeholder="Название колоды" maxlength="24"><textarea id="cw" placeholder="слово 1&#10;слово 2&#10;слово 3"></textarea><button class="opt" data-ok>Сохранить</button><button class="opt gy" data-no>Отмена</button>');
 $('[data-no]',ov).onclick=closeOv;
 $('[data-ok]',ov).onclick=function(){
  var nm=$('#cn').value.trim()||('Колода '+(custom.length+1)),seen={},ws=[];
  $('#cw').value.split(/[\n,;]+/).forEach(function(x){x=x.trim();if(x&&x.length<=60&&!seen[x.toLowerCase()]){seen[x.toLowerCase()]=1;ws.push(x)}});
  if(ws.length<5){toast('Нужно хотя бы 5 слов');return}
  var id='c'+Date.now();custom.push({id:id,name:nm,words:ws});sv('elias.custom',custom);prefs.decks.push(id);savePrefs();closeOv();showDicts()}}

/* ---------- game flow ---------- */
function startGame(){
 var m=prefs.mode,nm=names().map(function(n,i){return (n||'').trim()||(m==='team'?'Команда '+(i+1):m==='pair'?(i?'Партнёр':'Я'):'Игрок '+(i+1))});
 if(m==='pair'&&nm.length!==2){toast('Для пары нужно двое');return}
 if(poolFor(prefs.decks).length<10){toast('В выбранных колодах слишком мало слов');return}
 G={mode:m,names:nm,set:{ptsF:prefs.ptsF,ptsT:prefs.ptsT,time:prefs.time,penalty:prefs.penalty,lastAll:prefs.lastAll,markWho:!!prefs.markWho,blitz:prefs.blitz,gest:prefs.gest,draw:prefs.draw,saves:prefs.saves,sound:prefs.sound,punish:!!prefs.punish||m==='pair',punishWhen:prefs.punishWhen||'turn',heat:prefs.heat||1,tod:!!prefs.tod,alcohol:!!prefs.alcohol,pairEscalate:m==='pair'},
 sex:sexes().slice(),fines:[],usedDares:[],pendingFx:null,activeFx:null,
 decks:prefs.decks.slice(),turnNo:0,logs:[],phase:'ready',over:false};
 saveG();showReady()}

function chipsHtml(){var s=G.set,c=['<span class="chip b">⏱ '+(s.blitz?30:s.time)+' с</span>','<span class="chip b">🎯 до '+target()+'</span>'];
 if(s.blitz)c.push('<span class="chip r">⚡ блиц +2</span>');
 c.push('<span class="chip">'+(s.penalty?'пропуск −1':'без штрафа')+'</span>');
 if(s.gest)c.push('<span class="chip">🤐 жесты</span>');if(s.draw)c.push('<span class="chip">✏️ рисунок</span>');if(s.punish)c.push('<span class="chip r">🌶 наказание</span>');if(s.tod)c.push('<span class="chip r">правда/действие</span>');if(s.alcohol)c.push('<span class="chip r">алкоголь</span>');if(s.pairEscalate)c.push('<span class="chip r">пара 🌶+</span>');
 return c.join('')}
function showReady(){
 closeOv();stopListen();G.phase='ready';saveG();
 var e=curE(),cs=calc(G.logs),left=G.set.saves-cs.used[e];
 var info=isSolo()?(G.set.markWho?'Остальные угадывают все сразу. Кто угадал первым: +1 ему и +1 тебе. Пропуск −1 тебе.':'Остальные угадывают все сразу. Угадали — +1 тебе. Пропуск −1 тебе.'):'Объясняет игрок команды, остальные угадывают.';
 if(!G.set.penalty)info=info.replace(/ Пропуск −1 тебе\./,' Пропуск без штрафа.').replace('Объясняет игрок команды, остальные угадывают.','Объясняет игрок команды, остальные угадывают. Пропуск без штрафа.');
 if(G.set.penalty&&G.set.saves>0)info+=' Спасений осталось: '+Math.max(0,left)+'.';
 screen(cityScene(true)+'<div class="top"><button data-act="menu">‹ Меню</button><button data-act="board">Табло</button></div>'+
 '<div class="rcard"><div class="lab">'+(isSolo()?'Объясняет':'Ход команды')+'</div><div class="who">'+esc(G.names[e])+'</div><div class="info">'+info+'</div><div class="chips">'+chipsHtml()+'</div></div>'+
 '<div class="bot"><button class="obtn" data-act="go">Старт</button></div>','ready');bindAds();speakTurn();startListen()}

/* play */
var P=null;
function showPlay(){
 closeOv();G.phase='play';
 if(G.pendingFx){G.activeFx=G.pendingFx;G.pendingFx=null}else G.activeFx=null;
 var e=curE(),dur=G.set.blitz?30:G.set.time;
 P={items:[],dur:dur,rem:dur*1000,end:0,paused:false,iv:null,card:newCard(),busy:false,lastBeep:99,sheet:false};
 screen(cityScene(true)+'<div class="ptop"><button class="pa" data-act="pause" aria-label="Пауза"><i></i><i></i></button><div class="pt" id="tm">'+dur+'</div><div class="ps">очки хода<b id="pd">0</b></div></div>'+
 '<div class="pwho">'+esc(G.names[e])+(G.set.penalty&&G.set.saves>0?' · спасений: <span id="svl"></span>':'')+'</div><div class="pbar"><i id="pb"></i></div>'+
 '<div class="arena"><div class="hintup">УГАДАЛИ</div><div class="hintdn">ПРОПУСК</div><div id="cardhold" style="width:100%;display:flex;justify-content:center"></div></div>'+
 '<div class="pact"><button class="no" data-act="skip" aria-label="Пропуск">✕</button><button class="yes" data-act="ok" aria-label="Угадали">✓</button></div>','play');
 mountCard();updPlay();bindAds();
 P.end=Date.now()+P.rem;P.iv=setInterval(tick,100);beep(660,.12);speakTurn();startListen()}
function usedNow(){var e=curE();return calc(G.logs).used[e]+P.items.filter(function(i){return i.st==='f'}).length}
function updPlay(){
 var d=$('#pd');if(d)d.textContent=(turnDelta(P.items)>0?'+':'')+turnDelta(P.items);
 var s=$('#svl');if(s)s.textContent=Math.max(0,G.set.saves-usedNow())}
function mountCard(){
 var hold=$('#cardhold');if(!hold)return;var c=P.card;
 var fx=G.activeFx;
 var tk=c.task||fx?'<div class="tk">':'';
 if(fx==='blind')tk+='<span class="chip r">🙈 С завязанными глазами</span>';
 if(fx==='moan')tk+='<span class="chip r">Только стонами</span>';
 if(c.task)tk+='<span class="chip r">'+(c.task==='gest'?'🤐 Покажи жестами':'✏️ Нарисуй')+'</span>';
 if(c.task||fx)tk+='</div>';
 var free=(G.set.penalty&&G.set.saves-usedNow()>0)?'<div class="free">пропуск без штрафа (спасение)</div>':'';
 hold.innerHTML='<div class="wcard" id="wc">'+tk+'<div class="stamp g">УГАДАЛИ</div><div class="stamp s">ПРОПУСК</div>'+wordCardHtml(c.w)+free+'</div>';
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
 if(isSolo()&&G.set.markWho){
  var e=curE(),opts=G.names.map(function(n,i){return i===e?'':'<button class="opt b" data-by="'+i+'">'+esc(n)+'</button>'}).join('');
  P.sheet=true;
  sheet('<h3>Кто угадал первым?</h3><div class="sub">«'+esc(wordText(P.card.w))+'»</div><div class="opts">'+opts+'<button class="opt gy w" data-by="-1">Никто · вернуть слово</button></div>',false);
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
 if(voiceOn()&&(s===30||s===10||s===5)&&P.voiceAt!==s&&!(s===30&&P.dur<=30)){P.voiceAt=s;speak('Осталось '+s+' секунд')}
 if(rem<=0)timeUp()}
function stopTimer(){if(P&&P.iv){clearInterval(P.iv);P.iv=null}}
function timeUp(){
 stopTimer();P.over=true;P.sheet=false;closeOv();stopListen();beep(220,.7,.2);speak('Время вышло.');syncAdsHot();
 var el=$('#wc');if(el)el.style.transform='';
 if(G.set.lastAll)showLast();else showResults()}
function pauseGame(){
 if(!P||P.paused||P.over)return;P.paused=true;P.rem=Math.max(0,P.end-Date.now());stopListen();try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
 syncAdsHot();
 modal('<h3>Пауза</h3><p>Таймер остановлен.</p><button class="opt" data-r>Продолжить</button><button class="opt gy" data-e>Закончить ход</button><button class="opt gy" data-m>Выйти в меню</button>',false);
 $('[data-r]',ov).onclick=function(){closeOv();P.paused=false;P.end=Date.now()+P.rem;syncAdsHot();startListen()};
 $('[data-e]',ov).onclick=function(){closeOv();stopTimer();P.over=true;showResults()};
 $('[data-m]',ov).onclick=function(){closeOv();stopTimer();stopVoice();P=null;showMenu()}}
document.addEventListener('visibilitychange',function(){if(document.hidden&&P&&!P.over&&!P.paused&&$('#tm'))pauseGame()});

function showLast(){
 var e=curE();
 if(isSolo()&&!G.set.markWho){
  screen('<h2>Время вышло!</h2><div class="q">Последнее слово</div><div class="lw">'+wordCardHtml(P.card.w)+'</div><div class="q">Угадали?</div><div class="chs"><button class="opt" data-ok="1">Угадали</button><button class="opt gy" data-ok="0">Нет</button></div>','last');
  $$('[data-ok]',app).forEach(function(b){b.onclick=function(){var ok=b.getAttribute('data-ok')==='1';
   P.items.push(ok?{w:P.card.w,st:'g',by:e,last:true}:{w:P.card.w,st:'n',last:true});showResults()}});
  return}
 var opts=G.names.map(function(n,i){return (isSolo()&&i===e)?'':'<button class="opt" data-by="'+i+'">'+esc(n)+(!isSolo()&&i===e?' (свои)':'')+'</button>'}).join('');
 screen('<h2>Время вышло!</h2><div class="q">Последнее слово</div><div class="lw">'+wordCardHtml(P.card.w)+'</div><div class="q">Кто угадал?</div><div class="chs">'+opts+'<button class="opt gy" data-by="-1">Никто</button></div>','last');
 $$('[data-by]',app).forEach(function(b){b.onclick=function(){var by=+b.getAttribute('data-by');
  P.items.push(by<0?{w:P.card.w,st:'n',last:true}:{w:P.card.w,st:'g',by:by,last:true});showResults()}})}

function icon(it){return it.st==='g'?'<span class="ic g">✓</span>':it.st==='s'?'<span class="ic s">✕</span>':it.st==='f'?'<span class="ic f">✕</span>':'<span class="ic n">–</span>'}
function showResults(){
 closeOv();stopListen();G.phase='results';var items=P.items,e=curE(),d=turnDelta(items),v=unit(G.set);
 var g=items.filter(function(i){return i.st==='g'}).length,s=items.filter(function(i){return i.st==='s'||i.st==='f'}).length;
 var rows=items.map(function(it,i){
  var sub=it.st==='g'?(isSolo()&&G.set.markWho&&it.by!=null?'угадал(а): '+esc(G.names[it.by]):(!isSolo()&&it.by!=null&&it.by!==e?'забрала: '+esc(G.names[it.by]):'')):it.st==='f'?'спасение, без штрафа':it.st==='n'?'не засчитано':'';
  var pt=it.st==='g'?'<span style="color:var(--g)">+'+v+'</span>':it.st==='s'&&G.set.penalty?'<span style="color:var(--r)">−1</span>':'<span style="color:#bbb">0</span>';
  return '<button class="rs" data-i="'+i+'"><div class="w">'+wordLine(it.w)+(it.last?' <small>последнее слово</small>':'')+(sub?'<small>'+sub+'</small>':'')+'</div><div class="pt">'+pt+'</div>'+icon(it)+'</button>'}).join('');
 screen(hdr('Итоги хода','menu',esc(G.names[e]))+'<div class="sum"><div><b class="p" id="sg">'+g+'</b>угадано</div><div><b class="m" id="ss">'+s+'</b>пропущено</div><div><b id="sd">'+(d>0?'+':'')+d+'</b>очки '+(isSolo()?'объясняющего':'команды')+'</div></div>'+
 '<div class="body" style="padding:0">'+(rows||'<div class="hint">Слов не было</div>')+'<div class="hint">Нажми на слово, чтобы поправить отметку.</div></div><button class="next" data-act="commit">Далее</button>');
 var bk=$('.hdr .back');if(bk)bk.style.visibility='hidden';speakResults();startListen()}
function editItem(i){
 var it=P.items[i],e=curE(),o='';
 if(isSolo()&&G.set.markWho){G.names.forEach(function(n,k){if(k!==e)o+='<button class="opt b" data-st="g" data-by="'+k+'">Угадал(а): '+esc(n)+'</button>'})}
 else if(G.mode==='team'){G.names.forEach(function(n,k){o+='<button class="opt b" data-st="g" data-by="'+k+'">Угадали: '+esc(n)+(k===e?' (свои)':'')+'</button>'})}
 else o+='<button class="opt b" data-st="g" data-by="'+e+'">Угадали (+'+(G.set.blitz?2:1)+' объясняющему)</button>';
 o+='<button class="opt r" data-st="s">Пропуск'+(G.set.penalty?' (−1)':'')+'</button><button class="opt gy" data-st="f">Пропуск без штрафа</button><button class="opt gy" data-st="n">Не засчитывать</button>';
 sheet('<h3>'+esc(wordText(it.w))+'</h3><div class="sub">'+(wordArtist(it.w)?esc(wordArtist(it.w))+' · ':'')+'Поправить отметку</div><div class="opts">'+o+'</div>');
 $$('[data-st]',ov).forEach(function(b){b.onclick=function(){var st=b.getAttribute('data-st'),by=b.getAttribute('data-by');
  it.st=st;if(st==='g')it.by=+by;else delete it.by;closeOv();showResults()}})}
function commit(){
 stopListen();stopDot();G.activeFx=null;
 G.logs.push({e:curE(),items:P.items});P=null;var cs=calc(G.logs),sc=cs.sc,n=sc.length,mx=Math.max.apply(null,sc),T=target();
 var top=sc.filter(function(x){return x===mx}).length;
 var roundDone=(G.turnNo+1)%n===0;
 var over=mx>=T&&top===1&&(isSolo()||roundDone);
 G.turnNo++;
 var go=function(){
  sc=calc(G.logs).sc;
  if(over){G.over=true;sv('elias.game',null);try{localStorage.removeItem('elias.game')}catch(e){}showFinal(sc);return}
  saveG();showBoard(true)
 };
 if(G.set.punish&&((over&&G.set.punishWhen==='game')||G.set.punishWhen==='turn')){showDare(go,over&&G.set.punishWhen==='game'?'game':'turn');return}
 go()}

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
 var t=ev.target.closest('[data-act],[data-mode],[data-tg],[data-sv],[data-dk],[data-del],[data-deldare],[data-delpl],[data-like],[data-gv],[data-i],[data-sex],[data-heat],[data-pwhen],[data-mpick]');
 if(!t||!app.contains(t)&&!ov.contains(t))return;
 if(t.hasAttribute('data-del')&&t.closest('.dk')){ev.stopPropagation();var id=t.getAttribute('data-del');
  modal('<h3>Удалить колоду?</h3><p>Слова этой колоды будут удалены с устройства.</p><button class="opt r" data-ok>Удалить</button><button class="opt gy" data-no>Отмена</button>');
  $('[data-no]',ov).onclick=closeOv;$('[data-ok]',ov).onclick=function(){custom=custom.filter(function(c){return c.id!==id});sv('elias.custom',custom);prefs.decks=prefs.decks.filter(function(x){return x!==id});savePrefs();closeOv();showDicts()};return}
 var a=t.getAttribute('data-act');
 if(t.hasAttribute('data-mode')){var md=t.getAttribute('data-mode');var go=function(){prefs.mode=md;if(md==='pair'){prefs.punish=true;if(!prefs.pair||prefs.pair.length!==2)prefs.pair=['Я','Партнёр'];if(!prefs.pairSex||prefs.pairSex.length!==2)prefs.pairSex=['m','f']}savePrefs();showPlayers()};if(md==='pair'&&!prefs.adultOk){askAdult(go);return}go();return}
 if(t.hasAttribute('data-gv')){ev.stopPropagation();var gp=t.getAttribute('data-gv').split('|');voteWord(gp[0],+gp[1]);return}
 if(t.hasAttribute('data-like')){ev.stopPropagation();likeTop(t.getAttribute('data-like'));return}
 if(t.hasAttribute('data-delpl')){ev.stopPropagation();var pid=t.getAttribute('data-delpl');myPl=myPl.filter(function(g){return g.id!==pid});savePl();if(prefs.musicPick===pid){prefs.musicPick='';prefs.musicAuto=true;savePrefs()}musicPanel();return}
 if(t.hasAttribute('data-mpick')&&!ev.target.closest('a')&&!ev.target.closest('[data-delpl]')){prefs.musicPick=t.getAttribute('data-mpick');prefs.musicAuto=false;savePrefs();musicPanel();return}
 if(t.hasAttribute('data-sex')){sexes()[+t.getAttribute('data-i')]=t.getAttribute('data-sex');savePrefs();return showPlayers()}
 if(t.hasAttribute('data-heat')){prefs.heat=+t.getAttribute('data-heat');savePrefs();var sh=$('.body')&&$('.body').scrollTop;showSettings();if($('.body'))$('.body').scrollTop=sh;return}
 if(t.hasAttribute('data-pwhen')){prefs.punishWhen=t.getAttribute('data-pwhen');savePrefs();var sw=$('.body')&&$('.body').scrollTop;showSettings();if($('.body'))$('.body').scrollTop=sw;return}
 if(t.hasAttribute('data-deldare')){var di=+t.getAttribute('data-deldare');myDares.splice(di,1);saveMyDares();showSettings();return}
 if(t.hasAttribute('data-del')&&t.closest('.row')){if(prefs.mode==='pair')return;var l=names();if(l.length<=2){toast('Нужно минимум два '+(prefs.mode==='team'?'команды':'игрока'));return}var di=+t.getAttribute('data-del');l.splice(di,1);sexes();var sk=sexKey();if(prefs[sk])prefs[sk].splice(di,1);savePrefs();return showPlayers()}
 if(t.hasAttribute('data-tg')){var k=t.getAttribute('data-tg');
  if(k==='voice'&&!prefs.voice&&!isPremium()){showPremiumSoon();return}
  if((k==='punish'||k==='tod'||k==='alcohol')&&!prefs[k]&&!prefs.adultOk){askAdult(function(){prefs[k]=true;if(k==='tod'||k==='alcohol')prefs.punish=true;savePrefs();var scx=$('.body')&&$('.body').scrollTop;showSettings();if($('.body'))$('.body').scrollTop=scx});return}
  if(k==='voice'&&prefs.voice)stopVoice();
  prefs[k]=!prefs[k];if((k==='tod'||k==='alcohol')&&prefs[k])prefs.punish=true;savePrefs();var sc=$('.body').scrollTop;showSettings();$('.body').scrollTop=sc;return}
 if(t.hasAttribute('data-sv')){prefs.saves=+t.getAttribute('data-sv');savePrefs();var s2=$('.body').scrollTop;showSettings();$('.body').scrollTop=s2;return}
 if(t.hasAttribute('data-dk')){var id2=t.getAttribute('data-dk'),i=prefs.decks.indexOf(id2);
  var tog=function(){if(i>-1)prefs.decks.splice(i,1);else prefs.decks.push(id2);savePrefs();var s3=$('.body').scrollTop;showDicts();$('.body').scrollTop=s3};
  if(i===-1&&isAdultDeck(id2)&&!prefs.adultOk)askAdult(tog);else tog();return}
 if(t.classList.contains('rs')&&t.hasAttribute('data-i')){return editItem(+t.getAttribute('data-i'))}
 switch(a){
  case 'menu':if(P){stopTimer();P=null}closeOv();return showMenu();
  case 'hideinst':prefs.installHide=true;savePrefs();return showMenu();
  case 'continue':if(G){return G.phase==='board'?showBoard(true):showReady()}return showMenu();
  case 'new':return showPlayers();
  case 'how':return showHow();
  case 'music':musicPanel();return;
case 'suggest':showSuggest();return;
  case 'premdemo':sv('elias.premium',true);prefs.voice=true;savePrefs();toast('Премиум включён для теста');return showSettings();
  case 'mtab-list':musicTab='list';musicPanel();return;
  case 'mtab-top':musicTab='top';musicPanel();return;
  case 'addpl':addPlModal();return;
  case 'gadd':addWordModal();return;
  case 'gvote':votePanel();return;
  case 'mauto':prefs.musicAuto=true;prefs.musicPick='';savePrefs();musicPanel();return;
  case 'todtruth':return showTruth();
  case 'toddare':return startDareAction();
  case 'dotgo':return showDotSearch();
  case 'dotok':return dotWin();
  case 'dotno':return dotFail();
  case 'adddare':return addDareModal();
  case 'dareok':if(DareNow&&DareNow.fx==='blind')G.pendingFx='blind';if(DareNow&&DareNow.fx==='moan')G.pendingFx='moan';if(!G.over)saveG();finishDareThen();return;
  case 'dareko':G.fines=G.fines||[];if(DareLoser>=0)G.fines.push({p:DareLoser,d:-2});if(!G.over)saveG();finishDareThen();return;
  case 'daredrink':toast(currentHeat()>=3?'Штрафной шот вместо −2. Пейте ответственно.':'Глоток вместо −2. Пейте ответственно.');if(!G.over)saveG();finishDareThen();return;
  case 'players':return showPlayers();
  case 'add':if(prefs.mode==='pair')return;var l2=names();l2.push(prefs.mode==='team'?(TM_NAMES.filter(function(x){return l2.indexOf(x)<0})[0]||'Команда '+(l2.length+1)):'Игрок '+(l2.length+1));sexes().push(l2.length%2?'f':'m');savePrefs();showPlayers();var ins=$$('input.nm');if(ins.length){var li=ins[ins.length-1];li.focus();li.select()}$('.body').scrollTop=9999;return;
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
 if(t.id==='r1'){var pk=prefs.mode!=='team'?'ptsF':'ptsT';prefs[pk]=+t.value;$('#v1').textContent=t.value;savePrefs()}
 if(t.id==='r2'){prefs.time=+t.value;if(!prefs.blitz)$('#v2').textContent=t.value;savePrefs()}});
document.addEventListener('dblclick',function(ev){var t=ev.target;if(t.classList&&t.classList.contains('nm')&&t.closest('.row')){var l=names(),src=prefs.mode==='team'?TM_NAMES:PL_NAMES;var c=src.filter(function(x){return l.indexOf(x)<0});if(c.length){var v=pick(c);l[+t.getAttribute('data-i')]=v;t.value=v;savePrefs()}}});
document.addEventListener('contextmenu',function(e){e.preventDefault()});
var st=document.createElement('style');st.textContent='@keyframes cardin{from{transform:translateY(40px) scale(.94);opacity:0}to{transform:none;opacity:1}}';document.head.appendChild(st);

showMenu();flushSugQ();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 var __re=false,__had=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',function(){if(__re||!__had)return;__re=true;location.reload()});
 navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(reg){
  var chk=function(){try{reg.update()}catch(e){}};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)chk()});
  setInterval(chk,300000);chk()}).catch(function(){})}
loadGlobal();
window.__elias={get G(){return G},get P(){return P},get DARES(){return DARES},get TRUTHS(){return TRUTHS},get myDares(){return myDares},currentHeat:currentHeat,SUPABASE:SUPABASE};
})();
