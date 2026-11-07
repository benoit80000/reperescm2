/* ---------- utilitaires ---------- */
const $=s=>document.querySelector(s);
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const NB=" ";
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,NB);
const fmtD=(x,d)=>{let [i,f]=x.toFixed(d).split(".");return fmt(i)+(f?","+f:"")};
const fmtAuto=x=>{let s=(Math.round(x*1000)/1000).toString().split(".");return fmt(s[0])+(s[1]?","+s[1]:"")};
const parseNum=s=>Number(String(s).replace(/[\s  ]/g,"").replace(",","."));
const norm=s=>String(s).toLowerCase().replace(/[’`]/g,"'").replace(/\s+/g," ").trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* nombres en lettres (orthographe recommandée de 1990 : traits d'union partout) */
const U=["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
const T={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
function u100(n){if(n<17)return U[n];if(n<20)return "dix-"+U[n-10];const t=Math.floor(n/10),r=n%10;
  if(t<7)return T[t]+(r===0?"":r===1?"-et-un":"-"+U[r]);
  if(t===7)return "soixante-"+(r===1?"et-onze":u100(10+r));
  if(t===8)return r===0?"quatre-vingts":"quatre-vingt-"+U[r];
  return "quatre-vingt-"+u100(10+r)}
function u1000(n,final){const h=Math.floor(n/100),r=n%100;
  const hs=h===0?"":h===1?"cent":U[h]+"-cent"+(r===0&&final?"s":"");
  if(r===0)return hs||"zéro";
  let rs=u100(r); if(!final&&r===80)rs="quatre-vingt";
  return hs?hs+"-"+rs:rs}
function enLettres(n){if(n<1000)return u1000(n,true);const th=Math.floor(n/1000),r=n%1000;
  const thw=th===1?"mille":u1000(th,false)+"-mille";return r?thw+"-"+u1000(r,true):thw}

/* lecture vocale */
function speak(text){try{if(!("speechSynthesis" in window))return false;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="fr-FR";u.rate=.9;
  const v=speechSynthesis.getVoices().find(v=>/^fr/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u);return true}catch(e){return false}}
const canSpeak=(()=>{try{return "speechSynthesis" in window}catch(e){return false}})();

/* ---------- stockage (dans ce navigateur uniquement) ---------- */
const KEY="reperesCM2.v1";
let S={name:"",res:{},teacher:{},bilan:{},flu:[],chrono:{}};
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw))}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- questions : constructeurs ---------- */
function mc(prompt,correct,wrongs,expl,opt={}){const all=shuffle([correct,...wrongs.filter((w,i,a)=>w!==correct&&a.indexOf(w)===i)].slice(0,1+(opt.n||3)));
  return Object.assign({prompt,choices:all,answer:all.indexOf(correct),expl},opt)}
function inp(prompt,answer,expl,opt={}){return Object.assign({prompt,input:true,answer,expl},opt)}

/* ----- MATHS ----- */
function genEcrire(){const pats=[()=>ri(1,9)*1000+ri(1,9)*100,()=>ri(10,99)*1000+ri(100,999),()=>ri(1,9)*1000+ri(1,99),()=>ri(1,9)*100000,
  ()=>ri(70,99)*1000+ri(0,9)*10+ri(1,9),()=>ri(1,9)*1000+ri(70,99),()=>ri(100,999)*1000+ri(1,99),()=>ri(100,999)*1000+ri(0,9)*10,()=>ri(100,999)*1000+ri(100,999)];
  const n=pick(pats)();
  return inp(`Écris ce nombre en chiffres :<div class="big" style="font-size:1.25rem;margin-top:6px">${enLettres(n)}</div>`,n,
   `Réponse : <b>${fmt(n)}</b>. Découpe par classes : les mille, puis les unités simples. Un 0 marque une case vide (centaines, dizaines…).`,{say:String(n),num:true})}

function lineSVG(n,labels,arrow){const W=360,x0=48,x1=312,pos=i=>x0+(x1-x0)*i/n;let s=`<svg viewBox="0 0 ${W} 90" width="${W}" role="img" aria-label="ligne graduée"><rect width="100%" height="100%" rx="8" fill="var(--page)"/>`;
  s+=`<line x1="8" y1="44" x2="${W-8}" y2="44" stroke="var(--ink)" stroke-width="2"/>`;
  for(let i=0;i<=n;i++)s+=`<line x1="${pos(i)}" y1="36" x2="${pos(i)}" y2="52" stroke="var(--ink)" stroke-width="${labels[i]!==undefined?2.5:1.5}"/>`;
  for(const k in labels)s+=`<text x="${pos(+k)}" y="76" text-anchor="middle" font-size="15" font-family="Atkinson Hyperlegible,Verdana,sans-serif" fill="var(--ink)" font-weight="700">${labels[k]}</text>`;
  s+=`<path d="M${pos(arrow)} 32 l-6 -12 h12 z" fill="var(--margin)"/><text x="${pos(arrow)}" y="15" text-anchor="middle" font-size="16" font-weight="700" fill="var(--margin)" font-family="Atkinson Hyperlegible,Verdana,sans-serif">?</text></svg>`;return s}
function genLigne(){const t=pick(["ent","ent","dec","dec","frac"]);
  if(t==="ent"){const step=pick([100,1000,10000,100000]);const start=ri(0,20)*step*pick([1,1,2]);const L=pick([5,10]);let k;do{k=ri(1,10)}while(k===L);
    const ans=start+k*step;return inp(`Quel nombre indique la flèche&nbsp;?<div class="svgwrap">${lineSVG(10,{0:fmt(start),[L]:fmt(start+L*step)},k)}</div>`,ans,
     `Entre deux graduations on avance de <b>${fmt(step)}</b> (car ${fmt(L*step)} ÷ ${L} = ${fmt(step)}). La flèche est à ${k} graduations de ${fmt(start)} : <b>${fmt(ans)}</b>.`,{num:true})}
  if(t==="dec"){const half=Math.random()<.35;
    if(half){const s=ri(0,12);let k;do{k=ri(1,10)}while(k===2||k===0);const ans=s+k*.5;return inp(`Quel nombre indique la flèche&nbsp;?<div class="svgwrap">${lineSVG(10,{0:s,2:s+1},k)}</div>`,ans,
      `Deux graduations valent 1, donc une graduation vaut <b>0,5</b>. ${s} + ${k} × 0,5 = <b>${fmtAuto(ans)}</b>.`,{num:true})}
    const st=ri(0,95);const L=pick([5,10]);let k;do{k=ri(1,10)}while(k===L);const ans=(st+k)/10;
    return inp(`Quel nombre indique la flèche&nbsp;?<div class="svgwrap">${lineSVG(10,{0:fmtAuto(st/10),[L]:fmtAuto((st+L)/10)},k)}</div>`,ans,
      `Une graduation vaut <b>0,1</b> (un dixième). On compte de 0,1 en 0,1 depuis ${fmtAuto(st/10)} : <b>${fmtAuto(ans)}</b>.`,{num:true})}
  const d=pick([3,4,5,6]);let k;do{k=ri(1,2*d)}while(k===d||k===2*d);
  const lab=`${k}/${d}`;return mc(`Quelle fraction indique la flèche&nbsp;?<div class="svgwrap">${lineSVG(2*d,{0:"0",[d]:"1",[2*d]:"2"},k)}</div>`,lab,[`${d}/${k}`,`${k}/${2*d}`,`${k+1}/${d}`,`${k}/${d+1}`],
    `L’unité (de 0 à 1) est partagée en <b>${d}</b> parts égales : chaque graduation vaut 1/${d}. La flèche est à la ${k}<sup>e</sup> graduation : <b>${k}/${d}</b>.`)}

function barSVG(n,shaded,unequal){let w=[];if(unequal){do{w=Array.from({length:n},()=>ri(2,7))}while(Math.max(...w)<Math.min(...w)*2);}else w=Array(n).fill(1);const tot=w.reduce((a,b)=>a+b,0);
  let x=4,s=`<svg viewBox="0 0 168 40" width="168" role="img" aria-label="barre partagée en parts, certaines colorées">`;w.forEach((wi,i)=>{const ww=160*wi/tot;s+=`<rect x="${x}" y="6" width="${ww}" height="28" fill="${i<shaded?"var(--accent)":"var(--page)"}" stroke="var(--ink)" stroke-width="1.5"/>`;x+=ww});return s+"</svg>"}
function genRepr(){const t=pick(["deco","deco","frac","unit","comp","comp","lire"]);
  if(t==="deco"){if(Math.random()<.35){const dz=ri(2,8),u=ri(11,19),c=ri(0,5);const v=c*100+dz*10+u;const parts=[c?`${c} centaine${c>1?"s":""}`:"",`${dz} dizaines`,`${u} unités`].filter(Boolean).join(" + ");
      return mc(`Quel nombre correspond à&nbsp;: <b>${parts}</b>&nbsp;?`,fmt(v),[fmt(Number(`${c||""}${dz}${u}`)),fmt(v+10),fmt(v-10),fmt(v+100)],`${u} unités = 1 dizaine et ${u-10} unité${u-10>1?"s":""}. On regroupe : <b>${fmt(v)}</b>.`)}
    const places=[["millier",1000],["centaine",100],["dizaine",10],["unité",1]];const keep=shuffle([0,1,2,3]).slice(0,3);const digs=keep.map(i=>[places[i],ri(1,9)]);
    const v=digs.reduce((a,[[_,p],d])=>a+p*d,0);const shown=shuffle(digs);const txt=shown.map(([[nm],d])=>`${d} ${nm}${d>1?"s":""}`).join(" + ");
    const naive=Number(shown.map(([_,d])=>d).join(""));const sorted=Number(digs.slice().sort((a,b)=>b[0][1]-a[0][1]).map(([_,d])=>d).join(""));
    return mc(`Quel nombre correspond à&nbsp;: <b>${txt}</b>&nbsp;?`,fmt(v),[fmt(naive),fmt(sorted),fmt(v+1000),fmt(v+100),fmt(v+10),fmt(v*10)],
      `Place chaque chiffre dans sa colonne (milliers, centaines, dizaines, unités) et mets un <b>0</b> dans la colonne vide : <b>${fmt(v)}</b>.`)}
  if(t==="frac"){const d=ri(3,8),n=ri(1,d-1);const ok=barSVG(d,n,false);
    const opts=[ok,barSVG(d,n,true),barSVG(n+d,n,false),barSVG(d,d-n===n?n-1||1:d-n,false)];
    const q=mc(`Quelle figure représente <b>${n}/${d}</b>&nbsp;?`,ok,opts.slice(1),`${n}/${d} : l’unité est partagée en <b>${d} parts égales</b> et on en colorie <b>${n}</b>. Attention, des parts de tailles différentes ne conviennent pas.`);return q}
  if(t==="unit"){const kind=pick(["sup","inf","eg"]);
    const lt=()=>{const x=ri(2,9);return `${ri(1,x-1)}/${x}`},gt=()=>{const x=ri(2,9);return `${x+ri(1,5)}/${x}`},eqf=()=>{const x=ri(2,9);return `${x}/${x}`};
    const good={sup:gt,inf:lt,eg:eqf}[kind],bad={sup:[lt,eqf],inf:[gt,eqf],eg:[gt,lt]}[kind];
    const ok=good();const ws=[];let guard=0;while(ws.length<3&&guard++<200){const x=pick(bad)();if(x!==ok&&!ws.includes(x))ws.push(x)}
    const w={sup:"supérieure à 1",inf:"inférieure à 1",eg:"égale à 1"}[kind];
    return mc(`Quelle fraction est <b>${w}</b>&nbsp;?`,ok,ws,`Compare le numérateur (en haut) au dénominateur (en bas). Plus grand → supérieure à 1 ; égal → égale à 1 ; plus petit → inférieure à 1. Réponse : <b>${ok}</b>.`)}
  if(t==="comp"){const w=ri(0,25);const a=ri(1,9);let b;do{b=ri(10,99)}while(b%10===0||b/100===a/10);
    const A=w+a/10,B=w+b/100;const big=R3(A>B?A:B),small=R3(A>B?B:A);const cand=[R3(w+ri(1,9)/100),R3(w+ri(100,999)/1000),R3(w+ri(1,9)/100+ri(1,9)/1000),R3(w+ri(0,9)/100)];
    const extra=cand.filter(x=>x<big&&x!==small&&x!==big).map(fmtAuto);const pad=[R3(w+.05),R3(w+.005),R3(w+.07),R3(w+.01)].filter(x=>x<big).map(fmtAuto);
    return mc(`Quel est le <b>plus grand</b> nombre&nbsp;?`,fmtAuto(big),[fmtAuto(small),...extra,...pad],
      `Les parties entières sont égales (${w}). On compare les dixièmes, puis les centièmes : ${fmtD(A,2)} et ${fmtD(B,2)}. Le plus grand est <b>${fmtAuto(big)}</b>. Ce n’est pas celui qui a le plus de chiffres !`)}
  const k=pick(["c","fd"]);if(k==="c"){const u=ri(1,9),c=ri(1,9);const v=`${u},0${c}`;
    return mc(`Quel nombre s’écrit&nbsp;: <b>${U[u]} unité${u>1?"s":""} et ${U[c]} centième${c>1?"s":""}</b>&nbsp;?`,v,[`${u},${c}`,`${u},00${c}`,`${u}${c}`],`Les centièmes sont au 2<sup>e</sup> rang après la virgule. Il n’y a pas de dixièmes, donc on écrit 0 : <b>${v}</b>.`)}
  const n=ri(11,99);return mc(`Quel nombre est égal à <b>${n}/100</b>&nbsp;?`,`0,${n}`,[`${Math.floor(n/10)},${n%10}`,`0,0${n}`,`${n},100`],`${n}/100 = ${n} centièmes = <b>0,${n}</b>.`)}

function posed(a,b,op){const w=Math.max(String(a).length,String(b).length)+2;return `<pre class="op">${String(a).padStart(w)}\n${op}${String(b).padStart(w-1)}\n${"-".repeat(w)}</pre>`}
function genOper(){const t=pick(["add","sub","sub","mul","mul","div"]);
  if(t==="add"){const a=ri(1000,9999),b=ri(100,9999),c=ri(10,999);const r=a+b+c;return inp(`Pose et calcule&nbsp;: <b>${fmt(a)} + ${fmt(b)} + ${fmt(c)}</b>`,r,`Aligne les unités sous les unités, puis additionne colonne par colonne de droite à gauche en reportant les retenues. Résultat : <b>${fmt(r)}</b>.`,{num:true})}
  if(t==="sub"){const b=ri(1000,7999);const a=b+ri(500,5999);const ax=Math.floor(a/100)*100+ri(0,3);const r=ax-b;return inp(`Pose et calcule&nbsp;: <b>${fmt(ax)} − ${fmt(b)}</b>`,r,`${posed(ax,b,"−")}Quand le chiffre du haut est plus petit, on ajoute 10 en haut et 1 en bas à la colonne suivante (retenue). Résultat : <b>${fmt(r)}</b>.`,{num:true})}
  if(t==="mul"){const two=Math.random()<.55;const a=ri(120,899),b=two?ri(12,49):ri(3,9);const r=a*b;
    return inp(`Pose et calcule&nbsp;: <b>${fmt(a)} × ${b}</b>`,r,two?`${posed(a,b,"×")}Multiplie ${a} par ${b%10} (unités), puis par ${Math.floor(b/10)} dizaine${b>=20?"s":""} : n’oublie pas le <b>0</b> en décalage sur la 2<sup>e</sup> ligne. Puis additionne : <b>${fmt(r)}</b>.`:`${posed(a,b,"×")}Multiplie chaque chiffre de droite à gauche en ajoutant les retenues. Résultat : <b>${fmt(r)}</b>.`,{num:true})}
  const d=ri(2,9),q=ri(12,99);const a=d*q;return inp(`Pose et calcule&nbsp;: <b>${a} ÷ ${d}</b>`,q,`Dans ${String(a).slice(0,String(a).length-1)}, combien de fois ${d} ? On écrit le chiffre au quotient, on soustrait, on abaisse le chiffre suivant… Vérification : ${q} × ${d} = ${a}. Quotient : <b>${q}</b>.`,{num:true})}

function genFaits(){const a=ri(2,10),b=ri(2,10);const r=a*b;
  if(Math.random()<.3)return inp(`Complète&nbsp;: <span class="big">${r} = ${a} × …</span>`,b,`${a} × ${b} = ${r}. Connaître la table dans les deux sens aide pour les divisions.`,{num:true,timed:true});
  return inp(`<span class="big">${a} × ${b} = …</span>`,r,`${a} × ${b} = <b>${r}</b>. ${a>5&&b>5?"Astuce : "+a+" × "+b+" = "+a+" × "+(b-1)+" + "+a+".":""}`,{num:true,timed:true})}
function genProc(){const t=pick(["+9","+19","-9","x10","x100","/10","/2","comp100","+99"]);let a,r,e;
  switch(t){case"+9":a=ri(14,389);r=a+9;e=`+9, c’est +10 puis −1 : ${a}+10 = ${a+10}, puis −1 → <b>${r}</b>`;break;
    case"+19":a=ri(23,480);r=a+19;e=`+19, c’est +20 puis −1 → <b>${r}</b>`;break;
    case"-9":a=ri(25,500);r=a-9;e=`−9, c’est −10 puis +1 → <b>${r}</b>`;break;
    case"+99":a=ri(120,800);r=a+99;e=`+99, c’est +100 puis −1 → <b>${r}</b>`;break;
    case"x10":a=ri(12,999);r=a*10;e=`× 10 : chaque chiffre prend une valeur 10 fois plus grande (on « ajoute » un 0 pour un entier) → <b>${fmt(r)}</b>`;break;
    case"x100":a=ri(3,99);r=a*100;e=`× 100 : les unités deviennent des centaines → <b>${fmt(r)}</b>`;break;
    case"/10":a=ri(2,99)*10;r=a/10;e=`÷ 10 : chaque chiffre prend une valeur 10 fois plus petite → <b>${r}</b>`;break;
    case"/2":a=ri(6,99)*2;r=a/2;e=`÷ 2, c’est chercher la moitié : <b>${r}</b> + ${r} = ${a}`;break;
    default:a=ri(11,89);r=100-a;e=`Complément à 100 : ${a} + <b>${r}</b> = 100 (compte jusqu’à la dizaine, puis jusqu’à 100)`}
  const lbl={"+9":"+ 9","+19":"+ 19","-9":"− 9","+99":"+ 99","x10":"× 10","x100":"× 100","/10":"÷ 10","/2":"÷ 2"}[t];
  return inp(t==="comp100"?`<span class="big">${a} + … = 100</span>`:`<span class="big">${fmt(a)} ${lbl} = …</span>`,r,e,{num:true,timed:true})}

/* ----- PROBLÈMES (6 propositions, comme dans l'évaluation) ----- */
function fill5(ans,wr){const out=[];wr.forEach(x=>{x=Math.round(x*100)/100;if(x>0&&x!==ans&&!out.includes(x))out.push(x)});let k=1;
  while(out.length<5){const c=Math.round((ans+pick([-1,1])*k*pick([1,2,5,10]))*100)/100;if(c>0&&c!==ans&&!out.includes(c))out.push(c);k++}return out.slice(0,5)}
function pmc(q,ans,wr,e,u="",dec=false){const f=x=>(dec?fmtD(x,2):fmt(x))+u;return mc(q,f(ans),fill5(ans,wr).map(f),e,{n:5})}
function barsSVG(labels,vals){const max=Math.max(...vals)+10,H=200,W=320,x0=36,y0=216,sy=v=>y0-H*v/max;let s=`<svg viewBox="0 0 ${W} 242" width="${W}" role="img" aria-label="diagramme en barres"><rect width="100%" height="100%" rx="8" fill="var(--page)"/>`;
  for(let v=0;v<=max;v+=10)s+=`<line x1="${x0}" x2="${W-6}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--seyes-strong)"/><text x="${x0-6}" y="${sy(v)+4}" text-anchor="end" font-size="12" fill="var(--muted)" font-family="Atkinson Hyperlegible,Verdana,sans-serif">${v}</text>`;
  const bw=(W-x0-14)/vals.length;vals.forEach((v,i)=>{const x=x0+8+i*bw;s+=`<rect x="${x+8}" y="${sy(v)}" width="${bw-16}" height="${y0-sy(v)}" fill="var(--accent)" rx="2"/><text x="${x+bw/2}" y="${y0+18}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)" font-family="Atkinson Hyperlegible,Verdana,sans-serif">${labels[i]}</text>`});return s+"</svg>"}
function tbl(head,rows){return `<div class="svgwrap"><table class="tbl"><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`}
function genProb2(){const t=ri(1,14);
  switch(t){
  case 1:{const a=ri(180,450),b=ri(35,140);return pmc(`Un vélo coûte ${a}&nbsp;€. Une trottinette coûte ${b}&nbsp;€ de moins que le vélo. Combien coûte la trottinette&nbsp;?`,a-b,[a+b,b,a-b-10,a-b+10],`« de moins » : on soustrait. ${a} − ${b} = <b>${a-b}&nbsp;€</b>.`," €")}
  case 2:{const k=ri(3,8),p=ri(12,40),n=k*p;return pmc(`On partage équitablement ${n} billes entre ${k} enfants. Combien de billes reçoit chaque enfant&nbsp;?`,p,[n-k,n*k,p+k,n+k],`Partager en parts égales, c’est diviser : ${n} ÷ ${k} = <b>${p}</b>.`)}
  case 3:{const a=pick([6,10,12]),b=ri(7,25);return pmc(`Une boîte contient ${a} œufs. Combien d’œufs y a-t-il dans ${b} boîtes&nbsp;?`,a*b,[a+b,a*b+a,b*(a-1),b],`${b} fois ${a} œufs : ${b} × ${a} = <b>${a*b}</b>.`)}
  case 4:{const p=ri(6,15),n=3,A=ri(60,100);return pmc(`Léo a ${A}&nbsp;€. Il achète ${n} livres à ${p}&nbsp;€ chacun. Combien d’argent lui reste-t-il&nbsp;?`,A-n*p,[A-p,A+n*p,n*p,A-n-p],`Deux étapes : ${n} × ${p} = ${n*p}&nbsp;€ dépensés, puis ${A} − ${n*p} = <b>${A-n*p}&nbsp;€</b>.`," €")}
  case 5:{const h=ri(13,19),m=pick([25,35,40,45,50]),dm=pick([30,35,40,45]);const tot=h*60+m+60+dm,H=Math.floor(tot/60),M=tot%60;const f=(a,b)=>`${a} h ${String(b).padStart(2,"0")}`;
    return mc(`Un film commence à ${f(h,m)} et dure 1 h ${dm} min. À quelle heure se termine-t-il&nbsp;?`,f(H,M),[`${h+1} h ${m+dm}`,f(H-1,M),f(H+1,M),f(H,(M+10)%60),f(H,(M+50)%60),f(H-1,(M+40)%60),f(H+1,(M+30)%60),f(H,(M+20)%60)],`Dans une heure il y a <b>60 minutes</b>, pas 100. ${m+dm>=60?`${m} + ${dm} = ${m+dm} min = 1 h ${String(m+dm-60).padStart(2,"0")}, donc une heure de plus.`:`${m} + ${dm} = ${m+dm} min, ce qui fait moins d’une heure de plus.`} Fin : <b>${f(H,M)}</b>.`,{n:5})}
  case 6:{const d=pick([3,4,5]),n=d-1,k=ri(4,9),N=d*k;return pmc(`Il y a ${N} élèves dans l’école. Les ${n}/${d} mangent à la cantine. Combien d’élèves mangent à la cantine&nbsp;?`,n*k,[k,N-n,N-k,N+n],`1/${d} de ${N}, c’est ${N} ÷ ${d} = ${k}. Donc ${n}/${d}, c’est ${n} × ${k} = <b>${n*k}</b>.`)}
  case 7:{const n=pick([2,3,4]),p=pick([1.5,2.5,1.2,1.8]),m=n*pick([2,3]);return pmc(`${n} cahiers coûtent ${fmtD(n*p,2)}&nbsp;€. Combien coûtent ${m} cahiers&nbsp;?`,m*p,[n*p+m,n*p*m,n*p+(m-n),m*p+1,p*m/2],`Proportionnalité : ${m} cahiers, c’est ${m/n} fois plus que ${n} cahiers. ${fmtD(n*p,2)} × ${m/n} = <b>${fmtD(m*p,2)}&nbsp;€</b>.`," €",true)}
  case 8:{const g=ri(15,45),f=ri(60,120);return pmc(`Zoé a gagné ${g} cartes à la récréation. Maintenant, elle en a ${f}. Combien de cartes avait-elle avant&nbsp;?`,f-g,[f+g,g,f],`« Gagné » ne veut pas dire qu’il faut additionner ! On cherche le départ : ${f} − ${g} = <b>${f-g}</b>.`)}
  case 9:{const L=ri(8,25),l=ri(3,9);return pmc(`Un jardin rectangulaire mesure ${L}&nbsp;m de long et ${l}&nbsp;m de large. On veut l’entourer d’une clôture. Quelle longueur de clôture faut-il&nbsp;?`,2*(L+l),[L*l,L+l,2*L+l,4*L],`Faire le tour = le <b>périmètre</b> (pas l’aire). (${L} + ${l}) × 2 = <b>${2*(L+l)}&nbsp;m</b>.`," m")}
  case 10:{const b=pick([6,8,10,12]);let N;do{N=ri(30,99)}while(N%b===0);const q=Math.floor(N/b),r=N%b;return pmc(`Il faut ranger ${N} œufs dans des boîtes de ${b}. Combien de boîtes faut-il <b>au minimum</b> pour ranger tous les œufs&nbsp;?`,q+1,[q,r,N-b,q+r],`${N} ÷ ${b} = ${q} reste ${r}. ${q} boîtes pleines ne suffisent pas : il faut une boîte de plus pour les ${r} œufs restants, donc <b>${q+1} boîtes</b>.`)}
  case 11:{const cl=["CE2","CM1","CM2","6e"],v=cl.map(()=>ri(18,31));const i=ri(0,2),j=ri(i+1,3);const ask=Math.random()<.5;if(!ask)while(v[i]===v[j])v[j]=ri(18,31);
    const q=`Voici le nombre d’élèves inscrits à la chorale.${tbl(["Classe",...cl],[["Élèves",...v]])}`+(ask?`Combien d’élèves sont inscrits en tout&nbsp;?`:`Combien d’élèves de plus y a-t-il en ${v[i]>=v[j]?cl[i]:cl[j]} qu’en ${v[i]>=v[j]?cl[j]:cl[i]}&nbsp;?`);
    const tot=v.reduce((a,b)=>a+b,0),d=Math.abs(v[i]-v[j]);return ask?pmc(q,tot,[tot-v[3],tot+10,v[0]+v[3]],`On additionne les 4 cases : ${v.join(" + ")} = <b>${tot}</b>.`):pmc(q,d||1,[v[i]+v[j],v[i],v[j]],`On prélève les deux nombres dans le tableau puis on soustrait : ${Math.max(v[i],v[j])} − ${Math.min(v[i],v[j])} = <b>${d}</b>.`)}
  case 12:{const lab=["Pommes","Poires","Prunes","Kiwis"],v=lab.map(()=>ri(2,8)*10);const mx=v.indexOf(Math.max(...v)),mn=v.indexOf(Math.min(...v));
    if(mx===mn)return genProb2();return pmc(`Le diagramme montre les kilos de fruits vendus au marché.<div class="svgwrap">${barsSVG(lab,v)}</div>Combien de kilos de ${lab[mx].toLowerCase()} de plus que de ${lab[mn].toLowerCase()} a-t-on vendus&nbsp;?`,v[mx]-v[mn],[v[mx],v[mn],v[mx]+v[mn],v[mx]-v[mn]+10],`On lit les hauteurs : ${lab[mx]} ${v[mx]} kg, ${lab[mn]} ${v[mn]} kg. ${v[mx]} − ${v[mn]} = <b>${v[mx]-v[mn]} kg</b>.`," kg")}
  case 13:{const a=ri(11,25),k=ri(2,4);const tog=Math.random()<.5;return tog?pmc(`Paul a ${a} billes. Sarah en a ${k} fois plus que Paul. Combien de billes ont-ils <b>ensemble</b>&nbsp;?`,a+a*k,[a*k,a+k,a*k+k,a*(k-1)],`Sarah : ${a} × ${k} = ${a*k}. Ensemble : ${a} + ${a*k} = <b>${a+a*k}</b>.`)
      :pmc(`Paul a ${a} billes. Sarah en a ${k} fois plus que Paul. Combien de billes a Sarah&nbsp;?`,a*k,[a+k,a*k+a,a-k,a+a],`« ${k} fois plus » : on multiplie. ${a} × ${k} = <b>${a*k}</b>.`)}
  default:{const p1=ri(450,990)/100,p2=ri(120,480)/100,b=20;const r=Math.round((b-p1-p2)*100)/100;return pmc(`Emma achète un livre à ${fmtD(p1,2)}&nbsp;€ et un stylo à ${fmtD(p2,2)}&nbsp;€. Elle paie avec un billet de ${b}&nbsp;€. Combien lui rend-on&nbsp;?`,r,[p1+p2,b-p1,b-p2,r+1],`Total : ${fmtD(p1,2)} + ${fmtD(p2,2)} = ${fmtD(p1+p2,2)}&nbsp;€. Monnaie : ${b} − ${fmtD(p1+p2,2)} = <b>${fmtD(r,2)}&nbsp;€</b>. Aligne bien les virgules.`," €",true)}}}

/* ----- PROGRAMME CM2 hors évaluation ----- */
const R3=x=>Math.round(x*1e6)/1e6;
const TABLES={longueurs:["km","hm","dam","m","dm","cm","mm"],masses:["kg","hg","dag","g","dg","cg","mg"],contenances:["L","dL","cL","mL"]};
function genMesures(){if(Math.random()<.3){const v=[
   ()=>{const h=ri(2,5),m=pick([10,15,20,30,45]);return inp(`<span class="big">${h} h ${m} min = … min</span>`,h*60+m,`1 h = 60 min. ${h} × 60 = ${h*60}, puis ${h*60} + ${m} = <b>${h*60+m} min</b>.`,{num:true})},
   ()=>{const m=ri(2,5),s=pick([10,15,20,30,45]);return inp(`<span class="big">${m} min ${s} s = … s</span>`,m*60+s,`1 min = 60 s. ${m} × 60 + ${s} = <b>${m*60+s} s</b>.`,{num:true})},
   ()=>{const h=ri(1,3),m=pick([10,20,30,40,50]),t=h*60+m;return mc(`<span class="big">${t} min = …</span>`,`${h} h ${m} min`,[`${Math.floor(t/100)} h ${t%100} min`,`${h+1} h ${m} min`,`${h} h ${m+10} min`],`Dans ${t} min, il y a ${h} fois 60 min (${h*60} min) et il reste ${m} min : <b>${h} h ${m} min</b>.`)},
   ()=>{const j=ri(2,4);return inp(`<span class="big">${j} jours = … h</span>`,j*24,`1 jour = 24 h. ${j} × 24 = <b>${j*24} h</b>.`,{num:true})}];return pick(v)()}
  const nm=pick(["longueurs","longueurs","masses","contenances"]),T=TABLES[nm];let i,j;do{i=ri(0,T.length-1);j=ri(0,T.length-1)}while(i===j||Math.abs(i-j)>3||(nm==="masses"&&Math.max(i,j)>4));
  const f=10**(j-i);const v=j>i?(Math.random()<.4?ri(12,95)/10:ri(2,60)):ri(20,9000);const a=R3(v*f);
  const rule=j>i?`1 ${T[i]} = ${fmt(10**(j-i))} ${T[j]} : on multiplie par ${fmt(10**(j-i))}.`:`1 ${T[j]} = ${fmt(10**(i-j))} ${T[i]} : on divise par ${fmt(10**(i-j))}.`;
  return inp(`Convertis (${nm})&nbsp;:<p class="big" style="margin-top:6px">${fmtAuto(v)} ${T[i]} = … ${T[j]}</p>`,a,`${rule} ${fmtAuto(v)} ${T[i]} = <b>${fmtAuto(a)} ${T[j]}</b>. Astuce : place le nombre dans un tableau de conversion (${T.join(" | ")}), le chiffre des unités dans la colonne ${T[i]}.`,{num:true})}
function gridSVG(w,h){const c=22,W=(w+2)*c,H=(h+2)*c;let s=`<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="rectangle de ${w} carreaux de long et ${h} de large, dessiné sur un quadrillage"><rect width="${W}" height="${H}" rx="6" fill="var(--page)"/>`;
  s+=`<rect x="${c}" y="${c}" width="${w*c}" height="${h*c}" fill="var(--accent-soft)"/>`;
  for(let x=0;x<=w+2;x++)s+=`<line x1="${x*c}" y1="0" x2="${x*c}" y2="${H}" stroke="var(--seyes-strong)" stroke-width="1"/>`;for(let y=0;y<=h+2;y++)s+=`<line x1="0" y1="${y*c}" x2="${W}" y2="${y*c}" stroke="var(--seyes-strong)" stroke-width="1"/>`;
  return s+`<rect x="${c}" y="${c}" width="${w*c}" height="${h*c}" fill="none" stroke="var(--accent)" stroke-width="3.5"/></svg>`}
function genAires(){const t=pick(["grid","grid","rect","rect","carre","unit"]);const aire=Math.random()<.5;
  if(t==="grid"){const w=ri(3,9),h=ri(2,6);return inp(`Quel est ${aire?"l’<b>aire</b>":"le <b>périmètre</b>"} de ce rectangle, ${aire?"en carreaux":"en côtés de carreau"}&nbsp;?<div class="svgwrap">${gridSVG(w,h)}</div>`,aire?w*h:2*(w+h),
    aire?`L’aire, c’est la surface : on compte les carreaux. ${h} rangées de ${w} carreaux : ${h} × ${w} = <b>${w*h}</b>.`:`Le périmètre, c’est le tour : ${w} + ${h} + ${w} + ${h} = <b>${2*(w+h)}</b>.`,{num:true})}
  if(t==="rect"){const L=ri(6,25),l=ri(2,L-1);return inp(`Un rectangle mesure ${L}&nbsp;cm de long et ${l}&nbsp;cm de large. Calcule ${aire?"son <b>aire</b> (en cm²)":"son <b>périmètre</b> (en cm)"}.`,aire?L*l:2*(L+l),
    aire?`Aire du rectangle = longueur × largeur = ${L} × ${l} = <b>${L*l} cm²</b>.`:`Périmètre du rectangle = (longueur + largeur) × 2 = (${L} + ${l}) × 2 = <b>${2*(L+l)} cm</b>.`,{num:true})}
  if(t==="carre"){const c=ri(3,15);return inp(`Un carré a des côtés de ${c}&nbsp;cm. Calcule ${aire?"son <b>aire</b> (en cm²)":"son <b>périmètre</b> (en cm)"}.`,aire?c*c:4*c,aire?`Aire du carré = côté × côté = ${c} × ${c} = <b>${c*c} cm²</b>.`:`Périmètre du carré = côté × 4 = ${c} × 4 = <b>${4*c} cm</b>.`,{num:true})}
  const B=[["Pour mesurer l’aire du sol d’une chambre, on utilise plutôt :","le m²",["le m","le km","le L"]],["Pour mesurer le tour d’un stade, on utilise plutôt :","le m",["le m²","le kg","le cm²"]],["L’aire d’une feuille de cahier s’exprime plutôt en :","cm²",["km²","m","mL"]],["Deux figures ont la même aire. Ont-elles forcément le même périmètre ?","Non",["Oui","Oui, si ce sont des rectangles","On ne peut jamais savoir l’aire"]]];
  const [q,c,w]=pick(B);return mc(q,c,w,`Une longueur (tour, distance) se mesure en m, cm, km… Une aire (surface) en m², cm², km². Réponse : <b>${c}</b>.${c==="Non"?" Exemple : un rectangle 4 × 1 et un carré 2 × 2 ont la même aire (4) mais des périmètres de 10 et 8.":""}`)}
function angleSVG(d){const cx=100,cy=112,L=88,r=d*Math.PI/180;return `<svg viewBox="0 0 200 130" width="200" role="img" aria-label="un angle dessiné avec deux demi-droites"><rect width="100%" height="100%" rx="8" fill="var(--page)"/><line x1="${cx}" y1="${cy}" x2="${cx+L}" y2="${cy}" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${(cx+L*Math.cos(r)).toFixed(1)}" y2="${(cy-L*Math.sin(r)).toFixed(1)}" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="var(--margin)"/></svg>`}
function linesSVG(kind){const a=ri(0,170)*Math.PI/180,cx=110,cy=100,L=70;const seg=(ang,ox,oy)=>`<line x1="${(cx+ox-L*Math.cos(ang)).toFixed(1)}" y1="${(cy+oy-L*Math.sin(ang)).toFixed(1)}" x2="${(cx+ox+L*Math.cos(ang)).toFixed(1)}" y2="${(cy+oy+L*Math.sin(ang)).toFixed(1)}" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>`;
  let s=`<svg viewBox="0 0 220 200" width="220" role="img" aria-label="deux droites tracées"><rect width="100%" height="100%" rx="8" fill="var(--page)"/>`;if(kind==="par"){const nx=-Math.sin(a)*24,ny=Math.cos(a)*24;s+=seg(a,nx,ny)+seg(a,-nx,-ny)}else s+=seg(a,0,0)+seg(a+(kind==="perp"?Math.PI/2:ri(30,55)*Math.PI/180),0,0);return s+"</svg>"}
const B_GEO=[["Un quadrilatère qui a 4 angles droits et 4 côtés de même longueur s’appelle un :","carré",["rectangle qui n’est pas un carré","losange qui n’est pas un carré","trapèze"]],["Un quadrilatère qui a 4 côtés de même longueur mais pas d’angle droit est un :","losange",["carré","rectangle","parallélogramme quelconque"]],["Un quadrilatère qui a 4 angles droits et des côtés opposés de même longueur est un :","rectangle",["losange","trapèze","triangle"]],["Un triangle qui a ses 3 côtés de même longueur est :","équilatéral",["isocèle seulement","rectangle","quelconque"]],["Un triangle qui a un angle droit est un triangle :","rectangle",["équilatéral","obtus","qui a trois angles aigus"]],["Un triangle qui a exactement 2 côtés de même longueur est :","isocèle",["équilatéral","rectangle","quelconque"]],["Le segment qui relie le centre d’un cercle à un point du cercle s’appelle :","le rayon",["le diamètre","la corde","le sommet"]],["Combien d’axes de symétrie a un carré ?","4",["2","1","0"]],["Combien d’axes de symétrie a un rectangle (qui n’est pas un carré) ?","2",["4","1","0"]],["Un solide qui a 6 faces carrées est :","un cube",["une pyramide","un cylindre","un prisme à base triangulaire"]],["Combien d’arêtes a un pavé droit ?","12",["6","8","4"]],["Combien de sommets a un cube ?","8",["6","12","4"]],["Pour vérifier qu’un angle est droit, on utilise :","une équerre",["un compas","un rapporteur de cercle","une règle seule"]],["Les diagonales d’un rectangle :","ont la même longueur",["sont toujours perpendiculaires","sont parallèles","n’existent pas"]]];
function genGeo(){const t=pick(["bank","bank","bank","angle","lines","cercle"]);
  if(t==="angle"){const k=pick(["aigu","droit","obtus"]);const d=k==="aigu"?ri(25,70):k==="droit"?90:ri(112,155);return mc(`Cet angle est&nbsp;:<div class="svgwrap">${angleSVG(d)}</div>`,k==="aigu"?"aigu":k==="droit"?"droit":"obtus",["aigu","droit","obtus"].filter(x=>x!==k),`Un angle <b>aigu</b> est plus petit qu’un angle droit, un angle <b>obtus</b> est plus grand. Compare avec le coin d’une équerre (ou d’une feuille). Ici : <b>${k}</b>.`)}
  if(t==="lines"){const k=pick(["par","perp","sec"]);const lab={par:"parallèles",perp:"perpendiculaires",sec:"sécantes, mais pas perpendiculaires"};return mc(`Ces deux droites sont&nbsp;:<div class="svgwrap">${linesSVG(k)}</div>`,lab[k],Object.values(lab).filter(x=>x!==lab[k]),`<b>Parallèles</b> : elles ne se coupent jamais (toujours le même écart). <b>Perpendiculaires</b> : elles se coupent en formant un angle droit. Réponse : <b>${lab[k]}</b>.`,{wide:true})}
  if(t==="cercle"){const r=ri(2,12);return Math.random()<.5?inp(`Un cercle a un <b>rayon</b> de ${r}&nbsp;cm. Quelle est la longueur de son <b>diamètre</b> (en cm)&nbsp;?`,2*r,`Le diamètre traverse le cercle en passant par le centre : c’est 2 rayons. 2 × ${r} = <b>${2*r} cm</b>.`,{num:true})
    :inp(`Un cercle a un <b>diamètre</b> de ${2*r}&nbsp;cm. Quelle est la longueur de son <b>rayon</b> (en cm)&nbsp;?`,r,`Le rayon est la moitié du diamètre : ${2*r} ÷ 2 = <b>${r} cm</b>.`,{num:true})}
  const [q,c,w]=pick(B_GEO);return mc(q,c,w,`Réponse : <b>${c}</b>. Retiens les propriétés : nombre de côtés égaux, angles droits, axes de symétrie.`)}
function genDecCalc(){const t=pick(["add","add","sub","sub","x10","/10","x100","/100"]);
  if(t==="add"){const a=ri(100,9999)/100,b=ri(10,999)/10,r=R3(a+b);return inp(`Calcule&nbsp;: <span class="big">${fmtAuto(a)} + ${fmtAuto(b)}</span>`,r,`On pose l’opération en <b>alignant les virgules</b> (on peut ajouter un 0 : ${fmtD(b,2)}). Résultat : <b>${fmtAuto(r)}</b>.`,{num:true})}
  if(t==="sub"){const b=ri(100,1999)/10,a=R3(b+ri(500,6000)/100),r=R3(a-b);return inp(`Calcule&nbsp;: <span class="big">${fmtAuto(a)} − ${fmtAuto(b)}</span>`,r,`Aligne les virgules et complète avec des 0 pour avoir autant de chiffres après la virgule : ${fmtD(a,2)} − ${fmtD(b,2)} = <b>${fmtAuto(r)}</b>.`,{num:true})}
  const k={"x10":[10,"×"],"/10":[10,"÷"],"x100":[100,"×"],"/100":[100,"÷"]}[t];const a=t[0]==="x"?ri(11,999)/100:ri(11,9999)/10;const r=R3(k[1]==="×"?a*k[0]:a/k[0]);
  return inp(`Calcule&nbsp;: <span class="big">${fmtAuto(a)} ${k[1]} ${k[0]}</span>`,r,`${k[1]} ${k[0]} : chaque chiffre prend une valeur ${k[0]} fois plus ${k[1]==="×"?"grande":"petite"} (il se décale de ${k[0]===10?"1 rang":"2 rangs"} vers la ${k[1]==="×"?"gauche":"droite"}). Résultat : <b>${fmtAuto(r)}</b>. Ce n’est pas « ajouter un zéro » !`,{num:true})}
function genProp(){const t=pick(["tab","tab","recette","pct","pct","frac"]);
  if(t==="tab"){const k=ri(2,9);const xs=shuffle([1,2,3,4,5,6,8,10]).slice(0,4).sort((a,b)=>a-b);const m=ri(1,3);const it=pick(["Nombre de paquets|Nombre de gâteaux","Nombre de tickets|Prix (€)","Nombre de tours de piste|Distance (hm)"]).split("|");
    return inp(`Ce tableau est un tableau de proportionnalité. Quel nombre manque&nbsp;?${tbl([it[0],...xs],[[it[1],...xs.map((x,i)=>i===m?"?":x*k)]])}`,xs[m]*k,`On passe de la 1<sup>re</sup> ligne à la 2<sup>e</sup> en multipliant toujours par <b>${k}</b>. ${xs[m]} × ${k} = <b>${xs[m]*k}</b>.`,{num:true})}
  if(t==="recette"){const p=pick([2,4]),n=p*pick([1.5,2,3]),g=pick([100,150,200,250,300]);return inp(`Pour ${p} personnes, il faut ${g}&nbsp;g de farine. Combien de grammes faut-il pour ${n} personnes&nbsp;?`,g*n/p,`Passe par 1 personne ou par un multiple : pour ${p} personnes ${g} g, donc pour ${n} personnes ${g} × ${fmtAuto(n/p)} = <b>${fmt(g*n/p)} g</b>.`,{num:true})}
  if(t==="pct"){const [pc,div,txt]=pick([[50,2,"la moitié"],[25,4,"le quart"],[10,10,"le dixième"],[75,4,"les trois quarts"]]);const N=div*ri(3,30)*(pc===10?1:1);const r=N*pc/100;
    return inp(`Calcule <span class="big">${pc}&nbsp;% de ${N}</span>`,r,`${pc} % de ${N}, c’est ${txt} de ${N}${pc===75?` : ${N} ÷ 4 = ${N/4}, puis × 3`:""}. Résultat : <b>${fmtAuto(r)}</b>.`,{num:true})}
  const d=pick([3,4,5,6,8]),n=ri(1,d-1),q=ri(3,15),N=d*q;return inp(`Calcule <span class="big">${n}/${d} de ${N}</span>`,n*q,`On partage ${N} en ${d} parts égales : ${N} ÷ ${d} = ${q}. On en prend ${n} : ${n} × ${q} = <b>${n*q}</b>.`,{num:true})}
const CRIT={2:"un nombre est divisible par 2 si son chiffre des unités est pair (0, 2, 4, 6, 8)",5:"un nombre est divisible par 5 si son chiffre des unités est 0 ou 5",10:"un nombre est divisible par 10 si son chiffre des unités est 0",3:"un nombre est divisible par 3 si la somme de ses chiffres est dans la table de 3",9:"un nombre est divisible par 9 si la somme de ses chiffres est dans la table de 9"};
function genMult(){const t=pick(["crit","crit","crit","mult","div"]);
  if(t==="crit"){const d=pick([2,3,5,9,10,3,9]);const ok=d*ri(Math.ceil(100/d),Math.floor(999/d));const w=[];while(w.length<3){const x=ri(100,999);if(x%d&&!w.includes(x))w.push(x)}
    const sum=String(ok).split("").reduce((a,b)=>a+ +b,0);return mc(`Lequel de ces nombres est <b>divisible par ${d}</b>&nbsp;?`,fmt(ok),w.map(fmt),`Règle : ${CRIT[d]}.${d===3||d===9?` Pour ${ok} : ${String(ok).split("").join(" + ")} = ${sum}.`:""} Réponse : <b>${fmt(ok)}</b>.`)}
  if(t==="mult"){const d=ri(6,9),ok=d*ri(6,12);const w=[];while(w.length<3){const x=ok+ri(-9,9);if(x>0&&x%d&&!w.includes(x))w.push(x)}return mc(`Lequel de ces nombres est un <b>multiple de ${d}</b>&nbsp;?`,String(ok),w.map(String),`${ok} = ${d} × ${ok/d} : c’est un résultat de la table de ${d}. Réponse : <b>${ok}</b>.`)}
  const N=pick([24,36,48,60,72,45,90,84]);const divs=[];for(let i=2;i<N;i++)if(N%i===0)divs.push(i);const ok=pick(divs);const w=[];while(w.length<3){const x=ri(2,Math.min(N-1,30));if(N%x&&!w.includes(x))w.push(x)}
  return mc(`Lequel de ces nombres est un <b>diviseur de ${N}</b>&nbsp;?`,String(ok),w.map(String),`${N} ÷ ${ok} = ${N/ok}, sans reste : ${ok} est un diviseur de ${N}. Réponse : <b>${ok}</b>.`)}

/* ----- FRANÇAIS ----- */
const CLASSES=["nom","verbe","adjectif","déterminant","pronom"];
const B_CLASSES=[["Le <u>petit</u> chat dort sur le canapé.","adjectif"],["<u>Ces</u> montagnes sont couvertes de neige.","déterminant"],["Ma sœur range ses jouets puis <u>les</u> compte.","pronom"],["Les élèves <u>dessinent</u> un paysage.","verbe"],["Ce gâteau semble <u>délicieux</u>.","adjectif"],["Nous avons aperçu un <u>renard</u> près du bois.","nom"],["<u>Leur</u> maison est au bout du chemin.","déterminant"],["Le <u>dîner</u> est prêt.","nom"],["<u>Elle</u> marche très vite.","pronom"],["La porte <u>verte</u> grince.","adjectif"],["Je <u>porte</u> un sac très lourd.","verbe"],["Ferme la <u>porte</u>, s’il te plaît.","nom"],["Les enfants <u>nous</u> attendent.","pronom"],["Il a reçu <u>une</u> lettre.","déterminant"]];
function genClasses(){const [s,c]=pick(B_CLASSES);return mc(`Quelle est la nature du mot souligné&nbsp;?<p class="big" style="font-size:1.25rem;margin-top:8px">${s}</p>`,c,shuffle(CLASSES.filter(x=>x!==c)).slice(0,3),
  `Le mot souligné est un <b>${c}</b>. ${{nom:"On peut mettre un déterminant devant (le, un…).",verbe:"Il change avec le temps : hier, il…, demain, il…",adjectif:"Il précise le nom et s’accorde avec lui.",déterminant:"Il est placé devant le nom et l’annonce.",pronom:"Il remplace un nom ou un groupe nominal."}[c]}`)}
const B_VERBE=[["Demain, les enfants partiront en classe verte.","partiront",["enfants","classe","Demain"]],["Le chien ne mange pas sa pâtée.","mange",["chien","pas","pâtée"]],["Pour réussir, Tom révise ses leçons.","révise",["réussir","leçons","Pour"]],["Hier, nous marchions dans la forêt.","marchions",["Hier","forêt","dans"]],["La marche de nuit fatigue les randonneurs.","fatigue",["marche","nuit","randonneurs"]],["Où rangez-vous vos bottes ?","rangez",["Où","bottes","vos"]],["Le vent souffle fort sur la plage.","souffle",["vent","fort","plage"]],["Chaque été, ma tante cultive des tomates.","cultive",["été","tante","tomates"]]];
function genVerbe(){const [s,v,w]=pick(B_VERBE);return mc(`Quel est le <b>verbe conjugué</b>&nbsp;?<p class="big" style="font-size:1.25rem;margin-top:8px">${s}</p>`,v,w,`Le verbe conjugué est <b>${v}</b> : il change si on change le temps de la phrase. Un verbe à l’infinitif (comme « réussir ») n’est pas conjugué.`)}
const B_SUJET=[["Dans le jardin poussent des tomates.","des tomates",["le jardin","poussent","Dans le jardin"]],["Les élèves de la classe de CM2 préparent un spectacle.","Les élèves de la classe de CM2",["la classe de CM2","CM2","un spectacle"]],["Chaque matin, mon père boit un café.","mon père",["Chaque matin","un café","boit"]],["Que mangent les girafes ?","les girafes",["Que","mangent","girafes mangent"]],["Le facteur et sa voisine discutent devant la grille.","Le facteur et sa voisine",["sa voisine","Le facteur","la grille"]],["Sous le pont coule une rivière.","une rivière",["le pont","Sous le pont","coule"]],["Elles chantent au bord de l’eau.","Elles",["chantent","l’eau","au bord"]]];
function genSujet(){const [s,c,w]=pick(B_SUJET);return mc(`Quel est le <b>sujet</b> du verbe&nbsp;?<p class="big" style="font-size:1.25rem;margin-top:8px">${s}</p>`,c,w,`Pose la question « Qui est-ce qui… ? » devant le verbe. Le sujet est <b>${c}</b>. Il n’est pas toujours au début de la phrase !`)}
const B_COD=[["Léa mange une pomme rouge.","une pomme rouge",["Léa","mange","rouge"]],["Le maître corrige les cahiers des élèves.","les cahiers des élèves",["Le maître","corrige","des élèves"]],["Chaque soir, Tom lit un roman.","un roman",["Chaque soir","Tom","lit"]],["Mon frère parle à sa voisine.","à sa voisine",["Mon frère","parle","sa"]],["Le chat attrape la souris dans le grenier.","la souris",["dans le grenier","Le chat","attrape"]],["Nous pensons à nos vacances.","à nos vacances",["Nous","pensons","nos"]]];
function genCOD(){const [s,c,w]=pick(B_COD);return mc(`Quel est le <b>complément d’objet</b>&nbsp;?<p class="big" style="font-size:1.25rem;margin-top:8px">${s}</p>`,c,w,`Le complément d’objet complète le verbe : on le trouve avec « quoi ? », « qui ? », « à quoi ? ». Ici : <b>${c}</b>. Il ne peut pas être déplacé ni supprimé facilement.`)}
const B_ADJ=[["des robes (bleu)","bleues",["bleus","bleue","bleu"]],["une (vieux) maison","vieille",["vieux","vieil","vielle"]],["des chemins (étroit)","étroits",["étroites","étroit","étroite"]],["les (beau) histoires","belles",["beaux","belle","beau"]],["des journaux (local)","locaux",["locals","locales","local"]],["une réponse (exact)","exacte",["exact","exactes","exacts"]],["des chiennes (joueur)","joueuses",["joueurs","joueuse","joueures"]],["des rues (désert)","désertes",["déserts","déserte","désert"]]];
const B_NOM=[["des (cheval)","chevaux",["chevals","chevauxs","chevales"]],["des (bijou)","bijoux",["bijous","bijou","bijouxs"]],["les (journal)","journaux",["journals","journeaux","journal"]],["des (cadeau)","cadeaux",["cadeaus","cadeau","cadeauxs"]],["trois (nez)","nez",["nezs","neze","nezes"]],["des (festival)","festivals",["festivaux","festivales","festival"]],["des (souris)","souris",["souriss","sourix","sourises"]],["des (genou)","genoux",["genous","genou","genouxs"]],["des (pneu)","pneus",["pneux","pneu","pneues"]]];
function genAccordGN(){const adj=Math.random()<.5;const [g,c,w]=pick(adj?B_ADJ:B_NOM);
  return mc(`Choisis ${adj?"l’<b>adjectif</b>":"le <b>nom</b>"} bien accordé&nbsp;:<p class="big" style="font-size:1.25rem;margin-top:8px">${esc(g)}</p>`,c,w,
   adj?`Dans le groupe nominal, l’adjectif prend le genre et le nombre du nom. Regarde le déterminant et le nom : <b>${c}</b>.`:`Au pluriel, la plupart des noms prennent un -s ; certains font -x (bijou, genou, cheval → chevaux) ; les noms en -s, -x, -z ne changent pas. Réponse : <b>${c}</b>.`)}
const B_TRANS=[["Le chat dormait.","Les chats …","dormaient",["dormait","dormaits","dormais"]],["L’oiseau chante.","Les oiseaux …","chantent",["chantes","chante","chantents"]],["Elle finit son travail.","Elles …","finissent",["finit","finent","finissents"]],["Il prendra le bus.","Ils …","prendront",["prendrons","prendra","prendrent"]],["Le garçon a couru.","Les garçons …","ont couru",["a couru","sont couru","ont courus"]],["La voiture roulait vite.","Les voitures …","roulaient",["roulait","roulais","roulaits"]]];
const B_CONJ=[["Nous","chanter","futur","chanterons"],["Tu","jouer","imparfait","jouais"],["Elles","aller","présent","vont"],["Vous","finir","présent","finissez"],["Ils","partir","passé composé","sont partis"],["J’","être","imparfait","étais"],["Elle","venir","futur","viendra"],["Nous","avoir","présent","avons"],["Elles","arriver","passé composé","sont arrivées"],["Tu","faire","futur","feras"],["Vous","dire","présent","dites"],["Ils","marcher","imparfait","marchaient"]];
function genAccordV(){if(Math.random()<.45){const [s,d,c,w]=pick(B_TRANS);return mc(`Mets la phrase au pluriel&nbsp;: <b>${s}</b><br>${d}`,c,w,`Avec un sujet à la 3<sup>e</sup> personne du pluriel (ils, elles, les…), le verbe se termine par <b>-nt</b> (jamais -s). Réponse : <b>${c}</b>.`)}
  const [p,v,t,c]=pick(B_CONJ);const sp=p.endsWith("’")?"":" ";return inp(`Conjugue le verbe <b>${v}</b> au <b>${t}</b>&nbsp;:<p class="big" style="font-size:1.25rem;margin-top:8px">${p} …</p>`,c,`${p}${sp}<b>${c}</b>.${t==="passé composé"&&/sont/.test(c)?" Avec l’auxiliaire être, le participe passé s’accorde avec le sujet.":""}`,{text:true,accept:[c,p+c,p+" "+c]})}
const B_SYN=[["vif","rapide","Ce lézard est très vif, on n’arrive pas à l’attraper.",["Elle porte un pull rouge vif.","Il fait un froid vif ce matin.","Le feu est encore vif dans la cheminée."]],["pièce","salle","Cette maison compte cinq pièces.",["J’ai trouvé une pièce de deux euros.","Nous allons voir une pièce de théâtre.","Il manque une pièce à mon puzzle."]],["frapper","impressionner","Sa gentillesse m’a beaucoup frappé.",["Frappe avant d’entrer.","Le joueur frappe le ballon.","La grêle frappe les vitres."]],["glace","miroir","Elle se coiffe devant la glace.",["Je mange une glace à la fraise.","Le lac est couvert de glace.","Mets un glaçon, la glace rafraîchit."]],["léger","peu grave","Il n’a qu’une blessure légère au genou.",["Ce sac est léger.","Le tissu est léger comme une plume.","Elle danse d’un pas léger."]],["relever","remarquer","Le maître a relevé trois erreurs dans ma dictée.",["Relève la tête !","Il aide son ami à se relever.","Elle relève ses manches."]],["vieux","âgé","Ce vieux monsieur marche avec une canne.",["Ce pain est vieux et dur.","Ce vieux pull est plein de trous.","Nous visitons le vieux quartier de la ville."]]];
const B_FAM=[[["lait","laitier","allaiter"],"laid"],[["mer","marin","maritime"],"mère"],[["fleur","fleuriste","fleurir"],"fleuve"],[["chant","chanter","chanson"],"chandelle"],[["jour","journal","journée"],"jouer"],[["poisson","poissonnier","poissonnerie"],"poison"],[["bois","boisé","déboiser"],"boire"],[["long","longueur","allonger"],"loger"],[["terre","terrain","enterrer"],"terrible"]];
function genVoc(){if(Math.random()<.5){const [m,sens,c,w]=pick(B_SYN);return mc(`Dans quelle phrase le mot <b>« ${m} »</b> veut-il dire <b>« ${sens} »</b>&nbsp;?`,c,w,`Un mot peut avoir plusieurs sens : c’est la phrase qui choisit. Remplace le mot par « ${sens} » : seule la phrase « ${c} » garde son sens.`,{wide:true})}
  const [f,i]=pick(B_FAM);return mc(`Trouve l’<b>intrus</b> : le mot qui n’est pas de la même famille.`,i,f,`Les mots d’une même famille partagent le même radical et un sens commun. <b>${i}</b> ressemble à l’oreille mais n’a pas le même sens.`)}
const DICTEE=["un éléphant","une montagne","toujours","un chanteur","une addition","longtemps","un camion","bientôt","une feuille","un spectateur","pendant","une photographie","un enfant","quelquefois","une émotion","un aspirateur","gentiment","une bouteille","un rhinocéros","malgré","un instrument","une profondeur"];
function genDictee(){const w=pick(DICTEE);const core=w.replace(/^(un|une) /,"");
  return {prompt:`Écoute le mot et écris-le.${canSpeak?"":"<br><span class=\"small\">La lecture vocale n’est pas disponible ici : demande à un adulte de lire le mot (bouton « Voir le mot »).</span>"}`,input:true,text:true,answer:core,accept:[core,w],say:w,dictee:true,
    expl:`Le mot s’écrit <b>${w}</b>. ${/s$|t$|d$/.test(core)&&core!=="pendant"?"Pense aux lettres muettes : cherche un mot de la même famille.":/tion$/.test(core)?"Le son [sion] s’écrit souvent -tion.":/^(toujours|longtemps|bientôt|quelquefois|pendant|malgré|gentiment)$/.test(core)?"Mot invariable : à apprendre par cœur.":"Décompose le mot en syllabes pour ne rien oublier."}`}}

/* textes originaux */
const TXT_RECIT={titre:"Le gardien du phare",html:`<p>Chaque soir, quand le soleil plongeait dans la mer, Malo grimpait les cent douze marches du phare. Son grand-père, trop âgé pour monter, l’attendait en bas avec une tasse de chocolat.</p><p>Ce soir-là, le vent hurlait et les vagues frappaient les rochers. Malo alluma la grande lampe, puis colla son nez contre la vitre. Au loin, une petite lumière clignotait, disparaissait, revenait. « Un bateau ! » murmura-t-il. Le garçon dévala l’escalier si vite qu’il manqua une marche. Son grand-père prit aussitôt la radio et appela le port.</p><p>Une heure plus tard, le canot de sauvetage ramenait trois pêcheurs trempés mais sains et saufs. Le plus âgé serra longuement la main de Malo sans rien dire. Le lendemain matin, sur la porte du phare, quelqu’un avait accroché un petit poisson sculpté dans du bois flotté.</p>`,
 q:[["Qui allume la lampe du phare ?","Malo",["le grand-père","un pêcheur","le gardien du port"],"C’est écrit dans le 2<sup>e</sup> paragraphe : « Malo alluma la grande lampe »."],
  ["Pourquoi le grand-père ne monte-t-il plus en haut du phare ?","Il est trop âgé.",["Il a peur du noir.","Il prépare le chocolat.","Il surveille le port."],"Le texte dit qu’il est « trop âgé pour monter »."],
  ["Dans le texte, « dévala » veut dire :","descendit très vite",["monta lentement","glissa sur","tomba dans"],"Il manque une marche tellement il va vite : il descend l’escalier en courant."],
  ["Que voit Malo au loin ?","un bateau en difficulté",["une étoile filante","les lumières du port","un orage"],"La lumière qui clignote et le sauvetage qui suit montrent qu’un bateau est en danger : il faut relier plusieurs indices."],
  ["Qui a sans doute accroché le poisson en bois ?","un des pêcheurs sauvés",["le grand-père","Malo","le vent"],"Ce n’est pas écrit : on le devine. Les pêcheurs veulent remercier Malo sans le dire, comme le plus âgé qui lui serre la main en silence."],
  ["Quel titre résume le mieux l’histoire ?","Une nuit de sauvetage",["Le chocolat de grand-père","La pêche au poisson","Les cent douze marches"],"Le titre doit résumer l’événement principal : Malo permet de sauver des pêcheurs."]]};
const TXT_DOC={titre:"Le castor, bâtisseur des rivières",html:`<div class="encadre"><b>1. Qui est-il ?</b><br>Le castor d’Europe est le plus gros rongeur du continent : un adulte peut peser plus de 25 kilos. Sa queue plate et écailleuse lui sert de gouvernail quand il nage.</div><div class="encadre"><b>2. Un animal bâtisseur</b><br>Avec ses dents orange, très dures, il abat des arbres. Il utilise les branches, la boue et les pierres pour construire des barrages. L’eau monte derrière le barrage et forme un petit lac.</div><div class="encadre"><b>3. Sa maison : la hutte</b><br>Au milieu de ce lac, le castor construit une hutte. L’entrée se trouve sous l’eau : ainsi, le renard ou le loup ne peuvent pas y pénétrer.</div><div class="encadre"><b>4. Un animal protégé</b><br>Vers 1900, il ne restait qu’une centaine de castors en France. Protégés depuis 1909, ils sont aujourd’hui plus de 15&nbsp;000.</div>`,
 q:[["(Encadré 1) À quoi sert la queue du castor quand il nage ?","à se diriger",["à manger","à abattre les arbres","à construire la hutte"],"Un gouvernail sert à diriger un bateau : la queue sert donc à se diriger."],
  ["(Encadré 2) Pourquoi l’eau monte-t-elle ?","à cause du barrage",["à cause de la pluie","parce que le castor creuse","parce que la rivière déborde"],"« L’eau monte derrière le barrage » : c’est le barrage qui la retient."],
  ["(Encadré 3) Pourquoi l’entrée de la hutte est-elle sous l’eau ?","pour se protéger des prédateurs",["pour garder la hutte fraîche","pour pêcher plus facilement","parce que le castor ne sait pas marcher"],"Le texte cite le renard et le loup : ce sont des prédateurs qui ne peuvent pas entrer."],
  ["Que veut dire « rongeur » ?","un animal qui grignote avec ses dents",["un animal qui vit dans l’eau","un animal qui construit","un animal qui chasse la nuit"],"« Ronger », c’est grignoter avec les dents, comme le castor qui abat les arbres."],
  ["Combien de castors y avait-il en France vers 1900 ?","environ 100",["plus de 15 000","25","1909"],"Encadré 4 : « une centaine », c’est environ 100. 1909 est une date, pas un nombre de castors."],
  ["Ce document sert surtout à :","faire connaître un animal et sa vie",["raconter une aventure","expliquer comment construire un barrage","donner une recette"],"C’est un documentaire : des titres, des informations vraies sur un animal."]]};
const TXT_ORAL={titre:"La boussole de Lina",text:"Lina participait pour la première fois à la course d’orientation de l’école. Chaque équipe recevait une carte et une boussole. Lina faisait équipe avec Hugo, un garçon qui parlait peu mais qui courait très vite. Au troisième poste, ils se trompèrent de chemin et se retrouvèrent devant un étang qui n’était pas sur leur parcours. Hugo voulait faire demi-tour en courant. Lina, elle, s’assit sur une souche, déplia la carte et la tourna jusqu’à ce que le nord de la carte corresponde à l’aiguille de la boussole. « Le poste quatre est derrière ce bosquet », dit-elle calmement. Ils franchirent la ligne d’arrivée en deuxième position. Hugo, essoufflé, lui sourit : « La prochaine fois, c’est toi qui choisis le chemin. »",
 q:[["De quelle course s’agit-il ?","une course d’orientation",["un marathon","une course de natation","une course de vélo"],"Le mot est dit dès la première phrase."],
  ["Comment est Hugo ?","rapide et peu bavard",["lent et bavard","timide et lent","bavard et rapide"],"« Un garçon qui parlait peu mais qui courait très vite »."],
  ["Pourquoi arrivent-ils devant l’étang ?","Ils se sont trompés de chemin.",["C’était le poste trois.","Ils voulaient se baigner.","Hugo avait perdu la carte."],"L’étang « n’était pas sur leur parcours » : ils s’étaient perdus."],
  ["Que fait Lina pour retrouver le chemin ?","Elle oriente la carte avec la boussole.",["Elle suit les autres équipes.","Elle demande à un adulte.","Elle grimpe à un arbre."],"Elle tourne la carte pour que le nord corresponde à l’aiguille."],
  ["Que pense Hugo à la fin ?","que Lina sait bien s’orienter",["que Lina court trop lentement","qu’ils auraient dû gagner","qu’il ne veut plus courir avec elle"],"Il lui propose de choisir le chemin : il reconnaît qu’elle a eu raison. Ce n’est pas dit, il faut le comprendre."],
  ["Quelle phrase résume l’histoire ?","Grâce à son calme, Lina aide son équipe.",["Hugo gagne la course tout seul.","Les enfants se perdent et abandonnent.","Lina tombe dans l’étang."],"Le sens global : Lina reste calme et trouve la solution."]]};
function genLecture(){const T=Math.random()<.5?TXT_RECIT:TXT_DOC;const [q,c,w,e]=pick(T.q);
  return mc(`<div class="textbox" aria-label="texte"><h3>${T.titre}</h3>${T.html}</div><p style="margin-top:6px">${q}</p>`,c,w,e,{wide:true})}
function genOral(){const [q,c,w,e]=pick(TXT_ORAL.q);
  return mc(`<p class="small">Écoute l’histoire « ${TXT_ORAL.titre} » (bouton ci-dessous), sans la lire. Tu peux l’écouter deux fois.</p><details><summary>Afficher le texte (pour l’adulte qui lit)</summary><div class="textbox" style="margin-top:8px">${TXT_ORAL.text}</div></details><p style="margin-top:6px">${q}</p>`,c,w,e,{wide:true,say:TXT_ORAL.text,sayLabel:"Écouter l’histoire"})}

/* ---------- compétences (guide des scores Repères CM2 2026) ---------- */
const COMPS=[
 {id:"lecture",s:"fr",d:"Lecture",n:"Comprendre un texte lu",o:"Ex. 1 et 8 · 19 items · à besoins : 0–6 · fragile : 7–12",tips:"Questions de prélèvement, d’inférence et de sens global sur un récit et un document composite (encadrés). Pièges : mots peu familiers, reprises (il, celui-ci…), ce qui est sous-entendu.",g:genLecture},
 {id:"fluence",s:"fr",d:"Lecture",n:"Lire à voix haute un texte",o:"Ex. 30 · mots lus en 1 min · à besoins : 0–89 · fragile : 90–109 · attendu : 110",tips:"Lire le plus de mots correctement en une minute. Le but n’est pas de lire vite à tout prix mais de reconnaître les mots sans déchiffrer.",g:null},
 {id:"oral",s:"fr",d:"Oral",n:"Comprendre un texte entendu",o:"Ex. 23 · 7 items · à besoins : 0–2 · fragile : 3–4",tips:"L’enseignant lit un texte, l’élève répond sans le voir. Il faut garder les informations en mémoire et deviner ce qui n’est pas dit.",g:genOral},
 {id:"voc",s:"fr",d:"Vocabulaire",n:"Synonymes et familles de mots",o:"Ex. 28 et 29 · 8 items · à besoins : 0–3 · fragile : 4–5",tips:"Trouver le sens d’un mot qui en a plusieurs grâce à la phrase, et repérer l’intrus dans une famille de mots.",g:genVoc},
 {id:"dictee",s:"fr",d:"Vocabulaire",n:"Écrire des mots dictés",o:"Ex. 9 · 12 mots · à besoins : 0–5 · fragile : 6–8",tips:"Sons à plusieurs lettres (ou, an, ph, gn), syllabes comme -teur ou -tion, lettres muettes, mots invariables à mémoriser.",g:genDictee},
 {id:"constituants",s:"fr",d:"Grammaire",n:"Verbe, sujet, complément d’objet",o:"Ex. 25, 26, 27 · 8 items · à besoins : 0–3 · fragile : 4–5",tips:"Le sujet n’est pas toujours au début (phrase interrogative, « Sous le pont coule une rivière »). Ne pas confondre verbe conjugué et infinitif.",g:()=>pick([genVerbe,genSujet,genCOD])()},
 {id:"classes",s:"fr",d:"Grammaire",n:"Classes de mots",o:"Ex. 24 · 8 items · à besoins : 0–3 · fragile : 4–6",tips:"Nom, verbe, adjectif, déterminant, pronom. Pièges : « les » déterminant ou pronom, un même mot nom ou verbe (la porte / je porte).",g:genClasses},
 {id:"accordGN",s:"fr",d:"Orthographe",n:"Accords dans le groupe nominal",o:"Ex. 10 et 11 · 8 items · à besoins : 0–3 · fragile : 4–5",tips:"Le déterminant donne le genre et le nombre ; l’adjectif suit. Pluriels particuliers : -al → -aux, -ou → -oux pour 7 mots.",g:genAccordGN},
 {id:"accordV",s:"fr",d:"Orthographe",n:"Accord du verbe et conjugaison",o:"Ex. 12 et 13 · 8 items · à besoins : 0–3 · fragile : 4–5",tips:"Pluriel du verbe en -nt (pas -s). Terminaisons du présent, de l’imparfait, du futur et du passé composé (avec être : accord du participe).",g:genAccordV},
 {id:"ecrire",s:"ma",d:"Nombres",n:"Écrire des nombres entiers",o:"Ex. 2 · 10 items · à besoins : 0–4 · fragile : 5–6",tips:"Nombres dictés jusqu’à 999 999. Pièges : 70, 80, 90 ; les zéros (1 047, 5 700) ; écrire « comme on entend » (7000 80 18).",g:genEcrire},
 {id:"ligne",s:"ma",d:"Nombres",n:"Placer un nombre sur une ligne graduée",o:"Ex. 4, 16, 17 · 13 items · à besoins : 0–5 · fragile : 6–9",tips:"Trouver d’abord la valeur d’une graduation (100, 1 000, 0,1, 0,5…). Grands nombres, décimaux et fractions.",g:genLigne},
 {id:"repr",s:"ma",d:"Nombres",n:"Représentations des nombres",o:"Ex. 5, 14, 15, 19, 20 · 29 items · à besoins : 0–12 · fragile : 13–17",tips:"Décompositions (6 milliers + 4 dizaines…), fractions, comparaison à 1, nombres décimaux. Piège : 3,45 n’est pas plus grand que 3,7.",g:genRepr},
 {id:"oper",s:"ma",d:"Calcul",n:"Poser et effectuer des opérations",o:"Ex. 6 et 21 · 7 items · à besoins : 0–2 · fragile : 3–4",tips:"Alignement des chiffres, retenues, multiplication à deux chiffres (le 0 de décalage), division par un nombre à un chiffre.",g:genOper},
 {id:"faits",s:"ma",d:"Calcul",n:"Tables de multiplication",o:"Ex. 7 · 25 calculs en 1 min · à besoins : 0–8 · fragile : 9–12",tips:"Restituer vite les tables jusqu’à 10, dans les deux sens (56, c’est 7 fois…). Tables de 6 à 9 souvent fragiles.",g:genFaits},
 {id:"proc",s:"ma",d:"Calcul",n:"Calcul mental : procédures",o:"Ex. 22 · 30 calculs en 3 min · à besoins : 0–8 · fragile : 9–16",tips:"+9, +19, ×10, ÷10, ÷2, compléments à 100 : des « raccourcis » à automatiser.",g:genProc},
 {id:"prob",s:"ma",d:"Problèmes",n:"Résoudre des problèmes",o:"Ex. 3 et 18 · 11 items · à besoins : 0–3 · fragile : 4–7",tips:"Se représenter la situation. « Gagner » ne veut pas toujours dire additionner. Durées (60 min = 1 h), fractions d’une quantité, proportionnalité, périmètre.",g:genProb2},
 {id:"mesures",s:"ma",hors:true,d:"Grandeurs",n:"Mesures et conversions",o:"Programme de CM2 · hors évaluation Repères",tips:"Longueurs, masses, contenances avec le tableau de conversion ; durées (1 h = 60 min, 1 min = 60 s, 1 jour = 24 h).",g:genMesures},
 {id:"aires",s:"ma",hors:true,d:"Grandeurs",n:"Périmètres et aires",o:"Programme de CM2 · hors évaluation Repères",tips:"Le périmètre est le tour (en m, cm), l’aire est la surface (en m², cm²). Formules du carré et du rectangle.",g:genAires},
 {id:"geo",s:"ma",hors:true,d:"Géométrie",n:"Figures, droites et angles",o:"Programme de CM2 · hors évaluation Repères",tips:"Propriétés des quadrilatères et des triangles, cercle (rayon, diamètre), droites parallèles et perpendiculaires, angles aigus, droits, obtus, solides.",g:genGeo},
 {id:"deccalc",s:"ma",hors:true,d:"Calcul",n:"Calculer avec les décimaux",o:"Programme de CM2 · hors évaluation Repères",tips:"Additions et soustractions en alignant les virgules ; multiplier et diviser par 10 et 100 en décalant les chiffres.",g:genDecCalc},
 {id:"prop",s:"ma",hors:true,d:"Problèmes",n:"Proportionnalité et pourcentages",o:"Programme de CM2 · hors évaluation Repères",tips:"Tableaux de proportionnalité, recettes, fraction d’une quantité, pourcentages simples (50 %, 25 %, 10 %, 75 %).",g:genProp},
 {id:"multiples",s:"ma",hors:true,d:"Nombres",n:"Multiples, diviseurs, divisibilité",o:"Programme de CM2 · hors évaluation Repères",tips:"Critères de divisibilité par 2, 3, 5, 9 et 10 ; reconnaître les multiples et les diviseurs d’un nombre.",g:genMult}
];
const CHRONO={faits:{dur:60,max:25,s1:8,s2:12,lab:"1 min"},proc:{dur:180,max:30,s1:8,s2:16,lab:"3 min"}};
const CM=Object.fromEntries(COMPS.map(c=>[c.id,c]));

/* ---------- niveaux ---------- */
const LV={b:["À besoins","lv-besoin","var(--besoin)"],f:["Fragile","lv-fragile","var(--fragile)"],s:["Satisfaisant","lv-ok","var(--ok)"],n:["À évaluer","lv-none","var(--none)"]};
function fluBest(){return S.flu.length?Math.max(...S.flu.map(x=>x.wpm)):null}
function practice(id){if(id==="fluence"){const last=S.flu.slice(-3);if(!last.length)return null;const m=Math.round(last.reduce((a,b)=>a+b.wpm,0)/last.length);return {pct:Math.min(1,m/110),lv:m<90?"b":m<110?"f":"s",n:S.flu.length,label:`${m} mots/min`}}
  const r=(S.res[id]||[]).slice(-20);if(r.length<6)return r.length?{pct:r.reduce((a,b)=>a+b,0)/r.length,lv:null,n:r.length}:null;const p=r.reduce((a,b)=>a+b,0)/r.length;return {pct:p,lv:p<.5?"b":p<.75?"f":"s",n:r.length}}
function level(id){const ch=(S.chrono||{})[id];if(ch&&ch.length){const l=ch[ch.length-1];return {lv:l.lv,src:"épreuve chrono",p:{pct:Math.min(1,l.score/((l.s2+1)/.75)),n:ch.length,label:`${l.score} bonnes réponses en ${l.lab}`}}}const p=practice(id);if(p&&p.lv)return {lv:p.lv,src:"entraînement",p};if(S.teacher[id])return {lv:S.teacher[id],src:"fiche de septembre",p};if(S.bilan[id])return {lv:S.bilan[id],src:"bilan rapide",p};return {lv:"n",src:"",p}}
function priorities(){const ord={b:0,f:1,n:2,s:3};return COMPS.map(c=>({c,L:level(c.id)})).sort((a,b)=>ord[a.L.lv]-ord[b.L.lv]||((a.L.p?.pct??.5)-(b.L.p?.pct??.5)))}

/* ---------- vues ---------- */
let view="progres";
function setView(v){view=v;document.querySelectorAll("nav.tabs button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===v));render();window.scrollTo({top:0})}
document.querySelectorAll("nav.tabs button").forEach(b=>b.onclick=()=>{if(session&&session.iv)clearInterval(session.iv);session=null;setView(b.dataset.v)});
const nameIn=$("#childName");nameIn.value=S.name||"";nameIn.oninput=()=>{S.name=nameIn.value;save()};

function compRow(c){const L=level(c.id),[lab,cls,col]=LV[L.lv];const pct=L.p?Math.round(L.p.pct*100):0;
  const meta=L.src==="épreuve chrono"?`dernière épreuve : ${L.p.label}`:c.id==="fluence"?(L.p?`${L.p.label} · objectif 110`:"pas encore mesuré"):(L.p?`${pct}% de réussite · ${L.p.n} réponse${L.p.n>1?"s":""}`:"pas encore travaillé");
  return `<div class="comp"><span class="nm">${c.n}</span><span class="pill ${cls}">${lab}</span><span class="bar"><i style="width:${L.p?pct:0}%;background:${col}"></i></span><span class="meta"><span>${meta}</span><span>${L.src?"d’après : "+L.src:""}</span></span></div>`}
function renderProgres(){const pr=priorities().filter(x=>x.L.lv!=="s").slice(0,4);const nm=S.name?S.name:"ton enfant";
  const any=COMPS.some(c=>level(c.id).lv!=="n");
  return `<section class="stack">
  <div class="panel"><h2>À travailler en priorité</h2>
   ${any?`<p class="small">Touchez une compétence pour lancer 10 questions dessus.</p>`:`<p>Pour commencer, faites un <b>bilan rapide</b> (2 questions par compétence) ou reportez les résultats de la <b>fiche de restitution</b> remise par l’enseignant en septembre.</p>`}
   <div class="prio">${pr.map(x=>`<button data-go="${x.c.id}"><span class="pill ${LV[x.L.lv][1]}">${LV[x.L.lv][0]}</span> ${x.c.n}</button>`).join("")}</div>
   <div class="row"><button class="btn" id="goMix">Séance ciblée · 10 questions</button><button class="btn ghost" id="goBilan">Bilan rapide</button><button class="btn ghost" id="goFiche">Saisir la fiche de septembre</button></div>
  </div>
  <div class="legend small"><span class="pill lv-besoin">À besoins</span><span class="pill lv-fragile">Fragile</span><span class="pill lv-ok">Satisfaisant</span><span>Mêmes couleurs que les résultats officiels (violet, bleu, vert).</span></div>
  <div class="grid2">
   <div class="panel"><h2>Français</h2><div>${COMPS.filter(c=>c.s==="fr").map(compRow).join("")}</div></div>
   <div class="panel"><h2>Mathématiques</h2><div>${COMPS.filter(c=>c.s==="ma"&&!c.hors).map(compRow).join("")}</div></div>
   <div class="panel"><h2>Programme de CM2</h2><p class="small">Notions de maths travaillées en CM2 mais absentes de l’évaluation Repères.</p><div>${COMPS.filter(c=>c.hors).map(compRow).join("")}</div></div>
  </div>
  <p class="small">Les niveaux viennent en priorité de l’entraînement (à partir de 6 réponses : moins de 50 % = à besoins, 50 à 74 % = fragile, 75 % et plus = satisfaisant), sinon de la fiche de septembre, sinon du bilan rapide. Les données restent dans ce navigateur.</p>
  </section>`}
function bindProgres(){document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>startComp(b.dataset.go));$("#goMix").onclick=startMix;$("#goBilan").onclick=()=>setView("entrainer");$("#goFiche").onclick=()=>setView("fiche")}

let sel={s:"fr",d:"all"};try{const u=JSON.parse(localStorage.getItem(KEY+".ui")||"null");if(u&&u.s)sel=u}catch(e){}
function saveSel(){try{localStorage.setItem(KEY+".ui",JSON.stringify(sel))}catch(e){}}
const SUBJ={fr:"Français",ma:"Mathématiques"};
function catList(){return COMPS.filter(c=>c.s===sel.s&&(sel.d==="all"||c.d===sel.d))}
function renderEntrainer(){const doms=[...new Set(COMPS.filter(c=>c.s===sel.s).map(c=>c.d))];if(sel.d!=="all"&&!doms.includes(sel.d))sel.d="all";
  const list=catList(),train=list.filter(c=>c.g),catName=sel.d==="all"?"toute la matière":sel.d.toLowerCase();
  const row=c=>{const L=level(c.id);return `<div class="crow"><button class="cbtn" data-go="${c.id}"><span>${c.n}${c.hors?`<span class="tag">Programme</span>`:""}</span><span class="pill ${LV[L.lv][1]}">${LV[L.lv][0]}</span></button>${CHRONO[c.id]?`<button class="btn ghost sm" data-chrono="${c.id}">Chrono</button>`:""}</div>`};
  return `<section class="stack">
  <div class="panel">
   <h2>Que veux-tu travailler&nbsp;?</h2>
   <div class="seg" role="radiogroup" aria-label="Matière">${Object.entries(SUBJ).map(([k,v])=>`<button role="radio" data-s="${k}" aria-checked="${sel.s===k}">${v}</button>`).join("")}</div>
   <div class="chips" role="group" aria-label="Catégorie"><button data-d="all" aria-pressed="${sel.d==="all"}">Toutes</button>${doms.map(d=>`<button data-d="${d}" aria-pressed="${sel.d===d}">${d}</button>`).join("")}</div>
   ${train.length?`<div class="row"><button class="btn" id="goCat">10 questions · ${catName}</button><span class="small">${train.length>1?"Mélange les compétences ci-dessous, ou choisis-en une.":"Ou touche la compétence ci-dessous."}</span></div>`:""}
   <div class="list">${list.map(row).join("")}</div>
  </div>
  <div class="grid2">
   <div class="panel"><h2>Séance ciblée</h2><p>10 questions dans les compétences les plus fragiles, toutes matières confondues. Idéal 10 minutes par jour.</p><div><button class="btn ghost" id="goMix">Commencer</button></div></div>
   <div class="panel"><h2>Bilan rapide</h2><p>2 questions par compétence évaluée, pour situer votre enfant sans la fiche de septembre.</p><div class="row"><button class="btn ghost" data-bilan="fr">Bilan français</button><button class="btn ghost" data-bilan="ma">Bilan maths</button></div></div>
  </div></section>`}
function bindEntrainer(){document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{sel={s:b.dataset.s,d:"all"};saveSel();render()});
  document.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{sel.d=b.dataset.d;saveSel();render()});
  if($("#goCat"))$("#goCat").onclick=startCat;
  document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>startComp(b.dataset.go));$("#goMix").onclick=startMix;
  document.querySelectorAll("[data-bilan]").forEach(b=>b.onclick=()=>startBilan(b.dataset.bilan));document.querySelectorAll("[data-chrono]").forEach(b=>b.onclick=()=>startChrono(b.dataset.chrono))}
