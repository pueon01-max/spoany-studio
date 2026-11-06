/* ---------- 릴스 시뮬레이터 (시험판) ----------
   템플릿을 스토리(1080×1920) 장면으로 이어 붙이고 Web Animations로 모션을 줘요.
   같은 타임라인을 미리보기·MP4 저장(WebCodecs)·Remotion 데이터에 공통으로 써요. */
const RM={rise:"올라오기",pop:"튀어나오기",blur:"선명하게"},RT={fade:"페이드",slide:"슬라이드",zoom:"줌",punch:"펀치"};
const RPRE=[["후기 릴스",["reviewCover","review","review2","coupon"]],["이벤트 릴스",["summary","dday","price","coupon"]],["공지 릴스",["notice","schedule","faq"]],["코치 소개 릴스",["coach","routine","muscle","quote"]],["무드 릴스",["move","lift","rhythm","fog"]]];
const RW=1080,RH=1920,TR=450;
let R={scenes:RPRE[0][1].map(k=>({k,d:3,m:"rise"})),tr:"slide",ui:true};
try{const o=JSON.parse(localStorage.getItem("spoany.reels")||"null");if(o&&Array.isArray(o.scenes))R=Object.assign(R,o);}catch(e){}
R.scenes=R.scenes.filter(s=>T[s.k]&&shapeOf(s.k)==="p");
const rSave=()=>{try{localStorage.setItem("spoany.reels",JSON.stringify(R))}catch(e){}};
const rTotal=()=>R.scenes.reduce((a,s)=>a+s.d*1000,0);
const rStarts=()=>{let t=0;return R.scenes.map(s=>{const a=t;t+=s.d*1000;return a;});};

/* 패널 */
function rlPanel(){
 $("#rlPresets").innerHTML=RPRE.map(([n],i)=>`<button type="button" data-p="${i}">${n}</button>`).join("");
 $("#rlTr").innerHTML=Object.entries(RT).map(([k,n])=>`<button type="button" data-v="${k}" aria-pressed="${R.tr===k}">${n}</button>`).join("");
 $("#rlUi").checked=R.ui;$("#rlCount").textContent=`${R.scenes.length}개 · ${(rTotal()/1000).toFixed(0)}초`;
 $("#rlList").innerHTML=R.scenes.length?R.scenes.map((s,i)=>`<li data-i="${i}"><button type="button" class="rl-go" data-act="go" title="이 장면부터 보기"><span class="inum">${String(i+1).padStart(2,"0")}</span><b>${esc(T[s.k].n)}</b></button>
  <select data-act="d" aria-label="${i+1}번 장면 길이">${[2,3,4,5,6].map(v=>`<option value="${v}"${v===s.d?" selected":""}>${v}초</option>`).join("")}</select>
  <select data-act="m" aria-label="${i+1}번 장면 모션">${Object.entries(RM).map(([k,n])=>`<option value="${k}"${k===s.m?" selected":""}>${n}</option>`).join("")}</select>
  <span class="iact"><button type="button" class="mini" data-act="up" aria-label="위로"${i?"":" disabled"}>↑</button><button type="button" class="mini" data-act="down" aria-label="아래로"${i<R.scenes.length-1?"":" disabled"}>↓</button><button type="button" class="mini del" data-act="del" aria-label="삭제">✕</button></span></li>`).join(""):`<li class="empty">장면이 없어요. 빠른 시작을 누르거나 지금 템플릿을 추가해 주세요.</li>`;}
