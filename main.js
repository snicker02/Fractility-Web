// Fractility Web — app shell: state, UI, input, loop.
// A browser port of the 2D feedback/fractal half of Fractility (Godot): two variations (A, B)
// remap the previous frame, are mixed, post-transformed and blended with a start pattern.

import { Renderer, PARAMS, VARIATIONS, slotLayout, SLOT_VEC4 } from './engine/renderer.js?v=1.4.0';
import { Recorder, recordingSupport } from './engine/recorder.js?v=1.4.0';

const VERSION = '1.4.0';
const LS = { state: 'fractility.state', tab: 'fractility.tab', rnd: 'fractility.rnd', file: 'fractility.file' };
const $ = (id) => document.getElementById(id);
const INVERSE_VARIATIONS = [1];

// ------------------------------------------------------------------ state
const col = (r, g, b, a = 1) => ({ r, g, b, a });
const v2 = (x = 0, y = 0) => ({ x, y });

/** Preset key for a variation parameter (matches Fractility's Godot uniform/preset names). */
function pkey(base, slot, speed = false) {
    const sfx = speed ? '_speed' : '';
    if (base.startsWith('mirror_') || base.startsWith('kaleidoscope_')) return `var_${slot}_${base}${sfx}`;
    return `${base}_${slot}${sfx}`;
}

function defaultState() {
    const s = {
        variation_mode_a_id: 0, variation_mode_b_id: 1, start_pattern_mode: 0,
        variation_mix: 0.5, feedback_amount: 0.8, feedback_min: 0.0, feedback_max: 0.95,
        seamless_tiling: true, mirror_tiling: false, reset_on_drag_enabled: true, animation_paused: false,
        show_start_grid: false, show_circles: true, circle_count: 4, circle_radius: 0.2, circle_softness: 0.05,
        grad_col_tl: col(0, 1, 1), grad_col_tr: col(1, 1, 0), grad_col_bl: col(0, 0, 1), grad_col_br: col(1, 0, 0),
        circle_grid_scale: 8, circle_grid_radius: 0.4, circle_grid_softness: 0.05,
        use_escape_time: false, escape_limit: 4, escape_shape: 0, escape_smoothness: 0.1, escape_invert: false,
        pre_scale: 1, pre_rotation: 0, pre_translate: v2(), post_scale: 0.995, post_rotation: 0, post_translate: v2(),
        translate_a: v2(), translate_b: v2(),
        brightness: 1, contrast: 1, saturation: 1, sharpen: 1, gamma: 1, vibrance: 1,
        move_post_translate: true, move_pre_translate: false, move_var_a_translate: false, move_var_b_translate: false,
        post_mirror_x: false, post_mirror_y: false, post_kaleidoscope_on: false, post_kaleidoscope_slices: 6,
        image_input_opacity: 1.0,
        feed_mode: 1, feed_fade: 0,
        combine_mode: 0, resample_mode: 1, loop_sharpen: 0,
        patch_scale: 4, patch_soft: 0.05, patch_drift: 0, patch_shape: 0,
        outside_fill: 0, outside_color: col(0.12, 0.05, 0.2),
        generator_on: false, generator_strength: 0.0,
        gen_branch_count: 4, gen_branch_angle: 0.8, gen_branch_len: 0.2, gen_size: 0.8, gen_thickness: 0.015,
        snowflake_color: col(0.1, 0.35, 0.65),
        lighting_enabled: false, lighting_strength: 2, lighting_specular: 1, lighting_roughness: 10, light_dir_x: 0.5, light_dir_y: -0.5,
    };
    for (const slot of ['a', 'b']) {
        for (const [base, p] of Object.entries(PARAMS)) {
            s[pkey(base, slot)] = p.def;
            s[pkey(base, slot, true)] = 0;
        }
    }
    return s;
}

let S = defaultState();
let time = 0;            // shader time, as in Fractility (reset by reseed)
let frozen = false;      // stops iterating entirely (top-bar Freeze)
let dirtyProgram = true;

// ------------------------------------------------------------------ renderer
const canvas = $('gl');
let R;
try {
    R = new Renderer(canvas);
} catch (e) {
    document.body.innerHTML = `<div style="padding:24px;font:14px system-ui;color:#eee">Fractility needs WebGL: ${e.message}</div>`;
    throw e;
}
const recorder = new Recorder(canvas);
const slotA = new Float32Array(SLOT_VEC4 * 4), slotB = new Float32Array(SLOT_VEC4 * 4);

function fillSlot(arr, id, slot) {
    arr.fill(0);
    slotLayout(id).forEach((k, i) => {
        const speed = k.endsWith('_speed') && PARAMS[k.slice(0, -6)] !== undefined;
        const base = speed ? k.slice(0, -6) : k;
        const v = Number(S[pkey(base, slot, speed)]);
        arr[i] = Number.isFinite(v) ? v : 0;
    });
}