function startCat(){const tr=shuffle(catList().filter(c=>c.g).map(c=>c.id));if(!tr.length)return;const ids=[];for(let k=0;k<10;k++)ids.push(tr[k%tr.length]);
  mkSession(shuffle(ids),`${SUBJ[sel.s]} · ${sel.d==="all"?"toutes catégories":sel.d}`,"cat")}

function renderFiche(){return `<section class="panel"><h2>Résultats de septembre</h2>
  <p>L’enseignant remet une <b>fiche de restitution</b> en français et en mathématiques. Reportez ici le positionnement de votre enfant pour chaque compétence : l’application proposera d’abord les exercices là où un besoin a été repéré.</p>
  <div>${COMPS.filter(c=>!c.hors).map(c=>{const v=S.teacher[c.id]||"";return `<div class="fiche-row"><span style="font-weight:700">${c.n} <span class="small">· ${c.s==="fr"?"Français":"Maths"}</span></span><div class="levels" data-id="${c.id}">
   ${[["","Non renseigné","n"],["b","À besoins","b"],["f","Fragile","f"],["s","Satisfaisant","s"]].map(([k,l,cl])=>`<button class="${cl}" data-k="${k}" aria-pressed="${v===k}">${l}</button>`).join("")}</div></div>`}).join("")}</div></section>`}
