/* ---------- platform: 웹앱 (내 API 키로 Claude 호출 · 공유 시트/다운로드로 저장) ---------- */
const LS={get:k=>{try{return localStorage.getItem(k)||""}catch(e){return ""}},set:(k,v)=>{try{v?localStorage.setItem(k,v):localStorage.removeItem(k)}catch(e){}}};
const PLATFORM={kind:"web",
 notReady:"아래 'Claude API 설정'에 API 키를 넣고 저장하면 Claude로 제작할 수 있어요. 키 없이도 '내용 편집'으로 모두 만들 수 있어요.",
 init(){const key=$("#apiKey"),mdl=$("#apiModel");key.value=LS.get("spoany.key");mdl.value=LS.get("spoany.model")||"claude-sonnet-5-5";
  $("#keySave").addEventListener("click",()=>{LS.set("spoany.key",key.value.trim());LS.set("spoany.model",mdl.value);aiState();setStatus(LS.get("spoany.key")?"저장했어요. 이제 요청을 쓰고 제작을 눌러 보세요.":"키를 지웠어요.","ok");});
  $("#keyClear").addEventListener("click",()=>{key.value="";LS.set("spoany.key","");aiState();setStatus("키를 지웠어요.");});
  mdl.addEventListener("change",()=>LS.set("spoany.model",mdl.value));
  if(!LS.get("spoany.key"))$("#apiBox").open=true;},
 ready(){return !!LS.get("spoany.key")},
 openSettings(){const d=$("#apiBox");d.open=true;$("#apiKey").focus();},
 async ask(prompt,{signal}){const key=LS.get("spoany.key");if(!key)throw{code:"no_key"};let res;
  try{res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",signal,headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
   body:JSON.stringify({model:LS.get("spoany.model")||"claude-sonnet-5-5",max_tokens:4000,messages:[{role:"user",content:prompt+"\n\n다른 말 없이 JSON 객체 하나만 출력."}]})});}
  catch(e){throw{code:e&&e.name==="AbortError"?"cancelled":"network"}}
  if(!res.ok)throw{code:res.status===401?"bad_key":res.status===429?"rate_limited":(res.status===529||res.status>=500)?"overloaded":"api_"+res.status};
  const j=await res.json(),t=(j.content||[]).filter(x=>x.type==="text").map(x=>x.text).join(""),a=t.indexOf("{"),b=t.lastIndexOf("}");if(a<0||b<a)throw{code:"bad"};return JSON.parse(t.slice(a,b+1));},
 async save(blob,filename){const type=blob.type||"image/png",file=new File([blob],filename,{type});
  if(/Android|iPhone|iPad/i.test(navigator.userAgent)&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:filename});return}catch(e){if(e&&e.name==="AbortError")throw{code:"declined"}}}
  const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}};