const c4 = (c) => [c.r, c.g, c.b, c.a ?? 1];
function feedbackUniforms() {
    return {
        time,
        start_pattern_mode: S.start_pattern_mode | 0,
        variation_mix: S.variation_mix, feedback_amount: S.feedback_amount,
        seamless_tiling: S.seamless_tiling, mirror_tiling: S.mirror_tiling,
        show_grid: S.show_start_grid, show_circles: S.show_circles,
        escape_limit: S.escape_limit, use_escape_time: S.use_escape_time, escape_shape: S.escape_shape | 0,
        escape_smoothness: S.escape_smoothness, escape_invert: S.escape_invert,
        generator_strength: S.generator_on ? S.generator_strength : 0, image_input_opacity: S.image_input_opacity,
        feed_mode: S.feed_mode | 0, feed_fade: S.feed_fade,
        combine_mode: S.combine_mode | 0, resample_mode: S.resample_mode | 0, loop_sharpen: S.loop_sharpen,
        patch_scale: S.patch_scale, patch_soft: S.patch_soft, patch_drift: S.patch_drift, patch_shape: S.patch_shape | 0,
        outside_fill: S.outside_fill | 0, outside_color: c4(S.outside_color),
        lighting_enabled: S.lighting_enabled, lighting_strength: S.lighting_strength, lighting_specular: S.lighting_specular,
        lighting_roughness: S.lighting_roughness, light_direction: [S.light_dir_x, S.light_dir_y],
        circle_count: S.circle_count, circle_radius: S.circle_radius, circle_softness: S.circle_softness,
        grad_col_tl: c4(S.grad_col_tl), grad_col_tr: c4(S.grad_col_tr), grad_col_bl: c4(S.grad_col_bl), grad_col_br: c4(S.grad_col_br),
        circle_grid_scale: S.circle_grid_scale, circle_grid_radius: S.circle_grid_radius, circle_grid_softness: S.circle_grid_softness,
        pre_scale: S.pre_scale, pre_rotation: S.pre_rotation, pre_translate: [S.pre_translate.x, S.pre_translate.y],
        translate_a: [S.translate_a.x, S.translate_a.y], translate_b: [S.translate_b.x, S.translate_b.y],
        post_scale: S.post_scale, post_rotation: S.post_rotation, post_translate: [S.post_translate.x, S.post_translate.y],
        snowflake_color: c4(S.snowflake_color), snow_size: S.gen_size, snow_thickness_gen: S.gen_thickness,
        snow_branch_count: S.gen_branch_count | 0, snow_branch_angle: S.gen_branch_angle, snow_branch_len: S.gen_branch_len,
    };
}
function postUniforms() {
    return {
        brightness: S.brightness, contrast: S.contrast, saturation: S.saturation, sharpen: S.sharpen,
        gamma: Math.max(0.01, S.gamma), vibrance: S.vibrance,
        mirror_x: S.post_mirror_x, mirror_y: S.post_mirror_y,
        kaleidoscope_on: S.post_kaleidoscope_on, kaleidoscope_slices: S.post_kaleidoscope_slices,
    };
}

function ensureProgram() {
    if (!dirtyProgram) return;
    dirtyProgram = false;
    try {
        R.setVariations(S.variation_mode_a_id, S.variation_mode_b_id);
    } catch (e) {
        console.error(e);
        toast('Shader error — see console');
    }
}

// ------------------------------------------------------------------ helpers
let toastTimer = 0;
function toast(msg, ms = 2200) {
    const t = $('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0')).join('');
const unhex = (h) => col(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const decimals = (step) => Math.min(5, Math.max(0, Math.ceil(-Math.log10(step) - 1e-9)));
function fmt(v, step) { const d = decimals(step); return Number(v).toFixed(d); }
function stamp() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
let saveTimer = 0;
function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(LS.state, JSON.stringify(gatherPreset())); } catch (_) { /* quota */ } }, 400);
}

// ------------------------------------------------------------------ control builders
const bound = []; // {sync()} for every control, refreshed by syncUI()

/**
 * Slider + number box bound to S[key]. opts: {label,min,max,step,speed?:key}
 * Values typed into the number box may exceed the slider range (like Godot's or_greater).
 */
function slider(parent, key, o) {
    const row = document.createElement('div');
    row.className = 'ctl' + (o.cls ? ' ' + o.cls : '');
    const lab = document.createElement('label');
    lab.textContent = o.label; lab.title = o.title || o.label;
    const r = document.createElement('input');
    r.type = 'range'; r.min = o.min; r.max = o.max; r.step = o.step;
    const n = document.createElement('input');
    n.type = 'number'; n.step = o.step;
    const id = 'c_' + key; r.id = id; lab.htmlFor = id;
    const get = o.get || (() => S[key]);
    const set = o.set || ((v) => { S[key] = v; });
    const apply = (v, from) => {
        if (!Number.isFinite(v)) return;
        set(v);
        if (from !== r) r.value = v;
        if (from !== n) n.value = fmt(v, o.step);
        if (o.onChange) o.onChange(v);
        if (o.cls === 'speed') row.classList.toggle('live', v !== 0);
        persist();
    };
    r.addEventListener('input', () => apply(parseFloat(r.value), r));
    n.addEventListener('change', () => apply(parseFloat(n.value), n));
    row.append(lab, r, n);
    parent.appendChild(row);
    const ctl = { row, sync() { const v = get(); r.value = v; n.value = fmt(v, o.step); if (o.cls === 'speed') row.classList.toggle('live', v !== 0); }, setRange(min, max) { r.min = min; r.max = max; } };
    ctl.sync();
    bound.push(ctl);
    return ctl;
}

function dropdown(parent, key, label, options) {
    const row = document.createElement('div');
    row.className = 'ctl';
    const lab = document.createElement('label');
    lab.textContent = label;
    const sel = document.createElement('select');
    options.forEach((t, i) => { const o = document.createElement('option'); o.value = i; o.textContent = t; sel.appendChild(o); });
    sel.addEventListener('change', () => { S[key] = parseInt(sel.value, 10); persist(); });
    row.append(lab, sel);
    parent.appendChild(row);
    const ctl = { row, sync() { sel.value = String(Math.round(S[key]) | 0); } };
    ctl.sync();
    bound.push(ctl);
    return ctl;
}

function check(id, key, onChange) {
    const el = $(id);
    el.addEventListener('change', () => { S[key] = el.checked; if (onChange) onChange(); persist(); });
    bound.push({ sync() { el.checked = !!S[key]; } });
}
function colorInput(id, key) {
    const el = $(id);
    el.addEventListener('input', () => { S[key] = unhex(el.value); persist(); });
    bound.push({ sync() { el.value = hex(S[key]); } });
}
function selectInput(id, key, onChange, parse = (v) => parseInt(v, 10)) {
    const el = $(id);
    el.addEventListener('change', () => { S[key] = parse(el.value); if (onChange) onChange(); persist(); });
    bound.push({ sync() { el.value = String(S[key]); } });
}