function bindFiche(){document.querySelectorAll(".levels").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{const id=g.dataset.id,k=b.dataset.k;if(k)S.teacher[id]=k;else delete S.teacher[id];save();g.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b))}))}

function renderInfos(){return `<section class="stack cols">
 <div class="panel"><h2>Les évaluations Repères CM2 2026</h2>
 <p>Passées en classe entre le 7 et le 18 septembre 2026, en français et en mathématiques. Les exercices sont les mêmes qu’en 2025, sauf un exercice adapté aux nouveaux programmes. Pour chaque compétence, deux seuils séparent trois groupes : <span class="pill lv-besoin">à besoins</span> <span class="pill lv-fragile">fragile</span> <span class="pill lv-ok">satisfaisant</span>.</p>
 <p class="small">Les exercices de cette application sont originaux et reprennent le format et les difficultés décrits dans le guide officiel ; ce ne sont pas les items de l’évaluation.</p></div>
 ${["fr","ma"].map(s=>`<div class="panel"><h2>${s==="fr"?"Français":"Mathématiques"}</h2><dl class="info">${COMPS.filter(c=>c.s===s&&!c.hors).map(c=>`<dt>${c.n}</dt><dd><span class="small">${c.o}</span><br>${c.tips}</dd>`).join("")}</dl></div>`).join("")}
 <div class="panel"><h2>En plus : programme de CM2</h2><p class="small">Ces modules ne font pas partie de l’évaluation Repères mais du programme de mathématiques de l’année.</p><dl class="info">${COMPS.filter(c=>c.hors).map(c=>`<dt>${c.n}</dt><dd>${c.tips}</dd>`).join("")}</dl></div>
 <div class="panel"><h3>Sources officielles</h3><p class="small"><a href="https://eduscol.education.gouv.fr/5277/evaluations-des-acquis-et-besoins-des-eleves-au-cm2" target="_blank" rel="noopener">Éduscol · Évaluations CM2</a> · <a href="https://eduscol.education.gouv.fr/sites/default/files/document/26cm2guidedesscores-129826.pdf" target="_blank" rel="noopener">Guide des scores Repères CM2 2026 (PDF)</a> · <a href="https://www.education.gouv.fr/l-evaluation-des-acquis-des-eleves-en-cm2-des-reperes-de-debut-d-annee-414306" target="_blank" rel="noopener">Fiche pour les parents</a></p></div>
 </section>`}

