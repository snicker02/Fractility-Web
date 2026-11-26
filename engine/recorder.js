// Fractility Web — video recording (WebM + MP4), no external dependencies.
// WebM: MediaRecorder. MP4: MediaRecorder where the browser supports it (Safari, recent Chrome),
// otherwise WebCodecs H.264 + the small MP4 muxer below.

const WEBM_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
const MP4_TYPES = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.42E01F', 'video/mp4;codecs=avc1', 'video/mp4'];

function pickType(list) {
    if (typeof MediaRecorder === 'undefined') return null;
    for (const t of list) { try { if (MediaRecorder.isTypeSupported(t)) return t; } catch (_) { /* ignore */ } }
    return null;
}

export function recordingSupport() {
    return {
        webm: !!pickType(WEBM_TYPES),
        mp4: pickType(MP4_TYPES) ? 'mediarecorder' : (typeof VideoEncoder !== 'undefined' ? 'webcodecs' : null),
    };
}

// ---------------- minimal ISO-BMFF writer ----------------
class W {
    constructor() { this.parts = []; this.len = 0; }
    u8(v) { this.bytes([v & 255]); return this; }
    u16(v) { this.bytes([(v >> 8) & 255, v & 255]); return this; }
    u32(v) { this.bytes([(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]); return this; }
    str(s) { this.bytes([...s].map((c) => c.charCodeAt(0))); return this; }
    zeros(n) { this.bytes(new Uint8Array(n)); return this; }
    bytes(b) { const a = b instanceof Uint8Array ? b : Uint8Array.from(b); this.parts.push(a); this.len += a.length; return this; }
    out() { const o = new Uint8Array(this.len); let p = 0; for (const a of this.parts) { o.set(a, p); p += a.length; } return o; }
}
function box(type, ...payload) {
    const w = new W(); let n = 8;
    for (const p of payload) n += p.length;
    w.u32(n).str(type);
    for (const p of payload) w.bytes(p);
    return w.out();
}
function full(type, version, flags, ...payload) {
    const h = new W().u8(version).u8(flags >> 16).u8(flags >> 8).u8(flags).out();
    return box(type, h, ...payload);
}
const MATRIX = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000];

export function muxMP4({ width, height, timescale, samples, avcC }) {
    // samples: [{data:Uint8Array, dur, key}]
    const duration = samples.reduce((a, s) => a + s.dur, 0);
    const ftyp = box('ftyp', new W().str('isom').u32(0x200).str('isomiso2avc1mp41').out());
    const build = (chunkOffset) => {
        const mvhd = full('mvhd', 0, 0, (() => { const w = new W().u32(0).u32(0).u32(timescale).u32(duration).u32(0x10000).u16(0x100).zeros(10); MATRIX.forEach((m) => w.u32(m)); return w.zeros(24).u32(2).out(); })());
        const tkhd = full('tkhd', 0, 3, (() => { const w = new W().u32(0).u32(0).u32(1).u32(0).u32(duration).zeros(8).u16(0).u16(0).u16(0).u16(0); MATRIX.forEach((m) => w.u32(m)); return w.u32(width << 16).u32(height << 16).out(); })());
        const mdhd = full('mdhd', 0, 0, new W().u32(0).u32(0).u32(timescale).u32(duration).u16(0x55c4).u16(0).out());
        const hdlr = full('hdlr', 0, 0, new W().u32(0).str('vide').zeros(12).str('VideoHandler').u8(0).out());
        const vmhd = full('vmhd', 0, 1, new W().zeros(8).out());
        const dinf = box('dinf', full('dref', 0, 0, new W().u32(1).out(), full('url ', 0, 1)));
        const name = 'Fractility Web';
        const avc1 = box('avc1', new W().zeros(6).u16(1).zeros(16).u16(width).u16(height).u32(0x480000).u32(0x480000).u32(0).u16(1)
            .u8(name.length).str(name).zeros(31 - name.length).u16(0x18).u16(0xffff).out(), box('avcC', avcC));
        const stsd = full('stsd', 0, 0, new W().u32(1).out(), avc1);
        // stts: run-length of durations
        const runs = [];
        for (const s of samples) { const r = runs[runs.length - 1]; if (r && r[1] === s.dur) r[0]++; else runs.push([1, s.dur]); }
        const sttsW = new W().u32(runs.length); runs.forEach(([c, d]) => sttsW.u32(c).u32(d));
        const keys = samples.map((s, i) => (s.key ? i + 1 : 0)).filter(Boolean);
        const stssW = new W().u32(keys.length); keys.forEach((k) => stssW.u32(k));
        const stszW = new W().u32(0).u32(samples.length); samples.forEach((s) => stszW.u32(s.data.length));
        const stbl = box('stbl', stsd, full('stts', 0, 0, sttsW.out()), full('stss', 0, 0, stssW.out()),
            full('stsc', 0, 0, new W().u32(1).u32(1).u32(samples.length).u32(1).out()),
            full('stsz', 0, 0, stszW.out()), full('stco', 0, 0, new W().u32(1).u32(chunkOffset).out()));
        const minf = box('minf', vmhd, dinf, stbl);
        const mdia = box('mdia', mdhd, hdlr, minf);
        const trak = box('trak', tkhd, mdia);
        return box('moov', mvhd, trak);
    };
    const moovLen = build(0).length;
    const moov = build(ftyp.length + moovLen + 8);
    const total = samples.reduce((a, s) => a + s.data.length, 0);
    const mdatHead = new W().u32(total + 8).str('mdat').out();
    return new Blob([ftyp, moov, mdatHead, ...samples.map((s) => s.data)], { type: 'video/mp4' });
}