// ------------------------------------------------------------------ static UI
let fbSlider;
function buildStaticUI() {
    const m = $('ctlMain');
    slider(m, 'variation_mix', { label: 'Mix A ↔ B', min: 0, max: 1, step: 0.01 });
    fbSlider = slider(m, 'feedback_amount', { label: 'Feedback', min: S.feedback_min, max: S.feedback_max, step: 0.001 });
    slider(m, 'pre_scale', { label: 'Pre scale', min: 0.01, max: 10, step: 0.001 });
    slider(m, 'pre_rotation', { label: 'Pre rotation', min: -3.1416, max: 3.1416, step: 0.001 });
    slider(m, 'post_scale', { label: 'Post scale', min: 0.01, max: 3, step: 0.001 });
    slider(m, 'post_rotation', { label: 'Post rotation', min: -3.1416, max: 3.1416, step: 0.001 });

    selectInput('combineMode', 'combine_mode', updateCombineNote);
    bound.push({ sync: updateCombineNote });
    selectInput('resampleMode', 'resample_mode');
    selectInput('patchShape', 'patch_shape');
    selectInput('outsideFill', 'outside_fill', updateOutsideUI);
    colorInput('outsideCol', 'outside_color');
    bound.push({ sync: updateOutsideUI });
    const pc = $('ctlPatch');
    slider(pc, 'patch_scale', { label: 'Patch scale', min: 0.5, max: 20, step: 0.01 });
    slider(pc, 'patch_soft', { label: 'Edge softness', min: 0, max: 0.5, step: 0.001 });
    slider(pc, 'patch_drift', { label: 'Drift', title: 'How fast the regions move', min: 0, max: 2, step: 0.01 });
    slider($('ctlQuality'), 'loop_sharpen', { label: 'Loop sharpen', title: 'Unsharp mask applied inside the feedback loop', min: 0, max: 1, step: 0.01 });

    const fbMin = $('fbMin'), fbMax = $('fbMax');
    const applyRange = () => {
        S.feedback_min = Math.max(0, Math.min(1, parseFloat(fbMin.value) || 0));
        S.feedback_max = Math.max(S.feedback_min, Math.min(1, parseFloat(fbMax.value) || 0));
        S.feedback_amount = Math.min(S.feedback_max, Math.max(S.feedback_min, S.feedback_amount));
        syncUI(); persist();
    };
    fbMin.addEventListener('change', applyRange); fbMax.addEventListener('change', applyRange);
    bound.push({ sync() { fbMin.value = S.feedback_min; fbMax.value = S.feedback_max; fbSlider.setRange(S.feedback_min, S.feedback_max); fbSlider.sync(); } });

    check('movePost', 'move_post_translate'); check('movePre', 'move_pre_translate');
    check('moveA', 'move_var_a_translate'); check('moveB', 'move_var_b_translate');
    check('resetOnDrag', 'reset_on_drag_enabled');
    check('seamless', 'seamless_tiling'); check('mirrorTile', 'mirror_tiling'); check('pauseTime', 'animation_paused');
    $('btnCenter').addEventListener('click', () => {
        S.pre_translate = v2(); S.post_translate = v2(); S.translate_a = v2(); S.translate_b = v2(); persist(); reseed();
    });

    // pattern
    selectInput('startPattern', 'start_pattern_mode', () => { updatePatternVisibility(); reseed(); });
    selectInput('feedMode', 'feed_mode', () => { updateFeedNote(); reseed(); });
    slider($('ctlFeed'), 'feed_fade', { label: 'Fade out (s)', title: 'Seconds for the pattern injection to fade after a reseed (0 = never)', min: 0, max: 30, step: 0.1 });
    bound.push({ sync: updateFeedNote });
    colorInput('colTL', 'grad_col_tl'); colorInput('colTR', 'grad_col_tr'); colorInput('colBL', 'grad_col_bl'); colorInput('colBR', 'grad_col_br');
    check('showGrid', 'show_start_grid'); check('showCircles', 'show_circles');
    const c = $('ctlCircles');
    slider(c, 'circle_count', { label: 'Count', min: 1, max: 32, step: 1 });
    slider(c, 'circle_radius', { label: 'Radius', min: 0, max: 0.5, step: 0.01 });
    slider(c, 'circle_softness', { label: 'Softness', min: 0, max: 0.1, step: 0.001 });
    const rg = $('ctlRings');
    slider(rg, 'circle_grid_scale', { label: 'Ring scale', min: 0, max: 10, step: 0.01 });
    slider(rg, 'circle_grid_radius', { label: 'Ring width', min: 0, max: 1, step: 0.001 });
    slider(rg, 'circle_grid_softness', { label: 'Softness', min: 0, max: 1, step: 0.001 });
    slider($('ctlImage'), 'image_input_opacity', { label: 'Feed opacity', min: 0, max: 2, step: 0.01 });
    check('genOn', 'generator_on');
    colorInput('snowCol', 'snowflake_color');
    const sn = $('ctlSnow');
    slider(sn, 'generator_strength', { label: 'Strength', min: 0, max: 1, step: 0.01 });
    slider(sn, 'gen_branch_count', { label: 'Branches', min: 1, max: 8, step: 1 });
    slider(sn, 'gen_branch_angle', { label: 'Branch angle', min: 0, max: 3.14, step: 0.001 });
    slider(sn, 'gen_branch_len', { label: 'Branch length', min: 0, max: 0.5, step: 0.001 });
    slider(sn, 'gen_size', { label: 'Size', min: 0.1, max: 1, step: 0.01 });
    slider(sn, 'gen_thickness', { label: 'Thickness', min: 0.001, max: 0.1, step: 0.001 });

    // escape
    check('escOn', 'use_escape_time'); check('escInv', 'escape_invert');
    selectInput('escShape', 'escape_shape');
    const es = $('ctlEscape');
    slider(es, 'escape_limit', { label: 'Limit', min: 0, max: 10, step: 0.001 });
    slider(es, 'escape_smoothness', { label: 'Smoothness', min: 0, max: 2, step: 0.01 });

    // effects
    check('pMirX', 'post_mirror_x'); check('pMirY', 'post_mirror_y'); check('pKal', 'post_kaleidoscope_on');
    slider($('ctlKal'), 'post_kaleidoscope_slices', { label: 'Slices', min: 1, max: 24, step: 1 });
    const gr = $('ctlGrade');
    slider(gr, 'brightness', { label: 'Brightness', min: 0, max: 5, step: 0.001 });
    slider(gr, 'contrast', { label: 'Contrast', min: 0, max: 5, step: 0.001 });
    slider(gr, 'saturation', { label: 'Saturation', min: 0, max: 5, step: 0.001 });
    slider(gr, 'gamma', { label: 'Gamma', min: 0.1, max: 3, step: 0.01 });
    slider(gr, 'vibrance', { label: 'Vibrance', min: -5, max: 5, step: 0.01 });
    slider(gr, 'sharpen', { label: 'Sharpen', min: 0, max: 3, step: 0.01 });
    check('litOn', 'lighting_enabled');
    const li = $('ctlLight');
    slider(li, 'lighting_strength', { label: 'Depth', min: 0, max: 10, step: 0.01 });
    slider(li, 'lighting_specular', { label: 'Specular', min: 0, max: 5, step: 0.01 });
    slider(li, 'lighting_roughness', { label: 'Roughness', min: 1, max: 50, step: 0.1 });
    slider(li, 'light_dir_x', { label: 'Light X', min: -1, max: 1, step: 0.01 });
    slider(li, 'light_dir_y', { label: 'Light Y', min: -1, max: 1, step: 0.01 });

    // variation selects
    for (const id of ['varA', 'varB']) {
        const sel = $(id);
        const main = VARIATIONS.filter((v) => !v.tile).sort((a, b) => a.name.localeCompare(b.name));
        const tiles = VARIATIONS.filter((v) => v.tile).sort((a, b) => a.name.localeCompare(b.name));
        for (const v of main) { const o = document.createElement('option'); o.value = v.id; o.textContent = v.name; sel.appendChild(o); }
        const g = document.createElement('optgroup'); g.label = 'Rep-Tiles';
        for (const v of tiles) { const o = document.createElement('option'); o.value = v.id; o.textContent = v.name; g.appendChild(o); }
        sel.appendChild(g);
        const key = id === 'varA' ? 'variation_mode_a_id' : 'variation_mode_b_id';
        sel.addEventListener('change', () => { S[key] = parseInt(sel.value, 10); dirtyProgram = true; buildVarPanels(); persist(); });
        bound.push({ sync() { sel.value = String(S[key]); } });
    }
    document.querySelectorAll('[data-defaults]').forEach((b) => b.addEventListener('click', () => {
        const slot = b.dataset.defaults;
        const v = VARIATIONS[S[slot === 'a' ? 'variation_mode_a_id' : 'variation_mode_b_id']];
        for (const p of v.params) { S[pkey(p, slot)] = PARAMS[p].def; S[pkey(p, slot, true)] = 0; }
        syncUI(); persist();
    }));
}

