import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Line, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NeuralBrain() {
  const pointsRef = useRef<THREE.Points>(null!);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);

  // Generate brain-shaped sphere points
  const points = useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 * Math.pow(Math.random(), 1/3); // Volume distribution
      
      // Distort into more of a brain shape (ellipsoid)
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.2;
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi) * 0.8;
      
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.z = time * 0.05;
  });

  return (
    <group>
      {/* Central Core */}
      <Sphere args={[0.5, 32, 32]}>
        <MeshDistortMaterial
          color="#0ea5e9"
          speed={2}
          distort={0.4}
          radius={0.5}
        />
      </Sphere>

      {/* Neural Points */}
      <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#0ea5e9"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Simulated Neural Connections */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group rotation={[0, 0, 0]}>
           {/* We can add glowing lines here */}
        </group>
      </Float>
    </group>
  );
}

export function BrainModelContainer() {
  return (
    <div className="w-full h-[400px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
        <NeuralBrain />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    </div>
  );
}