/* ---------- séance ---------- */
let session=null;
function mkSession(ids,title,kind){const qs=ids.map(id=>Object.assign(CM[id].g(),{comp:id}));session={title,kind,qs,i:0,res:[],picked:null,done:false,t0:Date.now()};setView("entrainer");}
function startComp(id){if(id==="fluence"){session={fluence:true};setView("entrainer");return}mkSession(Array(10).fill(id),CM[id].n,"comp")}
function startMix(){const pr=priorities().filter(x=>x.c.g);let pool=pr.filter(x=>x.L.lv==="b"||x.L.lv==="f").map(x=>x.c.id);if(pool.length<3)pool=pr.slice(0,3).map(x=>x.c.id);pool=pool.slice(0,4);
  const ids=[];for(let k=0;k<10;k++)ids.push(pool[k%pool.length]);mkSession(shuffle(ids),"Séance ciblée","mix")}
function startBilan(s){const ids=[];COMPS.filter(c=>c.s===s&&c.g&&!c.hors).forEach(c=>ids.push(c.id,c.id));mkSession(ids,`Bilan rapide · ${s==="fr"?"français":"maths"}`,"bilan")}

function renderSession(){const ss=session;if(ss.done)return renderEnd();const q=ss.qs[ss.i];const c=CM[q.comp];
  const dots=ss.qs.map((_,k)=>`<span class="${k<ss.res.length?(ss.res[k]?"g":"b"):""} ${k===ss.i?"c":""}"></span>`).join("");
  let ans="";if(q.choices){ans=`<div class="choices ${q.wide?"wide":""}">${q.choices.map((h,k)=>`<button class="choice" data-k="${k}" aria-pressed="false">${h}</button>`).join("")}</div>`}
  else ans=`<div class="answer"><input id="ans" type="text" inputmode="${q.num?"decimal":"text"}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${q.num?"Ta réponse":"Écris ici"}"></div>`;
  const sayBtn=q.say?`<div class="row"><button class="btn ghost" id="say">${q.sayLabel||(q.dictee?"Écouter le mot":"Écouter le nombre")}</button>${q.dictee?`<details><summary>Voir le mot (adulte)</summary><span class="big" style="font-size:1.2rem">${q.say}</span></details>`:""}</div>`:"";
  return `<section class="sheet"><div class="qhead"><div><h3>${ss.title}</h3><span class="small">${c.n} · question ${ss.i+1}/${ss.qs.length}</span></div><div class="dots">${dots}</div></div>
   <div class="prompt">${q.prompt}</div>${sayBtn}${ans}<div id="fb"></div>
   <div class="row"><button class="btn" id="valid" ${q.choices?"disabled":""}>Valider</button><button class="btn ghost" id="quit">Arrêter</button></div></section>`}
