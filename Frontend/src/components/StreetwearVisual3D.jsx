import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * StreetwearVisual3D
 * Realistic 3D streetwear chrome luxury emblem with dynamic lighting,
 * rotating rings, floating ember particles, and interactive mouse controls.
 */
const StreetwearVisual3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Dimensions
    const width = el.clientWidth || 380;
    const height = el.clientHeight || 280;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x8a99ad, 3.5, 10);
    rimLight.position.set(-4, -2, -2);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0xd4af37, 2.0, 8); // subtle gold/champagne accent
    accentLight.position.set(2, -3, 3);
    scene.add(accentLight);

    // Group for all rotating elements
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Central 3D Torus Knot (streetwear chrome luxury icon)
    const knotGeo = new THREE.TorusKnotGeometry(1.0, 0.32, 128, 32, 2, 3);
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0x222226,
      emissive: 0x050508,
      roughness: 0.15,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const knot = new THREE.Mesh(knotGeo, chromeMat);
    mainGroup.add(knot);

    // Outer orbital ring
    const ringGeo = new THREE.TorusGeometry(1.85, 0.025, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x999aa0,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // Floating micro particles around the object
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const radius = 1.6 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pPos[i] = radius * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = radius * Math.cos(phi);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe0e2ec,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    mainGroup.add(particles);

    // Interactive mouse drag & hover
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRot = { x: 0.2, y: 0 };
    let currentRot = { x: 0.2, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        targetRot.y += dx * 0.01;
        targetRot.x += dy * 0.01;
        prevMouse = { x: e.clientX, y: e.clientY };
      } else {
        const rect = el.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        targetRot.y = nx * 0.6;
        targetRot.x = -ny * 0.6;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation for mouse drag / hover
      currentRot.x += (targetRot.x - currentRot.x) * 0.06;
      currentRot.y += (targetRot.y - currentRot.y) * 0.06;

      // Base idle spin
      mainGroup.rotation.y = currentRot.y + elapsed * 0.35;
      mainGroup.rotation.x = currentRot.x + Math.sin(elapsed * 0.5) * 0.1;

      // Counter-rotate rings
      ring1.rotation.z += delta * 0.4;
      ring2.rotation.y -= delta * 0.3;

      // Pulse floating particles
      particles.rotation.y -= delta * 0.15;

      // Dynamic light move
      accentLight.position.x = Math.sin(elapsed) * 3;
      accentLight.position.z = Math.cos(elapsed) * 3;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      title="Drag to rotate 3D Streetwear Artifact"
    />
  );
};

export default StreetwearVisual3D;
