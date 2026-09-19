import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeBackground
 * Full-screen realistic 3D dark-theme environment:
 * - Volumetric depth fog matching #111113
 * - Undulating 3D wireframe digital runway waves
 * - Dual-layer particle universe (sharp stars + glowing drifting dust motes)
 * - Atmospheric floating nebula lights
 * - Smooth camera parallax responding to mouse coordinates
 */
const ThreeBackground = ({ variant = "home" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x111113, 1);
    el.appendChild(renderer.domElement);

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111113, 0.0055);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 55);

    // ── 1. Undulating Runway Waves (Floor) ──────────────────────────────────
    const planeWidth = 260;
    const planeHeight = 260;
    const widthSegs = 65;
    const heightSegs = 65;
    const floorGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, widthSegs, heightSegs);
    floorGeo.rotateX(-Math.PI / 2);

    // Wireframe material with subtle dark slate glow
    const floorMat = new THREE.MeshBasicMaterial({
      color: variant === "register" ? 0x272738 : 0x1f232d,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -22;
    scene.add(floorMesh);

    // Keep initial positions for wave math
    const baseFloorPos = floorGeo.attributes.position.clone();

    // ── 2. Distant Sharp Star Field ─────────────────────────────────────────
    const STAR_COUNT = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starSizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 500;
      starPositions[i * 3 + 1] = Math.random() * 200 - 40;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      starSizes[i] = Math.random() * 1.5 + 0.5;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      color: 0xd8d9e0,
      size: 0.7,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ── 3. Near Glowing Motes (Atmospheric Dust) ─────────────────────────────
    const MOTE_COUNT = 180;
    const moteGeo = new THREE.BufferGeometry();
    const motePositions = new Float32Array(MOTE_COUNT * 3);
    const moteVelocities = [];

    for (let i = 0; i < MOTE_COUNT; i++) {
      motePositions[i * 3]     = (Math.random() - 0.5) * 120;
      motePositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      motePositions[i * 3 + 2] = (Math.random() - 0.5) * 80 + 10;
      moteVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.025 + 0.01,
        z: (Math.random() - 0.5) * 0.02,
      });
    }
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));

    const moteMat = new THREE.PointsMaterial({
      color: variant === "register" ? 0xa5b4fc : 0xc7d2fe,
      size: 1.8,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    // ── 4. Atmospheric Volumetric Glow Orbs ──────────────────────────────────
    const makeOrb = (color, radius, x, y, z, opacity) => {
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    const isRegister = variant === "register";
    const orb1 = makeOrb(isRegister ? 0x2e2b52 : 0x1c2738, 48, -40, 15, -70, 0.22);
    const orb2 = makeOrb(isRegister ? 0x3d2745 : 0x282338, 38,  45, -5, -80, 0.18);

    // ── 5. Mouse tracking ───────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetCam = { x: 0, y: 8 };

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetCam.x = mouse.x * 6;
      targetCam.y = 8 - mouse.y * 4;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── 6. Animation Loop ───────────────────────────────────────────────────
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Animate floor wave geometry
      const posAttr = floorGeo.attributes.position;
      const basePos = baseFloorPos.array;
      for (let i = 0; i < posAttr.count; i++) {
        const u = basePos[i * 3];
        const v = basePos[i * 3 + 2];
        const wave = Math.sin(u * 0.05 + elapsed * 1.2) * Math.cos(v * 0.05 + elapsed * 0.9) * 3.2;
        posAttr.setY(i, basePos[i * 3 + 1] + wave);
      }
      posAttr.needsUpdate = true;

      // Animate motes (rising slowly like dust/embers)
      const mPos = moteGeo.attributes.position;
      for (let i = 0; i < MOTE_COUNT; i++) {
        let y = mPos.getY(i) + moteVelocities[i].y;
        if (y > 45) y = -40;
        mPos.setY(i, y);
      }
      mPos.needsUpdate = true;

      // Rotate stars very gently
      stars.rotation.y = elapsed * 0.008;

      // Breathe orbs
      orb1.scale.setScalar(1 + 0.05 * Math.sin(elapsed * 0.5));
      orb2.scale.setScalar(1 + 0.05 * Math.sin(elapsed * 0.45 + 1.0));

      // Smooth camera interpolation
      camera.position.x += (targetCam.x - camera.position.x) * 0.035;
      camera.position.y += (targetCam.y - camera.position.y) * 0.035;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      floorGeo.dispose();
      starGeo.dispose();
      moteGeo.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [variant]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
};

export default ThreeBackground;