function bindSession(){const ss=session;if(ss.done){$("#again").onclick=()=>{const k=ss.kind,ids=ss.qs.map(q=>q.comp);if(k==="mix")startMix();else if(k==="cat")startCat();else mkSession(k==="bilan"?ids:Array(10).fill(ids[0]),ss.title,k)};$("#back").onclick=()=>{session=null;setView("progres")};return}
  const q=ss.qs[ss.i];const valid=$("#valid");ss.answered=false;const t0=Date.now();
  $("#quit").onclick=()=>{session=null;setView("entrainer")};
  if($("#say"))$("#say").onclick=()=>{if(!speak(q.say))$("#say").textContent="Lecture vocale indisponible";};
  if(q.choices){document.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{if(ss.answered)return;document.querySelectorAll(".choice").forEach(x=>x.setAttribute("aria-pressed",x===b));ss.picked=+b.dataset.k;valid.disabled=false})}
  else{const i=$("#ans");setTimeout(()=>i.focus(),50);i.onkeydown=e=>{if(e.key==="Enter")valid.click()}}
  valid.onclick=()=>{if(ss.answered){ss.i++;if(ss.i>=ss.qs.length)finish();render();return}
    let ok;if(q.choices)ok=ss.picked===q.answer;else{const v=$("#ans").value;if(!v.trim())return;
      ok=q.num?Math.abs(parseNum(v)-q.answer)<1e-6:(q.accept||[q.answer]).some(a=>norm(a)===norm(v));$("#ans").disabled=true}
    ss.answered=true;ss.res.push(ok?1:0);(S.res[q.comp]=S.res[q.comp]||[]).push(ok?1:0);S.res[q.comp]=S.res[q.comp].slice(-40);save();
    if(q.choices)document.querySelectorAll(".choice").forEach((b,k)=>{b.disabled=true;if(k===q.answer)b.classList.add("right");else if(k===ss.picked)b.classList.add("wrong")});
    const sec=Math.round((Date.now()-t0)/1000);const speed=q.timed&&ok?(sec<=4?" Et vite !":" Essaie d’aller plus vite : ce calcul doit devenir automatique."):"";
    $("#fb").innerHTML=`<div class="feedback ${ok?"ok":"ko"}"><strong>${ok?"Bravo !":"Pas tout à fait."}${speed}</strong><span>${q.expl}</span></div>`;
    valid.textContent=ss.i+1>=ss.qs.length?"Voir mon résultat":"Question suivante";valid.disabled=false;valid.focus()}}
