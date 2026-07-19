import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

type VrmHeroProps = {
  modelUrl?: string;
  attacking?: boolean;
  className?: string;
};

function createSword(): THREE.Group {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({
    color: 0xd8f6ff,
    metalness: 0.9,
    roughness: 0.16,
    emissive: 0x0b5d81,
    emissiveIntensity: 0.85,
  });
  const dark = new THREE.MeshStandardMaterial({ color: 0x07111c, metalness: 0.7, roughness: 0.3 });
  const glow = new THREE.MeshStandardMaterial({
    color: 0x5ee5ff,
    emissive: 0x1fbbe8,
    emissiveIntensity: 1.8,
    metalness: 0.45,
    roughness: 0.18,
  });

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.78, 0.015), steel);
  blade.position.y = 0.42;
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.74, 0.025), glow);
  edge.position.set(0.02, 0.43, 0);
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.05), dark);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.22, 10), dark);
  grip.position.y = -0.13;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), glow);
  pommel.position.y = -0.26;
  group.add(blade, edge, guard, grip, pommel);
  return group;
}

function createBackSword(): THREE.Group {
  const sword = createSword();
  sword.rotation.set(0.08, 0.15, -0.62);
  sword.position.set(0.14, 0.04, 0.13);
  sword.scale.setScalar(0.9);
  return sword;
}

function createArmor(profileMode: boolean): THREE.Group {
  const group = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({
    color: 0x0b2034,
    metalness: 0.62,
    roughness: 0.36,
    emissive: 0x061827,
    emissiveIntensity: 0.28,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: 0x52dfff,
    emissive: 0x178bae,
    emissiveIntensity: 1.15,
    metalness: 0.55,
    roughness: 0.24,
  });

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.29, 0.09), shell);
  chest.position.set(0, 0.01, profileMode ? -0.055 : 0.055);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.25, 0.105), trim);
  line.position.set(0, 0.01, profileMode ? -0.06 : 0.06);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.047, 0), trim);
  gem.position.set(0, 0.065, profileMode ? -0.115 : 0.115);
  const leftPad = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), shell);
  leftPad.scale.set(1.15, 0.56, 0.75);
  leftPad.position.set(0.24, 0.1, 0);
  const rightPad = leftPad.clone();
  rightPad.position.x = -0.24;
  group.add(chest, line, gem, leftPad, rightPad);
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
    const camera = new THREE.PerspectiveCamera(profileMode ? 30 : 32, 1, 0.05, 50);
    camera.position.set(0, profileMode ? 1.05 : 1.0, profileMode ? 4.7 : 4.35);
    camera.lookAt(0, profileMode ? 0.92 : 0.86, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight(0xe8f7ff, 3.4);
    key.position.set(2.6, 4.2, 3.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x7aaeff, 1.2);
    fill.position.set(-2.5, 2.2, 3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x44d8ff, 2.8);
    rim.position.set(-3, 2.5, -3);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xb6e6ff, 0x07101a, 1.55));

    const floorGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 40),
      new THREE.MeshBasicMaterial({ color: 0x36cfff, transparent: true, opacity: 0.08, side: THREE.DoubleSide }),
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = 0.006;
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

        const initialBox = new THREE.Box3().setFromObject(vrm.scene);
        const initialSize = new THREE.Vector3();
        initialBox.getSize(initialSize);
        const targetHeight = profileMode ? 1.72 : 1.62;
        const scale = targetHeight / Math.max(initialSize.y, 0.01);
        vrm.scene.scale.setScalar(scale);

        const box = new THREE.Box3().setFromObject(vrm.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        vrm.scene.position.set(-center.x, -box.min.y + 0.02, -center.z);

        // Profile shows the face; battle shows the hero's back toward the player.
        vrm.scene.rotation.y = profileMode ? Math.PI : 0;

        vrm.scene.traverse((object) => {
          object.frustumCulled = false;
          if ('castShadow' in object) object.castShadow = true;
          if ('receiveShadow' in object) object.receiveShadow = true;
        });

        const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');
        const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
        const leftLowerArm = vrm.humanoid?.getNormalizedBoneNode('leftLowerArm');
        const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');
        if (leftUpperArm) leftUpperArm.rotation.z = 1.32;
        if (rightUpperArm) rightUpperArm.rotation.z = -1.28;
        if (leftLowerArm) leftLowerArm.rotation.x = -0.18;
        if (rightLowerArm) rightLowerArm.rotation.x = -0.24;

        const chestBone = vrm.humanoid?.getNormalizedBoneNode('chest') ?? vrm.humanoid?.getNormalizedBoneNode('upperChest');
        if (chestBone) {
          const armor = createArmor(profileMode);
          armor.scale.setScalar(0.72);
          armor.position.set(0, 0.015, 0);
          chestBone.add(armor);
          if (!profileMode) chestBone.add(createBackSword());
        }

        const rightHand = vrm.humanoid?.getNormalizedBoneNode('rightHand');
        if (rightHand && profileMode) {
          const sword = createSword();
          sword.scale.setScalar(0.68);
          sword.position.set(-0.015, -0.025, 0.01);
          sword.rotation.set(0.02, 0, Math.PI);
          rightHand.add(sword);
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
          hips.position.y = Math.sin(elapsed * 1.7) * 0.006;
          hips.rotation.y = Math.sin(elapsed * 0.6) * 0.012;
        }
        if (chest) {
          chest.rotation.x = Math.sin(elapsed * 1.6) * 0.009;
          chest.rotation.z = Math.sin(elapsed * 1.1) * 0.007;
        }
        if (neck) neck.rotation.y = Math.sin(elapsed * 0.42) * 0.02;
        if (leftUpperArm) leftUpperArm.rotation.z = 1.32 + Math.sin(elapsed * 1.05) * 0.008;

        if (attackProgressRef.current > 0 && rightUpperArm && rightLowerArm) {
          const p = attackProgressRef.current;
          const swing = Math.sin(p * Math.PI);
          if (rightShoulder) rightShoulder.rotation.z = -0.28 * swing;
          rightUpperArm.rotation.z = -1.28 - 0.9 * swing;
          rightUpperArm.rotation.x = -0.12 - 0.78 * swing;
          rightUpperArm.rotation.y = 0.42 * swing;
          rightLowerArm.rotation.x = -0.24 - 0.9 * swing;
          attackProgressRef.current = Math.max(0, p - delta * 4.7);
        } else if (rightUpperArm && rightLowerArm) {
          rightUpperArm.rotation.z = -1.28 + Math.sin(elapsed) * 0.008;
          rightUpperArm.rotation.x = -0.12;
          rightUpperArm.rotation.y = 0;
          rightLowerArm.rotation.x = -0.24;
        }

        if (profileMode && vrm.expressionManager) {
          const blink = Math.max(0, Math.sin(elapsed * 0.72 - 1.2) - 0.985) * 65;
          vrm.expressionManager.setValue('blink', Math.min(1, blink));
        }
      }

      (floorGlow.material as THREE.MeshBasicMaterial).opacity = 0.065 + Math.sin(elapsed * 1.35) * 0.018;
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
