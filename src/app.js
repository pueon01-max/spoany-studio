(function(){
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rich=s=>esc(s).replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/\n/g,"<br>");
const plain=s=>String(s??"").replace(/\*/g,"");
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- brand assets (빌드 때 채워짐) ---------- */
//@@ASSETS
const DEF_CUT="var(--defcut)",DEF_PHOTO="var(--defphoto)";
const U=u=>!u?"none":String(u).startsWith("var(")?u:`url('${u}')`;

/* ---------- formats ---------- */
const FORMATS={
 feed:{w:1080,h:1350,n:"피드 4:5",d:"인스타그램 피드 · 1080×1350",s:"p"},
 square:{w:1080,h:1080,n:"정사각",d:"피드·카카오 채널 · 1080×1080",s:"p"},
 story:{w:1080,h:1920,n:"스토리",d:"스토리·릴스 커버 · 1080×1920",s:"p"},
 wide:{w:1920,h:1080,n:"가로 16:9",d:"매장 TV·키오스크·유튜브 썸네일 · 1920×1080",s:"l"},
 link:{w:1920,h:1005,n:"링크 썸네일",d:"블로그·카톡 링크 공유 (1.91:1) · 1920×1005",s:"l"},
 a4:{w:1080,h:1527,n:"A4 세로",d:"전단·공지 인쇄 · A4 비율",s:"p"},
 a4l:{w:1920,h:1358,n:"A4 가로",d:"가로 인쇄물·게시판 · A4 비율",s:"l"},
 xban:{w:1080,h:3240,n:"X배너",d:"입구 X배너 600×1800mm 비율 · 인쇄용 3배 저장 권장",s:"x"}};
const FGROUPS=[["SNS",["feed","square","story"]],["가로",["wide","link"]],["인쇄",["a4","a4l","xban"]]];
const SHAPE_N={p:"세로",l:"가로",x:"X배너"};

/* ---------- content ---------- */
const SAMPLE={kicker:"DECEMBER EVENT",headline:"연말엔 *운동*으로\n나를 챙겨요",sub:"12월 한 달, 신규 회원만의 혜택",word:"MOVE",
 metrics:[{label:"6개월 회원권",value:"297,000",unit:"원",status:"12.31 마감"},{label:"PT 체험",value:"1",unit:"회",status:"무료"},{label:"운영 시간",value:"06–24",unit:"시",status:"연중무휴"}],
 changes:[{label:"체중",value:"−6.4",unit:"kg"},{label:"체지방률",value:"−5.1",unit:"%p"},{label:"골격근량",value:"+1.8",unit:"kg"}],
 ring:{value:"3",unit:"회",label:"남은 출석",progress:72,caption:"이번 주 5회 출석 챌린지"},
 countdown:{days:"29",label:"12월 이벤트 마감까지"},
 offer:{value:"1",unit:"회 무료",label:"PT 체험권"},
 conds:["신규 회원 1인 1회","방문 전 상담 예약","다른 혜택과 중복 불가"],valid:"2026.12.31까지",code:"",
 ba:{period:"12주",before:"8월",after:"11월",note:"회원님 동의 후 게시 · 결과는 개인차가 있어요"},
 rows:[{label:"*6개월",value:"297,000원",note:"PT 1회 포함"},{label:"3개월",value:"169,000원",note:"운동복 대여"},{label:"12개월",value:"490,000원",note:"락커 무료"}],
 routine:[{label:"랫풀다운",value:"4×12",note:"등"},{label:"덤벨 숄더 프레스",value:"4×10",note:"어깨"},{label:"벤치 프레스",value:"5×8",note:"가슴"},{label:"케이블 푸시다운",value:"3×15",note:"삼두"},{label:"바벨 컬",value:"3×12",note:"이두"}],
 zones:[{label:"웨이트 존",value:"프리웨이트·머신",note:""},{label:"유산소 존",value:"러닝머신·사이클",note:""},{label:"GX룸",value:"그룹 수업",note:""},{label:"샤워실",value:"개인 락커",note:""}],
 team:[{name:"원광건",role:"PT팀장",tag:"생활체육지도자 2급"},{name:"코치 이름",role:"트레이너",tag:"전문 분야"},{name:"코치 이름",role:"트레이너",tag:"전문 분야"},{name:"코치 이름",role:"트레이너",tag:"전문 분야"}],
 faq:[{q:"운동을 처음 해도 괜찮나요?",a:"첫 방문 때 기구 사용법을 안내해 드려요."},{q:"PT 체험은 어떻게 신청하나요?",a:"프론트나 전화로 예약하면 돼요."},{q:"운동복을 챙겨야 하나요?",a:"대여 여부는 프론트에 문의해 주세요."},{q:"주차할 수 있나요?",a:"주차 안내는 프론트에 문의해 주세요."}],
 tips:["운동 전 *5분 스트레칭*으로 몸을 깨워요","무게보다 *바른 자세*가 먼저예요","세트 사이 휴식은 60~90초면 충분해요"],
 bullets:["최신 머신 120대","1:1 PT 무료 체험","06–24시 연중무휴"],
 tags:["근력","유산소","스트레칭"],
 chips:[{label:"어깨",on:true},{label:"삼두",on:false},{label:"가슴",on:true},{label:"하체",on:true},{label:"복근",on:false}],
 cta:"상담 예약하기",footnote:"문의 032-322-5508",date:"2026.12",qr:{url:"",label:"상담 예약"},
 rword:"REAL REVIEW",sticker:"1회 체험 → 등록",chead:"직접 받아본\n*광건쌤* PT는?",ccta:"회원님들의 실제 후기 4편",name:"원광건 PT팀장",creds:"생활체육지도자 2급 · 노인스포츠지도자\n현 스포애니 신중동점 PT팀장",
 quotes:["진짜 잘 가르쳐주십니다.","절대 후회 안 하는\n피티였습니다."],
 rtag:"광건팀장 PT 수업 후기",rhead:"오랜만에 받은 PT,\n*다시 운동할 의욕*이 생겼어요",
 review:"PT 오랜만에 받아봤는데 신청하길 잘했어요. 제가 운동 초짜라 부족한 부분이 많은데 *맞춤형으로 적절하게 진행해주셔서 의욕이 떨어지지 않게* 만들어주셨어요. 오늘 1회 체험이었는데, 광건쌤께 수업 받으면 포기하지 않고 열심히 할 수 있을 것 같아서 등록하려고 합니다. 잘 부탁드립니다 쌤",
 keywords:["친절해요","수업이 체계적이에요","자세를 꼼꼼히 봐주세요","선생님 실력이 좋아요","맞춤 케어를 잘해줘요"],
 rating:"5",page:"2",total:"5",source:"출처: 네이버 방문자 리뷰 · 실제 후기 일부 발췌"};
const SJ={};for(const k in SAMPLE)SJ[k]=JSON.stringify(SAMPLE[k]);

const PH={}; // 사진 id → {o 원본, m 흑백, name, alpha}
const S={tpl:"reviewCover",fmt:"feed",theme:"light",mono:true,ph:{bg:null,cut:null,bg2:null},c:clone(SAMPLE),
 cat:"all",ftype:"png",res:2,last:{p:"reviewCover",l:"wideInfo",x:"xbanner"}};
const isSample=k=>JSON.stringify(S.c[k])===SJ[k];
function cv(k){const sx=T[k]&&T[k].sx;if(!sx)return S.c;const o=Object.assign({},S.c);for(const key in sx)if(isSample(key))o[key]=sx[key];return o;}
function own(k){const sx=T[S.tpl].sx;if(sx&&k in sx&&isSample(k))S.c[k]=clone(sx[k]);return S.c[k];}

//@@TEMPLATES

/* ---------- editor config ---------- */
const USES={
 reviewCover:["photoCut","total","chead","quotes","name","creds","rating","ccta","source"],
 review:["page","total","rtag","rhead","photoBg","name","rating","review","keywords","source"],
 reviewCover2:["photoCut","total","rword","quotes","chead","rating","name","creds","ccta"],
 review2:["page","total","rtag","review","rating","photoBg","sticker","name","keywords","source"],
 beforeAfter:["ba","kicker","headline","photoBg","photoBg2","changes"],
 wideReview:["photoCut","quotes","rating","name","creds","ccta"],
 summary:["kicker","headline","sub","metrics"],
 coupon:["kicker","headline","offer","conds","qr","valid","code","footnote"],
 price:["kicker","headline","rows","footnote","qr"],
 rings:["photoBg","metrics","ring","countdown"],
 dday:["kicker","headline","countdown","cta"],
 wideInfo:["kicker","headline","sub","qr","footnote","metrics"],
 widePrice:["kicker","headline","rows","footnote","qr"],
 xbanner:["date","kicker","headline","sub","photoBg","offer","rows","bullets","cta","footnote","qr"],
 notice:["date","headline","sub","rows","footnote","qr"],
 schedule:["kicker","headline","rows","footnote"],
 faq:["kicker","headline","faq","footnote","qr"],
 facility:["photoBg","headline","zones"],
 wideNotice:["date","headline","sub","rows","footnote","qr"],
 coach:["photoBg","headline","sub","tags","metrics","footnote"],
 team:["photoBg","kicker","headline","team","footnote","cta"],
 routine:["date","kicker","headline","chips","routine"],
 tips:["page","total","kicker","headline","tips","footnote"],
 mono:["photoBg","kicker","headline","ring","tags"],
 muscle:["kicker","headline","chips"],
 lift:["photoBg","kicker","word","date"],
 move:["photoBg","photoCut","word","bullets","headline"],
 fog:["photoBg","headline"],
 rhythm:["photoBg","photoCut","headline"],
 quote:["headline","sub","kicker"],
 wideBold:["photoBg","photoCut","kicker","word","headline","cta","footnote"],
 xbannerBold:["photoBg","photoCut","word","headline","offer","cta","footnote","qr"]};
const F={
 photoBg:{t:"photo",slot:"bg",l:"배경 사진"},
 photoBg2:{t:"photo",slot:"bg2",l:"두 번째 사진"},
 photoCut:{t:"photo",slot:"cut",l:"인물 누끼 PNG",h:"배경을 지운 PNG예요. 아이폰은 사진을 길게 눌러 '피사체 복사', 또는 remove.bg를 쓰면 돼요."},
 kicker:{t:"text",l:"작은 라벨",h:"영문 대문자가 잘 어울려요 · 예: DECEMBER EVENT"},
 headline:{t:"area",l:"헤드라인",rows:2,rich:1,fit:1},
 sub:{t:"area",l:"서브 문구",rows:1},
 word:{t:"text",l:"영문 대형 단어",h:"한두 단어 · 예: MOVE, GYM TIME"},
 chead:{t:"area",l:"커버 헤드라인",rows:2,rich:1,fit:1},
 rword:{t:"text",l:"대형 영문 두 단어",h:"예: REAL REVIEW, TRUE STORY"},
 rtag:{t:"text",l:"후기 라벨"},
 rhead:{t:"area",l:"후기 헤드라인",rows:2,rich:1,fit:1},
 quotes:{t:"strs",l:"회원 한마디",max:2,area:1,rich:1,add:"한마디 추가"},
 review:{t:"area",l:"후기 원문",rows:7,rich:1,hl:1,h:"원문 그대로 써 주세요. 강조할 문장을 드래그한 뒤 '강조'를 누르면 형광펜이 칠해져요."},
 sticker:{t:"text",l:"스티커 문구",h:"후기에 실제로 나온 결과 · 예: 1회 체험 → 등록"},
 keywords:{t:"chips",l:"후기 키워드",max:6,h:"첫 번째 키워드가 레드로 강조돼요"},
 name:{t:"text",l:"코치 이름"},
 creds:{t:"area",l:"코치 이력",rows:2},
 rating:{t:"rating",l:"별점"},
 metrics:{t:"list",l:"숫자 카드",max:4,add:"숫자 카드 추가",parts:[{p:"label",ph:"라벨 · 예: 6개월 회원권",w:3},{p:"value",ph:"값",big:1,w:2},{p:"unit",ph:"단위",w:1},{p:"status",ph:"상태 · 예: 12.31 마감",w:3}],blank:{label:"",value:"",unit:"",status:""}},
 changes:{t:"list",l:"변화 수치",max:3,add:"수치 추가",h:"실제 회원의 기록만, 동의를 받고 넣어 주세요",parts:[{p:"label",ph:"항목 · 예: 체중",w:2},{p:"value",ph:"값 · 예: −6.4",big:1,w:2},{p:"unit",ph:"단위",w:2}],blank:{label:"",value:"",unit:""}},
 ring:{t:"obj",l:"진행 링",parts:[{p:"value",ph:"값",big:1,w:2},{p:"unit",ph:"단위",w:1},{p:"label",ph:"링 안 라벨 · 예: 남은 출석",w:3},{p:"progress",range:1,w:3},{p:"caption",ph:"아래 문구",w:3}]},
 countdown:{t:"obj",l:"D-day",parts:[{p:"days",ph:"남은 일수",big:1,w:2,suffix:"일 남음"},{p:"label",ph:"문구 · 예: 12월 이벤트 마감까지",w:3}]},
 offer:{t:"obj",l:"혜택 (크게 보이는 숫자)",parts:[{p:"value",ph:"예: 30",big:1,w:1},{p:"unit",ph:"예: % 할인",w:2},{p:"label",ph:"라벨 · 예: PT 체험권",w:3}]},
 ba:{t:"obj",l:"기간 · 시점",parts:[{p:"period",ph:"기간 · 예: 12주",w:1},{p:"before",ph:"비포 시점",w:1},{p:"after",ph:"애프터 시점",w:1},{p:"note",ph:"하단 안내",w:3}]},
 qr:{t:"obj",l:"QR 코드",h:"네이버 예약·카카오 채널 같은 링크를 넣으면 QR이 생겨요. 비우면 안 보여요.",parts:[{p:"url",ph:"https://…",w:3,url:1},{p:"label",ph:"QR 아래 문구 · 예: 상담 예약",w:3}]},
 rows:{t:"list",l:"표 · 가격 · 시간표",max:8,star:1,add:"행 추가",parts:[{p:"label",ph:"항목",w:1},{p:"value",ph:"값",w:1},{p:"note",ph:"메모",w:1}],blank:{label:"",value:"",note:""}},
 routine:{t:"list",l:"운동 순서",max:6,add:"운동 추가",parts:[{p:"label",ph:"운동 · 예: 랫풀다운",w:3},{p:"value",ph:"세트 · 예: 4×12",w:2},{p:"note",ph:"부위",w:1}],blank:{label:"",value:"",note:""}},
 zones:{t:"list",l:"공간",max:6,add:"공간 추가",parts:[{p:"label",ph:"공간 이름",w:2},{p:"note",ph:"위치 · 예: 2F",w:1},{p:"value",ph:"설명",w:3}],blank:{label:"",value:"",note:""}},
 team:{t:"list",l:"코치",max:4,add:"코치 추가",parts:[{p:"name",ph:"이름",w:1},{p:"role",ph:"역할",w:2},{p:"tag",ph:"전문 분야·자격",w:3}],blank:{name:"",role:"",tag:""}},
 faq:{t:"list",l:"질문과 답",max:4,add:"질문 추가",parts:[{p:"q",ph:"질문",w:3},{p:"a",ph:"답변",w:3,area:1}],blank:{q:"",a:""}},
 bullets:{t:"strs",l:"불릿",max:3,add:"불릿 추가"},
 conds:{t:"strs",l:"사용 조건",max:4,add:"조건 추가"},
 tips:{t:"strs",l:"팁",max:4,area:1,rich:1,add:"팁 추가"},
 tags:{t:"chips",l:"태그",max:4},
 chips:{t:"muscle",l:"운동 부위",h:"누른 부위가 바디맵에서 레드로 켜져요"},
 ccta:{t:"text",l:"하단 바 문구"},
 cta:{t:"text",l:"버튼 문구"},
 page:{t:"num",l:"이 장 번호",min:1,max:10},
 total:{t:"num",l:"전체 장 수",min:2,max:10},
 source:{t:"text",l:"출처"},
 footnote:{t:"text",l:"하단 안내"},
 date:{t:"text",l:"날짜"},
 valid:{t:"text",l:"유효기간"},
 code:{t:"text",l:"쿠폰 코드",h:"비우면 안 보여요"}};
const LBL={
 coach:{photoBg:"코치 사진",headline:"코치 이름",sub:"한 줄 소개",tags:"전문 분야",metrics:"숫자 3개"},
 review:{photoBg:"후기 사진 (회원 사진)"},review2:{photoBg:"후기 사진 (회원 사진)"},
 reviewCover:{photoCut:"코치 누끼 PNG"},reviewCover2:{photoCut:"코치 누끼 PNG"},wideReview:{photoCut:"코치 누끼 PNG",quotes:"대표 한마디 (첫 번째만 보여요)"},
 beforeAfter:{photoBg:"비포 사진",photoBg2:"애프터 사진"},
 facility:{photoBg:"시설 사진"},team:{photoBg:"단체 사진 (선택)"},mono:{tags:"프로그램 이름"},
 quote:{headline:"문장",sub:"출처·이름",kicker:"하단 라벨"},
 xbanner:{bullets:"혜택 목록",rows:"가격"},xbannerBold:{photoCut:"인물 누끼 PNG (선택)"},
 move:{headline:"슬로건"},lift:{kicker:"작은 문구 (국문 가능)"},
 schedule:{rows:"시간표 (시간 · 수업 · 요일)"},notice:{rows:"안내 표"},wideNotice:{rows:"안내 표"},
 price:{rows:"가격 (항목 · 가격 · 혜택)"},widePrice:{rows:"가격 (항목 · 가격 · 혜택)"},
 wideInfo:{metrics:"숫자 카드 (첫 장이 레드)"},summary:{metrics:"숫자 카드 (첫 장이 레드)"},rings:{metrics:"숫자 카드 (양옆 2장)"}};
const DEFP={review:{bg:DEF_PHOTO},review2:{bg:DEF_PHOTO},reviewCover:{cut:DEF_CUT},reviewCover2:{cut:DEF_CUT},wideReview:{cut:DEF_CUT}};
const MONO_AUTO=["rings","facility","team","coach","move","rhythm","xbanner","wideBold","xbannerBold"],MONO_ALWAYS=["lift","fog","mono"];
const ALLKEYS=Object.keys(F);

/* ---------- poster ---------- */
function poster(key,fk,exporting){const t=T[key],f=FORMATS[fk];C=cv(key);const dark=(t.m==="bold")||S.theme==="dark";
 return `<div class="pc${dark?" dark":""}${exporting?" exporting":""}" style="width:${f.w}px;height:${f.h}px">${t.f(f.h,f.w)}<div class="grain"></div></div>`;}

/* ---------- format & theme UI ---------- */
function fmtIcon(f){const r=f.w/f.h,h=r<1?15:11,w=Math.max(5,Math.min(24,Math.round(h*r)));return `<i style="width:${w}px;height:${h}px"></i>`;}
$("#fmts").innerHTML=FGROUPS.map(([g,ks])=>`<span class="gl">${g}</span>`+ks.map(k=>`<button type="button" class="fchip" data-v="${k}" aria-pressed="false" title="${esc(FORMATS[k].d)}">${fmtIcon(FORMATS[k])}${esc(FORMATS[k].n)}</button>`).join("")).join("");
function pickFor(sh){const t=T[S.tpl];if(t.pair&&t.pair[sh]&&shapeOf(t.pair[sh])===sh)return t.pair[sh];
 const cand=ORDER.filter(k=>shapeOf(k)===sh);return cand.find(k=>T[k].cat===t.cat)||(S.last[sh]&&shapeOf(S.last[sh])===sh?S.last[sh]:cand[0]);}
function setFmt(fk){if(!FORMATS[fk]||fk===S.fmt)return;const sh=FORMATS[fk].s,old=shapeOf(S.tpl);
 if(old!==sh){S.last[old]=S.tpl;S.tpl=S.last[sh]&&shapeOf(S.last[sh])===sh&&T[S.last[sh]].cat===T[S.tpl].cat?S.last[sh]:pickFor(sh);}
 S.fmt=fk;afterChange({fields:true,gallery:true});}
$("#fmts").addEventListener("click",e=>{const b=e.target.closest(".fchip");if(b)setFmt(b.dataset.v);});
function seg(id,fn){const el=$(id);el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;fn(b.dataset.v);});}
seg("#themeSeg",v=>{S.theme=v;afterChange({gallery:true});});
seg("#ftypeSeg",v=>{S.ftype=v;syncControls();});
seg("#resSeg",v=>{S.res=+v;syncControls();});
function syncControls(){
 $$("#fmts .fchip").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S.fmt));
 $$("#themeSeg button").forEach(b=>{b.setAttribute("aria-pressed",b.dataset.v===S.theme);b.disabled=T[S.tpl].m==="bold";});
 $$("#ftypeSeg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v===S.ftype));
 $$("#resSeg button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.v===S.res));
 const f=FORMATS[S.fmt];$("#fmtDesc").textContent=f.d+(T[S.tpl].m==="bold"?" · 이 템플릿은 다크 고정":"");
 $("#saveBtn").textContent=(S.ftype==="jpg"?"JPG":"PNG")+" 저장";
 $("#resNote").textContent=`저장 크기 ${f.w*S.res}×${f.h*S.res}px.`+(S.res>2&&f.s==="x"?" 휴대폰에서는 실패할 수 있어 PC 저장을 권해요.":"");
 $("#aiFmt").textContent=f.n;
 $("#allFields").checked=!!S.all;}

/* ---------- render ---------- */
let rt,gt;
function render(){
 const f=FORMATS[S.fmt],fit=$("#fit");
 const narrow=window.innerWidth<900,avail=Math.max(240,fit.clientWidth||600),maxH=narrow?Math.max(320,window.innerHeight*.52):Math.max(420,window.innerHeight-300);
 const sc=Math.min(avail/f.w,maxH/f.h,1);
 fit.innerHTML=`<div class="box" style="width:${Math.round(f.w*sc)}px;height:${Math.round(f.h*sc)}px">${poster(S.tpl,S.fmt)}</div>`;
 fit.querySelector(".pc").style.transform=`scale(${sc})`;
 $("#tplName").textContent=T[S.tpl].n;
 $("#tplMeta").textContent=`${T[S.tpl].d} · ${f.n}`;
 syncControls();shownNotes();}
function scheduleRender(){clearTimeout(rt);rt=setTimeout(render,90);}
function scheduleGallery(d){clearTimeout(gt);gt=setTimeout(renderGallery,d??500);}
function afterChange(o){o=o||{};if(o.fields||S.tpl!==edTpl)buildFields();render();if(o.gallery)renderGallery();else scheduleGallery();commit();}
let rz;window.addEventListener("resize",()=>{clearTimeout(rz);rz=setTimeout(()=>{render();renderGallery();},150);});

/* ---------- gallery ---------- */
function renderGallery(){if($("#tab-gallery").hidden)return;
 const f=FORMATS[S.fmt],sh=f.s,inShape=ORDER.filter(k=>shapeOf(k)===sh);
 const counts={all:inShape.length};inShape.forEach(k=>counts[T[k].cat]=(counts[T[k].cat]||0)+1);
 if(S.cat!=="all"&&!counts[S.cat])S.cat="all";
 $("#cats").innerHTML=CATS.filter(([k])=>counts[k]).map(([k,n])=>`<button type="button" data-v="${k}" aria-pressed="${k===S.cat}">${n} ${counts[k]}</button>`).join("");
 const list=inShape.filter(k=>S.cat==="all"||T[k].cat===S.cat),box=$("#thumbs"),tw=Math.max(120,(box.clientWidth-12)/2||160),sc=tw/f.w;
 $("#galInfo").textContent=`${f.n} 포맷 · ${SHAPE_N[sh]} 템플릿 ${inShape.length}개`;
 box.innerHTML=list.map(k=>`<button class="thumb" type="button" data-k="${k}" aria-pressed="${k===S.tpl}"><div class="box" style="width:${Math.round(tw)}px;height:${Math.round(f.h*sc)}px">${poster(k,S.fmt)}</div><div><span class="tn">${esc(T[k].n)}<span class="bd${T[k].m==="bold"?" b":""}">${T[k].m==="bold"?"DARK":"LIGHT"}</span></span><small>${esc(T[k].d)}</small></div></button>`).join("");
 box.querySelectorAll(".pc").forEach(p=>p.style.transform=`scale(${sc})`);}
$("#cats").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;S.cat=b.dataset.v;renderGallery();});
$("#thumbs").addEventListener("click",e=>{const b=e.target.closest(".thumb");if(!b)return;S.tpl=b.dataset.k;S.last[shapeOf(S.tpl)]=S.tpl;$$("#thumbs .thumb").forEach(x=>x.setAttribute("aria-pressed",x===b));afterChange({fields:true});});
$("#toEdit").addEventListener("click",()=>selectTab("edit"));
$("#toGallery").addEventListener("click",()=>selectTab("gallery"));

