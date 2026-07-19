import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

type VrmHeroProps = {
  modelUrl?: string;
  attacking?: boolean;
  className?: string;
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
    camera.position.set(0, 1.2, 3.25);
    camera.lookAt(0, 1.15, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xe8f8ff, 3.1);
    keyLight.position.set(2.5, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x56cfff, 2.6);
    rimLight.position.set(-3, 2.3, -2.5);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0x91d8ff, 0x07111b, 2));

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

        vrm.scene.rotation.y = Math.PI;
        vrm.scene.position.set(0, -0.02, 0);
        vrm.scene.traverse((object) => {
          object.frustumCulled = false;
          if ('castShadow' in object) object.castShadow = true;
          if ('receiveShadow' in object) object.receiveShadow = true;
        });

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
        const rightShoulder = vrm.humanoid?.getNormalizedBoneNode('rightShoulder');
        const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
        const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');
        const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');

        if (hips) {
          hips.position.y = Math.sin(elapsed * 1.7) * 0.008;
          hips.rotation.y = Math.sin(elapsed * 0.65) * 0.018;
        }
        if (chest) chest.rotation.z = Math.sin(elapsed * 1.2) * 0.012;
        if (leftUpperArm) leftUpperArm.rotation.z = 0.1 + Math.sin(elapsed * 1.1) * 0.015;

        if (attackProgressRef.current > 0 && rightUpperArm && rightLowerArm) {
          const p = attackProgressRef.current;
          const swing = Math.sin(p * Math.PI);
          if (rightShoulder) rightShoulder.rotation.z = -0.38 * swing;
          rightUpperArm.rotation.z = -1.15 * swing;
          rightUpperArm.rotation.x = -0.72 * swing;
          rightUpperArm.rotation.y = 0.42 * swing;
          rightLowerArm.rotation.x = -1.3 * swing;
          attackProgressRef.current = Math.max(0, p - delta * 4.8);
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
  }, [modelUrl]);

  useEffect(() => {
    if (attacking) attackProgressRef.current = 1;
  }, [attacking]);

  return (
    <div ref={mountRef} className={`vrm-hero ${className} is-${status}`} aria-label="3D аниме-персонаж">
      {status === 'loading' && <div className="vrm-hero-fallback">Загрузка 3D-героя…</div>}
      {status === 'error' && <div className="vrm-hero-fallback vrm-error">Добавь файл hero.vrm.glb в public/models</div>}
    </div>
  );
}
