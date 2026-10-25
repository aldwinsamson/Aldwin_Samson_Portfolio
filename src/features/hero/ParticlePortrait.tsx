import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { useTheme } from "@/hooks/useTheme";
import { sampleParticles, type ParticleMode } from "./particles";

/**
 * The hero portrait, rebuilt out of thousands of light particles.
 *  - assembles from scattered dust on load (staggered per particle)
 *  - gently breathes and is pushed away by the pointer (desktop)
 *  - `disperse` (0→1, driven by scroll) blows the portrait apart again
 *  - dark theme: gold/ivory light on black · light theme: bronze/ink stipple on paper
 * The canvas is always square; the wrapper decides the size.
 */

const VERT = /* glsl */ `
uniform float uProgress;
uniform float uDisperse;
uniform float uTime;
uniform float uSize;
uniform float uPointerPow;
uniform float uMode;
uniform float uSettle;
uniform vec2 uPointer;
attribute vec3 aSeed;
attribute float aLum;
varying float vAlpha;
varying float vLum;
varying float vMode;

float easeOut(float x) { return 1.0 - pow(1.0 - x, 3.0); }

void main() {
  vec2 target = position.xy;

  // Staggered assembly: every particle has its own start offset.
  float a = clamp((uProgress - aSeed.x * 0.45) / 0.55, 0.0, 1.0);
  float e = easeOut(a);

  // Scatter origin: a wide cloud, swirling slightly while it travels in.
  vec2 scatter = (aSeed.yz * 2.0 - 1.0) * 1.7 + vec2(0.0, -0.35);
  vec2 p = mix(scatter, target, e);
  p.x += sin(aSeed.x * 6.2831 + e * 3.0) * (1.0 - e) * 0.22;

  // Idle breathing.
  float tt = uTime * 0.6 + aSeed.x * 6.2831;
  p += vec2(sin(tt + aSeed.y * 9.0), cos(tt * 1.1 + aSeed.z * 9.0)) * 0.0045 * e;

  // Pointer repulsion.
  vec2 dv = p - uPointer;
  float push = smoothstep(0.34, 0.0, length(dv)) * uPointerPow;
  p += normalize(dv + vec2(1e-5)) * push * 0.11 * (0.4 + aSeed.x);

  // Scroll-driven dispersal: drift up and outward, staggered.
  float d = clamp((uDisperse - aSeed.y * 0.35) / 0.65, 0.0, 1.0);
  vec2 dir = normalize(vec2(aSeed.y * 2.0 - 1.0, aSeed.z * 2.0 - 1.0) + vec2(0.0, 0.6) + vec2(1e-5));
  p += dir * d * d * (0.5 + aSeed.x * 1.4);
  p.y += d * 0.35;

  vAlpha = e * (0.35 + 0.65 * aLum) * (1.0 - smoothstep(0.35, 1.0, d));
  // Once the intro has finished the real photo fades in and the particles melt away (both themes).
  // They come back when the portrait disperses on scroll.
  float settled = uSettle * (1.0 - smoothstep(0.0, 0.2, uDisperse));
  vAlpha *= 1.0 - settled;
  vLum = aLum;
  vMode = uMode;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = uSize * (0.55 + 0.9 * aLum) * (1.0 - 0.55 * d) * (0.6 + 0.4 * e);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
varying float vAlpha;
varying float vLum;
varying float vMode;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = smoothstep(0.5, 0.12, d);
  if (soft < 0.01) discard;
  vec3 gold = vec3(0.839, 0.729, 0.525);
  vec3 ivory = vec3(0.93, 0.91, 0.86);
  vec3 bronze = vec3(0.54, 0.42, 0.20);
  vec3 ink = vec3(0.16, 0.13, 0.08);
  vec3 darkCol = mix(gold * 0.85, ivory, smoothstep(0.45, 1.0, vLum));
  vec3 lightCol = mix(bronze, ink, smoothstep(0.1, 0.8, 1.0 - vLum));
  vec3 col = mix(darkCol, lightCol, vMode);
  gl_FragColor = vec4(col, soft * vAlpha * mix(0.7, 0.9, vMode));
}
`;

const SAMPLE_SIZE = 256;

export interface ParticlePortraitProps {
  src: string;
  /** 0 → 1. Scroll-driven dispersal. */
  disperse: MotionValue<number>;
  count: number;
  /** Pointer repulsion (fine pointers only). */
  interactive: boolean;
  dprCap?: number;
  className?: string;
  onReady?: () => void;
  /** Fires once, after the particle intro has fully finished (the photo should fade in now). */
  onAssembled?: () => void;
  onFail?: () => void;
}

interface Api {
  setMode: (m: ParticleMode) => void;
}