// ---------------- recorder ----------------
export class Recorder {
    constructor(canvas) {
        this.canvas = canvas;
        this.active = false;
        this.format = null;
    }

    async start(format, fps = 30, mbps = 12) {
        const sup = recordingSupport();
        this.format = format;
        this.fps = fps;
        this.startTime = performance.now();
        if (format === 'webm' || (format === 'mp4' && sup.mp4 === 'mediarecorder')) {
            const type = pickType(format === 'webm' ? WEBM_TYPES : MP4_TYPES);
            if (!type) throw new Error(format.toUpperCase() + ' recording is not supported in this browser.');
            this.mode = 'mr';
            this.stream = this.canvas.captureStream(fps);
            this.chunks = [];
            this.mr = new MediaRecorder(this.stream, { mimeType: type, videoBitsPerSecond: mbps * 1e6 });
            this.mr.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
            this.mr.start(500);
            this.mime = type.split(';')[0];
        } else if (format === 'mp4' && sup.mp4 === 'webcodecs') {
            this.mode = 'wc';
            const w = this.canvas.width & ~1, h = this.canvas.height & ~1;
            this.w = w; this.h = h;
            const codecs = ['avc1.640033', 'avc1.640028', 'avc1.4d0033', 'avc1.42003e', 'avc1.42001f'];
            let config = null;
            for (const codec of codecs) {
                const c = { codec, width: w, height: h, bitrate: mbps * 1e6, framerate: fps, avc: { format: 'avc' } };
                try { const r = await VideoEncoder.isConfigSupported(c); if (r.supported) { config = c; break; } } catch (_) { /* next */ }
            }
            if (!config) throw new Error('H.264 encoding is not available at ' + w + '×' + h + '.');
            this.samples = [];
            this.avcC = null;
            this.encError = null;
            this.encoder = new VideoEncoder({
                output: (chunk, meta) => {
                    if (meta && meta.decoderConfig && meta.decoderConfig.description && !this.avcC) {
                        this.avcC = new Uint8Array(meta.decoderConfig.description.buffer ? meta.decoderConfig.description.buffer : meta.decoderConfig.description).slice();
                    }
                    const data = new Uint8Array(chunk.byteLength);
                    chunk.copyTo(data);
                    this.samples.push({ data, ts: chunk.timestamp, key: chunk.type === 'key' });
                },
                error: (e) => { this.encError = e; },
            });
            this.encoder.configure(config);
            this.scratch = document.createElement('canvas');
            this.scratch.width = w; this.scratch.height = h;
            this.sctx = this.scratch.getContext('2d');
            this.frameIndex = 0;
            this.lastCapture = -1e9;
        } else {
            throw new Error('MP4 recording is not supported in this browser.');
        }
        this.active = true;
    }

    /** Call right after drawing to the canvas (same task), so the WebGL buffer is still valid. */
    onFrame() {
        if (!this.active || this.mode !== 'wc') return;
        const now = performance.now();
        if (now - this.lastCapture < 1000 / this.fps - 2) return;
        this.lastCapture = now;
        if (this.encoder.encodeQueueSize > 6) return; // drop under pressure; timestamps stay real-time
        this.sctx.drawImage(this.canvas, 0, 0, this.w, this.h);
        const ts = Math.round((now - this.startTime) * 1000);
        const frame = new VideoFrame(this.scratch, { timestamp: ts });
        this.encoder.encode(frame, { keyFrame: this.frameIndex % (this.fps * 2) === 0 });
        frame.close();
        this.frameIndex++;
    }

    elapsed() { return this.active ? (performance.now() - this.startTime) / 1000 : 0; }

    async stop() {
        if (!this.active) return null;
        this.active = false;
        if (this.mode === 'mr') {
            const done = new Promise((res) => { this.mr.onstop = res; });
            this.mr.stop();
            await done;
            this.stream.getTracks().forEach((t) => t.stop());
            return new Blob(this.chunks, { type: this.mime });
        }
        await this.encoder.flush();
        this.encoder.close();
        if (this.encError) throw this.encError;
        if (!this.samples.length || !this.avcC) throw new Error('No video frames were encoded.');
        const timescale = 90000;
        const s = this.samples.sort((a, b) => a.ts - b.ts);
        const frameDur = Math.round(timescale / this.fps);
        const out = s.map((x, i) => ({
            data: x.data, key: x.key,
            dur: i < s.length - 1 ? Math.max(1, Math.round((s[i + 1].ts - x.ts) * timescale / 1e6)) : frameDur,
        }));
        return muxMP4({ width: this.w, height: this.h, timescale, samples: out, avcC: this.avcC });
    }
}