// ------------------------------------------------------------------ variation panels
const varBound = { a: [], b: [] };
function buildVarPanels() {
    for (const slot of ['a', 'b']) {
        const host = $(slot === 'a' ? 'ctlVarA' : 'ctlVarB');
        // drop old controls from the bound list
        for (const c of varBound[slot]) { const i = bound.indexOf(c); if (i >= 0) bound.splice(i, 1); }
        varBound[slot] = [];
        host.innerHTML = '';
        const v = VARIATIONS[S[slot === 'a' ? 'variation_mode_a_id' : 'variation_mode_b_id']];
        $(slot === 'a' ? 'varAName' : 'varBName').textContent = v.name + (v.tile ? '  (Rep-Tile)' : '');
        const before = bound.length;
        if (!v.params.length) host.innerHTML = '<div class="note">No parameters.</div>';
        for (const base of v.params) {
            const p = PARAMS[base];
            if (p.opts) dropdown(host, pkey(base, slot), p.label, p.opts);
            else slider(host, pkey(base, slot), { label: p.label, min: p.min, max: p.max, step: p.step });
            if (v.speeds.includes(base)) {
                slider(host, pkey(base, slot, true), { label: '↻ speed', title: p.label + ' animation speed', min: -1, max: 1, step: 0.01, cls: 'speed' });
            }
        }
        varBound[slot] = bound.slice(before);
    }
}

const COMBINE_NOTES = [
    'Blend: the two mapped coordinates are averaged (original Fractility). Mix slides between A and B.',
    'IFS average: the image is mapped through A and B separately and the colours are averaged, weighted by Mix. Gives true attractor structure.',
    'IFS union: the brighter of the two mapped images wins, like a flame on black. Mix fades either side out.',
    'Patchwork: the screen is split into stable regions; A applies in some, B in others (Mix = share of B). A piecewise IFS — no grain.',
];
function updateCombineNote() {
    $('combineNote').textContent = COMBINE_NOTES[S.combine_mode | 0] || '';
    $('patchCtl').hidden = (S.combine_mode | 0) !== 3;
}

function updateOutsideUI() { $('outsideColLbl').hidden = (S.outside_fill | 0) !== 1; }

function updateFeedNote() {
    $('feedNote').textContent = S.feed_mode === 1
        ? 'Warped: the pattern is injected through the fractal map, so it never shows through as a flat overlay.'
        : 'Overlay (original Fractility): the pattern is re-added at screen position every iteration, so (1 − feedback) of it always shows through.';
}
function updatePatternVisibility() {
    const m = String(S.start_pattern_mode);
    document.querySelectorAll('[data-pat]').forEach((el) => { el.hidden = !el.dataset.pat.split(' ').includes(m); });
}

function syncUI() {
    for (const c of bound) c.sync();
    updatePatternVisibility();
}

// ------------------------------------------------------------------ actions
function reseed() { time = 0; }

function resetAll() {
    S = defaultState();
    dirtyProgram = true;
    frozen = false;
    buildVarPanels();
    syncUI();
    updateFreezeBtn();
    reseed();
    persist();
    toast('Reset to defaults');
}

