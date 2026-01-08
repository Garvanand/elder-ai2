import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 1000 }) {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      mesh.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00f3ff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0e27]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#0a0e27']} />
        <ambientLight intensity={0.5} />
        <Particles count={2000} />
      </Canvas>
    </div>
  );
};