function finish(){const ss=session;ss.done=true;if(ss.kind==="bilan"){const by={};ss.qs.forEach((q,k)=>{(by[q.comp]=by[q.comp]||[]).push(ss.res[k])});for(const id in by){const s=by[id].reduce((a,b)=>a+b,0);S.bilan[id]=s===2?"s":s===1?"f":"b"}save()}}
function renderEnd(){const ss=session;const tot=ss.res.reduce((a,b)=>a+b,0);const by={};ss.qs.forEach((q,k)=>{(by[q.comp]=by[q.comp]||[0,0]);by[q.comp][0]+=ss.res[k];by[q.comp][1]++});
  const msg=tot/ss.res.length>=.75?"Très beau travail !":tot/ss.res.length>=.5?"C’est en bonne voie, on continue.":"Ce n’est pas grave : c’est en s’entraînant qu’on progresse.";
  return `<section class="sheet"><h2>${ss.title}</h2><div class="kpi"><b>${tot}/${ss.res.length}</b><span>${msg}</span></div>
   <div>${Object.entries(by).map(([id,[a,n]])=>`<div class="comp"><span class="nm">${CM[id].n}</span><span>${a}/${n}</span></div>`).join("")}</div>
   ${ss.kind==="bilan"?`<p class="small">Le bilan a été enregistré : retrouvez le positionnement dans « Mes progrès ».</p>`:""}
   <div class="row"><button class="btn" id="again">Recommencer</button><button class="btn ghost" id="back">Voir mes progrès</button></div></section>`}

