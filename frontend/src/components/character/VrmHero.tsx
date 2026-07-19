import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

type VrmHeroProps = {
  modelUrl?: string;
  attacking?: boolean;
  className?: string;
};

function createSword() {
  const group = new THREE.Group();
  group.name = 'equipped-sword-3d';

  const steel = new THREE.MeshStandardMaterial({
    color: 0xbfeeff,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x164a68,
    emissiveIntensity: 0.55,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x07131f, metalness: 0.65, roughness: 0.35 });
  const cyan = new THREE.MeshStandardMaterial({
    color: 0x4ed8ff,
    emissive: 0x1b9fd0,
    emissiveIntensity: 1.2,
    metalness: 0.55,
    roughness: 0.25,
  });

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.72, 0.018), steel);
  blade.position.y = 0.39;
  blade.castShadow = true;

  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.68, 0.028), cyan);
  edge.position.set(0.019, 0.4, 0);

  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.05), dark);
  guard.position.y = 0.02;
  guard.rotation.z = 0.12;

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.23, 8), dark);
  grip.position.y = -0.12;

  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), cyan);
  pommel.position.y = -0.25;

  group.add(blade, edge, guard, grip, pommel);
  group.rotation.z = -0.08;
  return group;
}

function createArmor() {
  const group = new THREE.Group();
  group.name = 'equipped-armor-3d';

  const armor = new THREE.MeshStandardMaterial({
    color: 0x10283c,
    metalness: 0.72,
    roughness: 0.34,
    emissive: 0x071b2b,
    emissiveIntensity: 0.35,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: 0x55d8ff,
    emissive: 0x1689ae,
    emissiveIntensity: 0.9,
    metalness: 0.55,
    roughness: 0.25,
  });

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.14), armor);
  chest.position.set(0, 0.02, -0.01);
  chest.rotation.x = -0.06;

  const chestLine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.31, 0.155), trim);
  chestLine.position.set(0, 0.02, -0.005);

  const leftPad = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), armor);
  leftPad.scale.set(1.25, 0.6, 0.85);
  leftPad.position.set(0.29, 0.13, 0);
  leftPad.rotation.z = -0.3;

  const rightPad = leftPad.clone();
  rightPad.position.x = -0.29;
  rightPad.rotation.z = 0.3;

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), trim);
  gem.position.set(0, 0.08, 0.105);
  gem.rotation.z = Math.PI / 4;

  group.add(chest, chestLine, leftPad, rightPad, gem);
  return group;
}

