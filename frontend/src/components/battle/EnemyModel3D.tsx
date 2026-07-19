import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { EnemyKind } from '../../game/gameEngine';

type EnemyModel3DProps = {
  enemyId: string;
  enemyName: string;
  kind: EnemyKind;
  floorId: number;
  defeated?: boolean;
  hit?: boolean;
};

type ModelPreset = {
  url: string;
  scale: number;
  y: number;
  rotationY: number;
  tint?: number;
};

const THREE_EXAMPLES = 'https://threejs.org/examples/models/gltf';
const KHRONOS = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models';

function getPreset(name: string, kind: EnemyKind, floorId: number): ModelPreset {
  const lower = name.toLowerCase();

  if (kind === 'boss' || kind === 'miniboss') {
    if (floorId === 4 || lower.includes('глубин') || lower.includes('сирен')) {
      return { url: `${KHRONOS}/BarramundiFish/glTF-Binary/BarramundiFish.glb`, scale: 1.42, y: -0.72, rotationY: -0.45, tint: 0x78d7ff };
    }
    if (floorId >= 3) {
      return { url: `${KHRONOS}/DragonAttenuation/glTF-Binary/DragonAttenuation.glb`, scale: 1.1, y: -0.82, rotationY: Math.PI, tint: floorId === 5 ? 0xff405f : 0xb08cff };
    }
    return { url: `${THREE_EXAMPLES}/Fox.glb`, scale: 1.55, y: -0.88, rotationY: Math.PI, tint: 0xff6b4a };
  }

  if (lower.includes('волк') || lower.includes('кабан') || lower.includes('вепр') || lower.includes('хищник')) {
    return { url: `${THREE_EXAMPLES}/Fox.glb`, scale: kind === 'elite' ? 1.35 : 1.12, y: -0.88, rotationY: Math.PI, tint: kind === 'elite' ? 0x89a7ff : 0xd08b58 };
  }

  if (floorId === 4 || lower.includes('вод') || lower.includes('рыб') || lower.includes('озёр')) {
    return { url: `${KHRONOS}/BarramundiFish/glTF-Binary/BarramundiFish.glb`, scale: kind === 'elite' ? 1.22 : 0.98, y: -0.48, rotationY: -0.65, tint: 0x58cfff };
  }

  if (lower.includes('гоблин') || lower.includes('разбойник') || lower.includes('клинок') || lower.includes('охотник')) {
    return { url: `${THREE_EXAMPLES}/Soldier.glb`, scale: kind === 'elite' ? 1.12 : 0.96, y: -0.9, rotationY: Math.PI, tint: floorId === 5 ? 0xe54d77 : 0x67b6ff };
  }

  if (lower.includes('дух') || lower.includes('слиз') || lower.includes('паук')) {
    return { url: `${THREE_EXAMPLES}/RobotExpressive/RobotExpressive.glb`, scale: kind === 'elite' ? 1.05 : 0.86, y: -0.92, rotationY: Math.PI, tint: floorId === 2 ? 0x78e6a4 : 0xb986ff };
  }

  if (lower.includes('жук') || lower.includes('голем') || lower.includes('страж')) {
    return { url: `${THREE_EXAMPLES}/RobotExpressive/RobotExpressive.glb`, scale: kind === 'elite' ? 1.18 : 1, y: -0.92, rotationY: Math.PI, tint: 0xb3987c };
  }

  return { url: `${THREE_EXAMPLES}/Fox.glb`, scale: 1.08, y: -0.88, rotationY: Math.PI, tint: 0x9acfff };
}

export function EnemyModel3D({ enemyId, enemyName, kind, floorId, defeated = false, hit = false }: EnemyModel3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    setFailed(false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.05, 40);
    camera.position.set(0, 0.6, 4.2);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.45));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbde9ff, 0x120b18, 2.7));
    const key = new THREE.DirectionalLight(0xffffff, 4.4);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(kind === 'boss' ? 0xff4b66 : 0x62d8ff, kind === 'boss' ? 5 : 3.2);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);

    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(kind === 'boss' ? 1.18 : 0.86, 48),
      new THREE.MeshBasicMaterial({
        color: kind === 'boss' ? 0xff294e : kind === 'miniboss' ? 0xae5cff : 0x35cfff,
        transparent: true,
        opacity: kind === 'boss' ? 0.2 : 0.11,
        side: THREE.DoubleSide,
      }),
    );
    glow.position.set(0, 0.28, -0.5);
    scene.add(glow);

    const preset = getPreset(enemyName, kind, floorId);
    const loader = new GLTFLoader();
    let mixer: THREE.AnimationMixer | null = null;
    let model: THREE.Object3D | null = null;
    let disposed = false;

    loader.load(
      preset.url,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const target = preset.scale * (kind === 'boss' ? 2.1 : kind === 'miniboss' ? 1.72 : 1.42);
        const scale = target / Math.max(size.y, size.x, 0.01);
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        model.position.set(-center.x, preset.y - scaledBox.min.y, -center.z);
        model.rotation.y = preset.rotationY;

        model.traverse((object) => {
          object.frustumCulled = false;
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial && preset.tint) {
                material.color.lerp(new THREE.Color(preset.tint), 0.22);
                material.roughness = Math.min(material.roughness, 0.72);
              }
            });
          }
        });

        scene.add(model);
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          const preferred = gltf.animations.find((clip) => /idle|survey|walk/i.test(clip.name)) ?? gltf.animations[0];
          mixer.clipAction(preferred).play();
        }
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );

    const clock = new THREE.Clock();
    let frame = 0;
    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      resize();
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      mixer?.update(delta);
      if (model) {
        model.position.y += Math.sin(t * 2.2) * 0.00055;
        model.rotation.y += Math.sin(t * 0.8) * 0.00018;
        const targetScale = defeated ? 0.02 : hit ? 0.92 : 1;
        const current = model.userData.effectScale ?? 1;
        const next = THREE.MathUtils.lerp(current, targetScale, defeated ? 0.2 : 0.28);
        model.userData.effectScale = next;
        const base = model.userData.baseScale ?? model.scale.x;
        if (!model.userData.baseScale) model.userData.baseScale = base;
        model.scale.setScalar(base * next);
      }
      glow.material.opacity = (kind === 'boss' ? 0.2 : 0.1) + Math.sin(t * 2) * 0.035;
      renderer.render(scene, camera);
    };
    animate();

    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mixer?.stopAllAction();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [enemyId, enemyName, kind, floorId, defeated, hit]);

  return (
    <div ref={mountRef} className={`enemy-model-3d kind-${kind} ${failed ? 'is-fallback' : ''}`}>
      {failed && <div className="enemy-model-fallback"><span>✦</span><strong>{enemyName}</strong></div>}
    </div>
  );
}