/* ---------- épreuves chrono ---------- */
const fmtT=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const strip=h=>h.replace(/<[^>]+>/g,"").replace(/&nbsp;/g," ").replace("…","?").trim();
function startChrono(id){session={chrono:true,id,phase:"ready"};setView("entrainer")}
function renderChrono(){const ss=session,c=CHRONO[ss.id],nm=CM[ss.id].n,hist=(S.chrono[ss.id]||[]);const best=hist.length?Math.max(...hist.map(x=>x.score)):null;
  if(ss.phase==="ready")return `<section class="sheet"><div class="qhead"><div><h3>Épreuve chrono · ${nm}</h3><span class="small">${c.max} calculs au maximum en ${c.lab}, comme dans l’évaluation</span></div>${best!==null?`<span class="pill lv-ok">Record : ${best}</span>`:""}</div>
   <p>Réponds le plus vite possible et appuie sur <b>Entrée</b>. Si tu ne sais pas, passe au calcul suivant : il ne faut pas rester bloqué.</p>
   <p class="small">Repères officiels : jusqu’à ${c.s1} bonnes réponses, à besoins ; de ${c.s1+1} à ${c.s2}, fragile ; ${c.s2+1} et plus, satisfaisant.</p>
   <div class="row"><button class="btn" id="cgo">Partir !</button><button class="btn ghost" id="cquit">Retour</button></div></section>`;
  if(ss.phase==="run")return `<section class="sheet"><div class="qhead"><span class="timer" id="tm">${fmtT(c.dur)}</span><span class="kpi"><b id="csc">0</b><span>juste(s)</span></span></div>
   <div class="prompt" id="cq"></div><div class="answer"><input id="cans" type="text" inputmode="numeric" autocomplete="off" aria-label="Ta réponse"><button class="btn" id="cok">OK</button><button class="btn ghost" id="cskip">Passer</button></div><div id="cfl" class="small" aria-live="polite"></div></section>`;
  const [lab,cls]=LV[ss.lv];
  return `<section class="sheet"><h2>Épreuve chrono · ${nm}</h2><div class="kpi"><b>${ss.score}</b><span>bonnes réponses en ${c.lab}</span><span class="pill ${cls}">${lab}</span></div>
   <p>${ss.lv==="s"?"Bravo, ces calculs sont bien automatisés.":ss.lv==="f"?"Encore un effort : refais l’épreuve chaque jour, le score va monter.":"Entraîne-toi d’abord question par question, puis reviens battre ton score."}</p>
   ${ss.errs.length?`<details open><summary>À revoir (${ss.errs.length})</summary><div>${ss.errs.map(e=>`<div class="comp"><span class="nm">${e.q}</span><span><b>${e.a}</b>${e.g?` <span class="small">(réponse donnée : ${esc(e.g)})</span>`:" <span class=\"small\">(passé)</span>"}</span></div>`).join("")}</div></details>`:""}
   <div class="row"><button class="btn" id="cagain">Recommencer</button><button class="btn ghost" id="cquit">Retour</button></div></section>`}