/* ---------- tabs ---------- */
function selectTab(id){$$(".tabs button").forEach(b=>{const on=b.dataset.tab===id;b.setAttribute("aria-selected",on);b.tabIndex=on?0:-1;});$$(".tabpanel").forEach(p=>p.hidden=p.id!=="tab-"+id);if(id==="gallery")renderGallery();}
$(".tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b)selectTab(b.dataset.tab);});
$(".tabs").addEventListener("keydown",e=>{if(!["ArrowLeft","ArrowRight"].includes(e.key))return;const bs=$$(".tabs button"),i=bs.findIndex(b=>b.getAttribute("aria-selected")==="true"),n=bs[(i+(e.key==="ArrowRight"?1:bs.length-1))%bs.length];selectTab(n.dataset.tab);n.focus();});

/* ---------- editor ---------- */
let edTpl=null;
const at=(k,i,p)=>`data-k="${k}"${i!=null?` data-i="${i}"`:""}${p?` data-p="${p}"`:""}`;
function meterTxt(v){const L=plain(v).split("\n").map(x=>x.trim()).filter(Boolean),mx=Math.max(0,...L.map(l=>l.length));return {t:`${L.length}줄 · 가장 긴 줄 ${mx}자`,warn:L.length>3||mx>13};}
const etb=(k)=>`<div class="etb" data-etb="${k}"><button type="button" class="r" data-act="emph" data-k="${k}" title="선택한 글자를 레드로 강조">강조</button><button type="button" data-act="unemph" data-k="${k}" title="이 칸의 강조를 모두 지우기">강조 지우기</button></div>`;
function partHTML(k,i,p,val){const a=at(k,i,p.p),w="w"+(p.w||3);
 if(p.range)return `<label class="rng ${w}">진행률 <output>${+val||0}%</output><input type="range" min="0" max="100" step="1" value="${+val||0}" ${a}></label>`;
 if(p.area)return `<textarea class="${w}" rows="2" ${a} placeholder="${esc(p.ph||"")}">${esc(val)}</textarea>`;
 const inp=`<input type="${p.url?"url":"text"}"${p.big?' class="big"':""} ${a} value="${esc(val)}" placeholder="${esc(p.ph||"")}"${p.url?' inputmode="url" autocomplete="off" spellcheck="false"':""}>`;
 return p.suffix?`<div class="sfx ${w}">${inp}<span>${esc(p.suffix)}</span></div>`:`<div class="${w}">${inp}</div>`;}
function itemTools(k,i,n,extra){return `<div class="ihead"><span class="inum">${pad2(i+1)}</span><div class="iact">${extra||""}<button type="button" class="mini" data-act="up" data-k="${k}" data-i="${i}" aria-label="위로" ${i?"":"disabled"}>↑</button><button type="button" class="mini" data-act="down" data-k="${k}" data-i="${i}" aria-label="아래로" ${i<n-1?"":"disabled"}>↓</button><button type="button" class="mini del" data-act="del" data-k="${k}" data-i="${i}" aria-label="삭제">✕</button></div></div>`;}
function addBtn(k,f,n){return n<f.max?`<button type="button" class="add" data-act="add" data-k="${k}">＋ ${esc(f.add||"추가")}</button>`:`<p class="fh">최대 ${f.max}개까지예요</p>`;}
function photoHTML(k,f,lb){const sl=f.slot,id=S.ph[sl],mine=id&&PH[id],def=DEFP[S.tpl]&&DEFP[S.tpl][sl],cut=sl==="cut";
 const thumb=mine?`background-image:url('${PH[id].o}')`:def?`background-image:${def}`:"";
 const monoUI=sl!=="cut"&&MONO_AUTO.includes(S.tpl)?`<label class="chk" style="margin-top:6px"><input type="checkbox" data-act="mono" ${S.mono?"checked":""}> 흑백·대비 보정</label>`:sl!=="cut"&&MONO_ALWAYS.includes(S.tpl)?`<small>이 템플릿에서는 흑백으로 바뀌어요</small>`:"";
 return `<div class="fld" data-fk="${k}"><div class="fhead"><span class="fl">${esc(lb)}</span></div>${f.h&&cut?`<p class="fh">${esc(f.h)}</p>`:""}<div class="phf"><span class="pthumb${cut?" cut":""}" style="${thumb}">${mine||def?"":"없음"}</span><div class="pinfo"><b>${mine?esc(PH[id].name||"올린 사진"):def?"기본 예시 사진":"사진 없음 · 기본 그래픽"}</b><small>${cut?"투명 배경 PNG·WEBP":"JPG·PNG · 회원 얼굴은 미리 블러 처리"}</small><div class="go" style="gap:8px;margin-top:6px"><label class="btn ghost sm phbtn">${mine?"다른 사진으로":"사진 올리기"}<input type="file" data-photo="${sl}" accept="${cut?"image/png,image/webp":"image/*"}"></label>${mine?`<button type="button" class="x" data-act="phreset" data-slot="${sl}">${def?"기본 사진으로":"사진 빼기"}</button>`:""}</div>${monoUI}</div></div></div>`;}
function fieldHTML(k){const f=F[k],V=cv(S.tpl),v=V[k],lb=(LBL[S.tpl]&&LBL[S.tpl][k])||f.l,id="f_"+k;let body="",head="";
 if(f.t==="photo")return photoHTML(k,f,lb);
 switch(f.t){
  case "text":body=`<input type="text" id="${id}" ${at(k)} value="${esc(v)}">`;break;
  case "area":body=`<textarea id="${id}" ${at(k)} rows="${f.rows||3}">${esc(v)}</textarea>`;break;
  case "num":body=`<div class="step"><button type="button" class="mini" data-act="dec" data-k="${k}" aria-label="${esc(f.l)} 줄이기">−</button><input type="text" inputmode="numeric" id="${id}" ${at(k)} value="${esc(v)}"><button type="button" class="mini" data-act="inc" data-k="${k}" aria-label="${esc(f.l)} 늘리기">＋</button></div>`;break;
  case "rating":body=`<div class="stars" role="group" aria-label="별점">${[1,2,3,4,5].map(n=>`<button type="button" data-act="rate" data-k="${k}" data-v="${n}" aria-pressed="${+v>=n}" aria-label="${n}점">★</button>`).join("")}<span>${esc(v)}.0</span></div>`;break;
  case "obj":body=`<div class="pgrid">${f.parts.map(p=>partHTML(k,null,p,v[p.p]??"")).join("")}</div>`;break;
  case "list":body=v.map((it,i)=>{const hi=f.star&&isStar(it);return `<div class="item${hi?" hi":""}" data-li="${i}">${itemTools(k,i,v.length,f.star?`<button type="button" class="pin" data-act="star" data-k="${k}" data-i="${i}" aria-pressed="${hi}">${hi?"★ 강조됨":"☆ 강조"}</button>`:"")}<div class="pgrid">${f.parts.map(p=>partHTML(k,i,p,(f.star&&p.p==="label")?plain(it.label):(it[p.p]??""))).join("")}</div></div>`}).join("")+addBtn(k,f,v.length);break;
  case "strs":body=v.map((s,i)=>`<div class="item" data-li="${i}">${itemTools(k,i,v.length)}${f.area?`<textarea rows="2" ${at(k,i)}>${esc(s)}</textarea>`:`<input type="text" ${at(k,i)} value="${esc(s)}">`}</div>`).join("")+addBtn(k,f,v.length);break;
  case "chips":body=`<div class="chipbox">${v.map((c,i)=>`<span class="chip${i?"":" first"}">${esc(c)}<button type="button" data-act="del" data-k="${k}" data-i="${i}" aria-label="${esc(c)} 빼기">✕</button></span>`).join("")}${v.length<f.max?`<input type="text" class="chipin" data-chipin="${k}" placeholder="입력 후 Enter" aria-label="${esc(lb)} 추가">`:""}</div>`;break;
  case "muscle":body=`<div class="mus">${MUSCLES.map(m=>{const on=v.some(c=>c.label===m&&c.on);return `<button type="button" data-act="mus" data-k="${k}" data-v="${m}" aria-pressed="${on}">${on?"✓ ":""}${m}</button>`}).join("")}</div>`;break;}
 if(f.fit){const m=meterTxt(v);head+=`<span class="meter${m.warn?" warn":""}" id="m_${k}">${m.t}</span>`;}
 if(f.rich)head+=etb(k);
 return `<div class="fld" data-fk="${k}"><div class="fhead"><label class="fl"${["text","area","num"].includes(f.t)?` for="${id}"`:""}>${esc(lb)}</label>${head}</div>${f.h?`<p class="fh">${esc(f.h)}</p>`:""}${body}</div>`;}
const MUSCLES=["어깨","가슴","등","삼두","이두","복근","하체"];
function buildFields(){edTpl=S.tpl;const keys=S.all?ALLKEYS:(USES[S.tpl]||[]);const y=$("#fields").scrollTop;
 $("#edName").textContent=T[S.tpl].n;$("#edCount").textContent=S.all?`모든 항목 ${keys.length}개`:`이 템플릿에 쓰는 항목 ${keys.length}개 · 미리보기 순서`;
 $("#fields").innerHTML=keys.map(fieldHTML).join("");$("#fields").scrollTop=y;
 const ex=(USES[S.tpl]||[]).some(k=>F[k].t!=="photo"&&isSample(k));$("#sampleNote").textContent=ex?"처음 내용은 예시예요. 실제 정보로 바꿔 주세요.":"";}
function shownNotes(){$$("#fields .fld").forEach(fl=>{const k=fl.dataset.fk,f=F[k];if(!f||(f.t!=="list"&&f.t!=="strs"))return;
 const ids=new Set([...$("#fit").querySelectorAll(`[data-f="${k}"][data-i]`)].map(e=>e.dataset.i)),n=(cv(S.tpl)[k]||[]).length;
 let note=fl.querySelector(".cnt");if(ids.size&&ids.size<n){if(!note){note=document.createElement("p");note.className="fh cnt";fl.querySelector(".fhead").after(note);}note.textContent=`이 포맷 미리보기에는 앞의 ${ids.size}개만 보여요.`;}else if(note)note.remove();});}
$("#fields").addEventListener("input",e=>{const el=e.target,k=el.dataset.k;if(!k||!F[k])return;const f=F[k],i=el.dataset.i,p=el.dataset.p,v=el.value;
 if(f.t==="list"){const it=own(k)[+i];if(f.star&&p==="label")it.label=(isStar(it)?"*":"")+v;else it[p]=v;}
 else if(f.t==="strs")own(k)[+i]=v;
 else if(f.t==="obj"){own(k)[p]=p==="progress"?+v:v;if(p==="progress"){const o=el.parentElement.querySelector("output");if(o)o.textContent=v+"%";}}
 else S.c[k]=v;
 if(f.fit){const m=meterTxt(v),me=$("#m_"+k);if(me){me.textContent=m.t;me.classList.toggle("warn",m.warn);}}
 scheduleRender();scheduleGallery(700);commit();});
function emph(el,on,fl){const v=el.value;
 if(!on){el.value=v.replace(/\*/g,"");}
 else{const a=el.selectionStart,b=el.selectionEnd;if(a===b){tip(fl,"강조할 글자를 먼저 드래그해서 선택한 뒤 눌러 주세요.");return;}
  const sel=v.slice(a,b).replace(/\*/g,"");el.value=v.slice(0,a)+"*"+sel+"*"+v.slice(b);el.focus();el.setSelectionRange(a,a+sel.length+2);}
 el.dispatchEvent(new Event("input",{bubbles:true}));}
function tip(fl,msg){let t=fl.querySelector(".tipmsg");if(!t){t=document.createElement("p");t.className="fh tipmsg";t.style.color="var(--accent-ink)";fl.querySelector(".fhead").after(t);}t.textContent=msg;clearTimeout(t._t);t._t=setTimeout(()=>t.remove(),3500);}
let lastInp=null;
$("#fields").addEventListener("focusin",e=>{if(e.target.matches("input[type=text],textarea"))lastInp=e.target;});
$("#fields").addEventListener("mousedown",e=>{if(e.target.closest(".etb button"))e.preventDefault();});
function moveIt(a,i,d){const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];}
$("#fields").addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b||b.matches("input[type=checkbox]"))return;const k=b.dataset.k,i=+b.dataset.i,act=b.dataset.act,f=F[k];
 if(act==="emph"||act==="unemph"){const fl=b.closest(".fld");let el=lastInp&&fl.contains(lastInp)?lastInp:fl.querySelector("textarea,input[type=text]");if(el)emph(el,act==="emph",fl);return;}
 if(act==="add"){const a=own(k);if(a.length>=f.max)return;a.push(f.blank?clone(f.blank):"");}
 else if(act==="del")own(k).splice(i,1);
 else if(act==="up"||act==="down")moveIt(own(k),i,act==="up"?-1:1);
 else if(act==="star"){const r=own(k)[i];r.label=isStar(r)?r.label.slice(1):"*"+r.label;}
 else if(act==="rate")S.c[k]=b.dataset.v;
 else if(act==="inc"||act==="dec"){const cur=parseInt(cv(S.tpl)[k])||f.min;S.c[k]=String(Math.max(f.min,Math.min(f.max,cur+(act==="inc"?1:-1))));}
 else if(act==="phreset"){S.ph[b.dataset.slot]=null;}
 else if(act==="mus"){const m=b.dataset.v,a=own(k),c=a.find(x=>x.label===m);if(c)c.on=!c.on;else a.push({label:m,on:true});a.sort((x,y)=>MUSCLES.indexOf(x.label)-MUSCLES.indexOf(y.label));}
 else return;
 buildFields();render();scheduleGallery();commit();
 if(act==="add"){const n=S.c[k].length-1,el=$("#fields").querySelector(`[data-k="${k}"][data-i="${n}"]:is(input,textarea)`);if(el)el.focus();}
 else if(act==="up"||act==="down"){const j=i+(act==="up"?-1:1),el=$("#fields").querySelector(`button[data-act="${act}"][data-k="${k}"][data-i="${j}"]`);if(el&&!el.disabled)el.focus();}});
