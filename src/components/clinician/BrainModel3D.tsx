import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { HolographicCard } from '../ui/holographic-card';

const BrainGeometry = () => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#b000ff"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#b000ff"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

export const BrainModel3D = () => {
  return (
    <HolographicCard className="h-[400px] relative overflow-hidden">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-purple-400 uppercase tracking-widest">Neural Topography</h3>
        <p className="text-xs text-white/40">Real-time Cognitive Mapping</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <BrainGeometry />
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
      
      <div className="absolute bottom-6 right-6 z-10 flex gap-4">
        <div className="text-right">
          <div className="text-2xl font-black text-purple-400">84.2</div>
          <div className="text-[10px] text-white/40 uppercase">Index Score</div>
        </div>
      </div>
    </HolographicCard>
  );
};