const rnd = (a, b) => a + Math.random() * (b - a);
function randomize() {
    const o = randOpts;
    if (o.colors) for (const k of ['grad_col_tl', 'grad_col_tr', 'grad_col_bl', 'grad_col_br']) S[k] = col(Math.random(), Math.random(), Math.random());
    if (o.vars) {
        // same odds as Fractility: every main variation, plus one "Rep-Tiles" entry that picks a tile
        const main = VARIATIONS.filter((v) => !v.tile), tiles = VARIATIONS.filter((v) => v.tile);
        const pick = () => { const i = Math.floor(Math.random() * (main.length + 1)); return i < main.length ? main[i].id : tiles[Math.floor(Math.random() * tiles.length)].id; };
        S.variation_mode_a_id = pick(); S.variation_mode_b_id = pick();
        dirtyProgram = true;
    }
    const target = o.speed ? 0.9 : 0.8;
    if (target > S.feedback_max) S.feedback_max = target;
    S.feedback_amount = target;
    if (o.params) {
        for (const slot of ['a', 'b']) {
            const v = VARIATIONS[S[slot === 'a' ? 'variation_mode_a_id' : 'variation_mode_b_id']];
            for (const base of v.params) {
                const p = PARAMS[base];
                S[pkey(base, slot)] = p.opts ? Math.floor(Math.random() * p.opts.length) : rnd(p.min, p.max);
                if (v.speeds.includes(base)) S[pkey(base, slot, true)] = o.speed ? rnd(-0.1, 0.1) : 0;
            }
        }
        S.variation_mix = rnd(0.2, 0.8);
    }
    buildVarPanels();
    syncUI();
    reseed();
    persist();
}
let randOpts = { vars: true, params: true, speed: false, colors: true, startup: false };
function buildRandomUI() {
    try { Object.assign(randOpts, JSON.parse(localStorage.getItem(LS.rnd) || '{}')); } catch (_) { /* ignore */ }
    const map = { rndVars: 'vars', rndParams: 'params', rndSpeed: 'speed', rndColors: 'colors', rndStartup: 'startup' };
    for (const [id, k] of Object.entries(map)) {
        const el = $(id); el.checked = !!randOpts[k];
        el.addEventListener('change', () => { randOpts[k] = el.checked; try { localStorage.setItem(LS.rnd, JSON.stringify(randOpts)); } catch (_) { /* ignore */ } });
    }
}

function updateFreezeBtn() {
    const b = $('btnFreeze');
    b.textContent = frozen ? '▶ Resume' : '⏸ Freeze';
    b.classList.toggle('on', frozen);
}

// ------------------------------------------------------------------ presets (Fractility-compatible JSON)
function gatherPreset() {
    const d = { version: 'web-' + VERSION, app: 'Fractility Web', is_3d_view: false };
    for (const [k, v] of Object.entries(S)) d[k] = (v && typeof v === 'object') ? { ...v } : v;
    d.variation_mode_a = S.variation_mode_a_id; d.variation_mode_b = S.variation_mode_b_id;
    return d;
}
function applyPreset(data, quiet = false) {
    if (!data || typeof data !== 'object') throw new Error('Not a preset');
    const base = defaultState();
    const next = { ...base };
    for (const [k, v] of Object.entries(data)) {
        if (!(k in base)) continue;
        const ref = base[k];
        if (ref && typeof ref === 'object') {
            if (v && typeof v === 'object') next[k] = 'r' in ref ? col(+v.r || 0, +v.g || 0, +v.b || 0, v.a ?? 1) : v2(+v.x || 0, +v.y || 0);
        } else if (typeof ref === 'boolean') next[k] = !!v;
        else if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') { const n = Number(v); if (Number.isFinite(n)) next[k] = n; }
    }
    if (data.variation_mode_a_id === undefined && data.variation_mode_a !== undefined) next.variation_mode_a_id = +data.variation_mode_a;
    if (data.variation_mode_b_id === undefined && data.variation_mode_b !== undefined) next.variation_mode_b_id = +data.variation_mode_b;
    // Godot booleans for variation mirrors / dropdowns arrive as floats already; clamp ids
    for (const k of ['variation_mode_a_id', 'variation_mode_b_id']) {
        if (!VARIATIONS[next[k]]) { if (!quiet) toast('Preset uses a variation not in the web version (' + next[k] + ') — using Sinusoidal'); next[k] = 0; }
    }
    if (next.start_pattern_mode < 0 || next.start_pattern_mode > 5) next.start_pattern_mode = 0;
    // Presets from the Godot app predate feed modes: load them with the original overlay feed so they look the same.
    const fromGodot = !(typeof data.version === 'string' && data.version.startsWith('web-'));
    if (data.feed_mode === undefined) next.feed_mode = fromGodot ? 0 : base.feed_mode;
    next.feed_mode = next.feed_mode === 0 ? 0 : 1;
    // ...likewise the original coordinate blend and plain bilinear resampling
    if (data.combine_mode === undefined) next.combine_mode = fromGodot ? 0 : base.combine_mode;
    if (data.resample_mode === undefined) next.resample_mode = fromGodot ? 0 : base.resample_mode;
    next.combine_mode = Math.max(0, Math.min(3, Math.round(next.combine_mode)));
    next.resample_mode = next.resample_mode === 0 ? 0 : 1;
    next.loop_sharpen = Math.max(0, Math.min(1, next.loop_sharpen));
    next.outside_fill = Math.max(0, Math.min(2, Math.round(next.outside_fill)));
    for (const s of ['a', 'b']) if (data['glynn_tear_' + s] === undefined && fromGodot) next['glynn_tear_' + s] = 0; // original sand
    next.feed_fade = Math.max(0, next.feed_fade);
    next.feedback_amount = Math.min(next.feedback_max, Math.max(next.feedback_min, next.feedback_amount));
    S = next;
    dirtyProgram = true;
    buildVarPanels();
    syncUI();
    reseed();
    persist();
}