export function VrmHero({
  modelUrl = '/models/hero.vrm.glb',
  attacking = false,
  className = '',
}: VrmHeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const attackProgressRef = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const profileMode = className.includes('profile');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(profileMode ? 24 : 27, 1, 0.05, 50);
    camera.position.set(profileMode ? 0 : 0.12, profileMode ? 1.23 : 1.15, profileMode ? 3.55 : 3.15);
    camera.lookAt(0, profileMode ? 1.14 : 1.06, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xeaf9ff, 4.2);
    keyLight.position.set(2.7, 4.5, 3.4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8bbcff, 1.65);
    fillLight.position.set(-2.4, 2.1, 2.7);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x42d5ff, 3.4);
    rimLight.position.set(-3.2, 2.8, -3.3);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0xa6ddff, 0x08101a, 2.25));

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 48),
      new THREE.MeshBasicMaterial({ color: 0x36cfff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }),
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.008;
    scene.add(floorGlow);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    let disposed = false;
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const vrm = gltf.userData.vrm as VRM | undefined;
        if (!vrm) {
          setStatus('error');
          return;
        }

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        VRMUtils.rotateVRM0(vrm);

        const box = new THREE.Box3().setFromObject(vrm.scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetHeight = profileMode ? 2.45 : 2.25;
        const scale = targetHeight / Math.max(size.y, 0.01);
        vrm.scene.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(vrm.scene);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        vrm.scene.position.set(-center.x, -scaledBox.min.y - (profileMode ? 0.02 : 0.08), -center.z);
        vrm.scene.rotation.y = profileMode ? 0 : Math.PI;

        vrm.scene.traverse((object) => {
          object.frustumCulled = false;
          if ('castShadow' in object) object.castShadow = true;
          if ('receiveShadow' in object) object.receiveShadow = true;
        });

        const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
        const leftLowerArm = vrm.humanoid?.getNormalizedBoneNode('leftLowerArm');
        const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');
        if (leftUpperArm) leftUpperArm.rotation.z = 1.18;
        if (rightUpperArm) rightUpperArm.rotation.z = -1.05;
        if (leftLowerArm) leftLowerArm.rotation.x = -0.16;
        if (rightLowerArm) rightLowerArm.rotation.x = -0.32;

        const rightHand = vrm.humanoid?.getNormalizedBoneNode('rightHand');
        if (rightHand) {
          const sword = createSword();
          sword.scale.setScalar(0.78);
          sword.position.set(-0.015, -0.03, 0.01);
          sword.rotation.set(0.04, 0, Math.PI);
          rightHand.add(sword);
        }

        const chestBone = vrm.humanoid?.getNormalizedBoneNode('chest') ?? vrm.humanoid?.getNormalizedBoneNode('upperChest');
        if (chestBone) {
          const armor = createArmor();
          armor.scale.setScalar(0.88);
          armor.position.set(0, 0.03, profileMode ? 0.01 : -0.01);
          chestBone.add(armor);
        }

        scene.add(vrm.scene);
        vrmRef.current = vrm;
        setStatus('ready');
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM hero:', error);
        if (!disposed) setStatus('error');
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
      const elapsed = clock.elapsedTime;
      const vrm = vrmRef.current;

      if (vrm) {
        vrm.update(delta);
        const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
        const chest = vrm.humanoid?.getNormalizedBoneNode('chest');
        const neck = vrm.humanoid?.getNormalizedBoneNode('neck');
        const rightShoulder = vrm.humanoid?.getNormalizedBoneNode('rightShoulder');
        const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
        const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');
        const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');

        if (hips) {
          hips.position.y = Math.sin(elapsed * 1.75) * 0.008;
          hips.rotation.y = Math.sin(elapsed * 0.62) * 0.018;
        }
        if (chest) {
          chest.rotation.x = Math.sin(elapsed * 1.7) * 0.012;
          chest.rotation.z = Math.sin(elapsed * 1.15) * 0.009;
        }
        if (neck) neck.rotation.y = Math.sin(elapsed * 0.42) * 0.025;
        if (leftUpperArm) leftUpperArm.rotation.z = 1.18 + Math.sin(elapsed * 1.1) * 0.012;

        if (attackProgressRef.current > 0 && rightUpperArm && rightLowerArm) {
          const p = attackProgressRef.current;
          const windup = Math.min(1, p * 2.2);
          const swing = Math.sin(p * Math.PI);
          if (rightShoulder) rightShoulder.rotation.z = -0.34 * swing;
          rightUpperArm.rotation.z = -1.05 - 1.08 * swing;
          rightUpperArm.rotation.x = -0.16 - 0.92 * swing;
          rightUpperArm.rotation.y = 0.52 * windup;
          rightLowerArm.rotation.x = -0.32 - 1.12 * swing;
          attackProgressRef.current = Math.max(0, p - delta * 4.5);
        } else if (rightUpperArm && rightLowerArm) {
          rightUpperArm.rotation.z = -1.05 + Math.sin(elapsed * 1.05) * 0.012;
          rightUpperArm.rotation.x = -0.16;
          rightUpperArm.rotation.y = 0;
          rightLowerArm.rotation.x = -0.32;
        }

        if (profileMode && vrm.expressionManager) {
          const blink = Math.max(0, Math.sin(elapsed * 0.7 - 1.2) - 0.985) * 65;
          vrm.expressionManager.setValue('blink', Math.min(1, blink));
        }
      }

      floorGlow.material.opacity = 0.09 + Math.sin(elapsed * 1.4) * 0.025;
      renderer.render(scene, camera);
    };

    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (vrmRef.current) {
        VRMUtils.deepDispose(vrmRef.current.scene);
        vrmRef.current.scene.removeFromParent();
      }
      renderer.dispose();
      renderer.domElement.remove();
      vrmRef.current = null;
    };
  }, [className, modelUrl]);

  useEffect(() => {
    if (attacking) attackProgressRef.current = 1;
  }, [attacking]);

  return (
    <div ref={mountRef} className={`vrm-hero ${className} is-${status}`} aria-label="3D аниме-персонаж">
      {status === 'loading' && <div className="vrm-hero-fallback">Загрузка 3D-героя…</div>}
      {status === 'error' && <div className="vrm-hero-fallback vrm-error">Не удалось загрузить hero.vrm.glb</div>}
    </div>
  );
}
