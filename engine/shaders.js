// Fractility Web — shader sources (GLSL ES 1.00 / WebGL1).
// The feedback shader is specialised per (Variation A, Variation B) pair: only the two
// active variation bodies are compiled, and their parameters are read from two packed
// uniform arrays (uA / uB). This keeps the program small enough for mobile GPUs, which
// could never hold the ~600 scalar uniforms of the original Godot monolith.

import { VAR_GLSL, VARIATIONS, PARAMS } from './varlib.js?v=1.4.1';

export const SLOT_VEC4 = 8; // 32 floats per variation slot

const PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;

export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

// ---------- helpers (verbatim ports from fractal_feedback.gdshader) ----------
const HELPERS = `
#define PI 3.14159265358979
vec2 random(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}
float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
float modulate(float amp, float freq, float x) { return amp * cos(x * freq * 6.2831853); }
float perlin_noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(random(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(random(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(random(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(random(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 st, int octaves, float ridge_mix) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        float n = perlin_noise(st);
        float ridge = 1.0 - abs(n);
        float final_n = mix(n * 0.5 + 0.5, ridge, ridge_mix);
        value += amplitude * final_n;
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
mat2 rotate(float angle) { return mat2(vec2(cos(angle), -sin(angle)), vec2(sin(angle), cos(angle))); }
float sqr(float x) { return x * x; }
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float sdTriangle(vec2 p, float r) {
    const float k = 1.7320508;
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}
vec2 to_hex_grid(vec2 p) {
    float SQRT_3 = 1.7320508;
    return mat2(vec2(1.0, 0.0), vec2(0.5, SQRT_3 / 2.0)) * p;
}
float get_cell_value(vec2 p, vec2 offset) {
    p += offset;
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
vec2 apply_quad_transform(vec2 p, int transform_id) {
    if (transform_id == 1) p = vec2(-p.y, p.x);
    else if (transform_id == 2) p = -p;
    else if (transform_id == 3) p = vec2(p.y, -p.x);
    else if (transform_id == 4) p = vec2(-p.x, p.y);
    else if (transform_id == 5) p = vec2(p.x, -p.y);
    return p;
}
// GLSL ES 1.00 lacks the hyperbolic functions
vec2 f_sinh(vec2 x) { vec2 e = exp(clamp(x, -80.0, 80.0)); return 0.5 * (e - 1.0 / e); }
vec2 f_cosh(vec2 x) { vec2 e = exp(clamp(x, -80.0, 80.0)); return 0.5 * (e + 1.0 / e); }
float f_asinh(float x) { return sign(x) * log(abs(x) + sqrt(x * x + 1.0)); }

// ---------- shared ring-zone textures (Glynn Sim + Lazy Mega) ----------
// Set by ringTexture when a cut is filled with a map type; read (and reset) by main() around each
// variation call, so the filled cut can be shaded without touching the mapped coordinate.
float g_cut_shade = 0.0;
float ringHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

// Returns vec2(10000.0) (the "outside" sentinel, drawn black) for cut points, otherwise a mapped coordinate.
//  pu / pr : ring point unrotated / rotated by ring spin (identical for Glynn)
//  tex_fb  : the variation's own TEXTURE mapping;  keep_fb : what a non-cut point maps to
//  Modes 0-6 are the original Fractility patterns and match it exactly at detail 1 / fill 0.5.
vec2 ringTextureRaw(int mode, vec2 pu, vec2 pr, float dist, float inner, float outer,
                    float detail, float fill, float segs, float phase, vec2 tex_fb, vec2 keep_fb) {
    const vec2 CUT = vec2(10000.0);
    const float TAU = 6.2831853;
    fill = clamp(fill, 0.0, 1.0);
    float thr = (abs(fill - 0.5) < 0.0001) ? 0.0 : cos(PI * fill); // sin(x) > thr covers a 'fill' share; exact 0 at the default
    float band = max(outer - inner, 0.0001);
    float t = clamp((dist - inner) / band, 0.0, 1.0);  // 0 at inner edge, 1 at outer edge
    float a = atan(pr.y, pr.x);
    float S = max(1.0, floor(segs + 0.5));       // whole number of segments -> seamless around the ring
    float rows = max(1.0, floor(detail * 2.0 + 0.5));
    float u = (a / TAU + 0.5) * S;
    float v = t * rows;
    float k10 = max(1.0, floor(10.0 * detail + 0.5));

    // --- originals ---
    if (mode == 0) return CUT;                                                          // Empty
    if (mode == 1) return tex_fb;                                                       // Texture
    if (mode == 2) return (sin(dist * 50.0 * detail + phase) > thr) ? CUT : keep_fb;    // Stripes
    if (mode == 3) return (sin(dist * 20.0 * detail) * sin(atan(pu.y, pu.x) * k10) > thr) ? CUT : keep_fb; // Checkers
    if (mode == 4) { vec2 g = fract(pr * 10.0 * detail) - 0.5;                          // Dots
                     return (length(g) < 0.3 * sqrt(fill / 0.5)) ? CUT : keep_fb; }
    if (mode == 5) { float w = sin(pr.x * 20.0 * detail + time) + sin(pr.y * 20.0 * detail + time); // Plasma
                     return (w > 2.0 * thr) ? CUT : keep_fb; }
    if (mode == 6) return (sin(a * k10 + dist * 40.0 * detail) > thr) ? CUT : keep_fb;  // Spiral

    // --- new cut patterns (band coordinates u = around, v = across) ---
    if (mode <= 17) {
        bool cut = false;
        if (mode == 7) {                                     // Honeycomb: hexagonal holes, lattice remains
            vec2 q = vec2(u, v * 1.1547);
            vec2 hs = vec2(1.0, 1.7320508);
            vec2 ga = mod(q, hs) - hs * 0.5;
            vec2 gb = mod(q - hs * 0.5, hs) - hs * 0.5;
            vec2 g = (dot(ga, ga) < dot(gb, gb)) ? ga : gb;
            vec2 ag = abs(g);
            float hd = max(dot(ag, vec2(0.5, 0.8660254)), ag.x);   // 0 centre .. 0.5 edge
            cut = hd < 0.5 * fill;
        } else if (mode == 8) {                              // Bricks: black mortar
            float row = floor(v);
            vec2 f = vec2(fract(u + 0.5 * mod(row, 2.0)), fract(v));
            float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * 2.0;
            cut = e < 0.3 * fill;
        } else if (mode == 9) {                              // Waves
            cut = fract(v + 0.35 * sin(u * TAU)) < fill;
        } else if (mode == 10) {                             // Zigzag / chevrons
            cut = fract(v + abs(fract(u) - 0.5) * 1.5) < fill;
        } else if (mode == 11) {                             // Scales: overlapping arcs
            float row = floor(v);
            vec2 f = vec2(fract(u + 0.5 * mod(row, 2.0)) - 0.5, fract(v));
            cut = abs(length(f) - 0.5) < 0.24 * fill;
        } else if (mode == 12) {                             // Cracks: Voronoi cell edges
            vec2 q = vec2(u, v * 1.5);
            vec2 i = floor(q), f = fract(q);
            float d1 = 8.0, d2 = 8.0;
            for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
                vec2 o = vec2(float(x), float(y));
                vec2 id = i + o;
                id.x = mod(id.x, S);                         // wrap ids around the ring
                vec2 c = o + vec2(ringHash(id), ringHash(id + 17.3));
                float d = length(c - f);
                if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
            }
            cut = (d2 - d1) < 0.25 * fill;
        } else if (mode == 13) {                             // Sunburst: tapered rays
            cut = abs(fract(u) - 0.5) * 2.0 < fill * (1.0 - t);
        } else if (mode == 14) {                             // Weave: diamond gaps between crossing strands
            float s1 = abs(fract(u + v) - 0.5), s2 = abs(fract(u - v) - 0.5);
            cut = min(s1, s2) > 0.5 * (1.0 - fill);
        } else if (mode == 15) {                             // Dashes: random-length dashes per row
            float row = floor(v);
            float h = ringHash(vec2(mod(floor(u), S), row));
            cut = fract(u) < h * fill * 1.6;
        } else if (mode == 16) {                             // Noise: organic blotches
            float n = perlin_noise(pr * 6.0 * detail / max(inner, 0.05)) + 0.5 * perlin_noise(pr * 12.0 * detail / max(inner, 0.05) + 3.1);
            cut = (n * 0.6 + 0.5) < fill;
        } else {                                             // 17 Moire: two interfering ring sets
            vec2 c = vec2(0.25 * inner, 0.0);
            cut = sin(length(pr - c) * 60.0 * detail) * sin(length(pr + c) * 60.0 * detail) > thr;
        }
        return cut ? CUT : keep_fb;
    }

    // --- new map types: remap the image into the band instead of cutting ---
    float rs = inner * (1.0 - t);                            // band mirrored into the inner disk
    if (mode == 18) return vec2(cos(a), sin(a)) * rs;        // Mirror band
    if (mode == 19) {                                        // Unwrap: the whole image wrapped around the band
        float x = fract((a / TAU + 0.5) * S) * 2.0 - 1.0;
        return vec2(x, t * 2.0 - 1.0) * inner * detail;
    }
    if (mode == 20) {                                        // Kaleido band
        float sa = TAU / S;
        float k = abs(mod(a, sa) - 0.5 * sa);
        return vec2(cos(k), sin(k)) * rs;
    }
    if (mode == 21) {                                        // Twist band
        float k = a + t * PI * 2.0 * detail;
        return vec2(cos(k), sin(k)) * rs;
    }
    if (mode == 22) {                                        // Ripple band
        float r2 = rs + sin(a * S + phase) * fill * 0.3 * inner;
        return vec2(cos(a), sin(a)) * r2;
    }
    if (mode == 23) {                                        // Tiles: S small copies of the inner disk
        float sa = TAU / S;
        float ac = (floor((a + PI) / sa) + 0.5) * sa - PI;
        float rm = inner + 0.5 * band;
        vec2 c = vec2(cos(ac), sin(ac)) * rm;
        float rad = 0.5 * min(band, rm * sa) * (0.4 + fill);
        vec2 l = pr - c;
        if (length(l) > rad) return CUT;
        return l / rad * inner;
    }
    return keep_fb;
}

// Ring texture with "cut fill": cut points take a map type instead of the black sentinel.
// cutfill: 0 Black (original), 1 Texture, 2 Mirror, 3 Unwrap, 4 Kaleido, 5 Twist, 6 Ripple
vec2 ringTexture(int mode, vec2 pu, vec2 pr, float dist, float inner, float outer,
                 float detail, float fill, float segs, float phase, vec2 tex_fb, vec2 keep_fb, float cutfill, float cutshade) {
    vec2 r = ringTextureRaw(mode, pu, pr, dist, inner, outer, detail, fill, segs, phase, tex_fb, keep_fb);
    if (r.x > 5000.0) {
        int cf = int(floor(cutfill + 0.5));
        if (cf >= 1) g_cut_shade = clamp(cutshade, 0.0, 1.0);
        if (cf == 1) return tex_fb;
        if (cf >= 2) return ringTextureRaw(16 + cf, pu, pr, dist, inner, outer, detail, fill, segs, phase, tex_fb, keep_fb);
    }
    return r;
}
`;