// ------------------------------------------------------------------ image / video input
let liveVideo = null, camStream = null;
function stopLive() {
    if (liveVideo) { liveVideo.pause(); if (liveVideo.src) URL.revokeObjectURL(liveVideo.src); liveVideo.srcObject = null; liveVideo = null; }
    if (camStream) { camStream.getTracks().forEach((t) => t.stop()); camStream = null; }
}
function useImageInput(label) {
    S.start_pattern_mode = 2;
    syncUI(); reseed(); persist();
    $('imgInfo').textContent = label;
}
async function loadMediaFile(file) {
    stopLive();
    if (file.type.startsWith('video/')) {
        const v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true;
        v.src = URL.createObjectURL(file);
        await v.play();
        liveVideo = v;
        R.setBackground(v, true);
        useImageInput('Video: ' + file.name);
    } else {
        const bmp = await createImageBitmap(file);
        const max = Math.min(R.maxTex, 4096);
        const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas');
        c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        R.setBackground(c, false);
        useImageInput(`Image: ${file.name} (${bmp.width}×${bmp.height})`);
    }
}
async function useCamera() {
    stopLive();
    try {
        camStream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    } catch (e) { toast('Camera unavailable: ' + e.message); return; }
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.srcObject = camStream;
    await v.play();
    liveVideo = v;
    R.setBackground(v, true);
    useImageInput('Camera (live)');
}

// ------------------------------------------------------------------ saving
async function savePNG() {
    try {
        const sel = $('saveW').value, asp = $('saveAspect').value;
        const viewAspect = R.w / R.h;
        const aspect = asp === 'view' ? viewAspect : parseFloat(asp);
        let w = sel === 'view' ? R.w : parseInt(sel, 10);
        let h = Math.round(w / aspect);
        const k = Math.min(1, R.maxTex / Math.max(w, h));
        w = Math.round(w * k); h = Math.round(h * k);
        ensureProgram();
        fillSlot(slotA, S.variation_mode_a_id, 'a'); fillSlot(slotB, S.variation_mode_b_id, 'b');
        const img = R.renderStill(feedbackUniforms(), postUniforms(), slotA, slotB, w, h);
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        c.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
        const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
        download(blob, `fractility_${stamp()}.png`);
        toast(`Saved ${img.width}×${img.height} PNG`);
    } catch (e) { console.error(e); toast('Save failed: ' + e.message); }
}

// ------------------------------------------------------------------ recording
const recSup = recordingSupport();
function setupRecUI() {
    const fmt = $('recFmt');
    const opt = (v) => fmt.querySelector(`option[value="${v}"]`);
    if (!recSup.mp4) { opt('mp4').disabled = true; opt('mp4').textContent += ' — not supported here'; }
    if (!recSup.webm) { opt('webm').disabled = true; opt('webm').textContent += ' — not supported here'; }
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(LS.file) || '{}'); } catch (_) { /* ignore */ }
    for (const id of ['recFmt', 'recFps', 'recMbps', 'saveW', 'saveAspect']) {
        const el = $(id);
        if (saved[id] && el.querySelector(`option[value="${saved[id]}"]:not([disabled])`)) el.value = saved[id];
        el.addEventListener('change', () => { saved[id] = el.value; try { localStorage.setItem(LS.file, JSON.stringify(saved)); } catch (_) { /* ignore */ } updateRecInfo(); });
    }
    if (fmt.selectedOptions[0] && fmt.selectedOptions[0].disabled) fmt.value = recSup.webm ? 'webm' : 'mp4';
    updateRecInfo();
}
function updateRecInfo() {
    const f = $('recFmt').value;
    const how = f === 'mp4' ? (recSup.mp4 === 'mediarecorder' ? 'native MP4 recorder' : recSup.mp4 === 'webcodecs' ? 'H.264 via WebCodecs' : 'unavailable') : (recSup.webm ? 'MediaRecorder' : 'unavailable');
    $('recInfo').textContent = `Records the view at ${R.w}×${R.h} (set Resolution in Main). Encoder: ${how}.`;
}
async function toggleRecord() {
    if (recorder.active) {
        const fmtName = recorder.format;
        setRecButtons(false);
        try {
            const blob = await recorder.stop();
            if (blob) download(blob, `fractility_${stamp()}.${fmtName === 'mp4' ? 'mp4' : 'webm'}`);
            toast('Recording saved');
        } catch (e) { console.error(e); toast('Recording failed: ' + e.message); }
        return;
    }
    try {
        await recorder.start($('recFmt').value, parseInt($('recFps').value, 10), parseInt($('recMbps').value, 10));
        setRecButtons(true);
    } catch (e) { console.error(e); toast(e.message, 3500); }
}
function setRecButtons(on) {
    for (const id of ['btnRec', 'btnRec2']) {
        const b = $(id);
        b.classList.toggle('recording', on);
        b.textContent = on ? '■ Stop' : (id === 'btnRec' ? '● Rec' : '● Start recording');
    }
    $('recBadge').hidden = !on;
}

