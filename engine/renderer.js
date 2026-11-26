// Fractility Web — WebGL1 feedback renderer.
// Two RGBA8 textures are ping-ponged exactly like Godot's ViewportA / ViewportB pair:
// each step renders the feedback shader into the target while sampling the source.

import { VERT, feedbackFragment, POST_FRAG, COPY_FRAG, SLOT_VEC4 } from './shaders.js?v=1.4.1';

function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        throw new Error('Shader compile failed: ' + log);
    }
    return s;
}

function link(gl, fragSrc) {
    const p = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(p);
        gl.deleteProgram(p);
        throw new Error('Program link failed: ' + log);
    }
    const uniforms = new Map();
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        const name = info.name.replace(/\[0\]$/, '');
        uniforms.set(name, { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size });
    }
    return { prog: p, uniforms };
}

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        const opts = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false };
        const gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
        if (!gl) throw new Error('WebGL is not available in this browser.');
        this.gl = gl;
        this.maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            ...gl.getParameter(gl.MAX_VIEWPORT_DIMS));
        const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        this.hasHighp = !!(highp && highp.precision > 0);

        this.quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        this.floatType = this._detectFloat(); // null when no linear-filterable, renderable float format
        this.precision = this.floatType ? 'float' : '8bit';
        this.post = link(gl, POST_FRAG);
        this.copy = link(gl, COPY_FRAG);
        this.programs = new Map();
        this.fb = null;
        this.varIds = null;
        this.w = 0; this.h = 0;
        this.buffers = null; // [{tex, fbo}, {tex, fbo}]
        this.src = 0;
        this.bgTex = this._makeTex(1, 1, new Uint8Array([0, 0, 0, 255]));
        this.hasBg = false;
        this.bgSource = null; // video element for live input
        this.contextLost = false;
        canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.contextLost = true; });
    }

    /**
     * Find a float texture type that can be rendered to AND linearly filtered (both are required:
     * the loop renders into the buffer and resamples it with bilinear taps). Half float first.
     */
    _detectFloat() {
        const gl = this.gl;
        const tryType = (type) => {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, type, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            const ok = gl.getError() === gl.NO_ERROR && gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteFramebuffer(fbo);
            gl.deleteTexture(tex);
            return ok;
        };
        while (gl.getError() !== gl.NO_ERROR) { /* clear */ }
        const half = gl.getExtension('OES_texture_half_float');
        const halfLin = gl.getExtension('OES_texture_half_float_linear');
        gl.getExtension('EXT_color_buffer_half_float');
        if (half && halfLin && tryType(half.HALF_FLOAT_OES)) { this.floatName = '16-bit float'; return half.HALF_FLOAT_OES; }
        const full = gl.getExtension('OES_texture_float');
        const fullLin = gl.getExtension('OES_texture_float_linear');
        gl.getExtension('WEBGL_color_buffer_float');
        if (full && fullLin && tryType(gl.FLOAT)) { this.floatName = '32-bit float'; return gl.FLOAT; }
        this.floatName = null;
        return null;
    }

    /** 'float' (when supported) or '8bit' (Fractility's original RGBA8). Keeps the current image. */
    setPrecision(p) {
        const want = (p === 'float' && this.floatType) ? 'float' : '8bit';
        if (want === this.precision) return;
        this.precision = want;
        if (this.buffers) { const w = this.w, h = this.h; this.w = 0; this.resize(w, h); }
    }

    _makeTex(w, h, data = null, type = null) {
        const gl = this.gl;
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type || gl.UNSIGNED_BYTE, data);
        return t;
    }

    _makeTarget(w, h, float = false) {
        const gl = this.gl;
        const tex = this._makeTex(w, h, null, float ? this.floatType : null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (!ok) throw new Error('Framebuffer incomplete at ' + w + 'x' + h);
        return { tex, fbo, w, h, float };
    }

    _freeTarget(t) {
        if (!t) return;
        this.gl.deleteFramebuffer(t.fbo);
        this.gl.deleteTexture(t.tex);
    }

    /** Resize the simulation buffer, carrying the current image over (stretched). */
    resize(w, h) {
        w = Math.max(16, Math.min(this.maxTex, Math.round(w)));
        h = Math.max(16, Math.min(this.maxTex, Math.round(h)));
        if (w === this.w && h === this.h && this.buffers) return;
        const gl = this.gl;
        const fl = this.precision === 'float';
        const next = [this._makeTarget(w, h, fl), this._makeTarget(w, h, fl)];
        if (this.buffers) {
            const old = this.buffers[this.src];
            this._use(this.copy);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, old.tex);
            this._set(this.copy, 'tex', 0);
            this._set(this.copy, 'out_res', [w, h]);
            for (const t of next) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
                gl.viewport(0, 0, w, h);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }
            this.buffers.forEach((t) => this._freeTarget(t));
        }
        this.buffers = next;
        this.src = 0;
        this.w = w; this.h = h;
    }

    /** Build (or fetch from cache) the program specialised for these two variations. */
    setVariations(idA, idB) {
        const key = idA + '_' + idB;
        let p = this.programs.get(key);
        if (!p) {
            p = link(this.gl, feedbackFragment(idA, idB));
            this.programs.set(key, p);
            if (this.programs.size > 12) { // small LRU
                const first = this.programs.keys().next().value;
                if (first !== key) { this.gl.deleteProgram(this.programs.get(first).prog); this.programs.delete(first); }
            }
        } else {
            this.programs.delete(key); this.programs.set(key, p);
        }
        this.fb = p;
        this.varIds = [idA, idB];
    }

    _use(p) { this.gl.useProgram(p.prog); }

    _set(p, name, v) {
        const u = p.uniforms.get(name);
        if (!u) return;
        const gl = this.gl;
        switch (u.type) {
            case gl.FLOAT: gl.uniform1f(u.loc, v); break;
            case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break;
            case gl.FLOAT_VEC4: if (u.size > 1) gl.uniform4fv(u.loc, v); else gl.uniform4fv(u.loc, v); break;
            case gl.INT: case gl.SAMPLER_2D: gl.uniform1i(u.loc, v | 0); break;
            case gl.BOOL: gl.uniform1i(u.loc, v ? 1 : 0); break;
            default: break;
        }
    }

    /** Upload an image/canvas/video frame as the Image Input source. */
    setBackground(source, live = false) {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.bgTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        this.hasBg = true;
        this.bgSource = live ? source : null;
    }

    clearBackground() {
        this.hasBg = false;
        this.bgSource = null;
    }

    _refreshLiveBackground() {
        const v = this.bgSource;
        if (v && v.readyState >= 2 && v.videoWidth > 0) {
            const gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.bgTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
        }
    }

    _feedbackUniforms(U, slotA, slotB, w, h) {
        const p = this.fb, gl = this.gl;
        this._use(p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.buffers[this.src].tex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.bgTex);
        this._set(p, 'previous_frame', 0);
        this._set(p, 'background_texture', 1);
        this._set(p, 'has_background', this.hasBg);
        this._set(p, 'resolution', [w, h]);
        this._set(p, 'prev_res', [this.w, this.h]);
        this._set(p, 'frame_seed', [Math.random() * 4096, Math.random() * 4096]);
        for (const [k, v] of Object.entries(U)) this._set(p, k, v);
        const ua = p.uniforms.get('uA'); if (ua) gl.uniform4fv(ua.loc, slotA);
        const ub = p.uniforms.get('uB'); if (ub) gl.uniform4fv(ub.loc, slotB);
    }

    /** One feedback iteration. U = uniform dictionary, slotA/slotB = Float32Array(32). */
    step(U, slotA, slotB) {
        if (!this.fb || !this.buffers || this.contextLost) return;
        const gl = this.gl;
        if (this.bgSource) this._refreshLiveBackground();
        const dst = this.buffers[1 - this.src];
        this._feedbackUniforms(U, slotA, slotB, this.w, this.h);
        gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
        gl.viewport(0, 0, this.w, this.h);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        this.src = 1 - this.src;
    }

    _post(P, srcTex, srcW, srcH, outW, outH) {
        const gl = this.gl, p = this.post;
        this._use(p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, srcTex);
        this._set(p, 'tex', 0);
        this._set(p, 'texel', [1 / srcW, 1 / srcH]);
        this._set(p, 'out_res', [outW, outH]);
        for (const [k, v] of Object.entries(P)) this._set(p, k, v);
        gl.viewport(0, 0, outW, outH);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    /** Draw the current buffer to the canvas through the post-process pass. */
    present(P) {
        if (!this.buffers || this.contextLost) return;
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this._post(P, this.buffers[this.src].tex, this.w, this.h, this.canvas.width, this.canvas.height);
    }

    /**
     * High-resolution still, like Fractility's save viewport: one feedback pass rendered at the
     * export size (sampling the live buffer), then the post pass. Returns ImageData-ready RGBA rows (top first).
     */
    renderStill(U, P, slotA, slotB, w, h) {
        const gl = this.gl;
        w = Math.min(w, this.maxTex); h = Math.min(h, this.maxTex);
        const a = this._makeTarget(w, h, this.precision === 'float'), b = this._makeTarget(w, h);
        try {
            this._feedbackUniforms(U, slotA, slotB, w, h);
            gl.bindFramebuffer(gl.FRAMEBUFFER, a.fbo);
            gl.viewport(0, 0, w, h);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
            this._post(P, a.tex, w, h, w, h);
            const px = new Uint8Array(w * h * 4);
            gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
            const rows = new Uint8ClampedArray(w * h * 4), stride = w * 4;
            for (let y = 0; y < h; y++) rows.set(px.subarray((h - 1 - y) * stride, (h - y) * stride), y * stride);
            return { data: rows, width: w, height: h };
        } finally {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this._freeTarget(a); this._freeTarget(b);
        }
    }

    /** Read the whole raw buffer as RGBA8 (tests). Float buffers are copied to an 8-bit target first. */
    readBuffer() {
        const gl = this.gl, src = this.buffers[this.src];
        let t = src, tmp = null;
        if (src.float) {
            tmp = this._makeTarget(this.w, this.h);
            this._use(this.copy);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, src.tex);
            this._set(this.copy, 'tex', 0);
            this._set(this.copy, 'out_res', [this.w, this.h]);
            gl.bindFramebuffer(gl.FRAMEBUFFER, tmp.fbo);
            gl.viewport(0, 0, this.w, this.h);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            t = tmp;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        const px = new Uint8Array(this.w * this.h * 4);
        gl.readPixels(0, 0, this.w, this.h, gl.RGBA, gl.UNSIGNED_BYTE, px);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (tmp) this._freeTarget(tmp);
        return px;
    }

    /** Mean RGB of the bottom-left 64×64 block (tests). */
    sampleMean() {
        const all = this.readBuffer(), w = Math.min(64, this.w), h = Math.min(64, this.h);
        const px = new Uint8Array(w * h * 4);
        for (let y = 0; y < h; y++) px.set(all.subarray(y * this.w * 4, (y * this.w + w) * 4), y * w * 4);
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < px.length; i += 4) { r += px[i]; g += px[i + 1]; b += px[i + 2]; }
        const n = px.length / 4;
        return [r / n, g / n, b / n];
    }
}

export { SLOT_VEC4, PARAMS, VARIATIONS, slotLayout } from './shaders.js?v=1.4.1';