$("#fields").addEventListener("keydown",e=>{const k=e.target.dataset&&e.target.dataset.chipin;if(!k||e.isComposing)return;
 if(e.key==="Enter"||e.key===","){e.preventDefault();const v=e.target.value.trim().replace(/,$/,"");if(!v)return;const a=own(k);if(a.length<F[k].max)a.push(v);buildFields();render();scheduleGallery();commit();const n=$(`[data-chipin="${k}"]`);if(n)n.focus();}
 else if(e.key==="Backspace"&&!e.target.value){const a=own(k);if(a.length){a.pop();buildFields();render();commit();const n=$(`[data-chipin="${k}"]`);if(n)n.focus();}}});
$("#fields").addEventListener("change",async e=>{const el=e.target;
 if(el.dataset.act==="mono"){S.mono=el.checked;render();scheduleGallery();commit();return;}
 const sl=el.dataset.photo;if(!sl)return;const file=el.files&&el.files[0];if(!file)return;
 try{const id=await addPhoto(file,sl==="cut");S.ph[sl]=id;buildFields();render();scheduleGallery();commit();}
 catch(err){const fl=el.closest(".fld");tip(fl,"사진을 읽지 못했어요. JPG나 PNG로 바꿔서 올려 주세요. (아이폰: 설정 › 카메라 › 포맷 › 호환성 우선)");}
 el.value="";});
