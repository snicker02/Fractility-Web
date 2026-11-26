# Fractility Web — v1.4.1

A browser version of the **2D fractal / video-feedback** part of [Fractility](https://github.com/snicker02/Fractility) (the Godot app). It leaves out the 3D part.

Each iteration, two flame-style **variations** (A and B) remap the previous frame. Their outputs are mixed, post-transformed and blended with a **start pattern**. The result then feeds back into the next iteration.

## What's in it

- **46 variations** ported from `fractal_feedback.gdshader`:
  - classic flame variations: Sinusoidal, Spherical, Swirl, Julian2, Mobius, Clifford, DeJong and more
  - the 13 Rep-Tiles
  - Fractility's own variations: Lazy Mega, Glynn Sim, Nebula, Jigsaw, Chimera (gnarl), Constructivist, Frostbyte, Portal, Janus, Canvas
- Every animatable parameter has its own **↻ speed** slider, with the same `base + sin(time·speed)` behaviour as the Godot app.
- **Start patterns:** Gradient + Grid, Circles, Image Input, Perlin Noise, Concentric Rings, Snowflake generator.
  - Image Input also takes **video files and a live camera**.
- **Combine modes:** set how A and B are combined.
  - **Blend coordinates** is the original: the two mapped positions are averaged.
  - **IFS average** and **IFS union (max)** map the image through A and B *separately* and combine the colours instead. This is the Hutchinson operator, so you get true attractor structure, like a flame. **IFS patchwork** splits the screen into stable regions (noise blobs or Voronoi cells); A applies in some regions and B in others, making a piecewise IFS. Its settings are patch scale, edge softness and drift.
- **Quality:**
  - **16-bit float feedback buffer**, with automatic fallback to 32-bit float, then to 8-bit. With the 8-bit buffer the image never fades below about 16/255 and gradients band; the float buffer fades smoothly to black.
  - **Bicubic (Catmull-Rom) resampling**, clamped so it can't ring, instead of bilinear. This keeps detail through many iterations.
  - An optional **loop sharpen** that runs inside the feedback loop.
- **Feed mode (no ghosting):** each iteration re-injects part of the start pattern. In the Godot app this happens at the fixed screen position, so (1 − feedback) of the image, circles or rings always shows through as a static overlay. **Warped** (the default) samples the pattern at the same fractal-mapped coordinate as the previous frame. The injection then follows the orbit, and nothing flat is left on top. **Overlay** keeps the original behaviour, and presets from the Godot app load with Overlay so they look the same. The optional **Fade out (s)** setting reduces the injection to zero after a reseed, leaving pure feedback.
- **Feedback controls:**
  - feedback amount, with an adjustable min/max range
  - pre and post scale, rotation and translate
  - per-variation translate
  - seamless and mirror tiling
  - escape-time / orbit-trap mask
- **Effects:**
  - output mirror and kaleidoscope
  - brightness, contrast, saturation, gamma, vibrance and sharpen
  - optional surface lighting. This is in the original shader but has no UI in the Godot app.
- **Randomize** uses Fractility's odds and options: variations, parameters, speeds, colours, and randomize on startup.
- **Presets** are JSON files that use Fractility's key names, so 2D presets saved from the Godot app load here. Save, load, copy and paste are all supported.
- **Shared image shelf:** works with the other [snicker02 apps](https://snicker02.github.io/#shelf) through the **⇄ Shelf** button.
  - **Save current** puts the current frame on the shelf, with its preset stored alongside it. You can also send the frame straight to another app.
  - **Load here**, or an image sent from another app, becomes the **Image Input** start pattern.
  - Images stay in your browser.
- **Export:**
  - PNG at view size or up to 8192 px wide, with a chosen aspect ratio
  - **MP4 (H.264)** and **WebM** video. MP4 uses the browser's native recorder where it has one. Otherwise it uses WebCodecs plus a built-in MP4 muxer.

## Controls

| | Desktop | Touch |
|---|---|---|
| Move (post / pre / A / B, chosen in Main) | drag | one finger |
| Post zoom | wheel | pinch |
| Post rotate | Shift + wheel | twist |
| Pre zoom / rotate | Ctrl + wheel / Ctrl + Shift + wheel | — |
| Pan | — | two-finger drag |
| Reseed | T, or double-click | double-tap |
| Reset / hide UI / freeze | R / U / Space | top-bar buttons |

**Reseed on release** is on by default, as in the original, so letting go after a drag restarts from the start pattern. Turn it off under Main → Drag moves.

**Iterations / s** defaults to 20 because the Godot project ran at `max_fps = 20`. Raise it to make the feedback evolve faster.

## Layout

On phones the view stays docked, with tabs underneath it:

- **Portrait:** the view is on top.
- **Landscape:** the view is on the left, with a 300 px control column on the right.

The last-used tab is remembered.

## Structure

```
index.html            UI markup
styles.css            desktop + phone (tabbed) layout
main.js               state, UI, input, loop, presets, randomize
engine/varlib.js      variation GLSL bodies + parameter metadata (ported from the .gdshader / .tscn)
engine/shaders.js     specialised feedback shader builder, post-process, copy
engine/renderer.js    WebGL1 ping-pong renderer, PNG export
engine/recorder.js    WebM / MP4 recording, minimal MP4 muxer
tests/                glslangValidator sweep + headless-Chrome test
```

### Shader design

The Godot shader passes every parameter of every variation as a separate uniform, for both slots. That adds up to about 600 uniforms, which no mobile WebGL1 driver can hold.

This version builds a small shader for just the current A/B pair. Each slot's parameters are packed into a `vec4[8]` array. Changing a variation recompiles that pair; the result is cached.

All code is GLSL ES 1.00 / WebGL1 with no dependencies.

### Differences from the Godot version

- **Ring textures (Glynn Sim and Lazy Mega):** both variations use one shared library of 24 ring types.
  - **Originals:** Empty, Texture, Stripes, Checkers, Dots, Plasma, Spiral. At the default detail and fill they render exactly as in the Godot app.
  - **Cut patterns:** Honeycomb, Bricks, Waves, Zigzag, Scales, Cracks, Sunburst, Weave, Dashes, Noise, Moiré.
  - **Map types**, which remap the image into the band instead of cutting it: Mirror, Unwrap, Kaleido, Twist, Ripple, Tiles.
  - **Controls:** Ring detail (density), Ring fill (how much is cut), Ring segments (whole numbers, so patterns join up seamlessly around the ring).
  - **Lazy Mega edge fix:** with Edge Softness above 0, cut points used to turn into garbage coordinates in the soft band. They now fall back to the plain ring.
- **Filling black areas:**
  - **Black areas** (Main) sets what every "outside" point shows, including Jigsaw and Constructivist lines and ring cuts: Black (original), a Colour, or the Start pattern.
  - **Cut fill** (Glynn Sim and Lazy Mega) fills ring cuts with a map type instead: Texture, Mirror, Unwrap, Kaleido, Twist or Ripple.
  - **Cut shade** darkens filled cuts so the pattern stays readable.
- **Glynn Sim has a Tear style setting:**
  - **Smooth** (the default) blends between the pass-through and torn mappings, with no randomness.
  - **Clumps** tears in coherent noise patches, with a clump scale setting.
  - **Sand** is the original. It flips a coin per pixel (`rand(uv*500)`), so neighbouring pixels come from unrelated places, and fed back that turns into fuzzy speckled patches.

  Godot presets load with Sand.

- **Black "outside" regions now appear.** Variations mark a point as outside by sending its coordinate to 10000 (used by Jigsaw and Constructivist lines, and the Glynn / Lazy Mega "Empty" rings). The Godot shader wrapped that value with tiling before testing it, so with seamless tiling on (the default) those regions never turned black. The test now happens before tiling.
- Presets from the Godot app load with Overlay feed, Blend combine and Linear resampling, so they look as they did there.

- **Mobiq** has UI in the Godot app but no shader code, so it is not listed here.
- The A-panel default for Apollonian **C1 Y** was `5.0`. The B panel and the defaults resource both use `0.5`, so `0.5` is used here.
- **Pre rotation** uses a ±π range instead of 0–360. The shader treats the value as radians.

## Tests

```
node tests/validate-shaders.mjs   # every variation in both slots + post/copy, via glslangValidator (GLSL ES 100)
python3 tests/browser_test.py     # headless Chrome: all variations on real WebGL, presets, PNG, WebM/MP4, phone layouts, touch
SITE=../snicker02.github.io python3 tests/shelf_test.py   # shelf: save, apps.json target, ?shelf= hand-off
```

## Changelog

- **1.4.1** — Connected the shared snicker02 image shelf.

- **1.4.0** — Added the global Black areas fill and the ring Cut fill and Cut shade controls. Filled cuts are flagged through a shader global, so their mapped coordinates lose no precision. Tested: black pixels drop from 25% to 0% in every fill mode, and from 64% to 0% on Jigsaw.

- **1.3.0**
  - Added a shared ring texture library with 24 types for Glynn Sim and Lazy Mega, and the Ring detail, Ring fill and Ring segments controls.
  - Checked the original 7 modes pixel-for-pixel against v1.2.2. They are identical except in Lazy Mega's soft edge, where the fix above changes them deliberately.

- **1.2.2** — Added the Glynn Sim tear style setting (Smooth / Clumps / Sand) to remove the fuzzy torn areas. Tested on Brad's preset: fine-detail noise score 781 with Sand, 114 with Clumps, 43 with Smooth.

- **1.2.1** — Replaced "IFS random pick" with **IFS patchwork**. The per-pixel random choice re-rolled every iteration, so the grain never averaged out. Added tests that check for grain and for stability between frames.

- **1.2.0**
  - Fixed the outside-region bug: black regions now show with tiling on.
  - Added a float feedback buffer, bicubic resampling and loop sharpen.
  - Added IFS combine modes: average, union and random.
  - The browser test now measures each of these: the outline pixel count, the precision decay, sharpness after 60 rotations, and every variation run in each IFS mode.

- **1.1.1** — Added the credit line.

- **1.1.0** — Added feed mode: Warped injection (new default, removes pattern/image ghosting) or Overlay (original). Added a Fade out time. The start pattern is now a function, so it can be sampled at any mapped coordinate. The browser test now measures ghosting for patterns 1, 2 and 4.

- **1.0.0** — First web release: 2D feedback engine, all 46 variations, start patterns, effects, presets, PNG/MP4/WebM export, and the mobile layout.

---

Created with help from Claude AI