function rlChanged(){rSave();rlPanel();rvBuild();rlMeta();}
$("#rlPresets").addEventListener("click",e=>{const b=e.target.closest("button[data-p]");if(!b)return;R.scenes=RPRE[+b.dataset.p][1].map(k=>({k,d:3,m:"rise"}));rlChanged();rvPlay(true);});
$("#rlTr").addEventListener("click",e=>{const b=e.target.closest("button[data-v]");if(!b)return;R.tr=b.dataset.v;rlChanged();rvPlay(true);});
$("#rlUi").addEventListener("change",e=>{R.ui=e.target.checked;rSave();$("#rv")&&$("#rv").classList.toggle("noui",!R.ui);});
$("#rlAdd").addEventListener("click",()=>{let k=S.tpl;if(shapeOf(k)!=="p")k=S.last.p&&shapeOf(S.last.p)==="p"?S.last.p:"reviewCover";if(R.scenes.length>=8){rlMsg("장면은 8개까지 넣을 수 있어요.");return;}R.scenes.push({k,d:3,m:"rise"});rlChanged();rvSeek(rStarts()[R.scenes.length-1]);});
$("#rlList").addEventListener("click",e=>{const b=e.target.closest("button[data-act]");if(!b)return;const i=+b.closest("li").dataset.i,a=R.scenes;
 if(b.dataset.act==="go"){rvSeek(rStarts()[i]);rvPlay(false,true);return;}
 if(b.dataset.act==="del")a.splice(i,1);else if(b.dataset.act==="up"&&i>0)[a[i-1],a[i]]=[a[i],a[i-1]];else if(b.dataset.act==="down"&&i<a.length-1)[a[i+1],a[i]]=[a[i],a[i+1]];
 rlChanged();});
$("#rlList").addEventListener("change",e=>{const el=e.target.closest("select");if(!el)return;const i=+el.closest("li").dataset.i;if(el.dataset.act==="d")R.scenes[i].d=+el.value;else R.scenes[i].m=el.value;const t=rStarts()[i];rlChanged();rvSeek(t);rvPlay(false,true);});
function rlMsg(m,cls){const st=$("#rlStatus");st.className="status"+(cls?" "+cls:"");st.textContent=m;}

/* 모션: 장면 안의 요소는 위에서 아래 순서로 차례차례 등장 (transform 대신 translate/scale을 써서 원래 회전 등은 유지) */
const EASE="cubic-bezier(.2,.8,.2,1)";
const MKF={rise:[{opacity:0,translate:"0 70px"},{opacity:1,translate:"0 0"}],pop:[{opacity:0,scale:".82"},{opacity:1,scale:"1.04",offset:.7},{opacity:1,scale:"1"}],blur:[{opacity:0,filter:"blur(18px)",scale:"1.06"},{opacity:1,filter:"blur(0)",scale:"1"}]};
const TIN={fade:[{opacity:0},{opacity:1}],slide:[{translate:"100% 0"},{translate:"0 0"}],zoom:[{opacity:0,scale:"1.18"},{opacity:1,scale:"1"}],punch:[{opacity:0,scale:".86",filter:"brightness(2)"},{opacity:1,scale:"1.02",filter:"brightness(1.2)",offset:.6},{opacity:1,scale:"1",filter:"brightness(1)"}]};
const TOUT={fade:[{opacity:1},{opacity:1}],slide:[{translate:"0 0",filter:"brightness(1)"},{translate:"-30% 0",filter:"brightness(.6)"}],zoom:[{scale:"1",opacity:1},{scale:".92",opacity:.4}],punch:[{scale:"1"},{scale:"1.06"}]};
function motionTargets(sc){const all=[...sc.querySelectorAll("[data-f]")].filter(e=>!/^photo/.test(e.dataset.f));
 const top=all.filter(e=>!all.some(o=>o!==e&&o.contains(e)));
 return top.map(e=>({e,y:e.getBoundingClientRect().top})).sort((a,b)=>a.y-b.y).map(o=>o.e);}
function buildTimeline(root){const anims=[],st=rStarts(),T=rTotal(),scs=[...root.querySelectorAll(".rv-sc")];
 scs.forEach((sc,i)=>{const s=R.scenes[i],t0=st[i],d=s.d*1000;sc.style.display="block";
  anims.push(sc.animate(TIN[R.tr],{duration:i===0&&R.tr==="slide"?1:TR,delay:t0,fill:"both",easing:EASE}));
  if(i<scs.length-1)anims.push(sc.animate(TOUT[R.tr],{duration:TR,delay:t0+d,fill:"both",easing:EASE}));
  sc.querySelectorAll(".bgimg,[data-f^=photo]").forEach(p=>anims.push(p.animate([{scale:"1.12"},{scale:"1"}],{duration:d+TR,delay:t0,fill:"both",easing:"ease-out"})));
  const tg=motionTargets(sc),gap=Math.min(110,(d*.45)/Math.max(1,tg.length));
  tg.forEach((e,j)=>anims.push(e.animate(MKF[s.m]||MKF.rise,{duration:650,delay:t0+TR*.5+j*gap,fill:"both",easing:EASE})));});
 anims.forEach(a=>a.pause());
 return {anims,scs,st,T,set(t){t=Math.max(0,Math.min(T-1,t));anims.forEach(a=>a.currentTime=t);scs.forEach((sc,i)=>{const on=t>=st[i]&&t<st[i]+R.scenes[i].d*1000+TR;sc.style.display=on?"block":"none";sc.style.zIndex=i;});}};}