// ---------- token resolution ----------
/** Uniform layout for a variation: [{key, comp}] where key is a param base or base+'_speed'. */
export function slotLayout(varId) {
    const v = VARIATIONS[varId];
    const keys = [];
    for (const p of v.params) {
        keys.push(p);
        if (v.speeds.includes(p)) keys.push(p + '_speed');
    }
    if (keys.length > SLOT_VEC4 * 4) throw new Error('slot overflow ' + varId);
    return keys;
}

function resolveBody(varId, arrName) {
    const keys = slotLayout(varId);
    const idx = new Map(keys.map((k, i) => [k, i]));
    return VAR_GLSL[varId].replace(/\$(\w+)/g, (_, name) => {
        if (idx.has(name)) {
            const i = idx.get(name);
            return `${arrName}[${i >> 2}].${'xyzw'[i & 3]}`;
        }
        if (name.endsWith('_speed')) return '0.0';
        throw new Error(`unresolved token $${name} in variation ${varId}`);
    });
}

function starsTerm(varId, arrName) {
    if (varId !== 38) return '';
    const i = slotLayout(38).indexOf('nebula_stars');
    return `star_density += ${arrName}[${i >> 2}].${'xyzw'[i & 3]};`;
}

// ---------- feedback program ----------
export function feedbackFragment(idA, idB) {
    return PRECISION + `
uniform sampler2D previous_frame;
uniform sampler2D background_texture;
uniform bool has_background;
uniform vec2 resolution;
uniform float time;
uniform vec4 uA[${SLOT_VEC4}];
uniform vec4 uB[${SLOT_VEC4}];

uniform int start_pattern_mode;
uniform float variation_mix;
uniform float feedback_amount;
uniform bool seamless_tiling;
uniform bool mirror_tiling;
uniform bool show_grid;
uniform bool show_circles;
uniform float escape_limit;
uniform bool use_escape_time;
uniform int escape_shape;
uniform float escape_smoothness;
uniform bool escape_invert;
uniform float generator_strength;
uniform float image_input_opacity;
uniform int feed_mode;
uniform int combine_mode;
uniform int resample_mode;
uniform float loop_sharpen;
uniform vec2 prev_res;
uniform vec2 frame_seed;
uniform int outside_fill;
uniform vec4 outside_color;
uniform float patch_scale;
uniform float patch_soft;
uniform float patch_drift;
uniform int patch_shape;
uniform float feed_fade;
uniform bool lighting_enabled;
uniform float lighting_strength;
uniform float lighting_specular;
uniform float lighting_roughness;
uniform vec2 light_direction;
uniform float circle_count;
uniform float circle_radius;
uniform float circle_softness;
uniform vec4 grad_col_tl;
uniform vec4 grad_col_tr;
uniform vec4 grad_col_bl;
uniform vec4 grad_col_br;
uniform float circle_grid_scale;
uniform float circle_grid_radius;
uniform float circle_grid_softness;
uniform float pre_scale;
uniform float pre_rotation;
uniform vec2 pre_translate;
uniform vec2 translate_a;
uniform vec2 translate_b;
uniform float post_scale;
uniform float post_rotation;
uniform vec2 post_translate;
// Snowflake generator (Snoflake.gdshader, evaluated inline)
uniform vec4 snowflake_color;
uniform float snow_size;
uniform float snow_thickness_gen;
uniform int snow_branch_count;
uniform float snow_branch_angle;
uniform float snow_branch_len;
` + HELPERS + `
vec2 var_A(vec2 uv) {
    vec2 p = uv;
    {
${resolveBody(idA, 'uA')}
    }
    return uv;
}
vec2 var_B(vec2 uv) {
    vec2 p = uv;
    {
${resolveBody(idB, 'uB')}
    }
    return uv;
}

float sdLine(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}
vec4 snowflake(vec2 UV) {
    vec2 uv = (UV - 0.5) * 2.0;
    float angle = atan(uv.x, uv.y);
    float radius = length(uv);
    float slice = 3.14159 / 3.0;
    angle = mod(angle, slice) - 0.5 * slice;
    angle = abs(angle);
    vec2 p = vec2(sin(angle), cos(angle)) * radius;
    float dist = 100.0;
    dist = min(dist, sdLine(p, vec2(0.0, 0.0), vec2(0.0, snow_size)));
    for (int i = 1; i <= 8; i++) {
        if (i > snow_branch_count) break;
        float t = float(i) / float(snow_branch_count + 1) * snow_size;
        vec2 start_pos = vec2(0.0, t);
        float taper = 1.0 - (t / snow_size) * 0.3;
        vec2 tip_pos = start_pos + vec2(sin(snow_branch_angle), cos(snow_branch_angle)) * snow_branch_len * taper;
        dist = min(dist, sdLine(p, start_pos, tip_pos));
    }
    float shape = 1.0 - smoothstep(snow_thickness_gen, snow_thickness_gen + 0.01, dist);
    return vec4(snowflake_color.rgb, shape * snowflake_color.a);
}

vec4 gradient(vec2 UV) {
    vec4 top_mix = mix(grad_col_tl, grad_col_tr, UV.x);
    vec4 bottom_mix = mix(grad_col_bl, grad_col_br, UV.x);
    return mix(top_mix, bottom_mix, UV.y);
}

// The feedback buffer is stored with Godot's UV convention (UV.y = 0 at the top of the image),
// so texel row v holds UV.y = v. The display pass flips it upright.
vec4 prevAt(vec2 uv) { return texture2D(previous_frame, fract(uv)); } // emulates repeat_enable on NPOT

// Start pattern as a function of position, so it can be evaluated on screen (seed / original
// overlay feed) or at the fractal-mapped coordinate (warped feed).
vec4 startPattern(vec2 UV) {
    vec4 start_pattern_color;
    if (start_pattern_mode == 0) {
        start_pattern_color = gradient(UV);
        if (show_grid) {
            vec2 pixel_coords = UV * resolution;
            if (mod(pixel_coords.x, 50.0) < 1.5 || mod(pixel_coords.y, 50.0) < 1.5) start_pattern_color *= 1.5;
        }
    } else if (start_pattern_mode == 1) {
        vec4 gradient_color = gradient(UV);
        start_pattern_color = gradient_color;
        if (show_circles) {
            vec2 grid_uv = fract(UV * circle_count);
            float d = distance(grid_uv, vec2(0.5));
            float circle = 1.0 - smoothstep(circle_radius, circle_radius + circle_softness, d);
            start_pattern_color = vec4(vec3(circle), 1.0) * gradient_color;
        }
    } else if (start_pattern_mode == 2) {
        start_pattern_color = has_background ? texture2D(background_texture, UV) : vec4(0.0, 0.0, 0.0, 1.0);
    } else if (start_pattern_mode == 3) {
        float n = perlin_noise(UV * 10.0);
        n = (n + 1.0) * 0.5;
        start_pattern_color = vec4(vec3(n), 1.0);
    } else if (start_pattern_mode == 4) {
        vec4 gradient_color_A = gradient(UV);
        vec4 gradient_color_B = mix(mix(grad_col_br, grad_col_bl, UV.x), mix(grad_col_tr, grad_col_tl, UV.x), UV.y);
        float d = distance(UV, vec2(0.5)) * 2.0;
        float v = fract(d * circle_grid_scale);
        float half_width = circle_grid_radius * 0.5;
        float ring_value = smoothstep(0.5 - half_width - circle_grid_softness, 0.5 - half_width, v) -
                           smoothstep(0.5 + half_width, 0.5 + half_width + circle_grid_softness, v);
        start_pattern_color = mix(gradient_color_B, gradient_color_A, ring_value);
    } else if (start_pattern_mode == 5) {
        start_pattern_color = gradient(UV);
        vec4 snow_tex = snowflake(UV);
        start_pattern_color = mix(start_pattern_color, snow_tex, snow_tex.a * generator_strength);
    } else {
        start_pattern_color = gradient(UV);
    }
    return start_pattern_color;
}

// --- resampling the previous frame ---
vec4 samplePrevLinear(vec2 uv) { return prevAt(uv); }

// 9-tap Catmull-Rom (bicubic) using bilinear taps; result clamped to the taps' range (no ringing build-up).
vec4 samplePrevCubic(vec2 uv) {
    vec2 samplePos = uv * prev_res;
    vec2 texPos1 = floor(samplePos - 0.5) + 0.5;
    vec2 f = samplePos - texPos1;
    vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
    vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
    vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
    vec2 w3 = f * f * (-0.5 + 0.5 * f);
    vec2 w12 = w1 + w2;
    vec2 offset12 = w2 / w12;
    vec2 t0 = (texPos1 - 1.0) / prev_res;
    vec2 t3 = (texPos1 + 2.0) / prev_res;
    vec2 t12 = (texPos1 + offset12) / prev_res;
    vec4 s00 = prevAt(vec2(t0.x, t0.y)),  s10 = prevAt(vec2(t12.x, t0.y)),  s20 = prevAt(vec2(t3.x, t0.y));
    vec4 s01 = prevAt(vec2(t0.x, t12.y)), s11 = prevAt(vec2(t12.x, t12.y)), s21 = prevAt(vec2(t3.x, t12.y));
    vec4 s02 = prevAt(vec2(t0.x, t3.y)),  s12 = prevAt(vec2(t12.x, t3.y)),  s22 = prevAt(vec2(t3.x, t3.y));
    vec4 r = (s00 * w0.x + s10 * w12.x + s20 * w3.x) * w0.y
           + (s01 * w0.x + s11 * w12.x + s21 * w3.x) * w12.y
           + (s02 * w0.x + s12 * w12.x + s22 * w3.x) * w3.y;
    vec4 lo = min(min(min(s00, s10), min(s20, s01)), min(min(s11, s21), min(min(s02, s12), s22)));
    vec4 hi = max(max(max(s00, s10), max(s20, s01)), max(max(s11, s21), max(max(s02, s12), s22)));
    return clamp(r, lo, hi);
}

vec4 samplePrev(vec2 uv) {
    vec4 c = (resample_mode == 1) ? samplePrevCubic(uv) : samplePrevLinear(uv);
    if (loop_sharpen > 0.0) {
        // unsharp mask applied inside the loop, counteracting the per-iteration resampling blur
        vec2 px = 1.0 / prev_res;
        vec4 blur = (prevAt(uv + vec2(px.x, 0.0)) + prevAt(uv - vec2(px.x, 0.0)) +
                     prevAt(uv + vec2(0.0, px.y)) + prevAt(uv - vec2(0.0, px.y))) * 0.25;
        c = clamp(c + (c - blur) * (loop_sharpen * 0.15), 0.0, 1.0); // compounds every iteration, so kept gentle
    }
    return c;
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

// Weight of map B at screen position uv for the Patchwork combine mode. m = target share of B.
float patchWeightB(vec2 uv, float m) {
    vec2 q = uv * patch_scale + vec2(0.31, 0.17) * time * patch_drift;
    if (patch_shape == 1) {
        // Voronoi cells, each cell randomly assigned to A or B; soft seam from the F2 - F1 border distance
        vec2 i = floor(q), f = fract(q);
        float d1 = 8.0, d2 = 8.0; vec2 id1 = vec2(0.0), id2 = vec2(0.0);
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
            vec2 o = vec2(float(x), float(y));
            vec2 c = o + hash22(i + o);
            float d = length(c - f);
            if (d < d1) { d2 = d1; id2 = id1; d1 = d; id1 = i + o; }
            else if (d < d2) { d2 = d; id2 = i + o; }
        }
        float b1 = step(hash12(id1 * 1.7 + 11.3), m);
        float b2 = step(hash12(id2 * 1.7 + 11.3), m);
        float seam = smoothstep(0.0, max(patch_soft, 0.001), 0.5 * (d2 - d1));
        return mix(0.5 * (b1 + b2), b1, seam);
    }
    // smooth noise blobs; B where the noise falls below the share m
    float n = perlin_noise(q) + 0.5 * perlin_noise(q * 2.03 + 17.0);
    float n01 = clamp(n * 0.6 + 0.5, 0.0, 1.0);
    return 1.0 - smoothstep(m - patch_soft, m + patch_soft, n01);
}

float escapeDist(vec2 p) {
    if (escape_shape == 0) return length(p);
    if (escape_shape == 1) return max(abs(p.x), abs(p.y));
    if (escape_shape == 2) return min(abs(p.x), abs(p.y));
    return (abs(p.x) + abs(p.y)) * 0.7;
}

// One mapped branch: post transform, tiling, previous-frame lookup, feed and escape mask.
// mapped.x > 5000 is a variation's "outside" sentinel (drawn black); it is tested before tiling.
vec4 branchColor(vec2 mapped, vec4 seed_color, float fb, float shade, out vec2 fuv) {
    bool outside = mapped.x > 5000.0;
    float dist = escapeDist(mapped);
    vec2 q = mapped;
    q *= rotate(post_rotation);
    q /= post_scale;
    q += post_translate;
    vec2 f = q + vec2(0.5);
    if (mirror_tiling) {
        vec2 i = floor(f);
        vec2 g = fract(f);
        if (mod(i.x, 2.0) == 1.0) g.x = 1.0 - g.x;
        if (mod(i.y, 2.0) == 1.0) g.y = 1.0 - g.y;
        f = g;
    } else if (seamless_tiling) {
        f = fract(f);
    }
    fuv = f;
    // What "outside" points (a variation's sentinel) show: 0 black (original), 1 colour, 2 start pattern
    vec4 OUT = (outside_fill == 1) ? outside_color : (outside_fill == 2) ? seed_color : vec4(0.0, 0.0, 0.0, 1.0);
    vec4 transformed_color = outside ? OUT : samplePrev(f);
    // feed_mode 0: Fractility's original overlay (pattern at screen position -> static ghost of the pattern)
    // feed_mode 1: warped (pattern sampled at the mapped coordinate, so the injection follows the orbit)
    vec4 feed_color = (feed_mode == 1) ? (outside ? OUT : startPattern(fract(f))) : seed_color;
    if (start_pattern_mode == 2) feed_color *= image_input_opacity;
    vec4 c;
    if (use_escape_time) {
        float mask = smoothstep(escape_limit, escape_limit + escape_smoothness, dist);
        if (escape_invert) mask = 1.0 - mask;
        c = mix(mix(feed_color, transformed_color, fb), feed_color, mask);
    } else {
        c = mix(feed_color, transformed_color, fb);
    }
    c.rgb *= 1.0 - shade;   // filled ring cuts (Cut shade)
    return c;
}

void main() {
    vec2 UV = gl_FragCoord.xy / resolution;
    vec4 final_color;
    vec2 final_uv = UV;
    vec4 start_pattern_color = startPattern(UV);

    // --- STEP 3: FEEDBACK ---
    if (time < 0.1) {
        final_color = start_pattern_color;
    } else {
        vec2 transformed_uv = UV - vec2(0.5);
        transformed_uv *= rotate(pre_rotation);
        transformed_uv /= pre_scale;
        transformed_uv += pre_translate;

        g_cut_shade = 0.0;
        vec2 uv_a = var_A(transformed_uv + translate_a);
        float sh_a = g_cut_shade;
        g_cut_shade = 0.0;
        vec2 uv_b = var_B(transformed_uv + translate_b);
        float sh_b = g_cut_shade;

        // Optional fade-out: injection weight decays after a reseed, leaving pure feedback.
        float fb = feedback_amount;
        if (feed_fade > 0.0) fb = 1.0 - (1.0 - fb) * exp(-time / feed_fade);

        float m = variation_mix; // weight of B
        vec2 fuv_a, fuv_b;
        if (combine_mode == 0) {
            // Original: blend the two mapped coordinates. A variation's "outside" sentinel wins
            // whenever that variation has any weight (it used to be lost to tiling).
            vec2 mixed_uv = mix(uv_a, uv_b, m);
            if ((uv_a.x > 5000.0 && m < 1.0) || (uv_b.x > 5000.0 && m > 0.0)) mixed_uv = vec2(10000.0);
            final_color = branchColor(mixed_uv, start_pattern_color, fb, mix(sh_a, sh_b, m), fuv_a);
            final_uv = fuv_a;
        } else {
            // IFS modes: map the image through A and B separately and combine colours (Hutchinson operator).
            vec4 ca = branchColor(uv_a, start_pattern_color, fb, sh_a, fuv_a);
            vec4 cb = branchColor(uv_b, start_pattern_color, fb, sh_b, fuv_b);
            if (combine_mode == 1) {
                final_color = mix(ca, cb, m);                                   // weighted average
            } else if (combine_mode == 2) {
                float wa = min(1.0, 2.0 * (1.0 - m)), wb = min(1.0, 2.0 * m);  // union (max); mix fades a side out
                final_color = max(ca * wa, cb * wb);
            } else {
                // patchwork: a stable spatial partition decides which map applies where (piecewise IFS)
                final_color = mix(ca, cb, patchWeightB(UV, m));
            }
            final_uv = (m < 0.5) ? fuv_a : fuv_b;
        }
    }

    // --- NEBULA STARS ---
    float star_density = 0.0;
    ${starsTerm(idA, 'uA')}
    ${starsTerm(idB, 'uB')}
    if (star_density > 0.00001) {
        float star_rnd = rand(UV * 100.0 + time * 0.1);
        if (star_rnd > (1.0 - star_density)) final_color += vec4(1.0);
    }

    // --- SURFACE LIGHTING (present in the original shader; written back into the loop) ---
    if (lighting_enabled) {
        vec2 step_offset = vec2(3.0) / prev_res;
        float north = prevAt(final_uv + vec2(0.0, -step_offset.y)).r;
        float south = prevAt(final_uv + vec2(0.0, step_offset.y)).r;
        float east  = prevAt(final_uv + vec2(step_offset.x, 0.0)).r;
        float west  = prevAt(final_uv + vec2(-step_offset.x, 0.0)).r;
        float dx = (west - east) * lighting_strength;
        float dy = (north - south) * lighting_strength;
        vec3 normal = normalize(vec3(dx, dy, 1.0));
        vec3 light_dir = normalize(vec3(light_direction, 0.5));
        float diffuse = max(dot(normal, light_dir), 0.0);
        vec3 reflect_dir = reflect(-light_dir, normal);
        float spec = pow(max(reflect_dir.z, 0.0), lighting_roughness);
        final_color.rgb *= (0.4 + diffuse * 0.6);
        final_color.rgb += vec3(1.0) * spec * lighting_specular * 0.5;
    }

    gl_FragColor = clamp(final_color, 0.0, 1.0);
}
`;
}

