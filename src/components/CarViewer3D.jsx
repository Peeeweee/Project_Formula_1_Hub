import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const CarViewer3D = ({ car }) => {
  const mountRef = useRef(null);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0f');

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 10, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff3300, 0.3);
    directionalLight2.position.set(-5, 2, -5);
    scene.add(directionalLight2);

    // --- CAR MODEL CONSTRUCTION ---
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    const materials = [];
    const geometries = [];

    const addMesh = (geometry, material, x = 0, y = 0, z = 0, rotX = 0, rotY = 0, rotZ = 0) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rotX, rotY, rotZ);
      carGroup.add(mesh);
      geometries.push(geometry);
      materials.push(material);
      return mesh;
    };

    if (car && car.modelConfig) {
      const { bodyColor, accentColor, hasHighNose, wingSize, eraStyle } = car.modelConfig;

      const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3 });
      const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.3 });
      const darkBodyMat = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(bodyColor).multiplyScalar(0.8), 
        roughness: 0.3 
      });
      const haloMat = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.4 });
      const tireMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 });
      const rimMat = new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.4 });
      const floorMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.7 });

      materials.push(bodyMat, accentMat, darkBodyMat, haloMat, tireMat, rimMat, floorMat);

      // BODY
      const bodyYScale = eraStyle === 'classic' ? 1.2 : 1.0;
      const bodyGeom = new THREE.BoxGeometry(3.2, 0.3 * bodyYScale, 0.7);
      addMesh(bodyGeom, bodyMat, 0, 0.2, 0);

      // NOSE CONE
      const noseGeom = new THREE.ConeGeometry(0.18, 0.9, 8);
      addMesh(noseGeom, bodyMat, 2.2, 0.2, 0, 0, 0, -Math.PI / 2);

      // COCKPIT HUMP
      const cockpitGeom = new THREE.BoxGeometry(0.7, 0.25, 0.5);
      addMesh(cockpitGeom, darkBodyMat, 0.2, 0.45, 0);

      // HALO
      if (eraStyle !== 'classic') {
        const haloGeom = new THREE.TorusGeometry(0.28, 0.025, 8, 20, Math.PI);
        addMesh(haloGeom, haloMat, 0.2, 0.52, 0, 0, Math.PI / 2, 0);
      }

      // FRONT WING
      const frontWingGeom = new THREE.BoxGeometry(0.6, 0.05, 1.4);
      addMesh(frontWingGeom, accentMat, 2.0, 0.02, 0);

      // REAR WING
      const rwScale = wingSize === 'large' ? 1.4 : 1.0;
      const rwHeight = eraStyle === 'classic' ? 0.25 : 0.5 * rwScale;
      const rwBaseY = 0.55;

      const rwMainGeom = new THREE.BoxGeometry(0.05, rwHeight, 1.1);
      addMesh(rwMainGeom, bodyMat, -1.6, rwBaseY, 0);

      const rwTopGeom = new THREE.BoxGeometry(0.05, 0.08, 1.0);
      addMesh(rwTopGeom, accentMat, -1.6, rwBaseY + rwHeight / 2, 0);

      const rwEndGeom = new THREE.BoxGeometry(0.05, rwHeight, 0.05);
      addMesh(rwEndGeom, bodyMat, -1.6, rwBaseY, 0.55);
      addMesh(rwEndGeom, bodyMat, -1.6, rwBaseY, -0.55);

      // SIDEPODS
      if (eraStyle !== 'classic') {
        const sidepodGeom = new THREE.BoxGeometry(0.9, 0.2, 0.28);
        addMesh(sidepodGeom, bodyMat, -0.2, 0.15, 0.45);
        addMesh(sidepodGeom, bodyMat, -0.2, 0.15, -0.45);
      }

      // WHEELS
      const createWheel = (x, y, z, isRear) => {
        const radius = isRear ? 0.32 : 0.28;
        const tireGeom = new THREE.CylinderGeometry(radius, radius, 0.28, 16);
        addMesh(tireGeom, tireMat, x, y, z, Math.PI / 2, 0, 0);
        
        const rimGeom = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.29, 16);
        addMesh(rimGeom, rimMat, x, y, z, Math.PI / 2, 0, 0);
      };

      createWheel(1.3, -0.08, 0.52, false);
      createWheel(1.3, -0.08, -0.52, false);
      createWheel(-1.2, -0.08, 0.55, true);
      createWheel(-1.2, -0.08, -0.55, true);

      // FLOOR/DIFFUSER
      const floorGeom = new THREE.BoxGeometry(2.8, 0.04, 0.72);
      addMesh(floorGeom, floorMat, 0, -0.12, 0);

      // EXHAUST GLOW
      const exhaustLight = new THREE.PointLight(0xff4400, 0.8, 1.5);
      exhaustLight.position.set(-1.7, 0.2, 0);
      carGroup.add(exhaustLight);
    }

    // --- INTERACTION ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let isHovering = false;

    const onMouseDown = (e) => {
      isDragging = true;
      setHasDragged(true);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      carGroup.rotation.y += deltaX * 0.01;
      carGroup.rotation.x += deltaY * 0.005;
      carGroup.rotation.x = Math.max(-0.4, Math.min(0.4, carGroup.rotation.x));
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        setHasDragged(true);
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      
      carGroup.rotation.y += deltaX * 0.01;
      carGroup.rotation.x += deltaY * 0.005;
      carGroup.rotation.x = Math.max(-0.4, Math.min(0.4, carGroup.rotation.x));
      
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onMouseEnter = () => { isHovering = true; };
    const onMouseLeave = () => { isHovering = false; isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    domElement.addEventListener('mouseenter', onMouseEnter);
    domElement.addEventListener('mouseleave', onMouseLeave);

    // --- RESIZE ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mountRef.current);

    // --- ANIMATION LOOP ---
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging && !isHovering) {
        carGroup.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      domElement.removeEventListener('mouseenter', onMouseEnter);
      domElement.removeEventListener('mouseleave', onMouseLeave);

      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      
      if (mountRef.current && domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [car]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-4 pointer-events-none">
        {car && <div className="text-white text-[13px] font-rajdhani">{car.name}</div>}
        {!hasDragged && <div className="text-gray-400 text-[11px] mt-1">Drag to rotate</div>}
      </div>
    </div>
  );
};

export default CarViewer3D;
