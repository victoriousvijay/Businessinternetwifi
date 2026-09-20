/* ==========================================================================
   Galaxy — interactive WebGL star-field background.
   Vanilla-JS port of the React Bits <Galaxy /> component (no React / ogl needed).

   <div class="galaxy" data-galaxy
        data-density="1.5" data-glow-intensity="0.5" data-saturation="0.8" data-hue-shift="240"
        data-mouse-repulsion="true" data-mouse-interaction="true"
        data-light-mode="auto"></div>

   Supported data-* props (same names as the React props, kebab-case):
     star-speed, density, hue-shift, speed, glow-intensity, saturation, twinkle-intensity,
     rotation-speed, repulsion-strength, auto-center-repulsion, focal ("x,y"), rotation ("x,y"),
     mouse-interaction, mouse-repulsion, disable-animation, transparent, light-mode (true | false | auto)
   light-mode="auto" follows the page theme: ink-on-white in the light theme, glowing stars in the dark one.
   ========================================================================== */
(function () {
  'use strict';

  const VERT = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

  const FRAG = `
    precision highp float;
    uniform float uTime;
    uniform vec3 uResolution;
    uniform vec2 uFocal;
    uniform vec2 uRotation;
    uniform float uStarSpeed;
    uniform float uDensity;
    uniform float uHueShift;
    uniform float uSpeed;
    uniform vec2 uMouse;
    uniform float uGlowIntensity;
    uniform float uSaturation;
    uniform int uMouseRepulsion;
    uniform float uTwinkleIntensity;
    uniform float uRotationSpeed;
    uniform float uRepulsionStrength;
    uniform float uMouseActiveFactor;
    uniform float uAutoCenterRepulsion;
    uniform int uTransparent;
    uniform float uLightMode;
    varying vec2 vUv;

    #define STAR_COLOR_CUTOFF 0.2
    #define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
    #define PERIOD 3.0

    float Hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float tri(float x) { return abs(fract(x) * 2.0 - 1.0); }
    float tris(float x) { float t = fract(x); return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0)); }
    float trisn(float x) { float t = fract(x); return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0; }

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    float Star(vec2 uv, float flare) {
      float d = length(uv);
      float m = (0.05 * uGlowIntensity) / d;
      float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
      m += rays * flare * uGlowIntensity;
      uv *= MAT45;
      rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
      m += rays * 0.3 * flare * uGlowIntensity;
      m *= smoothstep(1.0, 0.2, d);
      return m;
    }

    vec3 StarLayer(vec2 uv) {
      vec3 col = vec3(0.0);
      vec2 gv = fract(uv) - 0.5;
      vec2 id = floor(uv);
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y));
          vec2 si = id + offset;
          float seed = Hash21(si);
          float size = fract(seed * 345.32);
          float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
          float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

          float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
          float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
          float grn = min(red, blu) * seed;
          vec3 base = vec3(red, grn, blu);

          float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
          hue = fract(hue + uHueShift / 360.0);
          float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
          float val = max(max(base.r, base.g), base.b);
          base = hsv2rgb(vec3(hue, sat, val));

          vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
          float star = Star(gv - offset - pad, flareSize);

          float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
          twinkle = mix(1.0, twinkle, uTwinkleIntensity);
          star *= twinkle;

          col += star * size * base;
        }
      }
      return col;
    }

    void main() {
      vec2 focalPx = uFocal * uResolution.xy;
      vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
      vec2 mouseNorm = uMouse - vec2(0.5);

      if (uAutoCenterRepulsion > 0.0) {
        float centerDist = length(uv);
        vec2 repulsion = normalize(uv) * (uAutoCenterRepulsion / (centerDist + 0.1));
        uv += repulsion * 0.05;
      } else if (uMouseRepulsion == 1) {
        vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
        float mouseDist = length(uv - mousePosUV);
        vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
        uv += repulsion * 0.05 * uMouseActiveFactor;
      } else {
        uv += mouseNorm * 0.1 * uMouseActiveFactor;
      }

      float a = uTime * uRotationSpeed;
      uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
      uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

      vec3 col = vec3(0.0);
      for (int li = 0; li < 4; li++) {
        float i = float(li) / 4.0;
        float depth = fract(i + uStarSpeed * uSpeed);
        float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
        float fade = depth * smoothstep(1.0, 0.9, depth);
        col += StarLayer(uv * scale + i * 453.32) * fade;
      }

      if (uLightMode > 0.5) {
        // ink-on-white variant for light pages
        float energy = max(max(col.r, col.g), col.b);
        float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
        vec3 ink = clamp(col * 0.48, 0.0, 0.82);
        gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
      } else if (uTransparent == 1) {
        // premultiplied: stars add light over whatever colour sits behind the canvas
        float alpha = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
      } else {
        gl_FragColor = vec4(col, 1.0);
      }
    }`;

  const num = (v, d) => (v === undefined || v === '' || isNaN(parseFloat(v)) ? d : parseFloat(v));
  const bool = (v, d) => (v === undefined ? d : v !== 'false');
  const pair = (v, d) => { if (!v) return d; const p = v.split(',').map(parseFloat); return p.length === 2 && p.every((n) => !isNaN(n)) ? p : d; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function create(host) {
    const d = host.dataset;
    const lm = d.lightMode === undefined ? 'false' : d.lightMode;
    const opt = {
      focal: pair(d.focal, [0.5, 0.5]),
      rotation: pair(d.rotation, [1, 0]),
      starSpeed: num(d.starSpeed, 0.5),
      density: num(d.density, 1),
      hueShift: num(d.hueShift, 140),
      disableAnimation: bool(d.disableAnimation, false) && d.disableAnimation !== undefined,
      speed: num(d.speed, 1),
      mouseInteraction: bool(d.mouseInteraction, true),
      glow: num(d.glowIntensity, 0.3),
      saturation: num(d.saturation, 0),
      mouseRepulsion: bool(d.mouseRepulsion, true),
      repulsionStrength: num(d.repulsionStrength, 2),
      twinkle: num(d.twinkleIntensity, 0.3),
      rotationSpeed: num(d.rotationSpeed, 0.1),
      autoCenter: num(d.autoCenterRepulsion, 0),
      transparent: bool(d.transparent, true),
      lightMode: lm === 'auto' ? document.documentElement.dataset.theme !== 'dark' : lm === 'true'
    };

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return null; // no WebGL: the plain hero background stays
    host.appendChild(canvas);

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[galaxy]', gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = vs && fs ? gl.createProgram() : null;
    if (prog) { gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); }
    if (!prog || !gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // full-screen triangle
    const loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(opt.lightMode ? 1 : 0, opt.lightMode ? 1 : 0, opt.lightMode ? 1 : 0, opt.lightMode ? 1 : 0);

    const U = {};
    ['uTime', 'uResolution', 'uFocal', 'uRotation', 'uStarSpeed', 'uDensity', 'uHueShift', 'uSpeed', 'uMouse', 'uGlowIntensity', 'uSaturation',
      'uMouseRepulsion', 'uTwinkleIntensity', 'uRotationSpeed', 'uRepulsionStrength', 'uMouseActiveFactor', 'uAutoCenterRepulsion', 'uTransparent', 'uLightMode']
      .forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    gl.uniform2f(U.uFocal, opt.focal[0], opt.focal[1]);
    gl.uniform2f(U.uRotation, opt.rotation[0], opt.rotation[1]);
    gl.uniform1f(U.uDensity, opt.density);
    gl.uniform1f(U.uHueShift, opt.hueShift);
    gl.uniform1f(U.uSpeed, opt.speed);
    gl.uniform1f(U.uGlowIntensity, opt.glow);
    gl.uniform1f(U.uSaturation, opt.saturation);
    gl.uniform1i(U.uMouseRepulsion, opt.mouseRepulsion ? 1 : 0);
    gl.uniform1f(U.uTwinkleIntensity, opt.twinkle);
    gl.uniform1f(U.uRotationSpeed, opt.rotationSpeed);
    gl.uniform1f(U.uRepulsionStrength, opt.repulsionStrength);
    gl.uniform1f(U.uAutoCenterRepulsion, opt.autoCenter);
    gl.uniform1i(U.uTransparent, opt.transparent ? 1 : 0);
    gl.uniform1f(U.uLightMode, opt.lightMode ? 1 : 0);
    gl.uniform1f(U.uStarSpeed, opt.starSpeed / 10);

    const dprCap = matchMedia('(pointer: coarse)').matches ? 1 : 1.5;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = Math.max(1, Math.floor(host.clientWidth * dpr)), h = Math.max(1, Math.floor(host.clientHeight * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform3f(U.uResolution, w, h, w / h);
    };
    const ro = new ResizeObserver(() => { resize(); if (!raf) draw(performance.now()); });
    ro.observe(host);
    resize();

    // pointer: listen on the window (the hero content sits above the canvas) and test against the host box
    const target = { x: 0.5, y: 0.5 }, smooth = { x: 0.5, y: 0.5 };
    let targetActive = 0, active = 0;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) { targetActive = 0; return; }
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      targetActive = 1;
    };
    const onLeave = () => (targetActive = 0);
    if (opt.mouseInteraction) {
      window.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseleave', onLeave);
    }

    let running = true, raf = 0;
    function draw(t) {
      smooth.x += (target.x - smooth.x) * 0.05;
      smooth.y += (target.y - smooth.y) * 0.05;
      active += (targetActive - active) * 0.05;
      if (!opt.disableAnimation) {
        gl.uniform1f(U.uTime, t * 0.001);
        gl.uniform1f(U.uStarSpeed, (t * 0.001 * opt.starSpeed) / 10);
      }
      gl.uniform2f(U.uMouse, smooth.x, smooth.y);
      gl.uniform1f(U.uMouseActiveFactor, active);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const loop = (t) => { if (!running) { raf = 0; return; } draw(t); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && running && !reduced) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const io = new IntersectionObserver((e) => { running = e[0].isIntersecting && !document.hidden; running ? start() : stop(); });
    io.observe(host);
    const onVis = () => { running = !document.hidden; running ? start() : stop(); };
    document.addEventListener('visibilitychange', onVis);

    if (reduced) draw(2000); else start(); // reduced motion: a single still frame

    return () => {
      stop(); io.disconnect(); ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-galaxy]').forEach((host) => {
      let destroy = create(host);
      // light-mode="auto" re-renders when the theme is toggled
      if (host.dataset.lightMode === 'auto') {
        window.addEventListener('themechange', () => { destroy && destroy(); destroy = create(host); });
      }
    });
  });
})();
