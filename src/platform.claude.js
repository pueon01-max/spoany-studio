/* ---------- platform: claude.ai 아티팩트 (보는 사람의 Claude로 제작 · downloads로 저장) ---------- */
let _sample=null,_dl=null;
const PLATFORM={kind:"claude",
 notReady:"이 화면에서는 Claude 제작을 쓸 수 없어요. '내용 편집'에서 직접 고칠 수 있어요.",
 init(){(async()=>{try{_sample=window.claude?await window.claude.use("sample"):null}catch(e){_sample=null}
  try{_dl=window.claude?await window.claude.use("downloads"):null}catch(e){_dl=null}
  aiState();if(!_dl){$("#saveBtn").disabled=true;$("#saveOpt").disabled=true;setSaveStatus("이 화면에서는 파일 저장을 쓸 수 없어요.");}})();},
 ready(){return !!_sample},canSave(){return !!_dl},openSettings(){},
 async ask(prompt,{signal}){if(!_sample)throw{code:"unavailable"};return await _sample.json(prompt,{signal,modelTier:"default"});},
 async save(blob,filename){if(!_dl)throw{code:"unavailable"};await _dl.save({filename,data:blob});}};
