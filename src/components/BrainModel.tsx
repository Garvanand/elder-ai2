import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Text, Sphere, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function MemoryStar({ position, memory, onHover }: { position: [number, number, number], memory: any, onHover: (text: string | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => { setHovered(true); onHover(memory.raw_text); }}
      onPointerOut={() => { setHovered(false); onHover(null); }}
    >
      <sphereGeometry args={[hovered ? 0.15 : 0.08, 16, 16]} />
      <meshStandardMaterial 
        color={memory.image_url ? "#fbbf24" : "#0ea5e9"} 
        emissive={memory.image_url ? "#fbbf24" : "#0ea5e9"} 
        emissiveIntensity={hovered ? 2 : 0.5} 
      />
    </mesh>
  );
}

function Constellation() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);
  const [hoveredText, setHoveredText] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchMemories() {
      const { data } = await supabase
        .from('memories')
        .select('*')
        .eq('elder_id', user.id)
        .limit(20);
      if (data) setMemories(data);
    }
    fetchMemories();
  }, [user]);

  const starPositions = useMemo(() => {
    return memories.map(() => [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2
    ] as [number, number, number]);
  }, [memories]);

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {memories.map((memory, i) => (
          <MemoryStar 
            key={memory.id} 
            position={starPositions[i]} 
            memory={memory} 
            onHover={setHoveredText} 
          />
        ))}
      </Float>

      {hoveredText && (
        <Html center position={[0, -2, 0]}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-primary/20 whitespace-nowrap"
          >
            <p className="text-sm font-bold text-primary italic">"{hoveredText.slice(0, 40)}..."</p>
          </motion.div>
        </Html>
      )}

      {/* Ambient background particles */}
      <Points positions={new Float32Array(500 * 3).map(() => (Math.random() - 0.5) * 10)} stride={3}>
        <PointMaterial transparent color="#ffffff" size={0.02} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
}

export function BrainModelContainer() {
  return (
    <div className="w-full h-full relative min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#0ea5e9" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#fbbf24" />
        <Constellation />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Memory Constellation</p>
      </div>
    </div>
  );
}