$("#allFields").addEventListener("change",e=>{S.all=e.target.checked;buildFields();});

/* 미리보기를 누르면 그 칸으로 */
function goField(k,i){if(!F[k])return;selectTab("edit");if(!(USES[S.tpl]||[]).includes(k)&&!S.all){S.all=true;syncControls();buildFields();}
 const fl=$(`#fields .fld[data-fk="${k}"]`);if(!fl)return;fl.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
 fl.classList.remove("flash");void fl.offsetWidth;fl.classList.add("flash");
 const el=(i!=null&&fl.querySelector(`[data-i="${i}"]:is(input,textarea)`))||fl.querySelector("input[type=text],input[type=url],textarea");if(el)el.focus({preventScroll:true});}
$("#fit").addEventListener("click",e=>{const el=e.target.closest("[data-f]");if(el)goField(el.dataset.f,el.dataset.i);});

/* ---------- photos ---------- */
function makeMono(src,alpha){return new Promise((res,rej)=>{const im=new Image();im.onerror=rej;im.onload=()=>{
 const max=1800,s=Math.min(1,max/Math.max(im.width,im.height)),w=Math.round(im.width*s),h=Math.round(im.height*s);
 const cv_=document.createElement("canvas");cv_.width=w;cv_.height=h;const x=cv_.getContext("2d");x.drawImage(im,0,0,w,h);
 const fmt=alpha?"image/png":"image/jpeg",o=cv_.toDataURL(fmt,.9);
 const d=x.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){let g=.299*p[i]+.587*p[i+1]+.114*p[i+2];g=(g-128)*1.25+128;g=g<0?0:g>255?255:g;p[i]=p[i+1]=p[i+2]=g;}
 x.putImageData(d,0,0);res([o,cv_.toDataURL(fmt,.9)]);};im.src=src;});}
