import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';

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
          color="#8b5cf6"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#8b5cf6"
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

export const BrainModel3D = () => {
  return (
    <Card className="h-[400px] relative overflow-hidden border-border bg-white shadow-sm rounded-[32px]">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-bold text-primary uppercase tracking-widest">Neural Topography</h3>
        <p className="text-xs text-muted-foreground">Real-time Cognitive Mapping</p>
      </div>
      
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <BrainGeometry />
        <OrbitControls enableZoom={false} autoRotate />
      </Canvas>
      
      <div className="absolute bottom-6 right-6 z-10 flex gap-4">
        <div className="text-right">
          <div className="text-2xl font-black text-primary">84.2</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold">Index Score</div>
        </div>
      </div>
    </Card>
  );
};
