/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export default function SplashCursor() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const QUALITY: Record<string, { sim: number; dye: number; iterations: number }> = {
      low: { sim: 64, dye: 512, iterations: 10 },
      medium: { sim: 96, dye: 1024, iterations: 16 },
      high: { sim: 128, dye: 1440, iterations: 20 },
    };
    const BLOOM_RESOLUTION = 256;
    const BLOOM_ITERATIONS = 4;
    const BLOOM_THRESHOLD = 0.3;
    const BLOOM_KNEE = 0.7;

    const VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
uniform vec2 texelSize;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

    const HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

    const SHADERS: Record<string, string> = {
      copy: `uniform sampler2D uTexture;
void main() { outColor = texture(uTexture, vUv); }`,
      clear: `uniform sampler2D uTexture; uniform float value;
void main() { outColor = value * texture(uTexture, vUv); }`,
      splat: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 pointA; uniform vec2 pointB; uniform float radius;
void main() {
  vec2 scale = vec2(aspectRatio, 1.0);
  vec2 pa = (vUv - pointA) * scale;
  vec2 ba = (pointB - pointA) * scale;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-9), 0.0, 1.0);
  vec2 d = pa - ba * h;
  vec3 base = texture(uTarget, vUv).xyz;
  outColor = vec4(base + exp(-dot(d, d) / radius) * color, 1.0);
}`,
      burst: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec2 point; uniform float radius; uniform float strength; uniform float seed;
void main() {
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);
  float distance = length(d);
  vec2 direction = d / max(distance, 0.00001);
  float angle = atan(d.y, d.x);
  float petals = 0.78 + 0.22 * sin(angle * 5.0 + seed) * sin(angle * 3.0 - seed * 1.7);
  vec2 twist = vec2(-direction.y, direction.x) * 0.3 * sin(angle * 4.0 + seed * 2.3);
  float falloff = exp(-dot(d, d) / radius) * distance / sqrt(radius);
  outColor = vec4(texture(uTarget, vUv).xy + (direction * petals + twist) * falloff * strength, 0.0, 1.0);
}`,
      crown: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec2 point; uniform float radius; uniform vec3 colorA; uniform vec3 colorB; uniform float seed;
