#!/usr/bin/env python3
"""Spoany Studio 빌드: src/ → index.html (웹앱) + claude.ai 아티팩트용 단일 HTML.
사용: python3 build.py [--claude 출력경로]"""
import base64, sys, pathlib, shutil
R = pathlib.Path(__file__).resolve().parent
S = R / "src"
def rd(p): return (S / p).read_text(encoding="utf-8")
def b64(p, mime): return f"data:{mime};base64," + base64.b64encode((S / p).read_bytes()).decode()

assets = ("const ASSET={" + ",".join(f'{k}:"{b64(p,m)}"' for k, p, m in [
    ("logo", "assets/logo.svg", "image/svg+xml"), ("logow", "assets/logo-white.svg", "image/svg+xml"),
    ("cut", "assets/coach-cutout.webp", "image/webp"), ("photo", "assets/review-photo.webp", "image/webp")]) + "};")

def app(platform):
    a = rd("app.js")
    for mark, val in [("//@@ASSETS", assets), ("//@@TEMPLATES", rd("templates.js")), ("//@@PLATFORM", rd(f"platform.{platform}.js")), ("//@@REELS", rd("reels.js"))]:
        assert mark in a, mark
        a = a.replace(mark, val)
    return a

def fontface(src_reg, src_disp):
    return (f'@font-face{{font-family:"Pretendard";src:{src_reg} format("woff2");font-weight:45 920;font-display:block}}\n'
            f'@font-face{{font-family:"Inter Tight";src:{src_disp} format("woff2");font-weight:100 900;font-display:block;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}}\n')

AI_SETTINGS = '''<details class="card2" id="apiBox"><summary>Claude API 설정</summary><div class="fields2">
 <label for="apiKey">Anthropic API 키<input type="password" id="apiKey" autocomplete="off" placeholder="sk-ant-..."></label>
 <label for="apiModel">모델<select id="apiModel"><option value="claude-sonnet-5-5">Sonnet 5.5 · 기본</option><option value="claude-haiku-5-5">Haiku 5.5 · 빠르고 저렴</option><option value="claude-opus-5-5">Opus 5.5 · 가장 꼼꼼</option></select></label>
 <div class="go"><button class="btn ghost sm" type="button" id="keySave">저장</button><button class="x" type="button" id="keyClear">키 지우기</button></div>
 <p class="note">키는 console.anthropic.com에서 발급해요. 이 기기 브라우저에만 저장되고 코드에는 들어가지 않아요. 사용 요금은 이 키의 계정에 청구돼요.</p></div></details>'''

def page(platform):
    sh = rd("shell.html")
    style = rd("ui.css") + "\n" + rd("reels.css") + "\n" + rd("poster.css")
    if platform == "web":
        head = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#111114">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Spoany Studio">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<title>Spoany Studio</title>
<link rel="preload" href="fonts/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin>'''
        style = fontface('url("fonts/PretendardVariable.woff2")', 'url("fonts/InterTight-Variable.woff2")') + \
            "html{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\n" + style
        body_open = "</head>\n<body>"
        scripts = '<script src="vendor/html-to-image.js"></script>\n<script src="vendor/qrcode.js"></script>\n<script src="vendor/html2canvas.min.js"></script>\n<script src="vendor/mp4-muxer.js"></script>'
        tail = '''<script>
if("serviceWorker" in navigator){addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));}
</script>
</body>
</html>
'''
        ai = AI_SETTINGS
    else:
        head = '<title>Spoany Studio</title>\n<meta name="claude:viewport-fit-sides" content="cover">'
        style = fontface('url("' + b64("fonts/PretendardVariable.woff2", "font/woff2") + '")',
                         'url("' + b64("fonts/InterTight-Variable.woff2", "font/woff2") + '")') + style
        body_open = ""
        scripts = "<script>\n" + rd("vendor/html-to-image.js") + "\n</script>\n<script>\n" + rd("vendor/qrcode.js") + "\n</script>\n<script>\n" + rd("vendor/mp4-muxer.js") + "\n</script>"
        tail = ""
        ai = ""
    out = sh
    for k, v in [("{{HEAD}}", head), ("{{STYLE}}", style), ("{{BODY_OPEN}}", body_open), ("{{AI_SETTINGS}}", ai),
                 ("{{SCRIPTS}}", scripts), ("{{APP}}", app(platform)), ("{{TAIL}}", tail), ("{{REELS_PANEL}}", rd("reels.html"))]:
        assert k in out, k
        out = out.replace(k, v)
    return out

if __name__ == "__main__":
    (R / "index.html").write_text(page("web"), encoding="utf-8")
    for sub in ("fonts", "vendor"):
        d = R / sub; d.mkdir(exist_ok=True)
        for f in (S / sub).iterdir(): shutil.copy2(f, d / f.name)
    print("index.html", (R / "index.html").stat().st_size)
    if "--claude" in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index("--claude") + 1])
        out.write_text(page("claude"), encoding="utf-8")
        print("claude", out, out.stat().st_size)
