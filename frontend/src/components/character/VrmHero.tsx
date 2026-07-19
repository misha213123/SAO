import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm';

type VrmHeroProps = {
  modelUrl?: string;
  attacking?: boolean;
  className?: string;
};

export function VrmHero({
  modelUrl = '/models/hero.vrm',
  attacking = false,
  className = '',
}: VrmHeroProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const vrmRef = useRef<VRM | null>(null);
  const attackProgressRef = useRef(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
    camera.position.set(0, 1.25, 3.2);
    camera.lookAt(0, 1.15, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0xdff7ff, 2.8);
    keyLight.position.set(2.5, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x67d9ff, 2.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    scene.add(new THREE.HemisphereLight(0x86cfff, 0x06111d, 1.9));

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    let disposed = false;
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const vrm = gltf.userData.vrm as VRM;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);
        vrm.scene.rotation.y = Math.PI;
        vrm.scene.position.set(0, 0, 0);
        scene.add(vrm.scene);
        vrmRef.current = vrm;
      },
      undefined,
      () => {
        mount.dataset.modelError = 'true';
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
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const vrm = vrmRef.current;

      if (vrm) {
        vrm.update(delta);
        const hips = vrm.humanoid?.getNormalizedBoneNode('hips');
        const chest = vrm.humanoid?.getNormalizedBoneNode('chest');
        const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
        const rightLowerArm = vrm.humanoid?.getNormalizedBoneNode('rightLowerArm');

        if (hips) hips.position.y = Math.sin(elapsed * 1.8) * 0.008;
        if (chest) chest.rotation.z = Math.sin(elapsed * 1.25) * 0.012;

        if (attackProgressRef.current > 0 && rightUpperArm && rightLowerArm) {
          const p = attackProgressRef.current;
          const swing = Math.sin(p * Math.PI);
          rightUpperArm.rotation.z = -0.9 * swing;
          rightUpperArm.rotation.x = -0.55 * swing;
          rightLowerArm.rotation.x = -1.15 * swing;
          attackProgressRef.current = Math.max(0, p - delta * 3.8);
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
      vrmRef.current?.scene.removeFromParent();
      renderer.dispose();
      renderer.domElement.remove();
      vrmRef.current = null;
    };
  }, [modelUrl]);

  useEffect(() => {
    if (attacking) attackProgressRef.current = 1;
  }, [attacking]);

  return (
    <div ref={mountRef} className={`vrm-hero ${className}`} aria-label="3D аниме-персонаж">
      <div className="vrm-hero-fallback">Загрузка 3D-героя…</div>
    </div>
  );
}