function bindChrono(){const ss=session,c=CHRONO[ss.id];
  if($("#cquit"))$("#cquit").onclick=()=>{clearInterval(ss.iv);session=null;setView("entrainer")};
  if(ss.phase==="ready"){$("#cgo").onclick=()=>{Object.assign(ss,{phase:"run",score:0,n:0,errs:[],left:c.dur});render()};return}
  if(ss.phase==="end"){$("#cagain").onclick=()=>{session={chrono:true,id:ss.id,phase:"ready"};render()};return}
  const box=$("#cans");let q;
  const end=()=>{if(ss.phase!=="run")return;clearInterval(ss.iv);ss.phase="end";ss.lv=ss.score<=c.s1?"b":ss.score<=c.s2?"f":"s";
    (S.chrono[ss.id]=S.chrono[ss.id]||[]).push({score:ss.score,lab:c.lab,s2:c.s2,lv:ss.lv,d:Date.now()});save();if(session===ss)render()};
  const next=()=>{if(ss.n>=c.max||ss.left<=0)return end();q=CM[ss.id].g();$("#cq").innerHTML=q.prompt;box.value="";box.focus()};
  const submit=skip=>{if(ss.phase!=="run")return;const v=box.value.trim();if(!skip&&!v)return;ss.n++;const ok=!skip&&Math.abs(parseNum(v)-q.answer)<1e-6;
    if(ok){ss.score++;$("#csc").textContent=ss.score;$("#cfl").textContent="Juste !"}else{ss.errs.push({q:strip(q.prompt),a:fmt(q.answer),g:skip?"":v});$("#cfl").textContent=""}next()};
  box.onkeydown=e=>{if(e.key==="Enter")submit(false)};$("#cok").onclick=()=>submit(false);$("#cskip").onclick=()=>submit(true);
  ss.iv=setInterval(()=>{ss.left--;const t=$("#tm");if(t)t.textContent=fmtT(Math.max(0,ss.left));if(ss.left<=0)end()},1000);next()}

/* ---------- fluence ---------- */
const FLU="Le samedi matin, Nina aide son oncle au marché. Elle installe les cagettes de pommes, de poires et de prunes sur la grande table en bois. Les premiers clients arrivent très tôt, avec leurs paniers et leurs sacs en tissu. Une vieille dame demande toujours les fruits les plus mûrs pour faire ses confitures. Un petit garçon, lui, choisit une seule pomme, la plus rouge, et la paie avec une pièce brillante. Vers dix heures, le soleil chauffe les toiles des stands voisins. On sent l’odeur du pain chaud, du fromage et des fleurs coupées. Nina rend la monnaie sans se tromper, car elle compte dans sa tête plus vite que son oncle. À midi, il ne reste presque plus rien sur la table. Son oncle lui tend alors un sachet de cerises et lui dit en souriant qu’elle a bien mérité son salaire. Nina rentre chez elle à vélo, fière et un peu fatiguée, en pensant déjà au samedi suivant.";
let fl={last:-1,run:false,left:60,iv:null};
function renderFluence(){const words=FLU.split(" ");const best=fluBest();
  return `<section class="sheet"><div class="qhead"><div><h3>Lire à voix haute un texte</h3><span class="small">Objectif de début de CM2 : 110 mots lus correctement en 1 minute</span></div>${best?`<span class="pill lv-ok">Record : ${best} mots/min</span>`:""}</div>
  <ol class="small" style="margin:0;padding-left:20px"><li>L’adulte lance le chrono, l’enfant lit à voix haute.</li><li>Au signal, l’adulte touche le <b>dernier mot lu</b>.</li><li>Indiquez le nombre de mots mal lus, puis enregistrez.</li></ol>
  <div class="row"><span class="timer" id="tm">1:00</span><button class="btn" id="go">Lancer le chrono</button></div>
  <div class="flu" id="flu">${words.map((w,k)=>`<span data-k="${k}">${w}</span>`).join(" ")}</div>
  <div class="row"><label for="err">Mots mal lus</label><input id="err" type="number" min="0" value="0" style="width:90px"><button class="btn" id="saveF" disabled>Enregistrer</button><button class="btn ghost" id="quitF">Retour</button></div>
  <div id="fb"></div></section>`}
function bindFluence(){fl={last:-1,run:false,left:60,iv:null};const spans=[...document.querySelectorAll("#flu span")];
  const mark=()=>spans.forEach((s,k)=>{s.className=k===fl.last?"last":k<fl.last?"read":""});
  spans.forEach(s=>s.onclick=()=>{fl.last=+s.dataset.k;mark();$("#saveF").disabled=false});
  $("#go").onclick=()=>{if(fl.run)return;fl.run=true;fl.left=60;$("#go").disabled=true;fl.iv=setInterval(()=>{fl.left--;$("#tm").textContent=`0:${String(Math.max(0,fl.left)).padStart(2,"0")}`;if(fl.left<=0){clearInterval(fl.iv);fl.run=false;$("#tm").textContent="Stop !";$("#go").disabled=false;$("#go").textContent="Relancer"}},1000)};
  $("#quitF").onclick=()=>{clearInterval(fl.iv);session=null;setView("entrainer")};
  $("#saveF").onclick=()=>{const wpm=Math.max(0,fl.last+1-(parseInt($("#err").value)||0));S.flu.push({wpm,d:Date.now()});save();
    const lv=wpm<90?"b":wpm<110?"f":"s";$("#fb").innerHTML=`<div class="feedback ${lv==="s"?"ok":"ko"}"><strong>${wpm} mots lus correctement en 1 minute</strong><span>${lv==="s"?"Objectif atteint : la lecture est fluide.":lv==="f"?"Proche de l’objectif. Relire le même texte 3 jours de suite aide beaucoup.":"Lire chaque jour à voix haute, un court texte relu plusieurs fois, permet d’automatiser la reconnaissance des mots."}</span></div>`;$("#saveF").disabled=true}}

/* Raccourcis clavier (ordinateur, tablette avec clavier) : 1 à 9 choisissent une réponse, Entrée valide. */
document.addEventListener("keydown",e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||view!=="entrainer"||!session||session.done||session.chrono||session.fluence)return;
  const t=e.target,tag=t&&t.tagName;if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SUMMARY")return;
  const valid=$("#valid");if(!valid)return;
  if(/^[1-9]$/.test(e.key)){const b=document.querySelector(`.choice[data-k="${+e.key-1}"]`);if(b&&!b.disabled){e.preventDefault();b.click()}}
  else if(e.key==="Enter"&&tag!=="BUTTON"&&!valid.disabled){e.preventDefault();valid.click()}});

/* ---------- rendu ---------- */
function render(){const v=$("#view");
  if(view==="entrainer"&&session){if(session.fluence){v.innerHTML=renderFluence();bindFluence()}else if(session.chrono){v.innerHTML=renderChrono();bindChrono()}else{v.innerHTML=renderSession();bindSession()}return}
  if(view==="progres"){v.innerHTML=renderProgres();bindProgres()}
  else if(view==="entrainer"){v.innerHTML=renderEntrainer();bindEntrainer()}
  else if(view==="fiche"){v.innerHTML=renderFiche();bindFiche()}
  else v.innerHTML=renderInfos()}
render();

/* Application installable et hors connexion */
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}
