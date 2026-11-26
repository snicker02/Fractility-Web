"""Headless Chrome checks for Fractility Web.
Run from the repo root:  python3 tests/browser_test.py  (needs playwright + google-chrome)
Serves the folder, then:
  * loads at 1440x900, 390x844 (touch) and 844x390 (touch) and screenshots each
  * runs every variation in slot A and slot B through real WebGL and checks the buffer is finite & non-degenerate
  * loads a Godot-format preset, saves a PNG, records WebM and MP4 and checks the files decode
"""
import http.server, threading, functools, json, os, sys, socketserver
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('SHOTS', os.path.join(ROOT, 'tests', 'shots'))
os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{port}/index.html'

fails = []
def ok(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)

ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=ARGS)

    # ---------------- desktop: functional checks ----------------
    stub = lambda r: r.fulfill(status=200, body='', headers={'content-type': 'text/javascript'})  # shelf bridge: see tests/shelf_test.py
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
    ctx.route('https://snicker02.github.io/**', stub)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto(URL)
    page.wait_for_function('window.__fractility && window.__fractility.R.w > 0', timeout=20000)
    page.wait_for_timeout(1500)
    ok(not errors, 'no console errors on load ' + ' | '.join(errors[:3]))
    page.screenshot(path=os.path.join(OUT, 'desktop_1440x900.png'))

    # every variation, both slots. Uses the app's own state + render path.
    res = page.evaluate('''async () => {
        const F = window.__fractility; const out = [];
        const ids = [...Array(46).keys()];
        for (const slot of ['a', 'b']) for (const id of ids) {
            const d = F.gatherPreset();
            d.variation_mode_a_id = slot === 'a' ? id : 0;
            d.variation_mode_b_id = slot === 'b' ? id : 1;
            d.variation_mix = slot === 'a' ? 0.0 : 1.0;
            F.applyPreset(d, true);
            let err = null;
            try { F.R.setVariations(d.variation_mode_a_id, d.variation_mode_b_id); } catch (e) { err = e.message; }
            for (let i = 0; i < 6; i++) F.step();
            const m = F.R.sampleMean();
            out.push({ slot, id, err, m });
        }
        return out;
    }''')
    bad = [r for r in res if r['err'] or any(x != x for x in r['m'])]
    ok(not bad, f'all 46 variations compile+run in both slots ({len(res)} runs) ' + json.dumps(bad[:3]))
    gl_errors = [e for e in errors if 'WebGL' in e or 'GL_' in e]
    ok(not gl_errors, 'no WebGL errors during variation sweep ' + ' | '.join(gl_errors[:3]))

    # ---- v1.2 features: measured, not just compiled ----
    feat = page.evaluate('''async () => {
        const F = window.__fractility; const R = F.R;
        const keepW = R.w, keepH = R.h, keepP = R.precision;
        R.resize(160, 160);
        const run = (over, n) => { const d = F.gatherPreset(); Object.assign(d, over); F.applyPreset(d, true); F.reseed(); for (let i = 0; i < n; i++) F.step(); return R.readBuffer(); };
        const lum = (px) => { const n = px.length / 4, L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.299*px[4*i] + 0.587*px[4*i+1] + 0.114*px[4*i+2]; return L; };
        const hpEnergy = (L, w) => { let e = 0; for (let y = 1; y < w-1; y++) for (let x = 1; x < w-1; x++) { const i = y*w+x; const v = 4*L[i]-L[i-1]-L[i+1]-L[i-w]-L[i+w]; e += v*v; } return e / (w*w); };
        const mean = (L) => L.reduce((a, b) => a + b, 0) / L.length;
        const out = { precision: R.precision, floatName: R.floatName };
        const ident = { variation_mode_a_id: 7, variation_mode_b_id: 7, variation_mix: 0, mirror_x_a: 0, var_a_mirror_x: 0, var_a_mirror_y: 0, var_a_mirror_rotation: 0,
                        var_b_mirror_x: 0, var_b_mirror_y: 0, var_b_mirror_rotation: 0, pre_scale: 1, pre_rotation: 0, post_scale: 1, post_rotation: 0,
                        pre_translate: {x:0,y:0}, post_translate: {x:0,y:0}, translate_a: {x:0,y:0}, translate_b: {x:0,y:0}, combine_mode: 0, loop_sharpen: 0, feed_fade: 0 };
        // 1) sentinel: Jigsaw outlines must be black even with seamless tiling on
        const jig = lum(run({ variation_mode_a_id: 39, variation_mode_b_id: 0, variation_mix: 0, seamless_tiling: true, mirror_tiling: false,
                              jigsaw_scale_a: 5, jigsaw_tab_size_a: 0.3, jigsaw_outline_a: 0.07, start_pattern_mode: 0, feed_mode: 1, post_scale: 1, post_rotation: 0, combine_mode: 0 }, 30));
        out.jigsawDark = jig.filter((v) => v < 6).length / jig.length;
        // 2) precision: decay to black with an identity map (feed = black image input)
        const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#b0b0b0'; g.fillRect(0, 0, 64, 64);
        R.setBackground(c, false);
        for (const prec of ['8bit', 'float']) {
            R.setPrecision(prec);
            out['decay_' + prec] = mean(lum(run({ ...ident, start_pattern_mode: 2, image_input_opacity: 0, feedback_amount: 0.97, feedback_max: 1, resample_mode: 0, feed_mode: 0 }, 200)));
        }
        R.setPrecision('float');
        // 3) resampling sharpness: pure rotation feedback (feedback 1) of the Circles seed
        for (const [name, rm, ls] of [['linear', 0, 0], ['cubic', 1, 0], ['linear_sharpen', 0, 1.0]]) {
            out['sharp_' + name] = hpEnergy(lum(run({ ...ident, start_pattern_mode: 1, feedback_amount: 1, feedback_max: 1, post_rotation: 0.031, resample_mode: rm, loop_sharpen: ls }, 60)), 160);
        }
        // 4) IFS combine modes on every variation: finite, and union differs from blend
        const bad = [];
        for (const mode of [1, 2, 3]) for (let id = 0; id < 46; id++) {
            F.applyPreset(Object.assign(F.gatherPreset(), { variation_mode_a_id: id, variation_mode_b_id: (id + 7) % 46, combine_mode: mode, variation_mix: 0.5, start_pattern_mode: 1 }), true);
            try { R.setVariations(id, (id + 7) % 46); } catch (e) { bad.push([mode, id, e.message]); continue; }
            F.reseed(); for (let i = 0; i < 4; i++) F.step();
            const m = R.sampleMean(); if (m.some((x) => !(x >= 0))) bad.push([mode, id, m]);
        }
        out.combineBad = bad;
        const base = { variation_mode_a_id: 0, variation_mode_b_id: 1, variation_mix: 0.5, start_pattern_mode: 1, post_scale: 0.995 };
        const blend = lum(run({ ...base, combine_mode: 0 }, 40)), union = lum(run({ ...base, combine_mode: 2 }, 40));
        let diff = 0; for (let i = 0; i < blend.length; i++) diff += Math.abs(blend[i] - union[i]); out.unionVsBlend = diff / blend.length;
        // 5) patchwork: no per-pixel grain and stable frame to frame (the old random pick failed both)
        const pbase = { variation_mode_a_id: 7, variation_mode_b_id: 23, variation_mix: 0.73, feedback_amount: 0.9, start_pattern_mode: 0,
                        pre_scale: 2.75, post_scale: 0.38, post_rotation: -2.184, seamless_tiling: true, mirror_tiling: true, combine_mode: 3 };
        for (const shape of [0, 1]) {
            const a = lum(run({ ...pbase, patch_shape: shape }, 60)); F.step(); const b = lum(R.readBuffer());
            let fd = 0; for (let i = 0; i < a.length; i++) fd += Math.abs(a[i] - b[i]);
            out['patch' + shape + '_hp'] = hpEnergy(a, 160); out['patch' + shape + '_framediff'] = fd / a.length;
        }
        const u = lum(run({ ...pbase, combine_mode: 2 }, 60)); out.union_hp = hpEnergy(u, 160);
        // 6) Glynn Sim tear styles (user's fuzzy-patch settings): sand vs clumps vs smooth
        // (Brad's preset that showed the fuzz: Sinusoidal A, Glynn B with TEXTURE ring)
        const gbase = { variation_mode_a_id: 0, variation_mode_b_id: 37, variation_mix: 1, feedback_amount: 0.636, combine_mode: 0, start_pattern_mode: 0,
                        pre_scale: 0.857, pre_rotation: 1.4914, post_scale: 1.245, post_rotation: 0.9584, post_translate: { x: -6.2733, y: 2.3565 },
                        seamless_tiling: true, mirror_tiling: true, feed_mode: 1, resample_mode: 1, sinusoidal_scale_a: 2.203, sinusoidal_strength_a: 0.551,
                        glynn_ring_mode_b: 1, glynn_radius_b: 0.339, glynn_thickness_b: 0.034, glynn_contrast_b: 0.5, glynn_pow_b: 0.593 };
        for (const [nm, tear] of [['sand', 0], ['clumps', 1], ['smooth', 2]]) out['glynn_' + nm] = hpEnergy(lum(run({ ...gbase, glynn_tear_b: tear }, 80)), 160);
        // 7) ring textures: all 24 modes in Glynn Sim and Lazy Mega run, are finite and look different
        for (const [vid, key, extra] of [[37, 'glynn', { glynn_radius_b: 0.22, glynn_thickness_b: 0.2, glynn_tear_b: 2 }], [36, 'lazy', { lazy_amount_b: 0.22, lazy_space_b: 0.2 }]]) {
            const sigs = [], badm = [];
            for (let mode = 0; mode < 24; mode++) {
                const L = lum(run({ variation_mode_a_id: 0, variation_mode_b_id: vid, variation_mix: 1, feedback_amount: 0.9, start_pattern_mode: 0, post_scale: 1,
                                    post_rotation: 0, pre_scale: 1, pre_rotation: 0, combine_mode: 0, mirror_tiling: false, post_translate: {x:0,y:0}, pre_translate: {x:0,y:0},
                                    ...extra, [key + '_ring_mode_b']: mode }, 30));
                const m = mean(L); if (!(m >= 0)) badm.push(mode);
                sigs.push(Math.round(m * 10) + ':' + Math.round(hpEnergy(L, 160)));
            }
            out['rings_' + key] = { unique: new Set(sigs).size, bad: badm };
        }
        // 8) filling black areas: ring cut fill (per variation) and the global outside fill
        const dark = (L) => L.filter((x) => x < 6).length / L.length;
        const ringScene = { variation_mode_a_id: 0, variation_mode_b_id: 37, variation_mix: 1, feedback_amount: 0.9, start_pattern_mode: 0, post_scale: 1,
                            post_rotation: 0, pre_scale: 1, pre_rotation: 0, combine_mode: 0, mirror_tiling: false, post_translate: {x:0,y:0}, pre_translate: {x:0,y:0},
                            glynn_radius_b: 0.22, glynn_thickness_b: 0.2, glynn_tear_b: 2, glynn_ring_mode_b: 2, outside_fill: 0 };
        out.fill_black = dark(lum(run({ ...ringScene, glynn_ring_cutfill_b: 0 }, 30)));
        out.fill_cut = [1, 2, 3, 4, 5, 6].map((cf) => dark(lum(run({ ...ringScene, glynn_ring_cutfill_b: cf }, 30))));
        out.fill_colour = dark(lum(run({ ...ringScene, glynn_ring_cutfill_b: 0, outside_fill: 1, outside_color: { r: 0.5, g: 0.3, b: 0.1, a: 1 } }, 30)));
        out.fill_pattern = dark(lum(run({ ...ringScene, glynn_ring_cutfill_b: 0, outside_fill: 2 }, 30)));
        const jigScene = { variation_mode_a_id: 39, variation_mode_b_id: 0, variation_mix: 0, seamless_tiling: true, mirror_tiling: false, jigsaw_scale_a: 5,
                      jigsaw_tab_size_a: 0.3, jigsaw_outline_a: 0.07, start_pattern_mode: 0, post_scale: 1, post_rotation: 0, combine_mode: 0 };
        out.jig_black = dark(lum(run({ ...jigScene, outside_fill: 0 }, 30)));
        out.jig_colour = dark(lum(run({ ...jigScene, outside_fill: 1, outside_color: { r: 0.5, g: 0.3, b: 0.1, a: 1 } }, 30)));
        R.clearBackground();
        R.setPrecision(keepP); R.resize(keepW, keepH);
        return out;
    }''')
    print('v1.2 measurements:', feat)
    ok(feat['jigsawDark'] > 0.04, f"Jigsaw outlines visible with seamless tiling ({feat['jigsawDark']*100:.1f}% black px)")
    ok(feat['precision'] == 'float', f"float buffer active ({feat['floatName']})")
    ok(feat['decay_8bit'] > 8 and feat['decay_float'] < 2, f"8-bit stalls at {feat['decay_8bit']:.1f}/255, float decays to {feat['decay_float']:.2f}/255")
    ok(feat['sharp_cubic'] > 1.3 * feat['sharp_linear'], f"bicubic keeps more detail ({feat['sharp_cubic']:.0f} vs linear {feat['sharp_linear']:.0f})")
    ok(1.3 * feat['sharp_linear'] < feat['sharp_linear_sharpen'] < 40 * feat['sharp_linear'], f"loop sharpen at max keeps detail without runaway ({feat['sharp_linear_sharpen']:.0f})")
    ok(not feat['combineBad'], f"IFS modes run on all 46 variations ({feat['combineBad'][:3]})")
    for s in ['0', '1']:
        ok(feat['patch' + s + '_hp'] < 4 * feat['union_hp'] + 50 and feat['patch' + s + '_framediff'] < 4,
           f"patchwork shape {s}: no grain (hp {feat['patch' + s + '_hp']:.0f} vs union {feat['union_hp']:.0f}), stable (frame diff {feat['patch' + s + '_framediff']:.2f}/255)")
    ok(feat['glynn_smooth'] < 0.35 * feat['glynn_sand'] and feat['glynn_clumps'] < feat['glynn_sand'],
       f"Glynn speckle: sand {feat['glynn_sand']:.0f}, clumps {feat['glynn_clumps']:.0f}, smooth {feat['glynn_smooth']:.0f} (high-pass energy)")
    for k in ['glynn', 'lazy']:
        r = feat['rings_' + k]
        ok(not r['bad'] and r['unique'] >= 23, f"{k} ring textures: 24 modes run, {r['unique']} distinct results")
    ok(feat['fill_black'] > 0.1 and all(x < 0.25 * feat['fill_black'] for x in feat['fill_cut']),
       f"ring cut fill removes black: {feat['fill_black']*100:.1f}% -> {[round(x*100,1) for x in feat['fill_cut']]}%")
    ok(feat['fill_colour'] < 0.25 * feat['fill_black'] and feat['fill_pattern'] < 0.25 * feat['fill_black'],
       f"global fill on rings: colour {feat['fill_colour']*100:.1f}%, start pattern {feat['fill_pattern']*100:.1f}% black")
    ok(feat['jig_colour'] < 0.1 * feat['jig_black'], f"global fill on Jigsaw: {feat['jig_black']*100:.1f}% -> {feat['jig_colour']*100:.1f}% black")
    ok(feat['unionVsBlend'] > 5, f"union differs from blend (mean |dL| {feat['unionVsBlend']:.1f})")

    # ghosting: correlation of the steady state with the static start pattern (edge/high-pass luminance),
    # for every start pattern that has structure, in both feed modes
    ghost = page.evaluate('''async () => {
        const F = window.__fractility; const R = F.R;
        const keepW = R.w, keepH = R.h;
        R.resize(160, 160);
        const lum = (px) => { const n = px.length / 4, L = new Float32Array(n); for (let i = 0; i < n; i++) L[i] = 0.299*px[4*i] + 0.587*px[4*i+1] + 0.114*px[4*i+2]; return L; };
        const hp = (L, w) => { const o = new Float32Array(L.length); for (let y = 1; y < w-1; y++) for (let x = 1; x < w-1; x++) { const i = y*w+x; o[i] = 4*L[i] - L[i-1] - L[i+1] - L[i-w] - L[i+w]; } return o; };
        const corr = (a, b) => { let ma=0, mb=0; for (let i=0;i<a.length;i++){ma+=a[i];mb+=b[i];} ma/=a.length; mb/=b.length; let s=0,sa=0,sb=0; for (let i=0;i<a.length;i++){const x=a[i]-ma,y=b[i]-mb; s+=x*y; sa+=x*x; sb+=y*y;} return s/Math.sqrt(sa*sb+1e-9); };
        // a bitmap so Image Input is exercised too
        const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
        for (let i = 0; i < 40; i++) { g.fillStyle = `hsl(${i*37},80%,${30 + (i%3)*20}%)`; g.fillRect((i*53)%220, (i*97)%220, 36, 36); }
        R.setBackground(c, false);
        const out = {};
        for (const pat of [1, 2, 4]) for (const mode of [0, 1]) {
            const d = F.gatherPreset();
            Object.assign(d, { variation_mode_a_id: 2, variation_mode_b_id: 4, variation_mix: 0.5, feedback_amount: 0.9, feedback_max: 0.95,
                               start_pattern_mode: pat, feed_mode: mode, feed_fade: 0, post_scale: 0.995, image_input_opacity: 1 });
            F.applyPreset(d, true);
            F.reseed(); F.step();                 // time < 0.1 -> seed frame = pure start pattern
            const P = hp(lum(R.readBuffer()), 160);
            for (let i = 0; i < 80; i++) F.step();
            const S = hp(lum(R.readBuffer()), 160);
            out[pat + '_' + mode] = corr(P, S);
        }
        R.resize(keepW, keepH);
        return out;
    }''')
    print('ghost correlation (pattern_mode):', {k: round(v, 3) for k, v in ghost.items()})
    for pat in ['1', '2', '4']:
        ok(ghost[pat + '_0'] > 0.05 and abs(ghost[pat + '_1']) < ghost[pat + '_0'] * 0.3,
           f'pattern {pat}: overlay ghost {ghost[pat + "_0"]:.3f} -> warped {ghost[pat + "_1"]:.3f}')

    # a Godot-style preset (keys as written by Fractility's _gather_preset_data)
    godot_preset = {
        "version": 3.8, "is_3d_view": False, "variation_mode_a_id": 40, "variation_mode_b_id": 8,
        "start_pattern_mode": 1, "variation_mix": 0.35, "feedback_amount": 0.9, "feedback_min": 0.0, "feedback_max": 0.99,
        "grad_col_tl": {"r": 1, "g": 0.2, "b": 0.1, "a": 1}, "post_translate": {"x": 0.01, "y": -0.02},
        "gnarl_mode_a": 3, "gnarl_scale_x_a": 0.8, "gnarl_freq_x1_a_speed": 0.05, "var_b_kaleidoscope_slices": 7,
        "post_scale": 1.01, "shape_index": 0, "mandel_power": 8,
    }
    st = page.evaluate('(p) => { const F = window.__fractility; F.applyPreset(p); return F.S; }', godot_preset)
    ok(st['variation_mode_a_id'] == 40 and st['gnarl_mode_a'] == 3 and st['var_b_kaleidoscope_slices'] == 7
       and abs(st['grad_col_tl']['g'] - 0.2) < 1e-9 and abs(st['post_translate']['y'] + 0.02) < 1e-9 and st['feed_mode'] == 0 and st['combine_mode'] == 0 and st['resample_mode'] == 0, 'Godot preset keys load (original feed/blend/resample kept for fidelity)')
    page.wait_for_timeout(1200)
    page.screenshot(path=os.path.join(OUT, 'desktop_preset.png'))
    sel = page.evaluate('() => [document.getElementById("varA").value, document.getElementById("varAName").textContent]')
    ok(sel[0] == '40' and 'Chimera' in sel[1], 'UI follows preset ' + str(sel))

    # PNG save at 2048
    page.select_option('#saveW', '2048')
    with page.expect_download() as dl:
        page.click('#btnSave2')
    path = dl.value.path()
    with open(path, 'rb') as f: head = f.read(32)
    w = int.from_bytes(head[16:20], 'big'); h = int.from_bytes(head[20:24], 'big')
    ok(head[:8] == b'\x89PNG\r\n\x1a\n' and w == 2048, f'PNG saved {w}x{h}')

    # recordings
    sup = page.evaluate('() => window.__fractility.recorder && (async () => (await import("./engine/recorder.js?v=1.4.1")).recordingSupport())()')
    print('recording support:', sup)
    for fmt in ['webm', 'mp4']:
        if not sup.get(fmt):
            print('SKIP', fmt, 'not supported in this Chrome build'); continue
        page.select_option('#recFmt', fmt)
        page.click('#btnRec2')
        page.wait_for_timeout(2500)
        with page.expect_download() as dl:
            page.click('#btnRec2')
        vp = dl.value.path()
        size = os.path.getsize(vp)
        # decode check: load into a <video> element and read duration
        with open(vp, 'rb') as f: data = f.read()
        import base64
        info = page.evaluate('''async ([b64, mime]) => {
            const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const v = document.createElement('video'); v.muted = true;
            v.src = URL.createObjectURL(new Blob([bin], {type: mime}));
            const r = await new Promise(res => { v.onloadedmetadata = () => res({d: v.duration, w: v.videoWidth, h: v.videoHeight}); v.onerror = () => res({err: v.error && v.error.code}); setTimeout(() => res({timeout: true}), 8000); });
            if (r.d === Infinity) { v.currentTime = 1e9; await new Promise(res => { v.ontimeupdate = res; setTimeout(res, 3000); }); r.d = v.duration; }
            return r;
        }''', [base64.b64encode(data).decode(), 'video/' + fmt])
        ok(size > 1000 and not info.get('err') and not info.get('timeout') and info.get('w', 0) > 0, f'{fmt} recording decodes: {size} bytes {info}')
    # force the WebCodecs MP4 path too (muxer test) when VideoEncoder exists
    has_vc = page.evaluate('() => typeof VideoEncoder !== "undefined"')
    if has_vc:
        info = page.evaluate('''async () => {
            const { Recorder } = await import('./engine/recorder.js?v=1.4.1');
            const c = document.getElementById('gl');
            const r = new Recorder(c);
            r.format = 'mp4';
            // emulate start() for webcodecs path
            const RS = await import('./engine/recorder.js?v=1.4.1');
            const orig = RS.recordingSupport;
            await (async () => {
                r.mode = 'wc';
            })();
            try {
                // monkey: call start with a support override by temporarily hiding MediaRecorder mp4
                const MR = window.MediaRecorder; const its = MR.isTypeSupported;
                MR.isTypeSupported = (t) => t.startsWith('video/mp4') ? false : its.call(MR, t);
                await r.start('mp4', 30, 8);
                MR.isTypeSupported = its;
                if (r.mode !== 'wc') return { err: 'not webcodecs mode: ' + r.mode };
                const F = window.__fractility;
                const t0 = performance.now();
                while (performance.now() - t0 < 1500) { F.step(); r.onFrame(); await new Promise(q => setTimeout(q, 34)); }
                const blob = await r.stop();
                const v = document.createElement('video'); v.muted = true; v.src = URL.createObjectURL(blob);
                const m = await new Promise(res => { v.onloadedmetadata = () => res({ d: v.duration, w: v.videoWidth, h: v.videoHeight, size: blob.size }); v.onerror = () => res({ err: v.error && v.error.code, size: blob.size }); setTimeout(() => res({ timeout: true }), 8000); });
                if (!m.err && !m.timeout) { v.currentTime = 0.5; await new Promise(res => { v.onseeked = res; setTimeout(res, 3000); }); m.seeked = v.currentTime; }
                return m;
            } catch (e) { return { err: String(e) }; }
        }''')
        ok(not info.get('err') and not info.get('timeout') and info.get('w', 0) > 0 and info.get('d', 0) > 0.8, f'WebCodecs MP4 muxer output decodes: {info}')
    ctx.close()

    # ---------------- phone layouts ----------------
    for (vw, vh, name) in [(390, 844, 'phone_portrait_390x844'), (844, 390, 'phone_landscape_844x390')]:
        ctx = b.new_context(viewport={'width': vw, 'height': vh}, has_touch=True, is_mobile=True, device_scale_factor=2)
        ctx.route('https://snicker02.github.io/**', stub)
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__fractility && window.__fractility.R.w > 0', timeout=20000)
        pg.wait_for_timeout(1200)
        lay = pg.evaluate('''() => {
            const r = (s) => { const e = document.querySelector(s).getBoundingClientRect(); return [Math.round(e.left), Math.round(e.top), Math.round(e.width), Math.round(e.height)]; };
            const on = [...document.querySelectorAll('#panel > .sec')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.dataset.tab);
            return { tabbed: document.body.classList.contains('tabbed'), view: r('#view'), strip: r('#tabstrip'), panel: r('#panel'),
                     tabs: document.querySelectorAll('#tabstrip button').length, visible: on, docW: document.documentElement.scrollWidth,
                     hint: document.getElementById('hint').textContent, bodyScroll: document.scrollingElement.scrollHeight - innerHeight };
        }''')
        print(name, lay)
        ok(lay['tabbed'] and lay['tabs'] == 8 and len(lay['visible']) == 1, f'{name}: tab layout active, one section visible')
        ok(lay['docW'] <= vw and lay['bodyScroll'] <= 1, f'{name}: no page overflow')
        ok('pinch' in lay['hint'], f'{name}: touch hint shown')
        if vw < vh:
            ok(lay['view'][1] < lay['strip'][1] < lay['panel'][1] and 0.4 < lay['view'][3] / vh < 0.55, f'{name}: view docked on top ~48%')
        else:
            ok(lay['view'][0] == 0 and lay['strip'][0] >= lay['view'][2] - 1 and 280 <= lay['panel'][2] <= 310, f'{name}: view left, 300px column right')
        pg.screenshot(path=os.path.join(OUT, name + '.png'))
        # switch to Var A tab, check persistence
        pg.click('#tabstrip button[data-tab="vara"]')
        pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(OUT, name + '_vara.png'))
        pg.reload()
        pg.wait_for_function('window.__fractility && window.__fractility.R.w > 0', timeout=20000)
        cur = pg.evaluate('() => document.querySelector("#tabstrip button.cur").dataset.tab')
        ok(cur == 'vara', f'{name}: tab remembered after reload ({cur})')
        # touch drag moves post_translate (CDP touch)
        before = pg.evaluate('() => ({...window.__fractility.S.post_translate})')
        box = pg.locator('#gl').bounding_box()
        cdp = ctx.new_cdp_session(pg)
        x0, y0 = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for i in range(1, 6):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + i * 8, 'y': y0}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        pg.wait_for_timeout(100)
        after = pg.evaluate('() => ({...window.__fractility.S.post_translate})')
        ok(after['x'] < before['x'], f'{name}: one-finger drag translates ({before["x"]:.4f} -> {after["x"]:.4f})')
        # pinch
        ps0 = pg.evaluate('() => window.__fractility.S.post_scale')
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0 - 20, 'y': y0, 'id': 1}, {'x': x0 + 20, 'y': y0, 'id': 2}]})
        for i in range(1, 6):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 - 20 - i * 10, 'y': y0, 'id': 1}, {'x': x0 + 20 + i * 10, 'y': y0, 'id': 2}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        ps1 = pg.evaluate('() => window.__fractility.S.post_scale')
        ok(ps1 != ps0, f'{name}: pinch changes post scale ({ps0:.3f} -> {ps1:.3f})')
        ok(not errs, f'{name}: no page errors ' + ' | '.join(errs[:2]))
        ctx.close()
    b.close()

srv.shutdown()
print('\n' + ('ALL PASSED' if not fails else f'{len(fails)} FAILED'))
sys.exit(1 if fails else 0)
