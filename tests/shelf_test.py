"""Shelf integration test. Routes https://snicker02.github.io/shared/bridge.js and /apps.json to a local
checkout of snicker02.github.io (SITE env var), serves this app, and checks:
  - the Shelf button mounts; Save current stores the frame (with preset params) as app 'Fractility-Web'
  - apps.json lists Fractility-Web as an image target
  - opening ?shelf=<id> loads that image as the Image Input start pattern
"""
import http.server, threading, functools, socketserver, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.environ.get('SITE', '/home/claude/src2/snicker02.github.io')
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{srv.server_address[1]}/index.html'
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
def site(route):
    path = route.request.url.split('snicker02.github.io', 1)[1].split('?')[0]
    f = os.path.join(SITE, path.lstrip('/'))
    if os.path.isfile(f):
        ctype = 'application/json' if f.endswith('.json') else 'text/javascript'
        route.fulfill(status=200, body=open(f, 'rb').read(), headers={'content-type': ctype, 'access-control-allow-origin': '*'})
    else:
        route.fulfill(status=404, body='')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = b.new_context(viewport={'width': 1300, 'height': 800})
    ctx.route('https://snicker02.github.io/**', site)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_function('window.__fractility && window.__fractility.R.w > 0 && window.SnickerShelf')
    pg.wait_for_timeout(800)
    ok(pg.is_visible('#btnShelf'), 'Shelf button visible')
    pg.click('#btnShelf')
    pg.wait_for_timeout(300)
    pg.evaluate("() => document.querySelector('[data-snicker-shelf]').shadowRoot.querySelector('[data-a=save]').click()")
    items = []
    for _ in range(60):   # the save is async (render + PNG encode + IndexedDB write)
        items = pg.evaluate("() => SnickerShelf.list().then(l => l.map(x => ({id: x.id, app: x.app, w: x.w, h: x.h, hasParams: !!(x.params && x.params.variation_mode_a_id !== undefined)})))")
        if items: break
        pg.wait_for_timeout(250)
    ok(len(items) == 1, f'one image on the shelf after Save current ({len(items)})')
    if not items: sys.exit(1)
    it = items[0]
    R = pg.evaluate('() => [window.__fractility.R.w, window.__fractility.R.h]')
    ok(it['app'] == 'Fractility-Web' and [it['w'], it['h']] == R and it['hasParams'], f'Save current stored {it}')
    tg = pg.evaluate("() => SnickerShelf.targets('image').then(t => t.map(a => a.name))")
    ok('Fractility-Web' in tg, f'apps.json lists Fractility-Web as an image target ({len(tg)} targets)')
    # also make sure the chip shows up from another app's perspective (any target list excluding self)
    # hand-off into a fresh tab
    pg2 = ctx.new_page()
    pg2.on('pageerror', lambda e: errs.append(str(e)))
    pg2.goto(URL + '?shelf=' + it['id'])
    pg2.wait_for_function('window.__fractility && window.__fractility.S.start_pattern_mode === 2', timeout=15000)
    st = pg2.evaluate("() => ({mode: window.__fractility.S.start_pattern_mode, info: document.getElementById('imgInfo').textContent, hasBg: window.__fractility.R.hasBg, url: location.search})")
    ok(st['mode'] == 2 and st['hasBg'] and 'Image' in st['info'] and 'shelf' not in st['url'], f'?shelf hand-off loads as Image Input ({st})')
    ok(not errs, 'no page errors ' + ' | '.join(errs[:2]))
    b.close()
srv.shutdown()
print('ALL PASSED' if not fails else f'{len(fails)} FAILED')
sys.exit(1 if fails else 0)
