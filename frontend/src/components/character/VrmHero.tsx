import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

type VrmHeroProps = {
  modelUrl?: string;
  attacking?: boolean;
  className?: string;
};

type BonePose = {
  x: number;
  y: number;
  z: number;
};

const setBoneRotation = (bone: THREE.Object3D | null, pose: BonePose) => {
  if (!bone) return;
  bone.rotation.set(pose.x, pose.y, pose.z);
};

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

    const battleView = className.includes('battle');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(battleView ? 31 : 26, 1, 0.1, 50);
    camera.position.set(0, battleView ? 1.05 : 1.18, battleView ? 3.55 : 4.15);
    camera.lookAt(0, battleView ? 0.95 : 1.08, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
    keyLight.position.set(2.7, 4.6, 4.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9edfff, 1.25);
    fillLight.position.set(-2.8, 2.4, 2.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.3);
    rimLight.position.set(-3.2, 2.8, -3.8);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0xb8e9ff, 0x08131f, 1.45));

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

        const bounds = new THREE.Box3().setFromObject(vrm.scene);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const targetHeight = battleView ? 1.72 : 1.9;
        const scale = size.y > 0 ? targetHeight / size.y : 1;

        vrm.scene.scale.setScalar(scale);
        vrm.scene.position.set(-center.x * scale, -bounds.min.y * scale - (battleView ? 0.04 : 0.02), -center.z * scale);
        vrm.scene.rotation.y = battleView ? 0 : Math.PI;

        vrm.scene.traverse((object) => {
          object.frustumCulled = false;
          if ('castShadow' in object) object.castShadow = true;
          if ('receiveShadow' in object) object.receiveShadow = true;
        });

        const humanoid = vrm.humanoid;
        setBoneRotation(humanoid?.getNormalizedBoneNode('leftUpperArm') ?? null, { x: 0.08, y: 0, z: 1.12 });
        setBoneRotation(humanoid?.getNormalizedBoneNode('rightUpperArm') ?? null, { x: 0.08, y: 0, z: -1.12 });
        setBoneRotation(humanoid?.getNormalizedBoneNode('leftLowerArm') ?? null, { x: -0.12, y: 0, z: 0.08 });
        setBoneRotation(humanoid?.getNormalizedBoneNode('rightLowerArm') ?? null, { x: -0.12, y: 0, z: -0.08 });
        setBoneRotation(humanoid?.getNormalizedBoneNode('leftHand') ?? null, { x: 0, y: 0, z: 0.05 });
        setBoneRotation(humanoid?.getNormalizedBoneNode('rightHand') ?? null, { x: 0, y: 0, z: -0.05 });

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
    let lastWidth = 0;
    let lastHeight = 0;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
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
        const humanoid = vrm.humanoid;
        const hips = humanoid?.getNormalizedBoneNode('hips') ?? null;
        const spine = humanoid?.getNormalizedBoneNode('spine') ?? null;
        const chest = humanoid?.getNormalizedBoneNode('chest') ?? null;
        const neck = humanoid?.getNormalizedBoneNode('neck') ?? null;
        const leftUpperArm = humanoid?.getNormalizedBoneNode('leftUpperArm') ?? null;
        const rightUpperArm = humanoid?.getNormalizedBoneNode('rightUpperArm') ?? null;
        const rightLowerArm = humanoid?.getNormalizedBoneNode('rightLowerArm') ?? null;

        const breathe = Math.sin(elapsed * 1.75);
        if (hips) {
          hips.position.y = breathe * 0.006;
          hips.rotation.y = Math.sin(elapsed * 0.55) * 0.018;
        }
        if (spine) spine.rotation.x = -0.025 + breathe * 0.008;
        if (chest) {
          chest.rotation.x = breathe * 0.012;
          chest.rotation.z = Math.sin(elapsed * 0.8) * 0.008;
        }
        if (neck) neck.rotation.y = Math.sin(elapsed * 0.42) * 0.025;

        if (leftUpperArm) {
          leftUpperArm.rotation.x = 0.08 + breathe * 0.012;
          leftUpperArm.rotation.z = 1.12;
        }

        if (rightUpperArm && rightLowerArm) {
          if (attackProgressRef.current > 0) {
            const p = attackProgressRef.current;
            const windup = Math.min(1, p * 1.7);
            const strike = Math.sin(p * Math.PI);
            rightUpperArm.rotation.x = -0.35 - strike * 1.05;
            rightUpperArm.rotation.y = 0.2 + strike * 0.55;
            rightUpperArm.rotation.z = -1.12 + windup * 0.72;
            rightLowerArm.rotation.x = -0.15 - strike * 1.45;
            if (chest) chest.rotation.y = strike * 0.28;
            if (hips) hips.rotation.y = -strike * 0.12;
            attackProgressRef.current = Math.max(0, p - delta * 4.2);
          } else {
            rightUpperArm.rotation.set(0.08 + breathe * 0.012, 0, -1.12);
            rightLowerArm.rotation.set(-0.12, 0, -0.08);
          }
        }

        const expressionManager = vrm.expressionManager;
        if (expressionManager) {
          const blinkPhase = elapsed % 4.8;
          const blink = blinkPhase > 4.62 ? Math.sin(((blinkPhase - 4.62) / 0.18) * Math.PI) : 0;
          expressionManager.setValue('blink', blink);
        }
      }

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