void main() {
  vec2 d = (vUv - point) * vec2(aspectRatio, 1.0);
  vec3 ink = exp(-dot(d, d) / (radius * 0.45)) * colorA;
  for (int i = 0; i < 7; i++) {
    float index = float(i);
    float angle = seed + index * 0.8975979 + sin(seed * 3.0 + index * 1.9) * 0.35;
    float reach = sqrt(radius) * (0.75 + 0.45 * fract(sin(seed * 7.1 + index * 3.7) * 43.7));
    float drop = radius * (0.08 + 0.12 * fract(sin(seed * 2.9 + index * 5.3) * 31.9));
    vec2 q = d - vec2(cos(angle), sin(angle)) * reach;
    ink += exp(-dot(q, q) / drop) * mix(colorA, colorB, fract(index * 0.37 + 0.2));
  }
  outColor = vec4(texture(uTarget, vUv).xyz + ink, 1.0);
}`,
      advection: `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  outColor = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,
      divergence: `uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  outColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
      curl: `uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  outColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
      vorticity: `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
void main() {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture(uVelocity, vUv).xy + force * dt;
  outColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}`,
      pressure: `uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  outColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`,
      gradient: `uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main() {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  outColor = vec4(velocity, 0.0, 1.0);
}`,
      prefilter: `uniform sampler2D uTexture; uniform vec3 curve; uniform float threshold;
void main() {
  vec3 c = texture(uTexture, vUv).rgb;
  float br = max(c.r, max(c.g, c.b));
  float rq = clamp(br - curve.x, 0.0, curve.y);
  rq = curve.z * rq * rq;
  c *= max(rq, br - threshold) / max(br, 0.0001);
  outColor = vec4(c, 0.0);
}`,
      blur: `uniform sampler2D uTexture; uniform float intensity;
void main() {
  vec4 sum = texture(uTexture, vL) + texture(uTexture, vR) + texture(uTexture, vT) + texture(uTexture, vB);
  outColor = sum * 0.25 * intensity;
}`,
      display: `uniform sampler2D uTexture; uniform sampler2D uBloom; uniform vec2 texelSize; uniform float shading; uniform float bloom; uniform float light;
float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec3 c = texture(uTexture, vUv).rgb;
  if (shading > 0.0) {
    float dx = length(texture(uTexture, vR).rgb) - length(texture(uTexture, vL).rgb);
    float dy = length(texture(uTexture, vT).rgb) - length(texture(uTexture, vB).rgb);
    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    c *= mix(1.0, clamp(n.z + 0.7, 0.7, 1.0), shading);
  }
  if (bloom > 0.0) {
    c += max(texture(uBloom, vUv).rgb, 0.0) * bloom;
  }
  c = max(c, 0.0);
  float peak = max(c.r, max(c.g, c.b));
  float grain = (hash(gl_FragCoord.xy) - 0.5) / 255.0 * smoothstep(0.0, 0.03, peak);
  if (light > 0.5) {
    vec3 transmit = exp(-2.4 * c);
    float low = min(transmit.r, min(transmit.g, transmit.b));
    float alpha = clamp(1.0 - low + grain, 0.0, 1.0);
    outColor = vec4(min(transmit - low, vec3(alpha)), alpha);
  } else {
    c = max(c + grain, 0.0);
    float alpha = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
    outColor = vec4(min(c, vec3(alpha)), alpha);
  }
}`,
    };

    const root = document.createElement("div");
    root.className = "splash-cursor";
    root.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    canvas.className = "splash-cursor__canvas";
    root.appendChild(canvas);
    document.body.appendChild(root);

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    }) as WebGL2RenderingContext | null;
    if (!gl) {
      root.remove();
      return;
    }

    gl.getExtension("EXT_color_buffer_float");
    gl.getExtension("EXT_color_buffer_half_float");
    const parallel = gl.getExtension("KHR_parallel_shader_compile");

    const compile = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type);
      if (!s) throw new Error("failed to create shader");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const programs: Record<string, { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> }> = {};
    Object.entries(SHADERS).forEach(([name, body]) => {
      const frag = compile(gl.FRAGMENT_SHADER, HEADER + body);
      const prog = gl.createProgram();
      gl.attachShader(prog, vertex);
      gl.attachShader(prog, frag);
      gl.bindAttribLocation(prog, 0, "aPosition");
      gl.linkProgram(prog);
      gl.deleteShader(frag);
      programs[name] = { program: prog, uniforms: {} };
    });
    gl.deleteShader(vertex);

    let ready = false;
    let broken = false;
    let disposed = false;
    let lost = false;

    const finish = () => {
      if (
        !parallel ||
        Object.values(programs).every(
          (p) =>
            gl.getProgramParameter(
              p.program,
              (parallel as any).COMPLETION_STATUS_KHR
            )
        )
      ) {
        Object.values(programs).forEach((p) => {
          if (!gl.getProgramParameter(p.program, gl.LINK_STATUS)) broken = true;
          const c = gl.getProgramParameter(p.program, gl.ACTIVE_UNIFORMS);
          for (let i = 0; i < c; i++) {
            const info = gl.getActiveUniform(p.program, i);
            if (info) {
              const loc = gl.getUniformLocation(p.program, info.name);
              if (loc) p.uniforms[info.name] = loc;
            }
          }
        });
        ready = true;
        return true;
      }
      return false;
    };

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const targets = new Set<any>();
    const bindProgram = (name: string) => {
      const p = programs[name];
      gl.useProgram(p.program);
      return p.uniforms;
    };
    const blit = (target: any) => {
      if (target) {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const createTarget = (w: number, h: number, fmt: any, filter: number) => {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, gl.HALF_FLOAT, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = {
        texture: tex,
        fbo,
        width: w,
        height: h,
        texelX: 1 / w,
        texelY: 1 / h,
        attach: (unit: number) => {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          return unit;
        },
      };
      targets.add(t);
      return t;
    };
    const destroyTarget = (t: any) => {
      if (!t) return;
      gl.deleteFramebuffer(t.fbo);
      gl.deleteTexture(t.texture);
      targets.delete(t);
    };
    const reshape = (t: any, w: number, h: number, fmt: any) => {
      gl.bindTexture(gl.TEXTURE_2D, t.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internal, w, h, 0, fmt.format, gl.HALF_FLOAT, null);
      t.width = w;
      t.height = h;
      t.texelX = 1 / w;
      t.texelY = 1 / h;
    };
    const createDouble = (w: number, h: number, fmt: any, filter: number) => {
      const p = {
        read: createTarget(w, h, fmt, filter),
        write: createTarget(w, h, fmt, filter),
        width: w,
        height: h,
        texelX: 1 / w,
        texelY: 1 / h,
        swap: () => {
          const r = p.read;
          p.read = p.write;
          p.write = r;
        },
      };
      return p;
    };
    const resizeDouble = (p: any, w: number, h: number, fmt: any, filter: number, keep: boolean) => {
      if (keep) {
        const n = createTarget(w, h, fmt, filter);
        const u = bindProgram("copy");
        gl.uniform1i(u.uTexture, p.read.attach(0));
        blit(n);
        destroyTarget(p.read);
        p.read = n;
      } else reshape(p.read, w, h, fmt);
      reshape(p.write, w, h, fmt);
      p.width = w;
      p.height = h;
      p.texelX = 1 / w;
      p.texelY = 1 / h;
    };

    const resolution = (base: number) => {
      const W = gl.drawingBufferWidth;
      const H = gl.drawingBufferHeight;
      const aspect = Math.max(W, H) / Math.max(1, Math.min(W, H));
      const short = Math.round(base);
      const long = Math.round(base * aspect);
      return W > H ? { width: long, height: short } : { width: short, height: long };
    };

    const fit = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const h = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
    };

    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));
    const parseColor = (value: string) => {
      let hex = String(value).replace("#", "").trim();
      if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
      const n = parseInt(hex.slice(0, 6), 16);
      if (Number.isNaN(n)) return [1, 1, 1];
      return [(n >> 16 & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };
    const hsv = (h: number, s: number, v: number) => {
      const i = Math.floor(h * 6),
        f = h * 6 - i,
        p = v * (1 - s),
        q = v * (1 - f * s),
        t = v * (1 - (1 - f) * s);
      switch ((i % 6 + 6) % 6) {
        case 0: return [v, t, p];
        case 1: return [q, v, p];
        case 2: return [p, v, t];
        case 3: return [p, q, v];
        case 4: return [t, p, v];
        default: return [v, p, q];
      }
    };

    const settings = {
      palette: ["#4f8cff", "#2dd4bf", "#ffd166"].map(parseColor),
      rainbow: true,
      colorSpeed: 1,
      intensity: 1,
      size: 1,
      force: 1,
      swirl: 3,
      trail: 1,
      momentum: 1,
      shading: 1,
      glow: 0,
      quality: "high",
      clickSplash: true,
      intro: true,
      contained: false,
      light: false,
    };

    const sizes = () => {
      const q = QUALITY[(settings as any).quality];
      const shortSide = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);
      return {
        sim: resolution(q.sim),
        ink: resolution(Math.max(q.sim, Math.min(q.dye, shortSide))),
      };
    };

    fit();
    const init = sizes();
    const rgba = { internal: gl.RGBA16F, format: gl.RGBA };
    const extHalfFloat = gl.getExtension("EXT_color_buffer_half_float");
    const rg = extHalfFloat ? { internal: gl.RG16F, format: gl.RG } : rgba;
    const r = extHalfFloat ? { internal: gl.R16F, format: gl.RED } : rg;

    const dye = createDouble(init.ink.width, init.ink.height, rgba, gl.LINEAR);
    const velocity = createDouble(init.sim.width, init.sim.height, rg, gl.LINEAR);
    const pressure = createDouble(init.sim.width, init.sim.height, r, gl.NEAREST);
    const divergence = createTarget(init.sim.width, init.sim.height, r, gl.NEAREST);
    const curl = createTarget(init.sim.width, init.sim.height, r, gl.NEAREST);
    let bloom: any = null;
    let bloomChain: any[] = [];

    const dropBloom = () => {
      destroyTarget(bloom);
      bloomChain.forEach(destroyTarget);
      bloom = null;
      bloomChain = [];
    };
    const ensureBloom = () => {
      if (bloom) return bloom;
      const sz = resolution(BLOOM_RESOLUTION);
      const base = createTarget(sz.width, sz.height, rgba, gl.LINEAR);
      for (let i = 0; i < BLOOM_ITERATIONS; i++) {
        const w = sz.width >> (i + 1);
        const h = sz.height >> (i + 1);
        if (w < 2 || h < 2) break;
        bloomChain.push(createTarget(w, h, rgba, gl.LINEAR));
      }
      bloom = base;
      return base;
    };

    const radiusFor = (scale: number) => {
      const aspect = canvas.width / canvas.height;
      return ((0.2 * settings.size * scale) / 100) * (aspect > 1 ? aspect : 1);
    };

    const splat = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      vx: number,
      vy: number,
      color: number[],
      radius: number
    ) => {
      const u = bindProgram("splat");
      gl.uniform1i(u.uTarget, velocity.read.attach(0));
      gl.uniform1f(u.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(u.pointA, ax, ay);
      gl.uniform2f(u.pointB, bx, by);
      gl.uniform3f(u.color, vx, vy, 0);
      gl.uniform1f(u.radius, radius);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform3f(u.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    };

    const colorAt = (offset: number, now: number) => {
      const phase = ((((offset + (now / 1000) * settings.colorSpeed * 0.6) % 1) + 1) % 1);
      if (settings.rainbow) return hsv(phase, 1, 1);
      const p = settings.palette;
      if (p.length === 1) return p[0];
      const pos = phase * p.length;
      const from = p[Math.floor(pos) % p.length];
      const to = p[(Math.floor(pos) + 1) % p.length];
      const t = pos - Math.floor(pos);
      const blend = t * t * (3 - 2 * t);
      return [
        from[0] + (to[0] - from[0]) * blend,
        from[1] + (to[1] - from[1]) * blend,
        from[2] + (to[2] - from[2]) * blend,
      ];
    };

    const inkFor = (color: number[], amount: number) =>
      color.map((c) => ((settings.light ? 1 - c : c) * amount));

    const flush = (pointer: any, dt: number, now: number) => {
      const aspect = canvas.width / canvas.height;
      const len = Math.hypot(
        (pointer.x - pointer.px) * aspect,
        pointer.y - pointer.py
      );
      if (len > 0.35) {
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        return;
      }
      let dx = pointer.x - pointer.px;
      let dy = pointer.y - pointer.py;
      if (aspect < 1) dx *= aspect;
      else dy /= aspect;
      const radius = radiusFor(1);
      const spread = 1 + len / (1.77 * Math.sqrt(radius));
      const push = (6000 * settings.force) / Math.sqrt(spread);
      const amount = (0.15 * settings.intensity * Math.min(dt * 60, 1)) / Math.sqrt(spread);
      const color = inkFor(colorAt(pointer.offset, now), amount);
      splat(pointer.px, pointer.py, pointer.x, pointer.y, dx * push, dy * push, color, radius);
      pointer.px = pointer.x;
      pointer.py = pointer.y;
    };

    const burst = (x: number, y: number, now: number) => {
      const seed = Math.random() * Math.PI * 2;
      const aspect = canvas.width / canvas.height;
      let u = bindProgram("burst");
      gl.uniform1i(u.uTarget, velocity.read.attach(0));
      gl.uniform1f(u.aspectRatio, aspect);
      gl.uniform2f(u.point, x, y);
      gl.uniform1f(u.radius, radiusFor(3));
      gl.uniform1f(u.strength, 1100 * settings.force);
      gl.uniform1f(u.seed, seed);
      blit(velocity.write);
      velocity.swap();
      const offset = Math.random();
      const amount = 1.6 * settings.intensity;
      const first = inkFor(colorAt(offset, now), amount);
      const second = inkFor(colorAt(offset + 0.3, now), amount);
      u = bindProgram("crown");
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform1f(u.aspectRatio, aspect);
      gl.uniform2f(u.point, x, y);
      gl.uniform1f(u.radius, radiusFor(1.6));
      gl.uniform3f(u.colorA, first[0], first[1], first[2]);
      gl.uniform3f(u.colorB, second[0], second[1], second[2]);
      gl.uniform1f(u.seed, seed);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number) => {
      const iter = QUALITY[(settings as any).quality].iterations;
      gl.disable(gl.BLEND);
      let u = bindProgram("curl");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(curl);
      u = bindProgram("vorticity");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uCurl, curl.attach(1));
      gl.uniform1f(u.curl, settings.swirl);
      gl.uniform1f(u.dt, dt);
      blit(velocity.write);
      velocity.swap();
      u = bindProgram("divergence");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      blit(divergence);
      u = bindProgram("clear");
      gl.uniform1i(u.uTexture, pressure.read.attach(0));
      gl.uniform1f(u.value, 0.1);
      blit(pressure.write);
      pressure.swap();
      u = bindProgram("pressure");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uPressure, pressure.read.attach(1));
      gl.uniform1i(u.uDivergence, divergence.attach(0));
      for (let i = 0; i < iter; i++) {
        gl.uniform1i(u.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }
      u = bindProgram("gradient");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uPressure, pressure.read.attach(0));
      gl.uniform1i(u.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();
      u = bindProgram("advection");
      gl.uniform2f(u.texelSize, velocity.texelX, velocity.texelY);
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, velocity.read.attach(0));
      gl.uniform1f(u.dt, dt);
      gl.uniform1f(u.dissipation, 2 / settings.momentum);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(u.uVelocity, velocity.read.attach(0));
      gl.uniform1i(u.uSource, dye.read.attach(1));
      gl.uniform1f(u.dissipation, 3.5 / settings.trail);
      blit(dye.write);
      dye.swap();
    };

    const applyBloom = (amount: number) => {
      const base = ensureBloom();
      if (!bloomChain.length) return;
      gl.disable(gl.BLEND);
      let u = bindProgram("prefilter");
      const knee = BLOOM_THRESHOLD * BLOOM_KNEE + 0.0001;
      gl.uniform3f(u.curve, BLOOM_THRESHOLD - knee, knee * 2, 0.25 / knee);
      gl.uniform1f(u.threshold, BLOOM_THRESHOLD);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      blit(base);
      u = bindProgram("blur");
      gl.uniform1f(u.intensity, 1);
      let last = base;
      bloomChain.forEach((t) => {
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);
        gl.uniform1i(u.uTexture, last.attach(0));
        blit(t);
        last = t;
      });
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.enable(gl.BLEND);
      for (let i = bloomChain.length - 2; i >= 0; i--) {
        const t = bloomChain[i];
        gl.uniform2f(u.texelSize, last.texelX, last.texelY);
        gl.uniform1i(u.uTexture, last.attach(0));
        blit(t);
        last = t;
      }
      gl.disable(gl.BLEND);
      gl.uniform1f(u.intensity, amount);
      gl.uniform2f(u.texelSize, last.texelX, last.texelY);
      gl.uniform1i(u.uTexture, last.attach(0));
      blit(base);
    };

    const render = () => {
      if (settings.glow > 0) applyBloom(2 * settings.glow);
      gl.disable(gl.BLEND);
      const u = bindProgram("display");
      gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
      gl.uniform1i(u.uTexture, dye.read.attach(0));
      gl.uniform1i(u.uBloom, (bloom ?? dye.read).attach(1));
      gl.uniform1f(u.shading, settings.shading);
      gl.uniform1f(u.bloom, settings.glow > 0 ? 1 : 0);
      gl.uniform1f(u.light, settings.light ? 1 : 0);
      blit(null);
    };

    const clearScreen = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    const pointers = new Map<string, any>();
    const bursts: any[] = [];
    const introPointer = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };
    let introStart = settings.intro ? performance.now() + 150 : -1;
    let raf = 0;
    let last = 0;
    let lastActivity = performance.now();

    const advanceIntro = (now: number) => {
      if (introStart < 0) return;
      const t = Math.min((now - introStart) / 1100, 1);
      if (t < 0) return;
      const eased = t * t * (3 - 2 * t);
      const x = 0.2 + 0.6 * eased;
      const y = 0.5 + 0.12 * Math.sin(eased * Math.PI * 2);
      if (!introPointer.ready) {
        introPointer.x = introPointer.px = x;
        introPointer.y = introPointer.py = y;
        introPointer.ready = true;
      } else {
        introPointer.x = x;
        introPointer.y = y;
        introPointer.moved = true;
      }
      if (t >= 1) introStart = -1;
      lastActivity = now;
    };

    const hold = () => {
      lastActivity = performance.now();
      last = performance.now();
      pointers.forEach((p) => {
        p.px = p.x;
        p.py = p.y;
        p.moved = false;
      });
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || lost) return;
      if (!ready) {
        if (gl.isContextLost()) return;
        if (!finish()) {
          hold();
          raf = requestAnimationFrame(frame);
          return;
        }
        if (broken) {
          dispose();
          return;
        }
      }
      const dt = clamp((now - last) / 1000, 0, 1 / 60);
      last = now;
      resize();
      advanceIntro(now);
      if (introPointer.moved) {
        introPointer.moved = false;
        flush(introPointer, dt, now);
      }
      pointers.forEach((p) => {
        if (p.moved) {
          p.moved = false;
          flush(p, dt, now);
        }
      });
      bursts.splice(0).forEach((pt) => burst(pt.x, pt.y, now));
      step(dt);
      render();
      const quiet = (2.2 * settings.trail + 0.4) * 1000;
      if (introStart >= 0 || now - lastActivity < quiet) {
        raf = requestAnimationFrame(frame);
      } else {
        clearScreen();
      }
    };

    const wake = () => {
      lastActivity = performance.now();
      if (raf || disposed || lost) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const locate = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = (cx - rect.left) / rect.width;
      const y = 1 - (cy - rect.top) / rect.height;
      if (settings.contained && (x < 0 || x > 1 || y < 0 || y > 1)) return null;
      return { x, y };
    };

    const track = (id: string, cx: number, cy: number) => {
      const pt = locate(cx, cy);
      if (!pt) return;
      let p = pointers.get(id);
      if (!p) {
        p = { x: 0, y: 0, px: 0, py: 0, ready: false, moved: false, offset: Math.random() };
        pointers.set(id, p);
      }
      if (!p.ready) {
        p.x = p.px = pt.x;
        p.y = p.py = pt.y;
        p.ready = true;
        return;
      }
      p.x = pt.x;
      p.y = pt.y;
      p.moved = true;
      wake();
    };

    const press = (cx: number, cy: number) => {
      if (!settings.clickSplash) return;
      const pt = locate(cx, cy);
      if (pt) {
        bursts.push(pt);
        wake();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") track(`p${e.pointerId}`, e.clientX, e.clientY);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") press(e.clientX, e.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        pointers.delete(`t${t.identifier}`);
        track(`t${t.identifier}`, t.clientX, t.clientY);
        press(t.clientX, t.clientY);
      });
    };
    const onTouchMove = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => track(`t${t.identifier}`, t.clientX, t.clientY));
    };
    const onTouchEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => pointers.delete(`t${t.identifier}`));
    };
    const onLeave = () => {
      pointers.forEach((p) => {
        p.ready = false;
      });
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {};

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const resize = () => {
      fit();
      const next = sizes();
      if (dye.width !== next.ink.width || dye.height !== next.ink.height)
        resizeDouble(dye, next.ink.width, next.ink.height, rgba, gl.LINEAR, true);
      if (velocity.width !== next.sim.width || velocity.height !== next.sim.height) {
        resizeDouble(velocity, next.sim.width, next.sim.height, rg, gl.LINEAR, true);
        resizeDouble(pressure, next.sim.width, next.sim.height, r, gl.NEAREST, false);
        reshape(divergence, next.sim.width, next.sim.height, r);
        reshape(curl, next.sim.width, next.sim.height, r);
      }
      const gs = resolution(BLOOM_RESOLUTION);
      if (bloom && (bloom.width !== gs.width || bloom.height !== gs.height)) dropBloom();
    };

    const dispose = () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      targets.forEach((t) => {
        gl.deleteFramebuffer(t.fbo);
        gl.deleteTexture(t.texture);
      });
      targets.clear();
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      Object.values(programs).forEach((p) => gl.deleteProgram(p.program));
      root.remove();
    };

    if (ready) resize();
    if (introStart >= 0) wake();

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return null;
}