// ---------- post process (post_process.gdshader) ----------
export const POST_FRAG = PRECISION + `
uniform sampler2D tex;
uniform vec2 texel;          // 1 / source size
uniform vec2 out_res;        // output size in pixels
uniform float brightness;
uniform float contrast;
uniform float saturation;
uniform float sharpen;
uniform float gamma;
uniform float vibrance;
uniform bool mirror_x;
uniform bool mirror_y;
uniform bool kaleidoscope_on;
uniform float kaleidoscope_slices;
#define PI 3.14159265358979
void main() {
    // Output is upright; source buffer uses Godot UV (y down).
    vec2 UV = vec2(gl_FragCoord.x / out_res.x, 1.0 - gl_FragCoord.y / out_res.y);
    vec2 p = UV - 0.5;
    if (kaleidoscope_on && kaleidoscope_slices > 0.0) {
        float angle = atan(p.y, p.x);
        float r = length(p);
        float slice_angle = PI / kaleidoscope_slices;
        angle = mod(angle, slice_angle * 2.0);
        angle = abs(angle - slice_angle);
        p.x = r * cos(angle);
        p.y = r * sin(angle);
    }
    if (mirror_x) p.x = abs(p.x);
    if (mirror_y) p.y = abs(p.y);
    vec2 final_uv = clamp(p + 0.5, 0.0, 1.0);
    vec4 final_color = texture2D(tex, final_uv);
    if (sharpen > 0.0) {
        vec3 s_up    = texture2D(tex, final_uv + vec2(0.0, -texel.y)).rgb;
        vec3 s_down  = texture2D(tex, final_uv + vec2(0.0, texel.y)).rgb;
        vec3 s_left  = texture2D(tex, final_uv + vec2(-texel.x, 0.0)).rgb;
        vec3 s_right = texture2D(tex, final_uv + vec2(texel.x, 0.0)).rgb;
        vec3 blur = (s_up + s_down + s_left + s_right) * 0.25;
        final_color.rgb = final_color.rgb + (final_color.rgb - blur) * sharpen;
    }
    final_color.rgb = max(vec3(0.0), final_color.rgb);
    final_color.rgb = pow(final_color.rgb, vec3(1.0 / gamma));
    final_color.rgb *= brightness;
    final_color.rgb = (final_color.rgb - 0.5) * contrast + 0.5;
    float luma = dot(final_color.rgb, vec3(0.299, 0.587, 0.114));
    float max_color = max(final_color.r, max(final_color.g, final_color.b));
    float min_color = min(final_color.r, min(final_color.g, final_color.b));
    float current_sat = max_color - min_color;
    if (vibrance != 0.0) final_color.rgb = mix(vec3(luma), final_color.rgb, 1.0 + (vibrance * (1.0 - current_sat)));
    final_color.rgb = mix(vec3(luma), final_color.rgb, saturation);
    gl_FragColor = vec4(clamp(final_color.rgb, 0.0, 1.0), 1.0);
}
`;

// ---------- straight copy (used when the buffer is resized) ----------
export const COPY_FRAG = PRECISION + `
uniform sampler2D tex;
uniform vec2 out_res;
void main() { gl_FragColor = texture2D(tex, gl_FragCoord.xy / out_res); }
`;

export { PARAMS, VARIATIONS };