// ------------------------------------------------------------------ input (pointer / touch / wheel / keys)
const pointers = new Map();
let gesture = null, lastTap = 0, tapHandledAt = 0, dragMoved = false;
function viewSize() { const r = canvas.getBoundingClientRect(); return [r.width, r.height]; }
function dominantInverse() {
    const id = S.variation_mix >= 0.5 ? S.variation_mode_b_id : S.variation_mode_a_id;
    return INVERSE_VARIATIONS.includes(id);
}
function translateBy(dx, dy) {
    const [w, h] = viewSize();
    const rx = dx / w, ry = dy / h;
    const mv = (k) => { S[k] = v2(S[k].x - rx, S[k].y - ry); };
    if (S.move_post_translate) mv('post_translate');
    if (S.move_pre_translate) mv('pre_translate');
    if (S.move_var_a_translate) mv('translate_a');
    if (S.move_var_b_translate) mv('translate_b');
}
function twoInfo() {
    const [a, b] = [...pointers.values()];
    return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.hypot(b.x - a.x, b.y - a.y) || 1, ang: Math.atan2(b.y - a.y, b.x - a.x) };
}
canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragMoved = false;
    if (pointers.size === 2) gesture = twoInfo();
    // double-tap / double-click → reseed (mobile browsers don't reliably fire dblclick)
    if (pointers.size === 1) {
        const now = performance.now();
        if (now - lastTap < 300 && now - tapHandledAt > 400) { tapHandledAt = now; reseed(); toast('Reseeded', 900); }
        lastTap = now;
    }
});
canvas.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 1) {
        if (dx || dy) { dragMoved = true; translateBy(dx, dy); }
    } else if (pointers.size === 2 && gesture) {
        const g = twoInfo();
        // two-finger drag pans
        translateBy(g.mx - gesture.mx, g.my - gesture.my);
        // pinch zooms the post transform (same direction convention as the wheel)
        // post_scale is a per-iteration zoom, so it is nudged gently (spreading 2x ≈ 7 wheel notches)
        let dz = Math.log(g.d / gesture.d) * 0.05;
        if (!dominantInverse()) dz = -dz;
        S.post_scale = Math.max(0.1, Math.min(3, S.post_scale + dz));
        // twist rotates (also per-iteration, so scaled down)
        let da = g.ang - gesture.ang;
        if (da > Math.PI) da -= 2 * Math.PI; else if (da < -Math.PI) da += 2 * Math.PI;
        S.post_rotation += da * 0.1;
        gesture = g;
        dragMoved = true;
        syncTransformCtls();
    }
});
function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) gesture = null;
    if (pointers.size === 1) { /* continue as single drag from current point */ }
    if (pointers.size === 0) {
        if (dragMoved && S.reset_on_drag_enabled) reseed();
        persist();
    }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const notches = Math.max(-5, Math.min(5, -e.deltaY / (e.deltaMode === 1 ? 3 : 100)));
    let delta = 0.005 * notches;
    if (!dominantInverse()) delta *= -1;
    if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey) S.pre_rotation += delta * 5; else S.pre_scale = Math.max(0.1, S.pre_scale + delta);
    } else if (e.shiftKey) S.post_rotation += delta * 5;
    else S.post_scale = Math.max(0.1, S.post_scale + delta);
    syncTransformCtls();
    persist();
}, { passive: false });
function syncTransformCtls() {
    for (const c of bound) if (c.row && /c_(pre|post)_(scale|rotation)/.test(c.row.querySelector('input')?.id || '')) c.sync();
}

window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'checkbox' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'r') resetAll();
    else if (k === 't') { reseed(); toast('Reseeded', 900); }
    else if (k === 'u') toggleUI();
    else if (k === ' ') { if (t && t.tagName === 'BUTTON') return; e.preventDefault(); frozen = !frozen; updateFreezeBtn(); }
});

function toggleUI() {
    document.body.classList.toggle('noui');
    $('btnShowUI').hidden = !document.body.classList.contains('noui');
}

// ------------------------------------------------------------------ phone layout: docked view + tabs
const TAB_MQ = window.matchMedia('(max-width: 760px), (max-height: 500px) and (orientation: landscape)');
function buildTabs() {
    const strip = $('tabstrip');
    strip.innerHTML = '';
    const secs = [...document.querySelectorAll('#panel > .sec')].filter((s) => !s.hidden);
    let cur = null;
    try { cur = localStorage.getItem(LS.tab); } catch (_) { /* ignore */ }
    if (!secs.some((s) => s.dataset.tab === cur)) cur = secs[0] && secs[0].dataset.tab;
    for (const s of secs) {
        const b = document.createElement('button');
        b.textContent = s.querySelector('h2').textContent;
        b.dataset.tab = s.dataset.tab;
        b.addEventListener('click', () => selectTab(s.dataset.tab));
        strip.appendChild(b);
    }
    selectTab(cur, false);
}
function selectTab(tab, store = true) {
    document.querySelectorAll('#panel > .sec').forEach((s) => s.classList.toggle('tabon', s.dataset.tab === tab));
    document.querySelectorAll('#tabstrip button').forEach((b) => b.classList.toggle('cur', b.dataset.tab === tab));
    const cur = document.querySelector('#tabstrip button.cur');
    if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    $('panel').scrollTop = 0;
    if (store) { try { localStorage.setItem(LS.tab, tab); } catch (_) { /* ignore */ } }
}
function applyLayoutMode() {
    document.body.classList.toggle('tabbed', TAB_MQ.matches);
    if (TAB_MQ.matches) buildTabs();
}
TAB_MQ.addEventListener('change', applyLayoutMode);

const COARSE = window.matchMedia('(pointer: coarse)');
function updateHint() {
    $('hint').textContent = COARSE.matches
        ? 'drag: move · pinch: zoom · twist: rotate · two fingers: pan · double-tap: reseed'
        : 'drag: move · wheel: zoom · shift+wheel: rotate · ctrl: pre-transform · double-click/T: reseed · R reset · U hide UI';
}
COARSE.addEventListener('change', updateHint);

// ------------------------------------------------------------------ sizing
let resMode = 'dpr';
function resizeToView() {
    const r = $('view').getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const k = resMode === 'dpr' ? Math.min(2, dpr) : parseFloat(resMode);
    const w = Math.max(16, Math.round(r.width * k)), h = Math.max(16, Math.round(r.height * k));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
    }
    R.resize(w, h);
    updateRecInfo();
}
new ResizeObserver(() => { if (!recorder.active) resizeToView(); }).observe($('view'));