export function ParticlePortrait({ src, disperse, count, interactive, dprCap = 1.75, className, onReady, onAssembled, onFail }: ParticlePortraitProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const { theme } = useTheme();
  const modeRef = useRef<ParticleMode>(theme);
  // Latest callbacks without re-running the (expensive) setup effect.
  const cbRef = useRef({ onReady, onAssembled, onFail });
  cbRef.current = { onReady, onAssembled, onFail };

  // Theme switch → rebuild particle distribution + colours (no teardown).
  useEffect(() => {
    modeRef.current = theme;
    apiRef.current?.setMode(theme);
  }, [theme]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      cbRef.current.onFail?.();
      return;
    }

    let disposed = false;
    let raf = 0;
    let visible = true;
    let loaded = false;
    let prog = 0;
    let t0 = 0; // wall-clock start of the assembly, so slow devices still finish on schedule
    let time = 0;
    let frameCount = 0;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const pointer = new THREE.Vector2(9, 9);
    const pointerTarget = new THREE.Vector2(9, 9);
    let pointerPow = 0;
    let pointerPowTarget = 0;
    let pixels: Uint8ClampedArray | null = null;
    let baseDpr = 1;
    let quality = 0; // 0 full · 1 lower DPR + 70% particles · 2 40% particles
    let slowFrames = 0;
    let skip = false;
    let hold = 0; // short beat on the finished particle portrait before the photo takes over
    let settle = 0;
    let assembledFired = false;

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    renderer.domElement.setAttribute("aria-hidden", "true");
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const uniforms = {
      uProgress: { value: 0 },
      uDisperse: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 3 },
      uPointerPow: { value: 0 },
      uPointer: { value: pointer },
      uMode: { value: modeRef.current === "light" ? 1 : 0 },
      uSettle: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: modeRef.current === "light" ? THREE.NormalBlending : THREE.AdditiveBlending,
    });
    const points = new THREE.Points(new THREE.BufferGeometry(), material);
    points.frustumCulled = false;
    scene.add(points);

    const build = (mode: ParticleMode) => {
      if (!pixels) return;
      const data = sampleParticles(pixels, SAMPLE_SIZE, count, mode);
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(data.count * 3);
      for (let i = 0; i < data.count; i++) {
        pos[i * 3] = data.target[i * 2];
        pos[i * 3 + 1] = data.target[i * 2 + 1];
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new THREE.BufferAttribute(data.seed, 3));
      geo.setAttribute("aLum", new THREE.BufferAttribute(data.lum, 1));
      const old = points.geometry;
      points.geometry = geo;
      old.dispose();
      uniforms.uMode.value = mode === "light" ? 1 : 0;
      material.blending = mode === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
      material.needsUpdate = true;
    };

    apiRef.current = { setMode: build };

    const resize = () => {
      // Square canvas sized to the wrapper; never collapses to 0 (e.g. while a layout is settling on a phone).
      const w = Math.max(2, Math.min(wrap.clientWidth || 0, wrap.clientHeight || wrap.clientWidth || 0));
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, w, false);
      baseDpr = dpr;
      // One sample cell is w / SAMPLE_SIZE css px; dots are slightly larger than a cell.
      uniforms.uSize.value = (w / SAMPLE_SIZE) * dpr * 1.3;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // Load + sample the cut-out portrait.
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const c = document.createElement("canvas");
      c.width = c.height = SAMPLE_SIZE;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        cbRef.current.onFail?.();
        return;
      }
      ctx.clearRect(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      pixels = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;
      build(modeRef.current);
      loaded = true;
      cbRef.current.onReady?.();
      start();
    };
    img.onerror = () => cbRef.current.onFail?.();
    img.src = src;

    // Pointer interaction (desktop).
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointerTarget.set(x, y);
      pointerPowTarget = Math.abs(x) < 1.25 && Math.abs(y) < 1.25 ? 1 : 0;
    };
    const onLeave = () => {
      pointerPowTarget = 0;
    };
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    let last = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden || !loaded) return;
      raf = requestAnimationFrame(frame);
      // Phones: render every other frame to save battery.
      if (coarse && (frameCount++ & 1) === 1) return;

      const rawDt = (now - last) / 1000;
      const dt = Math.min(rawDt, 0.05);
      last = now;

      // Adaptive quality: sustained slow frames step the portrait down instead of dropping the whole page's fps.
      if (rawDt > 0.034 && rawDt < 0.5) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && quality < 2) {
        quality++;
        slowFrames = 0;
        if (quality === 1) {
          renderer.setPixelRatio(Math.min(baseDpr, 1));
          renderer.setSize(wrap.clientWidth, wrap.clientWidth, false);
        }
        points.geometry.setDrawRange(0, Math.floor(points.geometry.getAttribute("position").count * (quality === 1 ? 0.7 : 0.4)));
      }

      time += dt;
      if (!t0) t0 = now;
      prog = Math.min(1, Math.max(0, ((now - t0) / 1000 - 0.25) / 2.8));

      pointer.lerp(pointerTarget, 1 - Math.pow(0.001, dt));
      pointerPow += (pointerPowTarget - pointerPow) * Math.min(1, dt * 6);

      const dispersed = disperse.get();
      // Fully dispersed → nothing visible: stop drawing. Settled + idle → 30 fps is plenty for the slow "breathing".
      if (dispersed > 0.995) return;
      const idle = prog >= 1 && pointerPow < 0.02 && dispersed < 0.001;
      if (idle) {
        skip = !skip;
        if (skip) return;
      }

      if (prog >= 1) {
        const slowDt = Math.min(rawDt, 0.25); // wall-clock-ish, so slow devices still hand over on time
        hold += slowDt;
        if (hold > 0.5) {
          if (!assembledFired) {
            assembledFired = true;
            cbRef.current.onAssembled?.();
          }
          settle = Math.min(1, settle + slowDt / 1.4);
        }
      }

      uniforms.uProgress.value = prog;
      uniforms.uSettle.value = settle;
      uniforms.uDisperse.value = dispersed;
      uniforms.uTime.value = time;
      uniforms.uPointerPow.value = pointerPow;
      renderer.render(scene, camera);
    };
    function start() {
      if (!raf && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0 },
    );
    io.observe(wrap);
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const onLost = (e: Event) => {
      e.preventDefault();
      cbRef.current.onFail?.();
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      apiRef.current = null;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      points.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [src, count, interactive, dprCap, disperse]);

  return <div ref={wrapRef} className={className} />;
}