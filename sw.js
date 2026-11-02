const V="spoany-studio-v5";
const CORE=["./","index.html","html2canvas.min.js","html-to-image.js","fonts/PretendardVariable.woff2","fonts/InterTight-Variable.woff2","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.hostname==="api.anthropic.com")return;
  const font=/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(u.hostname);
  if(font){e.respondWith(caches.open(V).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}).catch(()=>hit))));return;}
  if(u.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(h=>h||caches.match("index.html"))));}
});
