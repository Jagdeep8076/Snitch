import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ProductCanvas3D
 * Floating 3D product-preview orb for the Create Product page.
 * - Rotating wireframe box + torus knot orbiting it
 * - Glowing motes and mouse parallax
 */
const ProductCanvas3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    camera.position.set(0, 0, 9);

    // ── Core box ──────────────────────────────────────────────────
    const boxGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0xe8e8ea,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    scene.add(box);

    // ── Inner glowing sphere ──────────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xc3c6d1,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // ── Orbiting torus ────────────────────────────────────────────
    const torusGeo = new THREE.TorusGeometry(2.0, 0.04, 12, 80);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2.4;
    scene.add(torus);

    // ── Second ring (accent) ──────────────────────────────────────
    const ring2Geo = new THREE.TorusGeometry(2.6, 0.025, 8, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xe0d8d4,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 5;
    scene.add(ring2);

    // ── Floating motes ────────────────────────────────────────────
    const MOTE = 60;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(MOTE * 3);
    for (let i = 0; i < MOTE; i++) {
      motePos[i * 3]     = (Math.random() - 0.5) * 14;
      motePos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      motePos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    // ── Mouse parallax ────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animate ───────────────────────────────────────────────────
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      box.rotation.x = t * 0.22;
      box.rotation.y = t * 0.35;

      sphere.rotation.y = t * 0.5;
      sphere.rotation.z = t * 0.15;

      torus.rotation.z = t * 0.4;
      ring2.rotation.x = t * 0.18;
      ring2.rotation.z = t * 0.28;

      motes.rotation.y = t * 0.04;

      // Smooth camera parallax
      target.x += (mouse.x * 1.2 - target.x) * 0.04;
      target.y += (-mouse.y * 0.8 - target.y) * 0.04;
      camera.position.x = target.x;
      camera.position.y = target.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      boxGeo.dispose();
      sphereGeo.dispose();
      torusGeo.dispose();
      ring2Geo.dispose();
      moteGeo.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
};

export default ProductCanvas3D;
