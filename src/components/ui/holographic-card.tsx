import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const HolographicCard = ({ children, className, glowColor = "rgba(0, 243, 255, 0.3)" }: HolographicCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-cyan-500/10 before:to-purple-500/10",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${glowColor}`,
      }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ skewX: -20 }}
      />
    </motion.div>
  );
};
