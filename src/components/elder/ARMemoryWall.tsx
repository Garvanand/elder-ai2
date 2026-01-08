import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARCanvas, XR, Interactive } from '@react-three/xr';
import { Text, Sky, ContactShadows, Environment } from '@react-three/drei';
import { motion } from 'framer-motion-3d';

function MemoryFrame({ position, url, title }: { position: [number, number, number], url: string, title: string }) {
  return (
    <Interactive onSelect={() => alert(`Playing story for: ${title}`)}>
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.8, 1, 0.05]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        <Text
          position={[0, -0.6, 0.03]}
          fontSize={0.05}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      </group>
    </Interactive>
  );
}

export const ARMemoryWall = () => {
  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden border border-white/10 bg-black relative">
      <div className="absolute top-8 left-8 z-10 space-y-2">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">AR Memory <span className="text-primary">Portal</span></h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Augmented Reality Experience v1.0</p>
      </div>

      <Canvas>
        <XR>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={null}>
            <MemoryFrame position={[-1, 1.5, -2]} url="" title="Kyoto Trip 1992" />
            <MemoryFrame position={[1, 1.5, -2]} url="" title="First Grandchild" />
            <MemoryFrame position={[0, 1.2, -2.5]} url="" title="Summer Cabin" />
          </Suspense>
          <Environment preset="city" />
        </XR>
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <button className="px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:scale-105 transition-all">
          Initialize AR Session
        </button>
      </div>
    </div>
  );
};
