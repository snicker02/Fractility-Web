// Fractility Web — variation library.
// GLSL bodies ported from Fractility (Godot) fractal_feedback.gdshader to GLSL ES 1.00.
// $name tokens are resolved per slot into packed uniform reads by engine/shaders.js.

export const PARAMS = {
 "apollonian_scale": {
  "label": "Scale",
  "def": 1.5,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "ap_c1x": {
  "label": "C1 X",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "ap_c1y": {
  "label": "C1 Y",
  "def": 0.5,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "ap_c2x": {
  "label": "C2 X",
  "def": -0.433,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "ap_c2y": {
  "label": "C2 Y",
  "def": -0.25,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "ap_c3x": {
  "label": "C3 X",
  "def": 0.433,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "ap_c3y": {
  "label": "C3 Y",
  "def": -0.25,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "arctangent_scale": {
  "label": "Scale",
  "def": 1.0,
  "min": 0.0,
  "max": 10.0,
  "step": 0.001
 },
 "arctangent_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 10.0,
  "step": 0.001
 },
 "canvas_scale": {
  "label": "Scale",
  "def": 10.0,
  "min": 0.1,
  "max": 50.0,
  "step": 0.01
 },
 "canvas_strength": {
  "label": "Strength",
  "def": 0.5,
  "min": 0.0,
  "max": 2.0,
  "step": 0.01
 },
 "canvas_flow": {
  "label": "Flow",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "canvas_style": {
  "label": "Style",
  "def": 0.0,
  "min": 0.0,
  "max": 14.0,
  "step": 0.01
 },
 "canvas_chaos": {
  "label": "Chaos",
  "def": 0.5,
  "min": 0.0,
  "max": 5.0,
  "step": 0.01
 },
 "cellular_weave_grid_size": {
  "label": "Grid Size",
  "def": 10.0,
  "min": 2.0,
  "max": 100.0,
  "step": 0.001
 },
 "cellular_weave_threshold": {
  "label": "Threshold",
  "def": 4.0,
  "min": 0.0,
  "max": 8.0,
  "step": 0.001
 },
 "cellular_weave_iterations": {
  "label": "Iterations",
  "def": 1.0,
  "min": 1.0,
  "max": 10.0,
  "step": 0.001
 },
 "clifford_a": {
  "label": "A",
  "def": -1.7,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "clifford_b": {
  "label": "B",
  "def": 1.7,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "clifford_c": {
  "label": "C",
  "def": -0.5,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "clifford_d": {
  "label": "D",
  "def": -1.2,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "construction_density": {
  "label": "Grid Density",
  "def": 5.0,
  "min": 1.0,
  "max": 20.0,
  "step": 0.01
 },
 "construction_circles": {
  "label": "Shape Variety",
  "def": 0.5,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "construction_chaos": {
  "label": "Diagonal Chaos",
  "def": 0.0,
  "min": 0.0,
  "max": 50.0,
  "step": 0.01
 },
 "construction_thickness": {
  "label": "Line Weight",
  "def": 1.0,
  "min": 0.1,
  "max": 5.0,
  "step": 0.01
 },
 "cosine_scale": {
  "label": "Scale",
  "def": 3.142,
  "min": 0.0,
  "max": 20.0,
  "step": 0.001
 },
 "cosine_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "dejong_a": {
  "label": "A",
  "def": 1.4,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "dejong_b": {
  "label": "B",
  "def": 2.3,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "dejong_c": {
  "label": "C",
  "def": 1.5,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "dejong_d": {
  "label": "D",
  "def": -0.6,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "fisheye_strength": {
  "label": "Strength",
  "def": 2.0,
  "min": 0.0,
  "max": 10.0,
  "step": 0.001
 },
 "glynn_ring_mode": {
  "label": "Ring Mode",
  "def": 0,
  "min": 0,
  "max": 23,
  "step": 1,
  "opts": [
   "Empty",
   "Texture",
   "Stripes",
   "Checkers",
   "Dots",
   "Plasma",
   "Spiral",
   "Honeycomb",
   "Bricks",
   "Waves",
   "Zigzag",
   "Scales",
   "Cracks",
   "Sunburst",
   "Weave",
   "Dashes",
   "Noise",
   "Moir\u00e9",
   "Map: Mirror",
   "Map: Unwrap",
   "Map: Kaleido",
   "Map: Twist",
   "Map: Ripple",
   "Map: Tiles"
  ]
 },
 "glynn_radius": {
  "label": "Radius",
  "def": 0.5,
  "min": 0.0,
  "max": 2.0,
  "step": 0.001
 },
 "glynn_thickness": {
  "label": "Thickness",
  "def": 0.05,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "glynn_contrast": {
  "label": "Contrast",
  "def": 0.5,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "glynn_pow": {
  "label": "Pow",
  "def": 1.5,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "gnarl_mode": {
  "label": "Mode",
  "def": 1.0,
  "min": 1.0,
  "max": 11.0,
  "step": 1.0
 },
 "gnarl_scale_x": {
  "label": "Scale X",
  "def": 0.5,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "gnarl_scale_y": {
  "label": "Scale Y",
  "def": 0.5,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "gnarl_freq_x1": {
  "label": "Freq X1",
  "def": 3.5,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_freq_y1": {
  "label": "Freq Y1",
  "def": 3.5,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_freq_x2": {
  "label": "Freq X2",
  "def": 2.0,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_freq_y2": {
  "label": "Freq Y2",
  "def": 2.0,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_freq_x3": {
  "label": "Freq X3",
  "def": 5.0,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_freq_y3": {
  "label": "Freq Y3",
  "def": 5.0,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "gnarl_c1": {
  "label": "Color/Phase 1",
  "def": 5.0,
  "min": -10.0,
  "max": 10.0,
  "step": 0.001
 },
 "gnarl_c2": {
  "label": "Color/Phase 2",
  "def": 0.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "gnarl_distort": {
  "label": "Log Distort",
  "def": 0.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "heart_scale": {
  "label": "Scale",
  "def": 0.3,
  "min": 0.2,
  "max": 2.0,
  "step": 0.001
 },
 "heart_rotation": {
  "label": "Rotation",
  "def": 0.0,
  "min": -180.0,
  "max": 180.0,
  "step": 0.001
 },
 "heart_strength": {
  "label": "Strength",
  "def": 0.5,
  "min": 0.0,
  "max": 2.0,
  "step": 0.001
 },
 "hyperbolic_cosine_scale": {
  "label": "Scale",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "hyperbolic_cosine_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "hyperbolic_sine_scale": {
  "label": "Scale",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "hyperbolic_sine_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "janus_shift": {
  "label": "Shift",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "janus_zoom": {
  "label": "Zoom",
  "def": 1.0,
  "min": 0.1,
  "max": 5.0,
  "step": 0.01
 },
 "janus_opacity": {
  "label": "Opacity",
  "def": 1.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "janus_center_x": {
  "label": "Center X",
  "def": -0.5,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "janus_center_y": {
  "label": "Center Y",
  "def": -0.5,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "jigsaw_scale": {
  "label": "Scale",
  "def": 5.0,
  "min": 1.0,
  "max": 20.0,
  "step": 0.01
 },
 "jigsaw_tab_size": {
  "label": "Tab Size",
  "def": 0.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "jigsaw_distortion": {
  "label": "Distortion",
  "def": 0.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "jigsaw_outline": {
  "label": "Outline",
  "def": 0.07,
  "min": 0.0,
  "max": 0.1,
  "step": 0.001
 },
 "julian_power": {
  "label": "Power",
  "def": 2.0,
  "min": -50.0,
  "max": 50.0,
  "step": 0.001
 },
 "julian_dist": {
  "label": "Dist",
  "def": 1.0,
  "min": -5.0,
  "max": 8.0,
  "step": 0.001
 },
 "julian_a": {
  "label": "A",
  "def": 1.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "julian_b": {
  "label": "B",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "julian_c": {
  "label": "C",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "julian_d": {
  "label": "D",
  "def": 1.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "julian_e": {
  "label": "E",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "julian_f": {
  "label": "F",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "kaleidoscope_slices": {
  "label": "Slices",
  "def": 6.0,
  "min": 0.0,
  "max": 100.0,
  "step": 1.0
 },
 "kaleidoscope_rotation": {
  "label": "Rotation",
  "def": 0.0,
  "min": -180.0,
  "max": 180.0,
  "step": 0.001
 },
 "lazy_shape": {
  "label": "Shape",
  "def": 0,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Circle",
   "Square",
   "Diamond"
  ]
 },
 "lazy_inside_mode": {
  "label": "Inside Mode",
  "def": 0,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Twist",
   "Weave",
   "Hole"
  ]
 },
 "lazy_outside_mode": {
  "label": "Outside Mode",
  "def": 0,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Inverse",
   "Weave",
   "None"
  ]
 },
 "lazy_ring_mode": {
  "label": "Ring Mode",
  "def": 0,
  "min": 0,
  "max": 23,
  "step": 1,
  "opts": [
   "Empty",
   "Texture",
   "Stripes",
   "Checkers",
   "Dots",
   "Plasma",
   "Spiral",
   "Honeycomb",
   "Bricks",
   "Waves",
   "Zigzag",
   "Scales",
   "Cracks",
   "Sunburst",
   "Weave",
   "Dashes",
   "Noise",
   "Moir\u00e9",
   "Map: Mirror",
   "Map: Unwrap",
   "Map: Kaleido",
   "Map: Twist",
   "Map: Ripple",
   "Map: Tiles"
  ]
 },
 "lazy_amount": {
  "label": "Size",
  "def": 0.4,
  "min": 0.0,
  "max": 2.0,
  "step": 0.001
 },
 "lazy_twist": {
  "label": "Twist",
  "def": 5.0,
  "min": -20.0,
  "max": 20.0,
  "step": 0.001
 },
 "lazy_spin": {
  "label": "Spin",
  "def": 0.0,
  "min": -3.14,
  "max": 3.14,
  "step": 0.001
 },
 "lazy_space": {
  "label": "Space",
  "def": 0.0,
  "min": 0.0,
  "max": 2.0,
  "step": 0.001
 },
 "lazy_offset_x": {
  "label": "Offset X",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "lazy_offset_y": {
  "label": "Offset Y",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "lazy_ring_spin": {
  "label": "Ring Spin",
  "def": 0.0,
  "min": -6.28,
  "max": 6.28,
  "step": 0.001
 },
 "lazy_edge_softness": {
  "label": "Edge Softness",
  "def": 0.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "mirror_x": {
  "label": "Mirror X",
  "def": 0,
  "min": 0,
  "max": 1,
  "step": 1,
  "opts": [
   "Off",
   "On"
  ]
 },
 "mirror_y": {
  "label": "Mirror Y",
  "def": 0,
  "min": 0,
  "max": 1,
  "step": 1,
  "opts": [
   "Off",
   "On"
  ]
 },
 "mirror_rotation": {
  "label": "Rotation",
  "def": 0.0,
  "min": -180.0,
  "max": 180.0,
  "step": 0.001
 },
 "mobius_re_a": {
  "label": "A (Re)",
  "def": 0.1,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_im_a": {
  "label": "A (Im)",
  "def": 0.2,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_re_b": {
  "label": "B (Re)",
  "def": 0.2,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_im_b": {
  "label": "B (Im)",
  "def": -0.12,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_re_c": {
  "label": "C (Re)",
  "def": -0.15,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_im_c": {
  "label": "C (Im)",
  "def": -0.15,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_re_d": {
  "label": "D (Re)",
  "def": 0.21,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "mobius_im_d": {
  "label": "D (Im)",
  "def": 0.1,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "nebula_scale": {
  "label": "Scale",
  "def": 2.0,
  "min": 0.1,
  "max": 10.0,
  "step": 0.001
 },
 "nebula_speed": {
  "label": "Flow Speed",
  "def": 0.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.001
 },
 "nebula_detail": {
  "label": "Detail",
  "def": 5.0,
  "min": 1.0,
  "max": 8.0,
  "step": 1.0
 },
 "nebula_distortion": {
  "label": "Distortion",
  "def": 0.5,
  "min": 0.0,
  "max": 2.0,
  "step": 0.001
 },
 "nebula_swirl": {
  "label": "Swirls",
  "def": 0.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "nebula_stars": {
  "label": "Star Density",
  "def": 0.0,
  "min": 0.0,
  "max": 0.01,
  "step": 0.0001
 },
 "nebula_filaments": {
  "label": "Filaments",
  "def": 0.0,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "polar_offset": {
  "label": "Offset",
  "def": 1.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "popcorn_scale": {
  "label": "Scale",
  "def": 1.0,
  "min": 0.1,
  "max": 5.0,
  "step": 0.001
 },
 "popcorn_strength": {
  "label": "Strength",
  "def": 0.1,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "popcorn_density": {
  "label": "Density",
  "def": 3.0,
  "min": 1.0,
  "max": 20.0,
  "step": 0.001
 },
 "portal_shift_x": {
  "label": "Shift X",
  "def": 1.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "portal_shift_y": {
  "label": "Shift Y",
  "def": 1.0,
  "min": -2.0,
  "max": 2.0,
  "step": 0.01
 },
 "portal_size": {
  "label": "Aperture Zoom",
  "def": 2.0,
  "min": 0.1,
  "max": 10.0,
  "step": 0.01
 },
 "portal_center_x": {
  "label": "Center X",
  "def": -0.5,
  "min": -1.0,
  "max": 1.0,
  "step": 0.01
 },
 "portal_center_y": {
  "label": "Center Y",
  "def": -0.5,
  "min": -1.0,
  "max": 1.0,
  "step": 0.01
 },
 "portal_opacity": {
  "label": "Opacity",
  "def": 0.6,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "reptile_scale": {
  "label": "Zoom",
  "def": 1.0,
  "min": 0.1,
  "max": 5.0,
  "step": 0.001
 },
 "reptile_rotate": {
  "label": "Rotate",
  "def": 0.0,
  "min": -180.0,
  "max": 180.0,
  "step": 0.001
 },
 "sinusoidal_scale": {
  "label": "Scale",
  "def": 3.142,
  "min": 0.0,
  "max": 20.0,
  "step": 0.001
 },
 "sinusoidal_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "snow_scale": {
  "label": "Scale",
  "def": 1.0,
  "min": 0.1,
  "max": 5.0,
  "step": 0.01
 },
 "snow_branches": {
  "label": "Frequency",
  "def": 5.0,
  "min": 1.0,
  "max": 20.0,
  "step": 0.01
 },
 "snow_thickness": {
  "label": "Thickness",
  "def": 0.2,
  "min": 0.0,
  "max": 2.0,
  "step": 0.01
 },
 "snow_chaos": {
  "label": "Chaos",
  "def": 0.1,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "snow_strength": {
  "label": "Strength",
  "def": 0.2,
  "min": 0.0,
  "max": 1.0,
  "step": 0.01
 },
 "spherical_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "spherical_center_x": {
  "label": "Center X",
  "def": 0.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "spherical_center_y": {
  "label": "Center Y",
  "def": 0.0,
  "min": -5.0,
  "max": 5.0,
  "step": 0.001
 },
 "swirl_radius_scale": {
  "label": "Radius Scale",
  "def": 5.0,
  "min": -10.0,
  "max": 10.0,
  "step": 0.001
 },
 "swirl_angle_scale": {
  "label": "Angle Scale",
  "def": 2.0,
  "min": -10.0,
  "max": 10.0,
  "step": 0.001
 },
 "tangent_scale": {
  "label": "Scale",
  "def": 1.5,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "tangent_strength": {
  "label": "Strength",
  "def": 1.0,
  "min": 0.0,
  "max": 5.0,
  "step": 0.001
 },
 "truchet_mode": {
  "label": "Pattern",
  "def": 0,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Displacement",
   "90 Deg",
   "Swap"
  ]
 },
 "truchet_scale": {
  "label": "Scale",
  "def": 2.0,
  "min": 1.0,
  "max": 50.0,
  "step": 0.001
 },
 "truchet_rotate": {
  "label": "Rotate",
  "def": 0.0,
  "min": -180.0,
  "max": 180.0,
  "step": 0.001
 },
 "truchet_strength": {
  "label": "Strength",
  "def": 0.1,
  "min": 0.0,
  "max": 1.0,
  "step": 0.001
 },
 "wave_type": {
  "label": "Wave type",
  "def": 0,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Vertical",
   "Radial",
   "Square"
  ]
 },
 "wave_frequency": {
  "label": "Frequency",
  "def": 0.0,
  "min": 0.0,
  "max": 100.0,
  "step": 0.001
 },
 "wave_amplitude": {
  "label": "Amplitude",
  "def": 0.1,
  "min": 0.0,
  "max": 10.0,
  "step": 0.001
 },
 "wave_phase": {
  "label": "Phase",
  "def": 0.0,
  "min": 0.0,
  "max": 6.28,
  "step": 0.001
 },
 "blur_amount": {
  "label": "Amount",
  "def": 0.0,
  "min": -3.0,
  "max": 3.0,
  "step": 0.001
 },
 "custom_tl": {
  "label": "Top Left",
  "def": 0,
  "min": 0,
  "max": 5,
  "step": 1,
  "opts": [
   "Identity",
   "Rotate +90",
   "Rotate 180",
   "Rotate -90",
   "Flip X",
   "Flip Y"
  ]
 },
 "custom_tr": {
  "label": "Top Right",
  "def": 0,
  "min": 0,
  "max": 5,
  "step": 1,
  "opts": [
   "Identity",
   "Rotate +90",
   "Rotate 180",
   "Rotate -90",
   "Flip X",
   "Flip Y"
  ]
 },
 "custom_bl": {
  "label": "Bottom Left",
  "def": 0,
  "min": 0,
  "max": 5,
  "step": 1,
  "opts": [
   "Identity",
   "Rotate +90",
   "Rotate 180",
   "Rotate -90",
   "Flip X",
   "Flip Y"
  ]
 },
 "custom_br": {
  "label": "Bottom Right",
  "def": 0,
  "min": 0,
  "max": 5,
  "step": 1,
  "opts": [
   "Identity",
   "Rotate +90",
   "Rotate 180",
   "Rotate -90",
   "Flip X",
   "Flip Y"
  ]
 },
 "glynn_tear": {
  "label": "Tear style",
  "def": 2,
  "min": 0,
  "max": 2,
  "step": 1,
  "opts": [
   "Sand (original)",
   "Clumps",
   "Smooth"
  ]
 },
 "glynn_grain": {
  "label": "Clump scale",
  "def": 12,
  "min": 1,
  "max": 120,
  "step": 0.1
 },
 "glynn_ring_detail": {
  "label": "Ring detail",
  "def": 1,
  "min": 0.1,
  "max": 8,
  "step": 0.01
 },
 "glynn_ring_fill": {
  "label": "Ring fill",
  "def": 0.5,
  "min": 0,
  "max": 1,
  "step": 0.01
 },
 "glynn_ring_segments": {
  "label": "Ring segments",
  "def": 12,
  "min": 1,
  "max": 48,
  "step": 1
 },
 "lazy_ring_detail": {
  "label": "Ring detail",
  "def": 1,
  "min": 0.1,
  "max": 8,
  "step": 0.01
 },
 "lazy_ring_fill": {
  "label": "Ring fill",
  "def": 0.5,
  "min": 0,
  "max": 1,
  "step": 0.01
 },
 "lazy_ring_segments": {
  "label": "Ring segments",
  "def": 12,
  "min": 1,
  "max": 48,
  "step": 1
 },
 "glynn_ring_cutfill": {
  "label": "Cut fill",
  "def": 0,
  "min": 0,
  "max": 6,
  "step": 1,
  "opts": [
   "Black",
   "Texture",
   "Mirror",
   "Unwrap",
   "Kaleido",
   "Twist",
   "Ripple"
  ]
 },
 "lazy_ring_cutfill": {
  "label": "Cut fill",
  "def": 0,
  "min": 0,
  "max": 6,
  "step": 1,
  "opts": [
   "Black",
   "Texture",
   "Mirror",
   "Unwrap",
   "Kaleido",
   "Twist",
   "Ripple"
  ]
 },
 "glynn_ring_cutshade": {
  "label": "Cut shade",
  "def": 0.4,
  "min": 0,
  "max": 1,
  "step": 0.01
 },
 "lazy_ring_cutshade": {
  "label": "Cut shade",
  "def": 0.4,
  "min": 0,
  "max": 1,
  "step": 0.01
 }
};

export const VARIATIONS = [
 {
  "id": 0,
  "name": "Sinusoidal",
  "tile": false,
  "params": [
   "sinusoidal_scale",
   "sinusoidal_strength"
  ],
  "speeds": [
   "sinusoidal_scale",
   "sinusoidal_strength"
  ]
 },
 {
  "id": 1,
  "name": "Spherical",
  "tile": false,
  "params": [
   "spherical_strength",
   "spherical_center_x",
   "spherical_center_y"
  ],
  "speeds": [
   "spherical_strength",
   "spherical_center_x",
   "spherical_center_y"
  ]
 },
 {
  "id": 2,
  "name": "Swirl",
  "tile": false,
  "params": [
   "swirl_radius_scale",
   "swirl_angle_scale"
  ],
  "speeds": [
   "swirl_radius_scale",
   "swirl_angle_scale"
  ]
 },
 {
  "id": 3,
  "name": "Wave",
  "tile": false,
  "params": [
   "wave_type",
   "wave_frequency",
   "wave_amplitude",
   "wave_phase"
  ],
  "speeds": [
   "wave_frequency",
   "wave_amplitude",
   "wave_phase"
  ]
 },
 {
  "id": 4,
  "name": "Julian2",
  "tile": false,
  "params": [
   "julian_power",
   "julian_dist",
   "julian_a",
   "julian_b",
   "julian_c",
   "julian_d",
   "julian_e",
   "julian_f"
  ],
  "speeds": [
   "julian_power",
   "julian_dist",
   "julian_a",
   "julian_b",
   "julian_c",
   "julian_d",
   "julian_e",
   "julian_f"
  ]
 },
 {
  "id": 5,
  "name": "Polar",
  "tile": false,
  "params": [
   "polar_offset"
  ],
  "speeds": [
   "polar_offset"
  ]
 },
 {
  "id": 6,
  "name": "Fisheye",
  "tile": false,
  "params": [
   "fisheye_strength"
  ],
  "speeds": [
   "fisheye_strength"
  ]
 },
 {
  "id": 7,
  "name": "Mirror",
  "tile": false,
  "params": [
   "mirror_x",
   "mirror_y",
   "mirror_rotation"
  ],
  "speeds": [
   "mirror_rotation"
  ]
 },
 {
  "id": 8,
  "name": "Kaleidoscope",
  "tile": false,
  "params": [
   "kaleidoscope_slices",
   "kaleidoscope_rotation"
  ],
  "speeds": [
   "kaleidoscope_rotation"
  ]
 },
 {
  "id": 9,
  "name": "Mobius",
  "tile": false,
  "params": [
   "mobius_re_a",
   "mobius_im_a",
   "mobius_re_b",
   "mobius_im_b",
   "mobius_re_c",
   "mobius_im_c",
   "mobius_re_d",
   "mobius_im_d"
  ],
  "speeds": [
   "mobius_re_a",
   "mobius_im_a",
   "mobius_re_b",
   "mobius_im_b",
   "mobius_re_c",
   "mobius_im_c",
   "mobius_re_d",
   "mobius_im_d"
  ]
 },
 {
  "id": 10,
  "name": "Cellular Weave",
  "tile": false,
  "params": [
   "cellular_weave_grid_size",
   "cellular_weave_threshold",
   "cellular_weave_iterations"
  ],
  "speeds": [
   "cellular_weave_grid_size",
   "cellular_weave_threshold",
   "cellular_weave_iterations"
  ]
 },
 {
  "id": 11,
  "name": "Blur",
  "tile": false,
  "params": [
   "blur_amount"
  ],
  "speeds": []
 },
 {
  "id": 12,
  "name": "Heart",
  "tile": false,
  "params": [
   "heart_scale",
   "heart_rotation",
   "heart_strength"
  ],
  "speeds": [
   "heart_scale",
   "heart_rotation",
   "heart_strength"
  ]
 },
 {
  "id": 13,
  "name": "Apollonian Gasket",
  "tile": false,
  "params": [
   "apollonian_scale",
   "ap_c1x",
   "ap_c1y",
   "ap_c2x",
   "ap_c2y",
   "ap_c3x",
   "ap_c3y"
  ],
  "speeds": [
   "apollonian_scale",
   "ap_c1x",
   "ap_c1y",
   "ap_c2x",
   "ap_c2y",
   "ap_c3x",
   "ap_c3y"
  ]
 },
 {
  "id": 14,
  "name": "Cosine",
  "tile": false,
  "params": [
   "cosine_scale",
   "cosine_strength"
  ],
  "speeds": [
   "cosine_scale",
   "cosine_strength"
  ]
 },
 {
  "id": 15,
  "name": "Tangent",
  "tile": false,
  "params": [
   "tangent_scale",
   "tangent_strength"
  ],
  "speeds": [
   "tangent_scale",
   "tangent_strength"
  ]
 },
 {
  "id": 16,
  "name": "ArcTangent",
  "tile": false,
  "params": [
   "arctangent_scale",
   "arctangent_strength"
  ],
  "speeds": [
   "arctangent_scale",
   "arctangent_strength"
  ]
 },
 {
  "id": 17,
  "name": "Hyperbolic Sine",
  "tile": false,
  "params": [
   "hyperbolic_sine_scale",
   "hyperbolic_sine_strength"
  ],
  "speeds": [
   "hyperbolic_sine_scale",
   "hyperbolic_sine_strength"
  ]
 },
 {
  "id": 18,
  "name": "Hyperbolic Cosine",
  "tile": false,
  "params": [
   "hyperbolic_cosine_scale",
   "hyperbolic_cosine_strength"
  ],
  "speeds": [
   "hyperbolic_cosine_scale",
   "hyperbolic_cosine_strength"
  ]
 },
 {
  "id": 19,
  "name": "L-tromino",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 20,
  "name": "Custom 2x2 Tile",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate",
   "custom_tl",
   "custom_tr",
   "custom_bl",
   "custom_br"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 21,
  "name": "Sphinx",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 22,
  "name": "T-tetromino",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 23,
  "name": "Sierpinski Carpet",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 24,
  "name": "Gosper Island",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 25,
  "name": "Carpet (Corners)",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 26,
  "name": "Carpet (Cross)",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 27,
  "name": "Pentagonal Tile",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 28,
  "name": "Diagonal Carpet",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 29,
  "name": "Penrose Star",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 30,
  "name": "Hex Tile",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 31,
  "name": "Twindragon Tile",
  "tile": true,
  "params": [
   "reptile_scale",
   "reptile_rotate"
  ],
  "speeds": [
   "reptile_scale",
   "reptile_rotate"
  ]
 },
 {
  "id": 32,
  "name": "Clifford",
  "tile": false,
  "params": [
   "clifford_a",
   "clifford_b",
   "clifford_c",
   "clifford_d"
  ],
  "speeds": [
   "clifford_a",
   "clifford_b",
   "clifford_c",
   "clifford_d"
  ]
 },
 {
  "id": 33,
  "name": "DeJong",
  "tile": false,
  "params": [
   "dejong_a",
   "dejong_b",
   "dejong_c",
   "dejong_d"
  ],
  "speeds": [
   "dejong_a",
   "dejong_b",
   "dejong_c",
   "dejong_d"
  ]
 },
 {
  "id": 34,
  "name": "Truchet",
  "tile": false,
  "params": [
   "truchet_mode",
   "truchet_scale",
   "truchet_rotate",
   "truchet_strength"
  ],
  "speeds": [
   "truchet_scale",
   "truchet_rotate",
   "truchet_strength"
  ]
 },
 {
  "id": 35,
  "name": "Popcorn",
  "tile": false,
  "params": [
   "popcorn_scale",
   "popcorn_strength",
   "popcorn_density"
  ],
  "speeds": [
   "popcorn_scale",
   "popcorn_strength",
   "popcorn_density"
  ]
 },
 {
  "id": 36,
  "name": "Lazy Mega",
  "tile": false,
  "params": [
   "lazy_shape",
   "lazy_inside_mode",
   "lazy_outside_mode",
   "lazy_ring_mode",
   "lazy_ring_cutfill",
   "lazy_ring_cutshade",
   "lazy_ring_detail",
   "lazy_ring_fill",
   "lazy_ring_segments",
   "lazy_amount",
   "lazy_twist",
   "lazy_spin",
   "lazy_space",
   "lazy_offset_x",
   "lazy_offset_y",
   "lazy_ring_spin",
   "lazy_edge_softness"
  ],
  "speeds": [
   "lazy_amount",
   "lazy_twist",
   "lazy_spin",
   "lazy_space",
   "lazy_ring_spin"
  ]
 },
 {
  "id": 37,
  "name": "Glynn Sim",
  "tile": false,
  "params": [
   "glynn_ring_mode",
   "glynn_ring_cutfill",
   "glynn_ring_cutshade",
   "glynn_ring_detail",
   "glynn_ring_fill",
   "glynn_ring_segments",
   "glynn_tear",
   "glynn_grain",
   "glynn_radius",
   "glynn_thickness",
   "glynn_contrast",
   "glynn_pow"
  ],
  "speeds": [
   "glynn_radius",
   "glynn_thickness",
   "glynn_contrast",
   "glynn_pow"
  ]
 },
 {
  "id": 38,
  "name": "Nebula",
  "tile": false,
  "params": [
   "nebula_scale",
   "nebula_speed",
   "nebula_detail",
   "nebula_distortion",
   "nebula_swirl",
   "nebula_stars",
   "nebula_filaments"
  ],
  "speeds": [
   "nebula_scale",
   "nebula_speed",
   "nebula_distortion",
   "nebula_swirl"
  ]
 },
 {
  "id": 39,
  "name": "Jigsaw",
  "tile": false,
  "params": [
   "jigsaw_scale",
   "jigsaw_tab_size",
   "jigsaw_distortion",
   "jigsaw_outline"
  ],
  "speeds": [
   "jigsaw_scale",
   "jigsaw_tab_size",
   "jigsaw_distortion"
  ]
 },
 {
  "id": 40,
  "name": "Chimera",
  "tile": false,
  "params": [
   "gnarl_mode",
   "gnarl_scale_x",
   "gnarl_scale_y",
   "gnarl_freq_x1",
   "gnarl_freq_y1",
   "gnarl_freq_x2",
   "gnarl_freq_y2",
   "gnarl_freq_x3",
   "gnarl_freq_y3",
   "gnarl_c1",
   "gnarl_c2",
   "gnarl_distort"
  ],
  "speeds": [
   "gnarl_scale_x",
   "gnarl_scale_y",
   "gnarl_freq_x1",
   "gnarl_freq_y1",
   "gnarl_freq_x2",
   "gnarl_freq_y2",
   "gnarl_freq_x3",
   "gnarl_freq_y3",
   "gnarl_c1",
   "gnarl_c2",
   "gnarl_distort"
  ]
 },
 {
  "id": 41,
  "name": "Constructivist",
  "tile": false,
  "params": [
   "construction_density",
   "construction_circles",
   "construction_chaos",
   "construction_thickness"
  ],
  "speeds": [
   "construction_density",
   "construction_circles",
   "construction_chaos",
   "construction_thickness"
  ]
 },
 {
  "id": 42,
  "name": "Frostbyte",
  "tile": false,
  "params": [
   "snow_scale",
   "snow_branches",
   "snow_thickness",
   "snow_chaos",
   "snow_strength"
  ],
  "speeds": [
   "snow_scale",
   "snow_branches",
   "snow_thickness",
   "snow_chaos",
   "snow_strength"
  ]
 },
 {
  "id": 43,
  "name": "Portal",
  "tile": false,
  "params": [
   "portal_shift_x",
   "portal_shift_y",
   "portal_size",
   "portal_center_x",
   "portal_center_y",
   "portal_opacity"
  ],
  "speeds": [
   "portal_shift_x",
   "portal_shift_y",
   "portal_size",
   "portal_center_x",
   "portal_center_y",
   "portal_opacity"
  ]
 },
 {
  "id": 44,
  "name": "Janus",
  "tile": false,
  "params": [
   "janus_shift",
   "janus_zoom",
   "janus_opacity",
   "janus_center_x",
   "janus_center_y"
  ],
  "speeds": [
   "janus_shift",
   "janus_zoom",
   "janus_opacity",
   "janus_center_x",
   "janus_center_y"
  ]
 },
 {
  "id": 45,
  "name": "Canvas",
  "tile": false,
  "params": [
   "canvas_scale",
   "canvas_strength",
   "canvas_flow",
   "canvas_style",
   "canvas_chaos"
  ],
  "speeds": [
   "canvas_scale",
   "canvas_strength",
   "canvas_chaos"
  ]
 }
];

export const VAR_GLSL = {
/* 0 Sinusoidal */ 0: `
// Sinusoidal
   // 1. Calculate animated values
   float anim_scale = $sinusoidal_scale + sin(time * $sinusoidal_scale_speed);
   float anim_strength = $sinusoidal_strength + sin(time * $sinusoidal_strength_speed);

   // 2. Apply parameters
   return sin(uv * anim_scale) * anim_strength;
`,
/* 1 Spherical */ 1: `
// Spherical
   // 1. Calculate animated values
   float anim_strength = $spherical_strength + sin(time * $spherical_strength_speed);
   float anim_center_x = $spherical_center_x + sin(time * $spherical_center_x_speed);
   float anim_center_y = $spherical_center_y + sin(time * $spherical_center_y_speed);

   // 2. Reconstruct center vec2
   vec2 center = vec2(anim_center_x, anim_center_y);

   // 3. Apply logic
   vec2 p = uv - center;
   float r2 = dot(p, p);
   if (r2 > 1e-9) { // Avoid divide by zero
       return center + (p / r2) * anim_strength;
   }
   return uv; // Return original uv if at center
`,
/* 2 Swirl */ 2: `
// Swirl
   // 1. Calculate animated values
   float anim_radius_scale = $swirl_radius_scale + sin(time * $swirl_radius_scale_speed);
   float anim_angle_scale = $swirl_angle_scale + sin(time * $swirl_angle_scale_speed);

   // 2. Apply logic
   float r = length(uv);
   float angle = atan(uv.y, uv.x);
   float s = sin(r * anim_radius_scale - angle * anim_angle_scale);
   float c = cos(r * anim_radius_scale - angle * anim_angle_scale);
   return vec2(s, c) * r;
`,
/* 3 Wave */ 3: `
// Wave
   // 1. Calculate the animated values
   float freq = $wave_frequency + sin(time * $wave_frequency_speed);
   float amp = $wave_amplitude + sin(time * $wave_amplitude_speed);
   float phase = $wave_phase + sin(time * $wave_phase_speed);

   // 2. The rest of the logic uses these new animated values
   float offset = 0.0;
   if (int(floor($wave_type+0.5)) == 0) { // Vertical
       offset = sin(uv.y * freq + phase) * amp;
       return uv + vec2(offset, 0.0);
   } else if (int(floor($wave_type+0.5)) == 1) { // Radial
       float r = length(uv);
       offset = sin(r * freq + phase) * amp;
       return uv * (1.0 + offset);
   } else { // Square
       offset = sign(sin(uv.y * freq + phase)) * amp;
       return uv + vec2(offset, 0.0);
   }
`,
/* 4 Julian2 */ 4: `
// Julian2
       // 1. Calculate all animated values first
       float anim_power = $julian_power + sin(time * $julian_power_speed);
       float anim_dist = $julian_dist + sin(time * $julian_dist_speed);
       float anim_a = $julian_a + sin(time * $julian_a_speed);
       float anim_b = $julian_b + sin(time * $julian_b_speed);
       float anim_c = $julian_c + sin(time * $julian_c_speed);
       float anim_d = $julian_d + sin(time * $julian_d_speed);
       float anim_e = $julian_e + sin(time * $julian_e_speed);
       float anim_f = $julian_f + sin(time * $julian_f_speed);

       // 2. Re-create the matrix and vector
       mat2 julian_mat = mat2(vec2(anim_a, anim_c), vec2(anim_b, anim_d));
       vec2 julian_trans = vec2(anim_e, anim_f);

       // 3. Call the julian function with the animated values
       if (anim_power == 0.0) { return uv; }
       float _cN = anim_dist / anim_power * 0.5;
       vec2 p = uv * julian_mat + julian_trans;
       float angle = atan(p.y, p.x) / anim_power;
       float r = pow(dot(p, p), _cN);
       return vec2(r * cos(angle), r * sin(angle));
`,
/* 5 Polar */ 5: `
// Polar
   // 1. Calculate animated value
   float anim_offset = $polar_offset + sin(time * $polar_offset_speed);

   // 2. Apply logic
   float r = length(uv);
   float theta = atan(uv.y, uv.x);
   return vec2(theta / PI, r - anim_offset);
`,
/* 6 Fisheye */ 6: `
// Fisheye
       float anim_strength = $fisheye_strength + sin(time * $fisheye_strength_speed);
       float r = length(uv);
       return (anim_strength / (r + 1.0)) * uv;
`,
/* 7 Mirror */ 7: `
// Mirror
   // 1. Calculate and apply animated rotation
   float anim_rotation = $mirror_rotation + (time * $mirror_rotation_speed);
   vec2 p = uv * rotate(radians(anim_rotation));

   // 2. Apply mirror logic (check if float is > 0.5)
   if ($mirror_x > 0.5) { p.x = abs(p.x); }
   if ($mirror_y > 0.5) { p.y = abs(p.y); }
   return p;
`,
/* 8 Kaleidoscope */ 8: `
// Kaleidoscope
       // 1. Calculate animated rotation
   float anim_rotation = $kaleidoscope_rotation + (time * $kaleidoscope_rotation_speed);

   // 2. Apply rotation to the coordinate system (using your 'vec * mat' syntax)
   vec2 p = uv * rotate(radians(anim_rotation));

   // 3. Apply kaleidoscope logic to the rotated coordinates
   // Note: We use the non-animated '$kaleidoscope_slices' for stability
   if ($kaleidoscope_slices <= 0.0) { return p; } // Return just the rotated UVs

   float angle = atan(p.y, p.x);
   float r = length(p);
   float slice_angle = PI / $kaleidoscope_slices;
   angle = mod(angle, slice_angle * 2.0);
   angle = abs(angle - slice_angle);
   p.x = r * cos(angle);
   p.y = r * sin(angle);

   // 4. Return the sliced, rotated coordinates
   return p;
`,
/* 9 Mobius */ 9: `
// Mobius
       // 1. Calculate all 8 animated values
       float anim_re_a = $mobius_re_a + sin(time * $mobius_re_a_speed);
       float anim_im_a = $mobius_im_a + sin(time * $mobius_im_a_speed);
       float anim_re_b = $mobius_re_b + sin(time * $mobius_re_b_speed);
       float anim_im_b = $mobius_im_b + sin(time * $mobius_im_b_speed);
       float anim_re_c = $mobius_re_c + sin(time * $mobius_re_c_speed);
       float anim_im_c = $mobius_im_c + sin(time * $mobius_im_c_speed);
       float anim_re_d = $mobius_re_d + sin(time * $mobius_re_d_speed);
       float anim_im_d = $mobius_im_d + sin(time * $mobius_im_d_speed);

       // 2. Reconstruct the complex numbers (a, b, c, d) as vec2s
       vec2 m_a = vec2(anim_re_a, anim_im_a);
       vec2 m_b = vec2(anim_re_b, anim_im_b);
       vec2 m_c = vec2(anim_re_c, anim_im_c);
       vec2 m_d = vec2(anim_re_d, anim_im_d);

       // 3. Run the original Mobius logic with the new vec2s
       // u = a*z + b
       vec2 u = vec2(m_a.x * uv.x - m_a.y * uv.y, m_a.x * uv.y + m_a.y * uv.x) + m_b;

       // v = c*z + d
       vec2 v = vec2(m_c.x * uv.x - m_c.y * uv.y, m_c.x * uv.y + m_c.y * uv.x) + m_d;

       // Calculate 1 / |v|^2, and protect from division by zero
       float d = dot(v, v);
       if (d < 1e-9) { return uv; } // Return original if denominator is too small
       float inv_d = 1.0 / d;

       // Return u / v, which is (u * conjugate(v)) / |v|^2
       return vec2(u.x * v.x + u.y * v.y, u.y * v.x - u.x * v.y) * inv_d;
`,
/* 10 Cellular Weave */ 10: `
// Cellular Weave
   // 1. Calculate animated values
   // Use max() to ensure grid size never goes below 2.0 (or any small number)
   float anim_grid = max(2.0, $cellular_weave_grid_size + sin(time * $cellular_weave_grid_size_speed));
   // Use clamp() to keep the threshold between 0 and 8 (the max neighbors)
   float anim_thresh = clamp($cellular_weave_threshold + sin(time * $cellular_weave_threshold_speed), 0.0, 8.0);
   // This one is already correct
   float anim_iter = max(1.0, abs($cellular_weave_iterations + sin(time * $cellular_weave_iterations_speed)));

   // 2. Run logic with animated values
   vec2 p = uv;
   for (int i = 0; i < 12; i++) {
       if (i >= int(anim_iter)) break;
       vec2 grid_p = floor(p * anim_grid); // Use anim_grid
       float neighbor_sum = 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2(-1.0, -1.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2( 0.0, -1.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2( 1.0, -1.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2(-1.0,  0.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2( 1.0,  0.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2(-1.0,  1.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2( 0.0,  1.0)) > 0.5 ? 1.0 : 0.0;
       neighbor_sum += get_cell_value(grid_p, vec2( 1.0,  1.0)) > 0.5 ? 1.0 : 0.0;

       // 1. Define both possible outcomes
       float angle = neighbor_sum * 0.1;
       vec2 twisted_p = mat2(vec2(cos(angle), sin(angle)), vec2(-sin(angle), cos(angle))) * p;

       vec2 cell_center = (grid_p + 0.5) / anim_grid;
       vec2 pulled_p = mix(p, cell_center, 0.1);

       // 2. Create a "soft" threshold instead of a hard "if"
       // This will smoothly blend from 0.0 to 1.0 as the neighbor_sum crosses the threshold
       float softness = 0.5; // Controls how wide the blend is
       float mix_factor = smoothstep(anim_thresh - softness, anim_thresh + softness, neighbor_sum);

       // 3. Mix between the two outcomes using the mix_factor
       p = mix(pulled_p, twisted_p, mix_factor);
   }
   return p;
`,
/* 11 Blur */ 11: `
// Blur
       float angle = rand(uv) * 2.0 * PI;
       float radius = rand(uv + vec2(5.2, 3.1)) * $blur_amount;
       return uv + vec2(cos(angle), sin(angle)) * radius;
`,
/* 12 Heart */ 12: `
// Heart
   // 1. Calculate animated values
   // Use max(0.01, ...) for scale to prevent divide-by-zero
   float anim_scale = max(0.01, $heart_scale + sin(time * $heart_scale_speed));
   float anim_rotation = $heart_rotation + sin(time * $heart_rotation_speed);
   float anim_strength = $heart_strength + sin(time * $heart_strength_speed);

   // 2. Apply scale and rotation
   vec2 p = uv;
   p /= anim_scale;
   p.y *= -1.0;
   p = vec2(cos(radians(anim_rotation)) * p.x - sin(radians(anim_rotation)) * p.y,
              sin(radians(anim_rotation)) * p.x + cos(radians(anim_rotation)) * p.y);

   // --- Heart Shape Formula ---
   float x = p.x;
   float y = p.y;

   float heart_val = pow(x*x + y*y - 1.0, 3.0) - x*x * pow(y, 3.0);

   vec2 displacement = normalize(vec2(
       3.0 * pow(x*x + y*y - 1.0, 2.0) * (2.0*x) - 2.0*x*pow(y, 3.0),
       3.0 * pow(x*x + y*y - 1.0, 2.0) * (2.0*y) - x*x * 3.0*pow(y, 2.0)
   ));

   if (heart_val < 0.0) {
       displacement *= -1.0;
   }

   // 3. Apply animated strength
   return uv + displacement * anim_strength * 0.1; // *0.1 to keep it subtle
`,
/* 13 Apollonian Gasket */ 13: `
// Apollonian Gasket (Iterative Approximation)
   vec2 p = uv;

   // 1. Calculate all animated values
   float anim_scale = $apollonian_scale + sin(time * $apollonian_scale_speed);
   float anim_c1x = $ap_c1x + sin(time * $ap_c1x_speed);
   float anim_c1y = $ap_c1y + sin(time * $ap_c1y_speed);
   float anim_c2x = $ap_c2x + sin(time * $ap_c2x_speed);
   float anim_c2y = $ap_c2y + sin(time * $ap_c2y_speed);
   float anim_c3x = $ap_c3x + sin(time * $ap_c3x_speed);
   float anim_c3y = $ap_c3y + sin(time * $ap_c3y_speed);

   // 2. Reconstruct the vec2 centers
   vec2 c1 = vec2(anim_c1x, anim_c1y);
   vec2 c2 = vec2(anim_c2x, anim_c2y);
   vec2 c3 = vec2(anim_c3x, anim_c3y);

   // 3. Find the closest center
   float d1 = distance(p, c1);
   float d2 = distance(p, c2);
   float d3 = distance(p, c3);

   vec2 closest_center;
   if (d1 < d2 && d1 < d3) {
       closest_center = c1;
   } else if (d2 < d3) {
       closest_center = c2;
   } else {
       closest_center = c3;
   }

   // 4. Map the point
   if (abs(anim_scale) < 1e-6) { return p; } // Protect from divide by zero
   p = closest_center + (p - closest_center) / anim_scale;

   return p;
`,
/* 14 Cosine */ 14: `
// 1. Calculate animated values
float anim_scale = $cosine_scale + sin(time * $cosine_scale_speed);
float anim_strength = $cosine_strength + sin(time * $cosine_strength_speed);

// 2. Apply parameters
return cos(uv * anim_scale) * anim_strength;
`,
/* 15 Tangent */ 15: `
// Tangent
   // 1. Calculate animated values
   float anim_scale = $tangent_scale + sin(time * $tangent_scale_speed);
   float anim_strength = $tangent_strength + sin(time * $tangent_strength_speed);

   // 2. Apply parameters
   // We simply multiply uv by scale. If the user sets scale to ~1.57 (PI/2),
   // they will get the extreme stretching effect.
   return tan(uv * anim_scale) * anim_strength;
`,
/* 16 ArcTangent */ 16: `
// ArcTangent
   // 1. Calculate animated values
   float anim_scale = $arctangent_scale + sin(time * $arctangent_scale_speed);
   float anim_strength = $arctangent_strength + sin(time * $arctangent_strength_speed);

   // 2. Apply parameters
   return atan(uv * anim_scale) * anim_strength;
`,
/* 17 Hyperbolic Sine */ 17: `
// Hyperbolic Sine
   // 1. Calculate animated values
   float anim_scale = $hyperbolic_sine_scale + sin(time * $hyperbolic_sine_scale_speed);
   float anim_strength = $hyperbolic_sine_strength + sin(time * $hyperbolic_sine_strength_speed);

   // 2. Apply parameters
   return f_sinh(uv * anim_scale) * anim_strength;
`,
/* 18 Hyperbolic Cosine */ 18: `
// Hyperbolic Cosine
   // 1. Calculate animated values
   float anim_scale = $hyperbolic_cosine_scale + sin(time * $hyperbolic_cosine_scale_speed);
   float anim_strength = $hyperbolic_cosine_strength + sin(time * $hyperbolic_cosine_strength_speed);

   // 2. Apply parameters
   return f_cosh(uv * anim_scale) * anim_strength;
`,
/* 19 L-tromino */ 19: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p *= 2.0 * anim_scale;
    if (p.x >= 0.0 && p.y >= 0.0) { p = vec2(p.y, -p.x) + vec2(-1.0, 1.0); }
    else if (p.x < 0.0 && p.y >= 0.0) { p = p + vec2(1.0, -1.0); }
    else if (p.x < 0.0 && p.y < 0.0) { p = p + vec2(1.0, 1.0); }
    else { p = vec2(-p.y, p.x) + vec2(-1.0, -1.0); }
    return p / 2.0;
`,
/* 20 Custom 2x2 Tile */ 20: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    // For ID 20, we apply scale at the END to preserve the 0.5 offsets
    vec2 q = p * 2.0;

    if (q.x > 0.0 && q.y > 0.0) { // TR
         q = (apply_quad_transform(q - vec2(0.5, 0.5), int(floor($custom_tr+0.5))) * 0.5) + vec2(0.5, 0.5);
    } else if (q.x <= 0.0 && q.y > 0.0) { // TL
         q = (apply_quad_transform(q - vec2(-0.5, 0.5), int(floor($custom_tl+0.5))) * 0.5) + vec2(-0.5, 0.5);
    } else if (q.x <= 0.0 && q.y <= 0.0) { // BL
         q = (apply_quad_transform(q - vec2(-0.5, -0.5), int(floor($custom_bl+0.5))) * 0.5) + vec2(-0.5, -0.5);
    } else { // BR
         q = (apply_quad_transform(q - vec2(0.5, -0.5), int(floor($custom_br+0.5))) * 0.5) + vec2(0.5, -0.5);
    }

    // Apply the global zoom/scale here
    return (q / 2.0) * anim_scale;
`,
/* 21 Sphinx */ 21: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p *= 2.0 * anim_scale;
    mat2 R90 = mat2(vec2(0.0, 1.0), vec2(-1.0, 0.0));
    if (p.x + p.y > 0.0) {
        if (p.x - p.y > 0.0) { p = R90 * p + vec2(0.0, 1.0); }
        else { p = p + vec2(-1.0, 0.0); }
    } else {
        if (p.x - p.y > 0.0) { p = p + vec2(1.0, 0.0); }
        else { p = R90 * p + vec2(0.0, -1.0); }
    }
    return p / 2.0;
`,
/* 22 T-tetromino */ 22: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p *= 2.0 * anim_scale;
    mat2 R90 = mat2(vec2(0.0, 1.0), vec2(-1.0, 0.0));
    if (p.x >= 0.0 && p.y >= 0.0) { p = R90 * p + vec2(0.0, 1.0); }
    else if (p.x < 0.0 && p.y >= 0.0) { p = R90 * p + vec2(0.0, -1.0); }
    else if (p.x < 0.0 && p.y < 0.0) { p = -p; }
    else { p = p + vec2(-1.0, 1.0); }
    return p / 2.0;
`,
/* 23 Sierpinski Carpet */ 23: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p = (p * anim_scale + 0.5) * 3.0;
    vec2 i = floor(p);
    if (i.x == 1.0 && i.y == 1.0) { return uv; }
    return fract(p) - 0.5;
`,
/* 24 Gosper Island */ 24: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p = p + 0.5;
    float GOSPER_SCALE = 2.64575 * anim_scale;
    mat2 R60 = mat2(vec2(0.5, 0.866025), vec2(-0.866025, 0.5));
    vec2 p_hex = to_hex_grid(p);
    vec2 p_scaled = p_hex * GOSPER_SCALE;
    vec2 f = fract(p_scaled);
    vec2 i = floor(p_scaled);
    vec2 i_sq = vec2(i.x - floor(i.y / 2.0), i.y);
    int tile_index = int(mod(i_sq.x + i_sq.y * 2.0, 7.0));
    vec2 c_offset = vec2(0.0);
    if (tile_index == 1) { c_offset = vec2(1.0, 0.0); }
    else if (tile_index == 2) { c_offset = vec2(0.0, 1.0); }
    else if (tile_index == 3) { c_offset = vec2(-1.0, 1.0); }
    else if (tile_index == 4) { c_offset = vec2(-1.0, 0.0); }
    else if (tile_index == 5) { c_offset = vec2(0.0, -1.0); }
    else if (tile_index == 6) { c_offset = vec2(1.0, -1.0); }
    vec2 f_unskew = mat2(vec2(1.0, 0.0), vec2(-0.5 / 0.866025, 1.0 / 0.866025)) * f;
    vec2 result = (R60 * f_unskew) + c_offset;
    result = result / GOSPER_SCALE;
    return result - 0.5;
`,
/* 25 Carpet (Corners) */ 25: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p = (p * anim_scale + 0.5) * 3.0;
    vec2 i = floor(p);
    if ( (i.x == 0.0 || i.x == 2.0) && (i.y == 0.0 || i.y == 2.0) ) { return fract(p) - 0.5; }
    return uv;
`,
/* 26 Carpet (Cross) */ 26: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p = (p * anim_scale + 0.5) * 3.0;
    vec2 i = floor(p);
    if (i.x == 1.0 || i.y == 1.0) { return fract(p) - 0.5; }
    return uv;
`,
/* 27 Pentagonal Tile */ 27: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    float scale = 1.618034 * anim_scale;
    vec2 c1 = vec2(0.0, 0.5); vec2 c2 = vec2(0.4755, 0.1545); vec2 c3 = vec2(0.2939, -0.4045);
    vec2 c4 = vec2(-0.2939, -0.4045); vec2 c5 = vec2(-0.4755, 0.1545);
    float d1 = distance(p, c1); float d2 = distance(p, c2); float d3 = distance(p, c3);
    float d4 = distance(p, c4); float d5 = distance(p, c5);
    vec2 closest = c1; float min_d = d1;
    if (d2 < min_d) { min_d = d2; closest = c2; }
    if (d3 < min_d) { min_d = d3; closest = c3; }
    if (d4 < min_d) { min_d = d4; closest = c4; }
    if (d5 < min_d) { closest = c5; }
    return closest + (p - closest) / scale;
`,
/* 28 Diagonal Carpet */ 28: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p = (p * anim_scale + 0.5) * 3.0;
    vec2 i = floor(p);
    if ( (i.x == 1.0 && i.y != 1.0) || (i.y == 1.0 && i.x != 1.0) ) { return uv; }
    return fract(p) - 0.5;
`,
/* 29 Penrose Star */ 29: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    float scale = 1.8 * anim_scale;
    vec2 c1 = vec2(0.0, 0.5); vec2 c2 = vec2(0.4755, 0.1545); vec2 c3 = vec2(0.2939, -0.4045);
    vec2 c4 = vec2(-0.2939, -0.4045); vec2 c5 = vec2(-0.4755, 0.1545);
    float d1 = distance(p, c1); float d2 = distance(p, c2); float d3 = distance(p, c3);
    float d4 = distance(p, c4); float d5 = distance(p, c5);
    vec2 closest = c1; float min_d = d1;
    if (d2 < min_d) { min_d = d2; closest = c2; }
    if (d3 < min_d) { min_d = d3; closest = c3; }
    if (d4 < min_d) { min_d = d4; closest = c4; }
    if (d5 < min_d) { closest = c5; }
    return closest + (p - closest) / scale;
`,
/* 30 Hex Tile */ 30: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    float SCALE = 3.0 * anim_scale;
    vec2 p_hex = to_hex_grid(p);
    p_hex *= SCALE;
    vec2 f = fract(p_hex);
    vec2 i = floor(p_hex);
    vec2 i_sq = vec2(i.x - floor(i.y / 2.0), i.y);
    int tile_index = int(mod(i_sq.x + i_sq.y * 2.0, 7.0));
    if (tile_index == 0) { return uv * SCALE; }
    vec2 f_unskew = mat2(vec2(1.0, 0.0), vec2(-0.5 / 0.866025, 1.0 / 0.866025)) * f;
    return f_unskew - 0.5;
`,
/* 31 Twindragon Tile */ 31: `
// 1. Calculate Animated Transforms
float anim_scale = max(0.01, $reptile_scale + sin(time * $reptile_scale_speed));
float anim_rot = $reptile_rotate + sin(time * $reptile_rotate_speed);

// 2. Apply global rotation to UV
vec2 p = uv * rotate(radians(anim_rot));

    p *= 2.0 * anim_scale;
    mat2 R90 = mat2(vec2(0.0, 1.0), vec2(-1.0, 0.0));
    if (p.x < 0.0) { p = R90 * p + vec2(0.0, 1.0); }
    else { p = p + vec2(-1.0, 0.0); }
    return p / 2.0;
`,
/* 32 Clifford */ 32: `
// Clifford
       // 1. Calculate animated values
       float anim_a = $clifford_a + sin(time * $clifford_a_speed);
       float anim_b = $clifford_b + sin(time * $clifford_b_speed);
       float anim_c = $clifford_c + sin(time * $clifford_c_speed);
       float anim_d = $clifford_d + sin(time * $clifford_d_speed);

       // 2. Apply formula
       return vec2(sin(anim_a * uv.y) + anim_c * cos(anim_a * uv.x),
                   sin(anim_b * uv.x) + anim_d * cos(anim_b * uv.y));
`,
/* 33 DeJong */ 33: `
// DeJong
   // 1. Calculate all animated values
   float anim_a = $dejong_a + sin(time * $dejong_a_speed);
   float anim_b = $dejong_b + sin(time * $dejong_b_speed);
   float anim_c = $dejong_c + sin(time * $dejong_c_speed);
   float anim_d = $dejong_d + sin(time * $dejong_d_speed);

   // 2. Apply parameters
   return vec2(sin(anim_a * uv.y) - cos(anim_b * uv.x),
               sin(anim_c * uv.x) - cos(anim_d * uv.y));
`,
/* 34 Truchet */ 34: `
// Truchet (Multi-Mode)
       // 1. Calculate animated values
       float anim_scale = max(0.1, $truchet_scale + sin(time * $truchet_scale_speed));
       float anim_rotate = $truchet_rotate + sin(time * $truchet_rotate_speed);
       float anim_strength = $truchet_strength + sin(time * $truchet_strength_speed);

       int mode = int($truchet_mode);

       // --- Mode 0: Displacement ---
       if (mode == 0) {
           vec2 p = uv;
           p = p * rotate(radians(anim_rotate));
           p = p * anim_scale;

           vec2 i = floor(p);
           vec2 f = fract(p);

           float r = rand(i);

           vec2 c1, c2;
           if (r > 0.5) { c1 = vec2(0.0, 1.0); c2 = vec2(1.0, 0.0); }
           else { c1 = vec2(0.0, 0.0); c2 = vec2(1.0, 1.0); }

           vec2 g = normalize(f - c1) - normalize(f - c2);
           vec2 displacement = g * rotate(radians(anim_rotate)) * anim_strength;

           return uv + displacement;
       }
       // --- Mode 1: 90-degree rotate ---
       else if (mode == 1) {
           vec2 p = uv;
           p = p * rotate(radians(anim_rotate));
           p = p * anim_scale;

           vec2 i = floor(p);
           vec2 f = fract(p);

           float r = rand(i);
           if (r > 0.5) {
               f = vec2(f.y, 1.0 - f.x);
           }

           // Calculate the final result
           vec2 result = (i + f) / anim_scale * rotate(radians(-anim_rotate));

           // Mix between original and result based on strength
           return mix(uv, result, anim_strength);
       }
       // --- Mode 2: Swap ---
       else if (mode == 2) {
           vec2 p = uv;
           p = p * rotate(radians(anim_rotate));
           p = p * anim_scale;

           vec2 i = floor(p);
           vec2 f = fract(p);

           float r = rand(i);
           if (r > 0.5) {
               f.x = 1.0 - f.x;
           }
           if (f.x > f.y) {
               f.xy = f.yx;
           }

           // Calculate the final result
           vec2 result = (i + f) / anim_scale * rotate(radians(-anim_rotate));

           // Mix between original and result based on strength
           return mix(uv, result, anim_strength);
       }
       return uv;
`,
/* 35 Popcorn */ 35: `
// Popcorn
       // 1. Calculate animated values
       float anim_scale = max(0.01, $popcorn_scale + sin(time * $popcorn_scale_speed));
       float anim_strength = $popcorn_strength + sin(time * $popcorn_strength_speed);
       float anim_density = $popcorn_density + sin(time * $popcorn_density_speed);

       // 2. Apply Scale
       vec2 p = uv / anim_scale;

       // 3. Popcorn Formula
       // x = x - c * sin(y + tan(3 * y))
       // y = y - c * sin(x + tan(3 * x))
       // We use 'anim_density' instead of the hardcoded 3.0

       float dx = anim_strength * sin(p.y + tan(anim_density * p.y));
       float dy = anim_strength * sin(p.x + tan(anim_density * p.x));

       p.x -= dx;
       p.y -= dy;

       return p * anim_scale;
`,
/* 36 Lazy Mega */ 36: `
// Lazy Mega (Soft Edges + Ring Spin)
       // 1. Animate Variables
       float anim_amt = max(0.01, $lazy_amount + sin(time * $lazy_amount_speed));
       float anim_space = max(0.0, $lazy_space + sin(time * $lazy_space_speed));
       float anim_twist = $lazy_twist + sin(time * $lazy_twist_speed);
       float anim_spin = $lazy_spin + sin(time * $lazy_spin_speed);
       float anim_ring_spin = $lazy_ring_spin + (time * $lazy_ring_spin_speed); // Continuous spin

       // 2. Center
       vec2 offset = vec2($lazy_offset_x, $lazy_offset_y);
       vec2 p = uv - offset;

       // 3. Distance
       float dist = 0.0;
       if (int(floor($lazy_shape+0.5)) == 0) dist = length(p);
       else if (int(floor($lazy_shape+0.5)) == 1) dist = max(abs(p.x), abs(p.y));
       else dist = abs(p.x) + abs(p.y);

       // Boundaries
       float inner_edge = anim_amt;
       float outer_edge = anim_amt + anim_space;
       float soft = max(0.001, $lazy_edge_softness); // Avoid div by zero

       // --- BLENDING MASKS ---
       // We calculate a blend factor for each zone transition
       float mask_inside = 1.0 - smoothstep(inner_edge - soft, inner_edge, dist);
       float mask_ring = smoothstep(inner_edge - soft, inner_edge, dist) * (1.0 - smoothstep(outer_edge, outer_edge + soft, dist));
       float mask_outside = smoothstep(outer_edge, outer_edge + soft, dist);

       vec2 result = vec2(0.0);

       // --- ZONE 1: INSIDE ---
       if (mask_inside > 0.01) {
           vec2 p_in = p;
           if (int(floor($lazy_inside_mode+0.5)) == 0) { // Twist
               float a = atan(p.y, p.x) + anim_spin + anim_twist * (inner_edge - dist);
               p_in = vec2(cos(a), sin(a)) * dist;
           } else if (int(floor($lazy_inside_mode+0.5)) == 1) { // Travis
               p_in += sin(p.yx * 10.0 + anim_spin) * 0.1 * anim_twist;
           }
           result += p_in * mask_inside;
       }

       // --- ZONE 2: RING ---
       if (mask_ring > 0.01) {
           vec2 p_ring = p;
           // Apply independent Ring Spin
           p_ring = p_ring * rotate(anim_ring_spin);

           // Ring texture (shared library; modes 0-6 are the originals)
           vec2 rt = ringTexture(int(floor($lazy_ring_mode+0.5)), p, p_ring, dist, inner_edge, outer_edge,
                                 $lazy_ring_detail, $lazy_ring_fill, $lazy_ring_segments, anim_spin,
                                 p_ring * (inner_edge / max(0.001, dist)), p_ring, $lazy_ring_cutfill, $lazy_ring_cutshade);
           // a cut point is black where the ring dominates; in the soft edge it falls back to the plain ring
           // (the original multiplied the sentinel by the soft mask, giving garbage coordinates there)
           if (rt.x > 5000.0) { if (mask_ring >= 0.5) return vec2(10000.0); rt = p_ring; }
           p_ring = rt;
           result += p_ring * mask_ring;
       }

       // --- ZONE 3: OUTSIDE ---
       if (mask_outside > 0.01) {
           vec2 p_out = p;
           if (int(floor($lazy_outside_mode+0.5)) == 0) { // Inverse
               float r = anim_amt * (1.0 + anim_space / max(0.001, dist));
               p_out = p * (r / dist);
           }
           else if (int(floor($lazy_outside_mode+0.5)) == 1) { // Travis
               p_out += cos(p.xy * 5.0 + anim_spin) * 0.1;
           }
           result += p_out * mask_outside;
       }

       return result + offset;
`,
/* 37 Glynn Sim */ 37: `
// GlynnSim (Tuned Granular)
       // 1. Animate Variables
       float anim_radius = max(0.001, $glynn_radius + sin(time * $glynn_radius_speed));
       float anim_thickness = max(0.0, $glynn_thickness + sin(time * $glynn_thickness_speed));
       // Contrast controls the "density" of the tears (0.0 = All Stretch, 1.0 = No Stretch)
       float anim_contrast = clamp($glynn_contrast + sin(time * $glynn_contrast_speed), 0.0, 1.0);
       float anim_pow = $glynn_pow + sin(time * $glynn_pow_speed);

       // 2. Distance & Zones
       // Use the centered UV for distance to ensure ring is circular
       vec2 p = uv; // You can add an offset here later if you want moveable center
       float r = length(p);

       float inner_edge = anim_radius;
       float outer_edge = anim_radius + anim_thickness;

       // --- ZONE 1: INSIDE (Hole) ---
       if (r < inner_edge) {
           // Map hole to source
           return uv * (1.0 / inner_edge);
       }

       // --- ZONE 2: THE RING ---
       else if (r < outer_edge) {
           // Ring texture (shared library; modes 0-6 are the originals)
           return ringTexture(int(floor($glynn_ring_mode+0.5)), uv, uv, r, inner_edge, outer_edge,
                              $glynn_ring_detail, $glynn_ring_fill, $glynn_ring_segments, time,
                              uv * (inner_edge / r), uv * (inner_edge / r), $glynn_ring_cutfill, $glynn_ring_cutshade);
       }

       // --- ZONE 3: OUTSIDE (The GlynnSim Effect) ---
       else {
           // 1. Shift Space (Push outside away to make room for ring)
           // Map current radius 'r' back to where it starts after the thickness
           float shifted_r = r - anim_thickness;
           vec2 p_shifted = uv * (shifted_r / r);

           // 2. Glynn Math
           // Alpha gets smaller as you go further out
           float alpha = inner_edge / max(0.0001, shifted_r);

           // 3. Tearing. threshold = chance a point is "torn" (stretched by 1/alpha^2)
           float threshold = anim_contrast * pow(alpha, abs(anim_pow));
           int tear = int(floor($glynn_tear+0.5));
           if (tear == 2) {
               // SMOOTH (web): no randomness — continuous blend between pass-through and torn
               return mix(p_shifted, p_shifted / (alpha * alpha), clamp(threshold, 0.0, 1.0));
           }
           float rnd;
           if (tear == 1) {
               // CLUMPS (web): coherent noise patches instead of per-pixel sand, so neighbours tear together
               float n = perlin_noise(uv * $glynn_grain) + 0.5 * perlin_noise(uv * $glynn_grain * 2.03 + 7.0);
               rnd = clamp(n * 0.6 + 0.5, 0.0, 1.0);
           } else {
               // SAND (original): one coin flip per pixel — the fine "sand" grain
               rnd = rand(uv * 500.0);
           }
           if (rnd > threshold) {
               return p_shifted;                   // solid: pass through
           } else {
               return p_shifted / (alpha * alpha); // torn: pulls pixels from far away into the gap
           }
       }
`,
/* 38 Nebula */ 38: `
// Nebula (Galaxy Mode)
       float anim_scale = $nebula_scale + sin(time * $nebula_scale_speed);
       float anim_time_shift = time * $nebula_speed + (time * $nebula_speed_speed);
       float anim_distort = $nebula_distortion + sin(time * $nebula_distortion_speed);
       float anim_swirl = $nebula_swirl + sin(time * $nebula_swirl_speed);

       vec2 p = uv * anim_scale;

       // Swirl Logic (Keep this)
       float r_len = length(p);
       if (abs(anim_swirl) > 0.01) {
           p = p * rotate(r_len * anim_swirl);
       }

       // Domain Warping with FILAMENTS
       int octaves = int(clamp($nebula_detail, 1.0, 8.0));

       // Pass '$nebula_filaments' into fbm
       float q = fbm(p + vec2(anim_time_shift, 0.0), octaves, $nebula_filaments);
       float r = fbm(p + vec2(q) + vec2(0.0, anim_time_shift), octaves, $nebula_filaments);

       return uv + vec2(q, r) * anim_distort;
`,
/* 39 Jigsaw */ 39: `
// Jigsaw (True Pieces)
       float anim_scale = max(1.0, $jigsaw_scale + sin(time * $jigsaw_scale_speed));
       float anim_tab_size = $jigsaw_tab_size + sin(time * $jigsaw_tab_size_speed);
       float anim_distort = $jigsaw_distortion + sin(time * $jigsaw_distortion_speed);

       // 1. Base Grid
       vec2 p = uv * anim_scale;
       vec2 cell_id = floor(p);
       vec2 f = fract(p) - 0.5; // Local coords (-0.5 to 0.5)

       // 2. Determine Ownership (Who owns this pixel?)
       // We check neighbors to see if their "Tab" overlaps us.
       vec2 final_id = cell_id;
       float dist_to_edge = 1.0; // For drawing the outline later

       // Helper directions: Right, Left, Top, Bottom
       vec2 dirs[4];
       dirs[0] = vec2(1.0, 0.0); dirs[1] = vec2(-1.0, 0.0); dirs[2] = vec2(0.0, 1.0); dirs[3] = vec2(0.0, -1.0);

       for (int i = 0; i < 4; i++) {
           vec2 dir = dirs[i];
           // Position of the edge relative to cell center
           vec2 edge_pos = dir * 0.5;

           // Unique seed for this specific edge (shared by both neighbors)
           // We calculate a unique ID for the edge between cells
           vec2 edge_seed = cell_id + edge_pos;

           // Randomly decide: Tab Out (1) or Tab In (-1)?
           float r = rand(edge_seed);
           float has_tab = (r > 0.5) ? 1.0 : -1.0;

           // We define the tab "Out" direction relative to positive axes
           // If dir is positive (Right/Down), 'has_tab' 1 means sticking OUT of current cell

           // Calculate distance to the "Tab Circle" center
           // The tab center is slightly offset from the edge
           vec2 tab_center = edge_pos + (dir * has_tab * 0.1); // 0.1 pushes center in/out
           float d = distance(f, tab_center);

           // Check if we are inside the tab
           if (d < anim_tab_size) {
               // We are inside the circle.
               // If the tab belongs to the neighbor, we adopt neighbor's ID.

               // Logic:
               // If I am checking Right neighbor (dir=1,0)
               // And has_tab is -1 (Pointing Left, into me)
               // Then this pixel belongs to the Right Neighbor.

               // This simplified check handles all 4 directions:
               // If the tab points opposite to the direction we are checking, it's the neighbor's.
               if (has_tab * (dir.x + dir.y) < 0.0) {
                   final_id = cell_id + dir;
               }
           }

           // Track closest distance for the outline effect
           dist_to_edge = min(dist_to_edge, abs(d - anim_tab_size));
       }

       // 3. Apply Distortion (Scramble the pieces)
       // Now that we know which piece we belong to (final_id), we apply that piece's rotation.

       // Reconstruct Global UV relative to the *Piece Center*
       vec2 piece_center = (final_id + 0.5);
       vec2 uv_relative = (p - piece_center);

       if (abs(anim_distort) > 0.001) {
           // Random rotation per piece
           float rot = (rand(final_id) - 0.5) * anim_distort * 3.14;
           uv_relative = uv_relative * rotate(rot);
       }

       // 4. Final Mapping
       vec2 result = (piece_center + uv_relative) / anim_scale;

       // 5. Draw Outline
       // 'dist_to_edge' was calculated in the loop (distance to the nearest tab edge)
       // We also need to check distance to the straight grid lines for non-tab edges

       // Re-calculate distance to box edge if we didn't find a tab
       vec2 dist_to_box = 0.5 - abs(f);
       float min_box_dist = min(dist_to_box.x, dist_to_box.y);

       // Combine: The true edge is the minimum of the Box edge OR the Tab edge
       float final_edge_dist = min(dist_to_edge, min_box_dist);

       if (final_edge_dist < $jigsaw_outline) {
           return vec2(10000.0); // Signal to draw black
       }

       return result;
`,
/* 40 Chimera */ 40: `
// GNARL FRANKENSTEIN (DC + Vibration)

       // 1. Calculate Animated Values
       float sx = $gnarl_scale_x + sin(time * $gnarl_scale_x_speed);
       float sy = $gnarl_scale_y + sin(time * $gnarl_scale_y_speed);

       float fx1 = $gnarl_freq_x1 + sin(time * $gnarl_freq_x1_speed);
       float fy1 = $gnarl_freq_y1 + sin(time * $gnarl_freq_y1_speed);

       float fx2 = $gnarl_freq_x2 + sin(time * $gnarl_freq_x2_speed);
       float fy2 = $gnarl_freq_y2 + sin(time * $gnarl_freq_y2_speed);

       float fx3 = $gnarl_freq_x3 + sin(time * $gnarl_freq_x3_speed);
       float fy3 = $gnarl_freq_y3 + sin(time * $gnarl_freq_y3_speed);

       float c1 = $gnarl_c1 + sin(time * $gnarl_c1_speed);
       float c2 = $gnarl_c2 + sin(time * $gnarl_c2_speed);
       float dist_amt = $gnarl_distort + sin(time * $gnarl_distort_speed);

       float x0 = p.x;
       float y0 = p.y;
       float x1 = 0.0;
       float y1 = 0.0;

       // --- MODE 9: VIBRATION MONSTER ---
       if (int(floor($gnarl_mode+0.5)) == 9) {
           // Mapping Gnarl Vars to Vibration2 Params
           float dir = c1;          // C1 = Direction 1
           float angle = c2;        // C2 = Angle 1
           float freq = fx1;        // Freq X1 = Base Freq
           float amp = sx;          // Scale X = Amplitude

           // Modulation parameters (using Freq 2/3 vars)
           float dm = fx2;          // Dir Mod
           float tm = fy2;          // Angle Mod
           float fm = fx3;          // Freq Mod
           float am = fy3;          // Amp Mod

           // WAVE 1 Calculation
           float d_along = x0 * cos(dir) + y0 * sin(dir);
           float dirL = dir + modulate(dm, 0.1, d_along);
           float angleL = angle + modulate(tm, 0.1, d_along);
           float freqL = modulate(fm, 0.1, d_along); // / freq removed for stability
           float ampL = amp + amp * modulate(am, 0.1, d_along);

           float total_angle = angleL + dirL;
           float local_amp = ampL * sin((d_along * freq * 6.28) + freqL);

           x1 = local_amp * cos(total_angle);
           y1 = local_amp * sin(total_angle);

           // WAVE 2 Calculation (Secondary interference layer)
           // We reuse the variables but flipped (Y vars) to create complexity
           float dir2 = c1 + 1.57;  // Perpendicular
           float freq2 = fy1;
           float amp2 = sy;

           float d_along2 = x0 * cos(dir2) + y0 * sin(dir2);
           float dirL2 = dir2 + modulate(fy2, 0.1, d_along2);

           float total_angle2 = angle + dirL2; // Link angle to primary
           float local_amp2 = amp2 * sin((d_along2 * freq2 * 6.28));

           x1 += local_amp2 * cos(total_angle2);
           y1 += local_amp2 * sin(total_angle2);

           // Apply Logic: In Vibration, x1/y1 IS the displacement
           // We don't overwrite, we Add.
           p.x += x1;
           p.y += y1;

           // Skip the standard Gnarl mixing below for this mode
           return p;
       }

      // --- MODE 10: LIGHTNING GNARL (Exponential) ---
       if (int(floor($gnarl_mode+0.5)) == 10) {
           // No auto-animation (t = 0.0)
           float t = 0.0;

           // Exponential math creates sharp, electric spikes
           // Damped by 0.5 to prevent blowing out to pure white
           x1 = exp(sin(fx1 * y0)) * cos(fx2 * x0) * sx * 0.5;
           y1 = exp(sin(fy1 * x0)) * cos(fy2 * y0) * sy * 0.5;

           // Additive mixing
           p.x += x1;
           p.y += y1;

           // We use standard distortion logic at the end of the function
           // so simply return here to skip the x0/x1 average mix
           // (or let it fall through if you want standard mixing)

           // Let's fall through to the end so Color/Distort still work!
           // But we need to update x0/y0 for the mix
           x0 = p.x;
           y0 = p.y;
       }

       // --- MODE 11: DEEP LIQUID NOISE (Multi-Layer Perlin) ---
       else if (int(floor($gnarl_mode+0.5)) == 11) {
           float t = 0.0; // No auto-animation

           // Layer 1: Base Flow (Controlled by Freq 1)
           float n1 = perlin_noise(p * fx1);

           // Layer 2: Detail/Grit (Controlled by Freq 2)
           // We rotate it slightly to prevent grid alignment
           float n2 = perlin_noise((p * fx2) + vec2(43.0, 12.0));

           // Layer 3: Warp/Distortion (Controlled by Freq 3)
           float n3 = perlin_noise((p * fx3) - vec2(15.0, 32.0));

           // Combine layers: Base + (Detail * 0.5) + (Warp * 0.25)
           float final_noise = n1 + (n2 * 0.5) + (n3 * 0.25);

           // Map noise to an angle (0 to 2PI)
           float angle = final_noise * 6.28;

           // Create displacement
           x1 = cos(angle) * sx;
           y1 = sin(angle) * sy;

           // Additive mixing feels more fluid
           p.x += x1;
           p.y += y1;

           // Update for final mix step
           x0 = p.x;
           y0 = p.y;
       }
       // --- MODES 1-8: DC GNARLY ---
       float t = 0.0; // Internal flow for standard gnarl

       if (int(floor($gnarl_mode+0.5)) == 1) {
           x1 = cos(fx1 * y0 + t + sin(fx2 * (y0 + sin(fx3 * y0))));
           y1 = cos(fy1 * x0 + t + sin(fy2 * (x0 + sin(fy3 * x0))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 2) {
           x1 = sin(fx1 * y0 + t + sin(fx2 * (y0 + cos(fx3 * y0))));
           y1 = sin(fy1 * x0 + t + sin(fy2 * (x0 + cos(fy3 * x0))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 3) {
           x1 = cos(fx1 * y0 + t + sin(fx2 * (x0 + sin(fx3 * y0))));
           y1 = cos(fy1 * x0 + t + sin(fy2 * (y0 + sin(fy3 * x0))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 4) {
           x1 = sin(fx1 * y0 + t + sin(sqrt(abs(fx2 * (y0 + cos(fx3 * y0))))));
           y1 = sin(fy1 * x0 + t + sin(sqrt(abs(fy2 * (x0 + cos(fy3 * x0))))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 5) { // ASINH
           x1 = cos(fx1 * y0 + t + f_asinh(fx2 * (y0 + sin(fx3 * y0))));
           y1 = cos(fy1 * x0 + f_asinh(fy2 * (x0 + sin(fy3 * x0))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 6) { // TAN
           x1 = cos(fx1 * y0 + t + tan(fx2 * (y0 + sin(fx3 * y0))));
           y1 = cos(fy1 * x0 + tan(fy2 * (x0 + sin(fy3 * x0))));
       }
       else if (int(floor($gnarl_mode+0.5)) == 7) { // SQR
           x1 = sin(fx1 * y0 + t + sin(sqr(fx2 * (y0 + cos(fx3 * y0)))));
           y1 = sin(fy1 * x0 + t + sin(sqr(fy2 * (x0 + cos(fy3 * x0)))));
       }
       else { // Mode 8
           x1 = sin(fx1 * y0 + t + sin(sqr(fx2 * (x0 + cos(fx3 * y0)))));
           y1 = sin(fy1 * x0 + t + sin(sqr(fy2 * (y0 + cos(fy3 * x0)))));
       }

       // Apply Strength (Scale)
       x1 *= sx;
       y1 *= sy;

       // --- STEP 1: CALCULATE BASIC SHAPE ---
       p.x = (x0 + x1) * 0.5;
       p.y = (y0 + y1) * 0.5;

       // --- STEP 2: CALCULATE S1 ---
       float s1 = 0.0;
       float radius = sqrt(x1*x1 + y1*y1);
       if (radius > 0.0001) s1 = log(radius);

       // --- STEP 3: APPLY LOG DISTORTION ---
       if (abs(dist_amt) > 0.001) {
           p += (s1 * dist_amt) * 0.5;
       }

       // --- STEP 4: APPLY COLOR/PHASE WARPING ---
       if (abs(c1) > 0.0 || abs(c2) > 0.0) {
            float final_s1 = s1 * dist_amt;
            float phase_val = abs(cos(x0 + x1 * c1 + final_s1) + sin(y0 + y1 * c2 + final_s1));
            p += vec2(sin(phase_val), cos(phase_val)) * 0.1;
       }

       return p;
`,
/* 41 Constructivist */ 41: `
// CONSTRUCTIVIST (Mondrian/Bauhaus)
       // 1. Animate
       float anim_den = max(1.0, $construction_density + sin(time * $construction_density_speed));
       // anim_circ now controls Shape Variety (0.0 = Blocks only, 1.0 = All shapes)
       float anim_variety = $construction_circles + sin(time * $construction_circles_speed);
       float anim_chaos = $construction_chaos + sin(time * $construction_chaos_speed);
       float anim_thick = max(0.001, $construction_thickness + sin(time * $construction_thickness_speed));

       // 2. Grid Setup
       vec2 grid_p = uv * anim_den;
       vec2 id = floor(grid_p);
       vec2 f = fract(grid_p) - 0.5; // Centered local UV (-0.5 to 0.5)

       float rnd = rand(id); // Unique seed per cell

       // 3. Chaos (Shifting Grid)
       if (rnd > (1.0 - anim_chaos * 0.5)) {
           // FIX: Multiply time by the speed variable ($construction_chaos_speed)
           // If speed is 0.0, this shift becomes constant (or 0 if time starts at 0)
           float shift = time * $construction_chaos_speed * 0.5 * (mod(id.y, 2.0) * 2.0 - 1.0);
           f.x += shift;
           f = fract(f + 0.5) - 0.5;
       }

       // Define line width
       float line_width = anim_thick * 0.015;

       // 4. Shape Selection Logic
       // We split the variety parameter into thresholds for different shapes.
       // If anim_variety is 1.0, each shape has a 20% chance.
       // If anim_variety is 0.2, only circles and blocks appear.
       float t_circle = anim_variety * 0.2;
       float t_diamond = anim_variety * 0.4;
       float t_cross = anim_variety * 0.6;
       float t_triangle = anim_variety * 0.8;

       float dist = 0.0;
       bool draw_shape_outline = false;

       if (rnd < t_circle) {
           // --- CIRCLE ---
           dist = length(f);
           // Draw at radius 0.4
           draw_shape_outline = abs(dist - 0.4) < line_width;
       }
       else if (rnd < t_diamond) {
           // --- DIAMOND (Rotated Square) ---
           // Manhattan distance
           dist = abs(f.x) + abs(f.y);
           // Draw at radius 0.5
            draw_shape_outline = abs(dist - 0.5) < line_width;
       }
       else if (rnd < t_cross) {
            // --- CROSS (Union of two boxes) ---
            // Horizontal bar (wide, thin) vs Vertical bar (thin, tall)
            float box1 = sdBox(f, vec2(0.4, 0.12));
            float box2 = sdBox(f, vec2(0.12, 0.4));
            // Union is min() of distances.
            dist = min(box1, box2);
            // SDF is 0.0 at edge. Draw outline near 0.0.
            draw_shape_outline = abs(dist) < line_width;
       }
       else if (rnd < t_triangle) {
           // --- TRIANGLE ---
           // Need to offset Y slightly to center visually in grid cell
           dist = sdTriangle(f + vec2(0.0, 0.05), 0.4);
           // SDF is 0.0 at edge.
           draw_shape_outline = abs(dist) < line_width;
       }
       else {
           // --- BLOCK (Mondrian background) ---
           // Draw grid lines near edges of cell (0.5)
           vec2 ab_f = abs(f);
           if (ab_f.x > (0.5 - line_width) || ab_f.y > (0.5 - line_width)) {
               return vec2(10000.0); // Black Line
           }
       }

       // 5. Final Outline Check
       if (draw_shape_outline) {
            return vec2(10000.0); // Black Line
       }

       // 6. Chaos distortion inside shapes (optional aesthetic choice)
       if (rnd < t_triangle && anim_chaos > 0.1) {
            f = f * (1.0 + anim_chaos * 0.2);
       }

       // Return mapped coordinate
       return (id + 0.5 + f) / anim_den;
`,
/* 42 Frostbyte */ 42: `
// SNOWFLAKE (Fractal Ice Upgrade)
       // 1. Animate Parameters
       float anim_scale = max(0.1, $snow_scale + sin(time * $snow_scale_speed));
       float anim_branch = $snow_branches + sin(time * $snow_branches_speed); // Controls fold angle
       float anim_thick = max(0.001, $snow_thickness + sin(time * $snow_thickness_speed)); // Controls spacing
       float anim_chaos = $snow_chaos + sin(time * $snow_chaos_speed); // Controls twist
       float anim_str = $snow_strength + sin(time * $snow_strength_speed);

       // 2. Center and Scale
       vec2 p = uv * anim_scale;

       // 3. FRACTAL LOOP
       // We loop 4 times to create recursive "frost" patterns
       // Use the 'anim_str' (Strength slider) to fade the effect in/out
       float strength_factor = clamp(anim_str, 0.0, 1.0);

       // Standard Hexagonal Angle (30 degrees)
       // We modulate this with 'Branch' slider to let you open/close the crystals
       float fold_angle = 0.523598 + (anim_branch * 0.2);
       vec2 n = vec2(sin(fold_angle), cos(fold_angle));

       for (int i = 0; i < 4; i++) {
           // A. Symmetry Fold (Kaleidoscope)
           p.x = abs(p.x);
           p -= 2.0 * min(0.0, dot(p, n)) * n;

           // B. Shift & Scale (The Fractal part)
           // 'Thickness' slider now controls how far apart the crystals are
           p.y -= 1.0 + (anim_thick * 10.0);

           // C. Rotation (Twist)
           // 'Chaos' slider rotates the next layer of crystals
           if (abs(anim_chaos) > 0.01) {
               p *= rotate(anim_chaos * float(i));
           }

           // D. Scale down for next iteration
           p *= 1.4;
       }

       // 4. Return to 0..1 space
       // We mix between original UV and Fractal UV based on strength
       return mix(uv, p, strength_factor);
`,
/* 43 Portal */ 43: `
// PORTAL (Fully Animated)

       // --- ANIMATION CALCULATIONS ---

       // 1. Center / Position Animation (Orbiting)
       // We use an amplitude of 0.5 so it can move across half the screen.
       float anim_center_x = $portal_center_x + (sin(time * $portal_center_x_speed) * 0.5);
       float anim_center_y = $portal_center_y + (sin(time * $portal_center_y_speed) * 0.5);

       // 2. Size Animation (Pulse)
       float anim_size = $portal_size + (sin(time * $portal_size_speed) * 0.3);
       anim_size = max(0.01, anim_size);

       // 3. Opacity Animation (Fade)
       float anim_opacity = $portal_opacity + sin(time * $portal_opacity_speed);
       anim_opacity = clamp(anim_opacity, 0.0, 1.0);

       // 4. Shift Animation (Internal Sway)
       float anim_shift_x = $portal_shift_x + (sin(time * $portal_shift_x_speed) * 0.5);
       float anim_shift_y = $portal_shift_y + (sin(time * $portal_shift_y_speed) * 0.5);

       // --- CORE LOGIC ---

       // 1. APPLY CENTER (Using Animated Values)
       vec2 p_centered = (uv - 0.5) - vec2(anim_center_x, anim_center_y);

       // 2. APPLY ZOOM
       vec2 p = (p_centered * 2.0) * anim_size;

       // --- STAGE 1: THE APERTURE ---
       float fixed_v = 0.63661977;
       float x = p.x;
       float y = p.y;

       float tmp = y*y + x*x + 1.0;
       float x2 = 2.0 * x;
       float term1 = sqrt(max(0.0001, tmp + x2));
       float term2 = sqrt(max(0.0001, tmp - x2));
       float xmax = 0.5 * (term1 + term2);

       float a = x / max(0.0001, xmax);
       float b = sqrt(max(0.0, 1.0 - a*a));
       float sign_y = (y >= 0.0) ? 1.0 : -1.0;

       vec2 elliptic_p;
       elliptic_p.x = fixed_v * atan(a, b);
       elliptic_p.y = sign_y * fixed_v * log(max(0.0001, xmax + sqrt(max(0.0, xmax*xmax - 1.0))));
       elliptic_p *= 1.2;

       // 3. BLEND (Opacity)
       p = mix(p, elliptic_p, anim_opacity);

       // --- STAGE 2: THE SHIFT ---
       if (p.x >= 0.0) p.x += anim_shift_x;
       else p.x -= anim_shift_x;

       if (p.y >= 0.0) p.y += anim_shift_y;
       else p.y -= anim_shift_y;

       // 4. UN-CENTER
       return (p / 2.0) + 0.5;
`,
/* 44 Janus */ 44: `
// JANUS (Centered & Robust)

       // 1. ANIMATION CALCULATIONS
       float anim_shift = $janus_shift + (time * $janus_shift_speed * 0.5);

       float anim_zoom = $janus_zoom + (sin(time * $janus_zoom_speed) * 0.2);
       anim_zoom = max(0.01, anim_zoom);

       float anim_opacity = $janus_opacity + sin(time * $janus_opacity_speed);
       anim_opacity = clamp(anim_opacity, 0.0, 1.0);

       // NEW: Calculate Center Animation
       float anim_center_x = $janus_center_x + (sin(time * $janus_center_x_speed) * 0.5);
       float anim_center_y = $janus_center_y + (sin(time * $janus_center_y_speed) * 0.5);

       // 2. APPLY CENTER & SCALE
       // We subtract the center offset first, THEN scale up.
       vec2 p_centered = (uv - 0.5) - vec2(anim_center_x, anim_center_y);
       vec2 p = p_centered * 4.0 * anim_zoom;

       float r2 = dot(p, p);
       float x2 = 2.0 * p.x;

       // 3. JANUS MATH

       // --- Y Component (Angle) ---
       float angle = 0.5 * atan(2.0 * p.y, r2 - 1.0);

       // Apply Shift
       angle -= 0.5 * PI * anim_shift;

       // Wrap Angle cleanly
       angle = mod(angle, PI);

       // --- X Component (Field Lines) ---
       float num = (r2 + 1.0) + x2;
       float den = (r2 + 1.0) - x2;

       // Safety check for division
       if (abs(den) < 0.0001) den = 0.0001;
       float fraction = abs(num / den);

       float log_val = log(fraction);

       // 4. MAPPING
       vec2 janus_p;
       janus_p.x = log_val * 0.2; // Tighter rings
       janus_p.y = angle * (1.0 / PI);

       // 5. BLEND & RETURN
       // We use fract() to force the texture to loop, preventing solid colors
       vec2 final_p = mix(p * 0.25, janus_p, $janus_opacity);

       return fract(final_p + 0.5);
`,
/* 45 Canvas */ 45: `
// CANVAS (15 Styles: Oil to Spirit)

       // 1. ANIMATION & PARAMS
       float anim_scale = max(1.0, $canvas_scale + (sin(time * $canvas_scale_speed) * 0.1));
       float anim_str = $canvas_strength + (sin(time * $canvas_strength_speed) * 0.1);

       // Chaos Multi-Mode Selector
       float raw_chaos = $canvas_chaos + (sin(time * $canvas_chaos_speed) * 0.1);
       float flow_time = time * $canvas_flow;

       vec2 p = uv;
       vec2 paint_offset = vec2(0.0);

       // --- CHAOS SELECTOR ---
       if (raw_chaos > 0.001) {
           int chaos_mode = int(floor(abs(raw_chaos)));
           float chaos_power = fract(abs(raw_chaos));
           if (chaos_power < 0.001) chaos_power = 1.0;

           if (chaos_mode == 0) { // Liquid
               float cx = sin(p.y * 3.0 + flow_time);
               float cy = cos(p.x * 3.0 + flow_time);
               p += vec2(cx, cy) * chaos_power * 0.1;
           }
           else if (chaos_mode == 1) { // Smoke
               float n = perlin_noise(p * 5.0 + vec2(flow_time * 0.5));
               p += n * chaos_power * 0.1;
           }
           else if (chaos_mode == 2) { // Static
               float rnd = rand(uv + vec2(time)) - 0.5;
               p += rnd * chaos_power * 0.05;
           }
           else if (chaos_mode == 3) { // Tear
               float slit = floor(p.y * 20.0);
               float shift = sin(flow_time * 5.0 + slit);
               p.x += shift * chaos_power * 0.05;
           }
           else if (chaos_mode == 4) { // Crunch
               float res = 100.0 * (1.1 - chaos_power);
               p = floor(p * res) / res;
           }
           else {
               float cx = sin(p.y * 10.0 + flow_time);
               p += vec2(cx, 0.0) * chaos_power * 0.1;
           }
       }

       float style = $canvas_style;

       // --- STYLE 0: OIL ---
       if (style < 1.0) {
           float influence = 1.0 - style;
           float wave_x = sin(p.y * anim_scale * 8.0 + flow_time);
           float wave_y = cos(p.x * anim_scale * 8.0 + flow_time);
           paint_offset += vec2(wave_x, wave_y * 0.5) * 0.015 * anim_str * influence;
       }
       // --- STYLE 1: CUBISM ---
       else if (style < 2.0) {
           float influence = 1.0 - abs(1.0 - style);
           float blocks = anim_scale * 5.0;
           vec2 stepped_uv = floor(p * blocks) / blocks;
           paint_offset += (p - stepped_uv) * anim_str * 2.0 * influence;
       }
       // --- STYLE 2: SKETCH ---
       else if (style < 3.0) {
           float influence = 1.0 - abs(2.0 - style);
           float grain = sin(p.x * 200.0 * anim_scale) * sin(p.y * 200.0 * anim_scale);
           float jitter_x = sin(p.x * anim_scale * 50.0 + flow_time * 20.0);
           paint_offset += vec2(jitter_x + grain, grain) * 0.003 * anim_str * influence;
       }
       // --- STYLE 3: MOSAIC ---
       else if (style < 4.0) {
           float influence = 1.0 - abs(3.0 - style);
           float tiles = anim_scale * 10.0;
           vec2 grid = p * tiles;
           if (mod(floor(grid.y), 2.0) > 0.5) grid.x += 0.5;
           vec2 cell = floor(grid);
           vec2 center = (cell + 0.5) / tiles;
           vec2 mosaic_dist = (center - p);
           if (mod(cell.y, 2.0) > 0.5) mosaic_dist.x -= (0.5/tiles);
           paint_offset += mosaic_dist * anim_str * influence;
       }
       // --- STYLE 4: WET INK ---
       else if (style < 5.0) {
           float influence = 1.0 - abs(4.0 - style);
           float ink_x = sin(p.y * 3.0 * anim_scale + flow_time) + sin(p.y * 10.0 * anim_scale);
           float ink_y = cos(p.x * 3.0 * anim_scale + flow_time) + cos(p.x * 10.0 * anim_scale);
           paint_offset += vec2(ink_x, ink_y) * 0.03 * anim_str * influence;
       }
       // --- STYLE 5: GLITCH ---
       else if (style < 6.0) {
           float influence = 1.0 - abs(5.0 - style);
           float scanline = floor(p.y * anim_scale * 20.0);
           float shift = sin(scanline * 132.4 + flow_time * 50.0);
           if (fract(sin(scanline * 43.12 + flow_time) * 43758.54) > (1.0 - anim_str * 0.5)) {
               paint_offset.x += shift * 0.1 * anim_str * influence;
           }
           paint_offset.y += sin(flow_time * 50.0) * 0.002 * anim_str * influence;
       }
       // --- STYLE 6: IMPASTO ---
       else if (style < 7.0) {
           float influence = 1.0 - abs(6.0 - style);
           float dabs = anim_scale * 15.0;
           vec2 dab_id = floor(p * dabs);
           float dab_angle = rand(dab_id) * 3.14 + flow_time;
           vec2 dab_uv = fract(p * dabs) - 0.5;
           vec2 rot_dab = dab_uv * mat2(vec2(cos(dab_angle), -sin(dab_angle)), vec2(sin(dab_angle), cos(dab_angle)));
           paint_offset += rot_dab * 0.1 * anim_str * influence;
       }
       // --- STYLE 7: POINTILLISM ---
       else if (style < 8.0) {
           float influence = 1.0 - abs(7.0 - style);
           float dots = anim_scale * 40.0;
           vec2 dot_grid = fract(p * dots) - 0.5;
           float d_len = length(dot_grid);
           float breathe = sin(flow_time * 5.0) * 0.2;
           paint_offset += (dot_grid * (0.5 - d_len + breathe)) * 0.1 * anim_str * influence;
       }
       // --- STYLE 8: CROSS-HATCH ---
       else if (style < 9.0) {
           float influence = 1.0 - abs(8.0 - style);
           float lines = anim_scale * 50.0;
           float l1 = sin((p.x + p.y) * lines + flow_time * 10.0);
           float l2 = sin((p.x - p.y) * lines - flow_time * 10.0);
           paint_offset += vec2(l1, l2) * 0.005 * anim_str * influence;
       }
       // --- STYLE 9: HALFTONE ---
       else if (style < 10.0) {
           float influence = 1.0 - abs(9.0 - style);
           float freq = anim_scale * 60.0;
           vec2 grid = fract(p * freq) - 0.5;
           float dist = length(grid);
           paint_offset += (grid * -dist) * anim_str * 0.5 * influence;
       }
       // --- STYLE 10: ENGRAVING ---
       else if (style < 11.0) {
           float influence = 1.0 - abs(10.0 - style);
           float freq = anim_scale * 80.0;
           float wave = sin(p.x * freq + sin(p.y * freq * 0.5 + flow_time) * 5.0);
           paint_offset.y += wave * 0.02 * anim_str * influence;
       }
       // --- STYLE 11: MARBLING ---
       else if (style < 12.0) {
           float influence = 1.0 - abs(11.0 - style);
           vec2 q = vec2(0.0);
           q.x = fbm((p * anim_scale) + 0.00 * flow_time, 2, 0.5);
           q.y = fbm((p * anim_scale) + vec2(1.0), 2, 0.5);
           vec2 r = vec2(0.0);
           r.x = fbm((p * anim_scale) + 1.0 * q + vec2(1.7, 9.2) + 0.15 * flow_time, 2, 0.5);
           r.y = fbm((p * anim_scale) + 1.0 * q + vec2(8.3, 2.8) + 0.126 * flow_time, 2, 0.5);
           paint_offset += r * 0.2 * anim_str * influence;
       }
       // --- STYLE 12: WOVEN (Fabric) ---
       else if (style < 13.0) {
           float influence = 1.0 - abs(12.0 - style);
           float threads = anim_scale * 40.0;
           // Checkboard pattern for over/under
           vec2 weave = sin(p * threads + flow_time);
           // Offset X by Y to create the weave look
           float fabric = sin(p.x * threads + sin(p.y * threads));
           paint_offset += vec2(fabric, -fabric) * 0.005 * anim_str * influence;
       }
       // --- STYLE 13: SHATTER (Glass) ---
       else if (style < 14.0) {
           float influence = 1.0 - abs(13.0 - style);
           float shards = anim_scale * 5.0;
           vec2 cell = floor(p * shards);
           // Random offset for each shard
           vec2 rand_shift = vec2(rand(cell), rand(cell + 10.0)) - 0.5;
           // Rotate slightly based on time
           rand_shift *= rotate(flow_time * (rand(cell) - 0.5));
           paint_offset += rand_shift * 0.1 * anim_str * influence;
       }
       // --- STYLE 14: SPIRIT (Ethereal) ---
       else {
           float influence = 1.0;

           // Upward drifting sine waves
           float drift = sin(p.x * 20.0 * anim_scale + flow_time * 2.0) + sin(p.x * 50.0 * anim_scale + flow_time * 5.0);

           // FIX: Use 'p.y' (local coord) instead of 'UV.y' (global)
           // p.y is centered (-0.5 to 0.5), so adding 0.5 restores the 0-to-1 range
           float fade = clamp(p.y + 0.5, 0.0, 1.0);

           paint_offset.y -= drift * 0.02 * anim_str * influence * fade;
       }

       return uv + paint_offset;
`,
};
