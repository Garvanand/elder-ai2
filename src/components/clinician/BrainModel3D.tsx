import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

const BrainCore = () => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#a855f7"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#a855f7"
          emissiveIntensity={0.5}
        />
      </Sphere>
      
      {/* Neural Network Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} />
      </mesh>
    </Float>
  );
};

export const BrainModel3D = () => {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <BrainCore />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Neural Synapse Load</p>
            <p className="text-xl font-black text-cyan-400">82% <span className="text-[10px] text-slate-500 font-medium">OPTIMAL</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Cognitive Reserve</p>
            <p className="text-xl font-black text-purple-400">Low Risk</p>
          </div>
        </div>
      </div>
    </div>
  );
};
