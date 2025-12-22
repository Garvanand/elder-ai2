import React from 'react';

export function FuturisticBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[#f8fafc]" />
      
      {/* Dynamic futuristic blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-60" />
      <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-60" />
      <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-60" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/60" />
    </div>
  );
}
