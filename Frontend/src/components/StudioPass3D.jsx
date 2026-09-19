import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * StudioPass3D
 * Realistic 3D floating "Snitch Studio Access" card with realistic metallic
 * shader, procedural canvas texture, dynamic specular sheen, and mouse tilt physics.
 */
const StudioPass3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const width = el.clientWidth || 340;
    const height = el.clientHeight || 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const sheenLight = new THREE.PointLight(0xa5b4fc, 3.0, 10);
    sheenLight.position.set(0, 0, 2.5);
    scene.add(sheenLight);

    const goldAccent = new THREE.PointLight(0xfef08a, 1.5, 6);
    goldAccent.position.set(-2, -2, 1);
    scene.add(goldAccent);

    // Create high-res procedural texture for the Card Face
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");

    // Dark sleek gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 640);
    bgGrad.addColorStop(0, "#161619");
    bgGrad.addColorStop(0.5, "#1f2026");
    bgGrad.addColorStop(1, "#0d0d10");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle brushed lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 640; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }

    // Card border
    ctx.strokeStyle = "rgba(232, 232, 234, 0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 964, 580);

    // Brand Logo
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("SNITCH", 60, 110);

    // Subtitle
    ctx.fillStyle = "#919094";
    ctx.font = "500 24px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("STUDIO VERIFIED ACCESS", 60, 150);

    // Holographic Chip representation
    const chipGrad = ctx.createLinearGradient(60, 240, 160, 320);
    chipGrad.addColorStop(0, "#d4af37");
    chipGrad.addColorStop(0.5, "#f3e5ab");
    chipGrad.addColorStop(1, "#aa771c");
    ctx.fillStyle = chipGrad;
    ctx.roundRect(60, 240, 100, 80, 12);
    ctx.fill();

    // Chip circuit lines
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(75, 255, 70, 50);

    // Access ID
    ctx.fillStyle = "rgba(227, 226, 230, 0.9)";
    ctx.font = "bold 32px 'Plus Jakarta Sans', monospace";
    ctx.fillText("0084  •  STUDIO  •  2025", 60, 420);

    // Bottom Badges
    ctx.fillStyle = "#e8e8ea";
    ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("VIP PRIVILEGE PASS", 60, 560);

    ctx.fillStyle = "#818cf8";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("EXCLUSIVE", 810, 560);

    const cardTexture = new THREE.CanvasTexture(canvas);
    cardTexture.anisotropy = 8;

    // Card Mesh (Realistic Box)
    const cardGeo = new THREE.BoxGeometry(2.3, 1.44, 0.035);
    const cardMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.9, roughness: 0.2 }), // right
      new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.9, roughness: 0.2 }), // left
      new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.9, roughness: 0.2 }), // top
      new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.9, roughness: 0.2 }), // bottom
      new THREE.MeshPhysicalMaterial({                                                       // front
        map: cardTexture,
        metalness: 0.85,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        reflectivity: 0.8,
      }),
      new THREE.MeshStandardMaterial({ color: 0x111113, metalness: 0.9, roughness: 0.3 }), // back
    ];

    const cardGroup = new THREE.Group();
    const cardMesh = new THREE.Mesh(cardGeo, cardMaterials);
    cardGroup.add(cardMesh);
    scene.add(cardGroup);

    // Floating ambient rings around the pass
    const ringGeo = new THREE.TorusGeometry(1.6, 0.015, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    cardGroup.add(ring);

    // Mouse tilt interaction
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      target.x = ny * 0.45;  // pitch
      target.y = nx * 0.65;  // yaw

      // Move sheen light along with mouse for realistic dynamic glint
      sheenLight.position.x = nx * 2;
      sheenLight.position.y = -ny * 2;
    };

    const handlePointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    const handleResize = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    let rafId;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth damp
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      // Realistic levitation float
      const floatY = Math.sin(elapsed * 1.6) * 0.08;
      cardGroup.position.y = floatY;

      // Card tilt with subtle idle sway
      cardGroup.rotation.x = current.x + Math.sin(elapsed * 0.8) * 0.04;
      cardGroup.rotation.y = current.y + Math.cos(elapsed * 0.7) * 0.05;
      cardGroup.rotation.z = -current.y * 0.2;

      // Ring slow rotation
      ring.rotation.z = elapsed * 0.2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      cardTexture.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-56 sm:h-64 relative rounded-2xl overflow-hidden cursor-pointer"
      title="Interactive 3D Studio Pass - Move mouse to inspect"
    />
  );
};

export default StudioPass3D;