function readFile(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>res(fr.result);fr.readAsDataURL(file);});}
function phCss(){let st=$("#phvars");if(!st){st=document.createElement("style");st.id="phvars";document.head.appendChild(st);}
 st.textContent=":root{"+Object.keys(PH).map(id=>`--p-${id}-o:url("${PH[id].o}");--p-${id}-m:url("${PH[id].m}");`).join("")+"}";}
async function addPhoto(file,alpha,name){const src=typeof file==="string"?file:await readFile(file);const [o,m]=await makeMono(src,alpha);
 const id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);PH[id]={o,m,name:name||(file&&file.name)||"사진",alpha:!!alpha};phCss();return id;}
async function putPhoto(id,rec){if(PH[id])return;const [o,m]=await makeMono(rec.o,rec.alpha);PH[id]={o,m,name:rec.name,alpha:rec.alpha};}

/* ---------- storage (IndexedDB) ---------- */
const DB={p:null,open(){if(!this.p)this.p=new Promise((res,rej)=>{try{const r=indexedDB.open("spoany-studio",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e)}});return this.p;},
 async get(k){const db=await this.open();return new Promise((res,rej)=>{const q=db.transaction("kv").objectStore("kv").get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});},
 async set(k,v){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction("kv","readwrite");t.objectStore("kv").put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}};