function scenesHTML(){return R.scenes.map((s,i)=>`<div class="rv-sc" data-i="${i}">${poster(s.k,"story",true)}</div>`).join("");}

/* 플레이어 (오른쪽 미리보기 자리) */
let TL=null,rvT=0,rvRaf=0,rvOn=false,rvLast=0;
const IG={heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',com:'<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',send:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',dots:'<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',cam:'<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l2-3h4l2 3"/>'};
const ig=(p,s)=>`<svg viewBox="0 0 24 24" width="${s||64}" height="${s||64}" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
function rvBuild(){const box=$("#reelStage");if(!box||box.hidden)return;cancelAnimationFrame(rvRaf);rvOn=false;
 if(!R.scenes.length){box.innerHTML=`<div class="empty" style="margin:40px auto;max-width:360px">왼쪽에서 빠른 시작을 누르거나 장면을 추가해 주세요.</div>`;TL=null;return;}
 const narrow=isNarrow(),maxH=narrow?Math.max(300,window.innerHeight*.5):Math.max(440,window.innerHeight-250),sh=Math.min(maxH,(box.clientWidth-40)*16/9),sc=sh/RH,sw=RW*sc;
 box.innerHTML=`<div class="rv${R.ui?"":" noui"}" id="rv"><div class="rv-phone" style="width:${Math.round(sw)}px;height:${Math.round(sh)}px"><div class="rv-in" style="transform:scale(${sc})">${scenesHTML()}
  <div class="rv-ui"><div class="rv-top"><b>릴스</b>${ig(IG.cam,70)}</div><div class="rv-side">${[[IG.heart,"1,284"],[IG.com,"86"],[IG.send,"공유"],[IG.dots,""]].map(([p,n])=>`<span>${ig(p,74)}<small>${n}</small></span>`).join("")}</div>
  <div class="rv-cap"><div class="rv-pf"><i></i><b>spoany_sinjungdong</b><em>팔로우</em></div><p>스포애니 신중동점 · ${esc(T[R.scenes[0].k].n)} 🔥 더 보기</p><div class="rv-mus">♫ Spoany Studio · 오리지널 오디오</div></div><div class="rv-safe" title="인스타 UI에 가려질 수 있는 영역"></div></div>
  <div class="rv-bar"><i id="rvBarI"></i></div></div></div>
  <div class="rv-ctl"><button type="button" class="ibtn" id="rvPlay" aria-label="재생">${playIco(false)}</button><div class="rv-seg" id="rvSeg">${R.scenes.map((s,i)=>`<button type="button" data-i="${i}" style="flex:${s.d}" title="${esc(T[s.k].n)}"><i></i><span>${esc(T[s.k].n)}</span></button>`).join("")}</div><span class="rv-time" id="rvTime"></span></div></div>`;
 TL=buildTimeline($("#rv .rv-in"));rvT=Math.min(rvT,TL.T-1);TL.set(rvT);rvUI();}
const playIco=on=>on?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>';
const fmtT=ms=>`0:${String(Math.floor(ms/1000)).padStart(2,"0")}`;
function rvUI(){if(!TL)return;const p=rvT/TL.T;const bi=$("#rvBarI");if(bi)bi.style.width=(p*100)+"%";const tm=$("#rvTime");if(tm)tm.textContent=`${fmtT(rvT)} / ${fmtT(TL.T)}`;
 $$("#rvSeg button").forEach((b,i)=>{const a=TL.st[i],d=R.scenes[i].d*1000,f=Math.max(0,Math.min(1,(rvT-a)/d));b.querySelector("i").style.width=(f*100)+"%";b.classList.toggle("on",rvT>=a&&rvT<a+d);});
 $$("#rlList li[data-i]").forEach((li,i)=>li.classList.toggle("on",rvT>=TL.st[i]&&rvT<TL.st[i]+R.scenes[i].d*1000));
 const pb=$("#rvPlay");if(pb){pb.innerHTML=playIco(rvOn);pb.setAttribute("aria-label",rvOn?"일시정지":"재생");}}
function rvSeek(t){rvT=Math.max(0,t||0);if(TL){TL.set(rvT);rvUI();}}
function rvTick(now){if(!rvOn||!TL)return;rvT+=Math.min(100,now-rvLast);rvLast=now;if(rvT>=TL.T)rvT=0;TL.set(rvT);rvUI();rvRaf=requestAnimationFrame(rvTick);}
function rvPlay(restart,force){if(!TL)return;if(restart)rvT=0;rvOn=force?true:!rvOn;if(matchMedia("(prefers-reduced-motion: reduce)").matches&&!force&&!restart){}
 cancelAnimationFrame(rvRaf);if(rvOn){rvLast=performance.now();rvRaf=requestAnimationFrame(rvTick);}rvUI();}
document.addEventListener("click",e=>{if(e.target.closest("#rvPlay"))rvPlay();const sb=e.target.closest("#rvSeg button");if(sb&&TL){rvSeek(TL.st[+sb.dataset.i]);rvPlay(false,true);}
 if(e.target.closest("#rv .rv-phone"))rvPlay();});
document.addEventListener("keydown",e=>{if(document.body.dataset.tab!=="reels"||e.target.closest("input,textarea,select"))return;if(e.code==="Space"){e.preventDefault();rvPlay();}});
let rvRz;window.addEventListener("resize",()=>{if(document.body.dataset.tab!=="reels")return;clearTimeout(rvRz);rvRz=setTimeout(rvBuild,200);});
function rlMeta(){if(document.body.dataset.tab==="reels")$("#tplMeta").textContent=`스토리 9:16 · 1080×1920 · 장면 ${R.scenes.length}개 · ${(rTotal()/1000).toFixed(0)}초`;}
function onTab(id){const rs=$("#reelStage");if(!rs)return;const on=id==="reels";rs.hidden=!on;$("#tplName").textContent=on?"릴스 미리보기":T[S.tpl].n;if(on)rlMeta();else render();
 if(on){rlPanel();rvBuild();rvPlay(false,true);}else if(TL||rs.innerHTML){rvOn=false;cancelAnimationFrame(rvRaf);rs.innerHTML="";TL=null;}}

/* MP4 저장: 프레임마다 시간을 맞추고 그림으로 찍어서 WebCodecs로 인코딩 */
let rlAbort=false;
async function pickCodec(w,h,fps){if(!window.VideoEncoder)return null;
 for(const [codec,mux] of [["avc1.640028","avc"],["avc1.4d0028","avc"],["avc1.42001f","avc"],["vp09.00.40.08","vp9"]]){
  try{const cfg={codec,width:w,height:h,bitrate:6e6,framerate:fps};const r=await VideoEncoder.isConfigSupported(cfg);if(r&&r.supported)return {cfg,mux};}catch(e){}}return null;}
$("#rlMp4").addEventListener("click",async()=>{if(!R.scenes.length){rlMsg("장면을 먼저 넣어 주세요.","err");return;}
 const W=720,H=1280,fps=24,pick=await pickCodec(W,H,fps);
 if(!pick||!window.Mp4Muxer||!window.htmlToImage){rlMsg("이 브라우저는 영상 저장을 지원하지 않아요. PC 크롬이나 최신 사파리에서 열어 주세요. 대신 'Remotion용 데이터'는 저장할 수 있어요.","err");return;}
 rvOn=false;cancelAnimationFrame(rvRaf);rvUI();
 const btn=$("#rlMp4"),stop=$("#rlStop"),pr=$("#rlProg");btn.disabled=true;stop.hidden=false;pr.hidden=false;rlAbort=false;
 const ex=$("#exp");ex.innerHTML=`<div class="rv-in rv-exp" style="width:${RW}px;height:${RH}px;position:relative;overflow:hidden;background:#000">${scenesHTML()}</div>`;const root=ex.firstElementChild;
 try{await document.fonts.ready;const tl=buildTimeline(root),N=Math.ceil(tl.T/1000*fps);
  const fontEmbedCSS=await htmlToImage.getFontEmbedCSS(root).catch(()=>undefined);
  const muxer=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:pick.mux,width:W,height:H,frameRate:fps},fastStart:"in-memory"});
  let encErr=null;const enc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:e=>encErr=e});enc.configure(pick.cfg);
  const t0=performance.now();
  for(let f=0;f<N;f++){if(rlAbort)throw{code:"abort"};if(encErr)throw encErr;
   tl.set(f*1000/fps);
   const cvs=await htmlToImage.toCanvas(root,{width:RW,height:RH,canvasWidth:W,canvasHeight:H,pixelRatio:1,skipAutoScale:true,cacheBust:false,fontEmbedCSS,filter:n=>!(n.classList&&n.classList.contains("rv-sc")&&n.style.display==="none")});
   const vf=new VideoFrame(cvs,{timestamp:Math.round(f*1e6/fps),duration:Math.round(1e6/fps)});enc.encode(vf,{keyFrame:f%(fps*2)===0});vf.close();
   while(enc.encodeQueueSize>4)await new Promise(r=>setTimeout(r,5));
   const done=(f+1)/N,el=(performance.now()-t0)/1000,left=Math.max(0,Math.round(el/done-el));pr.firstElementChild.style.width=(done*100)+"%";rlMsg(`영상 만드는 중… ${Math.round(done*100)}% · 약 ${left}초 남음 (이 탭을 열어 두세요)`);}
  await enc.flush();enc.close();muxer.finalize();
  const blob=new Blob([muxer.target.buffer],{type:"video/mp4"});
  await PLATFORM.save(blob,`스포애니_릴스_${stamp()}.mp4`);
  rlMsg(`저장했어요 · ${(blob.size/1048576).toFixed(1)}MB · 720p ${fps}fps · ${(tl.T/1000).toFixed(0)}초`,"ok");}
 catch(e){rlMsg(e&&e.code==="abort"?"영상 저장을 멈췄어요.":e&&e.code==="unavailable"?"이 화면에서는 파일을 저장할 수 없어요.":"영상을 만들지 못했어요. 장면 수를 줄이거나 PC 크롬에서 다시 시도해 주세요.","err");console.error(e);}
 finally{ex.innerHTML="";btn.disabled=false;stop.hidden=true;pr.hidden=true;}});
$("#rlStop").addEventListener("click",()=>{rlAbort=true;});

/* Remotion용 데이터: 같은 장면·모션·내용을 그대로 담아요 (사진 포함) */
$("#rlJson").addEventListener("click",async()=>{if(!R.scenes.length){rlMsg("장면을 먼저 넣어 주세요.","err");return;}
 const fps=30,photos={};Object.entries(S.ph).forEach(([slot,id])=>{if(id&&PH[id])photos[slot]={color:PH[id].o,mono:PH[id].m};});
 const data={app:"Spoany Studio",kind:"reels",version:1,fps,width:RW,height:RH,transition:{type:R.tr,durationInFrames:Math.round(TR/1000*fps)},theme:S.theme,mono:S.mono,
  scenes:R.scenes.map(s=>({template:s.k,name:T[s.k].n,durationInFrames:s.d*fps,motion:s.m,content:JSON.parse(JSON.stringify(cv(s.k)))})),photos};
 try{await PLATFORM.save(new Blob([JSON.stringify(data,null,1)],{type:"application/json"}),`스포애니_릴스_${stamp()}.json`);rlMsg("Remotion용 데이터를 저장했어요. Remotion 프로젝트에서 이 파일을 읽어 같은 디자인으로 고화질 렌더할 수 있어요.","ok");}
 catch(e){rlMsg("파일을 저장하지 못했어요.","err");}});
rlPanel();