// ------------------------------------------------------------------ loop
function iterate(stepDt) {
    if (!S.animation_paused) time += stepDt;
    fillSlot(slotA, S.variation_mode_a_id, 'a'); fillSlot(slotB, S.variation_mode_b_id, 'b');
    R.step(feedbackUniforms(), slotA, slotB);
    itN++;
}
let simRate = 20, acc = 0, last = performance.now(), fpsT = 0, fpsN = 0, itN = 0;
function frame(now) {
    requestAnimationFrame(frame);
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.25) dt = 0.25;
    ensureProgram();
    let steps = 0;
    if (!frozen) {
        if (simRate <= 0) steps = 1;
        else { acc += dt; const period = 1 / simRate; if (acc >= period) { steps = 1; acc = Math.min(acc - period, period); } }
    }
    // time advances by the real time between iterations, like Godot's `time += delta` at max_fps 20
    if (steps) iterate(simRate <= 0 ? dt : 1 / simRate);
    R.present(postUniforms());
    recorder.onFrame();
    fpsN++; fpsT += dt;
    if (fpsT >= 0.5) {
        $('stat').textContent = `${Math.round(fpsN / fpsT)} fps · ${Math.round(itN / fpsT)} it/s · ${R.w}×${R.h} · ${R.precision === 'float' ? 'float' : '8-bit'}`;
        fpsN = 0; itN = 0; fpsT = 0;
    }
    if (recorder.active) {
        const s = recorder.elapsed();
        $('recBadge').textContent = `● REC ${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')} ${recorder.format.toUpperCase()}`;
    }
}

// ------------------------------------------------------------------ boot
function boot() {
    $('ver').textContent = 'v' + VERSION;
    try {
        const saved = JSON.parse(localStorage.getItem(LS.state) || 'null');
        if (saved) applyPreset(saved, true);
    } catch (_) { /* fresh */ }
    buildStaticUI();
    buildVarPanels();
    buildRandomUI();
    setupRecUI();
    syncUI();

    const sr = $('simRate');
    sr.value = String(simRate);
    sr.addEventListener('change', () => { simRate = parseInt(sr.value, 10); });
    const bp = $('bufPrec');
    if (R.floatType) bp.querySelector('option[value="float"]').textContent = R.floatName + ' (smooth)';
    else { const o = bp.querySelector('option[value="float"]'); o.disabled = true; o.textContent = 'Float — not supported here'; }
    let prec = 'float';
    try { prec = localStorage.getItem('fractility.precision') || 'float'; } catch (_) { /* ignore */ }
    R.setPrecision(prec);
    bp.value = R.precision;
    bp.addEventListener('change', () => { R.setPrecision(bp.value); bp.value = R.precision; try { localStorage.setItem('fractility.precision', R.precision); } catch (_) { /* ignore */ } });
    const rs = $('resScale');
    resMode = COARSE.matches ? '1' : 'dpr';
    try { resMode = localStorage.getItem('fractility.res') || resMode; } catch (_) { /* ignore */ }
    if (![...rs.options].some((o) => o.value === resMode)) resMode = 'dpr';
    rs.value = resMode;
    rs.addEventListener('change', () => { resMode = rs.value; try { localStorage.setItem('fractility.res', resMode); } catch (_) { /* ignore */ } resizeToView(); });

    $('btnFreeze').addEventListener('click', () => { frozen = !frozen; updateFreezeBtn(); });
    $('btnReseed').addEventListener('click', () => { reseed(); toast('Reseeded', 900); });
    $('btnReset').addEventListener('click', resetAll);
    $('btnRandom').addEventListener('click', randomize);
    $('btnRandom2').addEventListener('click', randomize);
    $('btnSave').addEventListener('click', savePNG);
    $('btnSave2').addEventListener('click', savePNG);
    $('btnRec').addEventListener('click', toggleRecord);
    $('btnRec2').addEventListener('click', toggleRecord);
    $('btnHide').addEventListener('click', toggleUI);
    $('btnShowUI').addEventListener('click', toggleUI);

    $('btnLoadImg').addEventListener('click', () => $('fileImg').click());
    $('fileImg').addEventListener('change', async (e) => {
        const f = e.target.files[0]; e.target.value = '';
        if (f) { try { await loadMediaFile(f); } catch (err) { console.error(err); toast('Could not load: ' + err.message); } }
    });
    $('btnCam').addEventListener('click', useCamera);
    $('btnClearImg').addEventListener('click', () => { stopLive(); R.clearBackground(); $('imgInfo').textContent = 'No source loaded.'; reseed(); });

    $('btnPresetSave').addEventListener('click', () => {
        download(new Blob([JSON.stringify(gatherPreset(), null, 1)], { type: 'application/json' }), `fractility_preset_${stamp()}.json`);
    });
    $('btnPresetLoad').addEventListener('click', () => $('filePreset').click());
    $('filePreset').addEventListener('change', async (e) => {
        const f = e.target.files[0]; e.target.value = '';
        if (!f) return;
        try { applyPreset(JSON.parse(await f.text())); toast('Preset loaded'); } catch (err) { toast('Not a valid preset: ' + err.message); }
    });
    $('btnPresetCopy').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(gatherPreset())); toast('Preset copied'); }
        catch (_) { $('pasteText').value = JSON.stringify(gatherPreset()); $('pasteDlg').showModal(); }
    });
    $('btnPresetPaste').addEventListener('click', async () => {
        let txt = null;
        try { txt = await navigator.clipboard.readText(); } catch (_) { /* fall back to dialog */ }
        if (txt) { try { applyPreset(JSON.parse(txt)); toast('Preset pasted'); return; } catch (_) { /* show dialog */ } }
        $('pasteText').value = txt || ''; $('pasteDlg').showModal();
    });
    $('pasteDlg').addEventListener('close', () => {
        if ($('pasteDlg').returnValue !== 'ok') return;
        try { applyPreset(JSON.parse($('pasteText').value)); toast('Preset applied'); } catch (err) { toast('Not a valid preset: ' + err.message); }
    });

    updateHint();
    setTimeout(() => $('hint').classList.add('fade'), 6000);
    applyLayoutMode();
    resizeToView();
    if (randOpts.startup) randomize();
    reseed();
    if (!R.hasHighp) toast('This GPU lacks highp floats — some variations may look blocky.', 4000);
    requestAnimationFrame(frame);
    window.__fractility = { get S() { return S; }, R, applyPreset, gatherPreset, randomize, reseed, recorder, step: () => { ensureProgram(); iterate(0.05); R.present(postUniforms()); }, VERSION };
}
boot();