const snapObj=()=>({tpl:S.tpl,fmt:S.fmt,theme:S.theme,mono:S.mono,ph:Object.assign({},S.ph),c:S.c});
const snap=()=>JSON.stringify(snapObj());
function photosOf(ph){const o={};Object.values(ph||{}).forEach(id=>{if(id&&PH[id])o[id]={o:PH[id].o,name:PH[id].name,alpha:PH[id].alpha};});return o;}
async function applySnap(o,photos){if(photos)for(const id in photos){try{await putPhoto(id,photos[id]);}catch(e){}}phCss();
 S.tpl=T[o.tpl]?o.tpl:S.tpl;S.fmt=FORMATS[o.fmt]?o.fmt:S.fmt;if(shapeOf(S.tpl)!==FORMATS[S.fmt].s)S.tpl=ORDER.find(k=>shapeOf(k)===FORMATS[S.fmt].s);
 S.theme=o.theme==="dark"?"dark":"light";S.mono=o.mono!==false;S.ph={bg:null,cut:null,bg2:null};for(const sl in S.ph){const id=o.ph&&o.ph[sl];S.ph[sl]=id&&PH[id]?id:null;}
 S.c=Object.assign(clone(SAMPLE),o.c||{});}
let svT,canStore=true;
function autosave(){clearTimeout(svT);svT=setTimeout(async()=>{if(!canStore)return;try{await DB.set("autosave",{v:3,at:Date.now(),snap:snapObj(),photos:photosOf(S.ph)});
 const d=new Date();$("#savedMeta").textContent=`자동 저장됨 ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
 catch(e){canStore=false;$("#savedMeta").textContent="이 브라우저에서는 자동 저장이 안 돼요";}},700);}

/* ---------- history (되돌리기) ---------- */
const H={st:[],i:-1};let ct=null;
function commitNow(){ct=null;const s=snap();if(H.st[H.i]===s)return;H.st=H.st.slice(0,H.i+1);H.st.push(s);if(H.st.length>100)H.st.shift();H.i=H.st.length-1;histUI();autosave();}
function commit(){clearTimeout(ct);ct=setTimeout(commitNow,400);}
function flush(){if(ct){clearTimeout(ct);commitNow();}}
function histUI(){$("#undoBtn").disabled=H.i<=0;$("#redoBtn").disabled=H.i>=H.st.length-1;}
async function restoreSnap(s){await applySnap(JSON.parse(s));buildFields();render();renderGallery();histUI();autosave();}
function undo(){flush();if(H.i<=0)return;H.i--;restoreSnap(H.st[H.i]);}
function redo(){flush();if(H.i>=H.st.length-1)return;H.i++;restoreSnap(H.st[H.i]);}
$("#undoBtn").addEventListener("click",undo);$("#redoBtn").addEventListener("click",redo);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"){if(!$("#drawer").hidden)toggleDrawer(false);if(!$("#saveOpts").hidden)togglePop(false);return;}
 if(!(e.ctrlKey||e.metaKey))return;const k=e.key.toLowerCase();if(k!=="z"&&k!=="y")return;
 const t=e.target;if(t&&t.matches&&t.matches("input[type=text],input[type=url],input[type=password],textarea"))return;
 e.preventDefault();if(k==="y"||e.shiftKey)redo();else undo();});

/* ---------- 보관함 ---------- */
function toggleDrawer(on){const d=$("#drawer");on=on??d.hidden;d.hidden=!on;$("#boxBtn").setAttribute("aria-expanded",on);if(on){listDrafts();const n=$("#draftName");n.value=defaultName();n.focus();n.select();}}
function defaultName(){return `${lines(cv(S.tpl).headline||"")[0]||T[S.tpl].n} · ${T[S.tpl].n}`.slice(0,40);}
$("#boxBtn").addEventListener("click",()=>toggleDrawer());$("#drawerClose").addEventListener("click",()=>toggleDrawer(false));
async function getDrafts(){try{return (await DB.get("drafts"))||[]}catch(e){return null}}
async function listDrafts(){const L=await getDrafts(),box=$("#draftList");
 if(L===null){box.innerHTML=`<div class="empty">이 브라우저에서는 보관함을 쓸 수 없어요.</div>`;return;}
 box.innerHTML=L.length?L.map(d=>{const dt=new Date(d.at);return `<div class="ditem" data-id="${d.id}"><div><b>${esc(d.name)}</b><small>${esc(T[d.snap.tpl]?T[d.snap.tpl].n:"")} · ${esc(FORMATS[d.snap.fmt]?FORMATS[d.snap.fmt].n:"")} · ${dt.getMonth()+1}/${dt.getDate()} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}</small></div><div class="go" style="flex:none;gap:6px"><button class="btn ghost sm" type="button" data-dact="load">불러오기</button><button class="x" type="button" data-dact="del">삭제</button></div></div>`}).join(""):`<div class="empty">아직 보관한 작업이 없어요.<br>위에 이름을 쓰고 '보관'을 누르면 지금 화면이 저장돼요.</div>`;}
$("#draftSave").addEventListener("click",async()=>{flush();const L=await getDrafts();if(L===null)return;const name=$("#draftName").value.trim()||defaultName();
 L.unshift({id:"d"+Date.now().toString(36),name,at:Date.now(),snap:snapObj(),photos:photosOf(S.ph)});try{await DB.set("drafts",L.slice(0,40));}catch(e){}listDrafts();$("#draftName").value="";});
$("#draftList").addEventListener("click",async e=>{const b=e.target.closest("[data-dact]");if(!b)return;const it=b.closest(".ditem"),id=it.dataset.id,L=await getDrafts();if(!L)return;const d=L.find(x=>x.id===id);if(!d)return;
 if(b.dataset.dact==="load"){flush();await applySnap(d.snap,d.photos);buildFields();render();renderGallery();commitNow();toggleDrawer(false);selectTab("edit");setSaveStatus(`'${d.name}'을 불러왔어요. 되돌리기로 이전 화면으로 돌아갈 수 있어요.`);}
 else if(b.dataset.dact==="del"){it.innerHTML=`<div class="confirm" style="width:100%">'${esc(d.name)}'을 지울까요? <button class="btn primary sm" type="button" data-dact="delyes">지우기</button><button class="x" type="button" data-dact="delno">취소</button></div>`;}
 else if(b.dataset.dact==="delyes"){try{await DB.set("drafts",L.filter(x=>x.id!==id));}catch(e){}listDrafts();}
 else if(b.dataset.dact==="delno")listDrafts();});
$("#newWrap").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const w=$("#newWrap");
 if(b.id==="newBtn")w.innerHTML=`<div class="confirm">지금 화면 내용이 예시로 바뀌어요. 필요하면 먼저 보관해 두세요. <button class="btn primary sm" type="button" id="newYes">새로 시작</button><button class="x" type="button" id="newNo">취소</button></div>`;
 else if(b.id==="newYes"){flush();S.c=clone(SAMPLE);S.ph={bg:null,cut:null,bg2:null};S.theme="light";S.mono=true;buildFields();render();renderGallery();commitNow();toggleDrawer(false);selectTab("gallery");setSaveStatus("예시 내용으로 새로 시작했어요. 되돌리기로 돌아갈 수 있어요.");}
 if(b.id!=="newBtn")w.innerHTML=`<button class="btn ghost sm" type="button" id="newBtn">예시 내용으로 새로 시작</button>`;});

//@@PLATFORM

/* ---------- AI 제작 ---------- */
const EX=["회원 후기 카드뉴스: (네이버 후기 원문을 붙여넣기)","12월 운영시간 공지, 25일 휴관","PT 1회 무료 체험 쿠폰, 12월 31일까지","헬스 초보 FAQ 3개","GX 요가·필라테스 주간 시간표","금요일 상체 루틴 5가지","출석 챌린지: 주 5회, 완주 시 굿즈","매장 TV용 가로 혜택 배너"];
$("#examples").innerHTML=EX.map(x=>`<button type="button">${esc(x)}</button>`).join("");
$("#examples").addEventListener("click",e=>{const b=e.target.closest("button");if(b){$("#prompt").value=b.textContent;$("#prompt").focus();}});
function setStatus(m,cls){const st=$("#status");st.className="status"+(cls?" "+cls:"");st.textContent=m;}
function setSaveStatus(m,cls){const st=$("#saveStatus");st.className="status"+(cls?" "+cls:"");st.textContent=m;}
function aiState(){const ok=PLATFORM.ready();$("#goBtn").textContent=ok?"Claude로 제작":(PLATFORM.kind==="web"?"API 키 넣고 제작":"Claude로 제작");$("#t-ai").classList.toggle("dot",PLATFORM.kind==="web"&&!ok);if(!$("#status").textContent)setStatus("요청을 쓰고 제작을 누르면 카피·숫자·템플릿을 새로 짜요.");}
function fieldSchema(){return ALLKEYS.filter(k=>F[k].t!=="photo").map(k=>{const f=F[k];let t="";
 switch(f.t){case "text":case "area":t="문자열";break;case "num":t=`숫자 문자열 ${f.min}~${f.max}`;break;case "rating":t='"1"~"5"';break;
  case "obj":t="{"+f.parts.map(p=>p.p+(p.range?":0-100 숫자":"")).join(",")+"}";break;case "list":t="[{"+f.parts.map(p=>p.p).join(",")+"}] 최대 "+f.max+(f.star?" (추천 행은 label 앞에 *)":"");break;
  case "strs":case "chips":t="[문자열] 최대 "+f.max;break;case "muscle":t='[{label:"어깨|가슴|등|삼두|이두|복근|하체",on:true/false}]';break;}
 return `${k}: ${t} — ${f.l}`;}).join("\n");}
function buildPrompt(req){const f=FORMATS[S.fmt],ks=ORDER.filter(k=>shapeOf(k)===f.s);
 const tdesc=ks.map(k=>`- ${k}: ${T[k].n} (${T[k].d}) · 쓰는 칸: ${(USES[k]||[]).filter(x=>F[x].t!=="photo").join(", ")}`).join("\n");
 return `너는 '스포애니 신중동점'(헬스장) 홍보물 카피라이터 겸 디자이너다. 디자인 시스템 'Spoany Pulse' 규칙:
- 목소리: 짧고 담백하게, 기록하듯. 느낌표·이모지·"특가!!" 금지. 숫자는 쉼표와 단위로 정확히(297,000원, 06:00–24:00).
- 헤드라인은 2~3줄, 줄마다 12자 이내, 줄바꿈은 \\n. 강조할 단어 딱 하나만 *별표*로 감싼다(레드). 조사에서 줄을 나누지 않는다.
- word는 영문 대문자 1~2단어. kicker는 영문 대문자 라벨.
- 요청에 없는 가격·날짜·사실·사람 이름·링크를 지어내지 말 것. 모르면 그 칸은 답에서 빼서 현재 값을 유지한다.
- 회원 후기 원문은 고쳐 쓰지 말고 그대로 쓴다(이모지만 뺀다). 비포·애프터 수치는 요청에 있을 때만 넣는다.

지금 포맷: ${f.n} (${f.d})
고를 수 있는 템플릿:
${tdesc}

칸 형식:
${fieldSchema()}

현재 내용(JSON):
${JSON.stringify(Object.assign({template:S.tpl},cv(S.tpl)))}

요청: ${req}

JSON 객체 하나만 답하라. {"template": "위 목록의 키", 그리고 바꿀 칸만}`;}
function cleanVal(k,v){const f=F[k],str=(x,n)=>String(x??"").slice(0,n||200);
 switch(f.t){case "text":case "area":return (typeof v==="string"||typeof v==="number")?str(v,k==="review"?900:240):undefined;
  case "num":{const n=parseInt(v);return isNaN(n)?undefined:String(Math.max(f.min,Math.min(f.max,n)));}
  case "rating":{const n=Math.round(+v);return n>=1&&n<=5?String(n):undefined;}
  case "obj":{if(!v||typeof v!=="object")return;const o=Object.assign({},cv(S.tpl)[k]);f.parts.forEach(p=>{if(v[p.p]!=null)o[p.p]=p.range?Math.max(0,Math.min(100,+v[p.p]||0)):str(v[p.p]);});return o;}
  case "list":if(!Array.isArray(v))return;return v.slice(0,f.max).map(it=>{const o={};f.parts.forEach(p=>o[p.p]=str(it&&it[p.p]));return o;});
  case "strs":case "chips":if(!Array.isArray(v))return;return v.slice(0,f.max).map(x=>str(x,120));
  case "muscle":if(!Array.isArray(v))return;return v.slice(0,7).filter(x=>x&&MUSCLES.includes(x.label)).map(x=>({label:x.label,on:!!x.on}));}}
const ERR={no_key:null,bad_key:"API 키가 맞지 않아요. 아래 설정에서 키를 다시 확인해 주세요.",network:"인터넷 연결을 확인하고 다시 시도해 주세요.",overloaded:"Claude 서버가 바빠요. 잠시 후 다시 눌러 주세요.",rate_limited:"요청이 많아요. 잠시 후 다시 눌러 주세요.",cancelled:"멈췄어요.",not_granted:"Claude 사용을 허용하지 않아서 제작하지 못했어요. 내용은 직접 고칠 수 있어요.",unavailable:"이 화면에서는 Claude 제작을 쓸 수 없어요. '내용 편집'에서 직접 고쳐 주세요."};
let ctl=null;
$("#askForm").addEventListener("submit",async e=>{e.preventDefault();
 if(!PLATFORM.ready()){setStatus(PLATFORM.notReady,"err");PLATFORM.openSettings();return;}
 const req=$("#prompt").value.trim();if(!req){$("#prompt").focus();return;}
 flush();ctl=new AbortController();$("#goBtn").disabled=true;$("#stopBtn").hidden=false;setStatus("Claude가 카피와 레이아웃을 짜는 중… (보통 10~40초)");
 try{const o=await PLATFORM.ask(buildPrompt(req),{signal:ctl.signal});if(!o||typeof o!=="object")throw{code:"bad"};
  let n=0;for(const k in o){if(!F[k]||F[k].t==="photo")continue;const v=cleanVal(k,o[k]);if(v!==undefined){S.c[k]=v;n++;}}
  if(T[o.template]&&shapeOf(o.template)===FORMATS[S.fmt].s){S.tpl=o.template;S.last[shapeOf(S.tpl)]=S.tpl;}
  buildFields();render();renderGallery();commitNow();setStatus(`완성 — ${T[S.tpl].n} 템플릿, ${n}개 칸을 채웠어요. '내용 편집'에서 고치거나 되돌리기로 돌아갈 수 있어요.`,"ok");}
 catch(err){setStatus(ERR[err&&err.code]||"제작하지 못했어요. 요청을 조금 더 구체적으로 써서 다시 시도해 주세요.","err");}
 finally{$("#goBtn").disabled=false;$("#stopBtn").hidden=true;}});
$("#stopBtn").addEventListener("click",()=>ctl&&ctl.abort());

/* ---------- 저장 ---------- */
function togglePop(on){const p=$("#saveOpts");on=on??p.hidden;p.hidden=!on;$("#saveOpt").setAttribute("aria-expanded",on);}
$("#saveOpt").addEventListener("click",e=>{e.stopPropagation();togglePop();});
document.addEventListener("click",e=>{if(!$("#saveOpts").hidden&&!e.target.closest(".savewrap"))togglePop(false);if(!$("#drawer").hidden&&!e.target.closest("#drawer")&&!e.target.closest("#boxBtn"))toggleDrawer(false);});
function dataURLtoBlob(u){const [h,b]=u.split(","),mime=(h.match(/:(.*?);/)||[])[1]||"image/png",bin=atob(b),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime});}
async function renderBlob(pr){const f=FORMATS[S.fmt],ex=$("#exp");ex.innerHTML=poster(S.tpl,S.fmt,true);const node=ex.firstElementChild;
 try{await document.fonts.ready;
  if(window.htmlToImage){const opt={width:f.w,height:f.h,pixelRatio:pr,cacheBust:false};
   if(S.ftype==="jpg"){opt.backgroundColor="#ffffff";opt.quality=.92;await htmlToImage.toJpeg(node,opt);return dataURLtoBlob(await htmlToImage.toJpeg(node,opt));}
   await htmlToImage.toBlob(node,opt);const b=await htmlToImage.toBlob(node,opt);if(!b)throw new Error("empty");return b;}
  if(window.html2canvas){const cvs=await html2canvas(node,{scale:pr,width:f.w,height:f.h,backgroundColor:null,logging:false});return await new Promise(r=>cvs.toBlob(r,S.ftype==="jpg"?"image/jpeg":"image/png",.92));}
  throw new Error("no renderer");}
 finally{ex.innerHTML="";}}
function stamp(){const d=new Date();return `${String(d.getFullYear()).slice(2)}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}`;}
$("#saveBtn").addEventListener("click",async()=>{if(PLATFORM.canSave&&!PLATFORM.canSave())return;togglePop(false);const b=$("#saveBtn");b.disabled=true;setSaveStatus("이미지를 그리는 중…");
 let pr=S.res,blob=null,note="";
 try{blob=await renderBlob(pr);}catch(e){if(pr>2){pr=2;note=" 큰 사이즈가 이 기기에서 실패해서 2배로 저장했어요.";try{blob=await renderBlob(pr);}catch(e2){blob=null}}}
 try{if(!blob)throw{code:"render"};const f=FORMATS[S.fmt],ext=S.ftype==="jpg"?"jpg":"png";
  await PLATFORM.save(blob,`spoany_${S.tpl}_${S.fmt}_${stamp()}.${ext}`);setSaveStatus(`저장했어요 · ${f.w*pr}×${f.h*pr}px ${ext.toUpperCase()}.${note} 유리 블러 같은 일부 효과는 조금 단순하게 나올 수 있어요.`,"ok");}
 catch(e){setSaveStatus(e&&e.code==="declined"?"저장을 취소했어요.":e&&e.code==="render"?"이미지를 만들지 못했어요. 사진 크기를 줄이거나 다른 브라우저에서 시도해 주세요.":"저장하지 못했어요. 다시 시도해 주세요.","err");}
 finally{b.disabled=false;}});
function textOf(k,v){const f=F[k];if(!f||f.t==="photo"||v==null)return "";
 switch(f.t){case "obj":return f.parts.filter(p=>!p.range).map(p=>plain(v[p.p])).filter(Boolean).join(" ");
  case "list":return v.map(it=>f.parts.map(p=>plain(it[p.p])).filter(Boolean).join(" · ")).join("\n");
  case "strs":case "chips":return v.map(plain).join("\n");case "muscle":return v.filter(x=>x.on).map(x=>x.label).join(", ");
  case "rating":return "별점 "+v+".0";default:return plain(v);}}
$("#copyBtn").addEventListener("click",async()=>{const V=cv(S.tpl),t=(USES[S.tpl]||[]).map(k=>textOf(k,V[k])).filter(Boolean).join("\n\n");
 try{await navigator.clipboard.writeText(t);setSaveStatus("이 템플릿의 문구를 복사했어요. 인스타 본문이나 블로그에 붙여넣으세요.","ok");}catch(e){setSaveStatus(t);}});

/* ---------- init ---------- */
(function injectAssets(){const st=document.createElement("style");st.textContent=`:root{--defcut:url("${ASSET.cut}");--defphoto:url("${ASSET.photo}");--logo:url("${ASSET.logo}");--logow:url("${ASSET.logow}")}`;document.head.appendChild(st);})();
PLATFORM.init();aiState();
(async function boot(){let restored=false;
 try{const a=await DB.get("autosave");if(a&&a.snap){await applySnap(a.snap,a.photos);restored=true;}}catch(e){canStore=false;}
 syncControls();buildFields();selectTab(restored?"edit":"gallery");render();commitNow();
 if(restored)setSaveStatus("지난 작업을 이어서 보여드려요. 처음부터 하려면 보관함 › 예시 내용으로 새로 시작.");
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{render();renderGallery();});})();
})();
