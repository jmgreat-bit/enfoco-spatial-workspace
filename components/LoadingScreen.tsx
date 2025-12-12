import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuration & Data ---
const MOCK_NEWS = [
  { title: "NEURAL NETWORK SYNCHRONIZED", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80" },
  { title: "MARKET VOLATILITY DETECTED", url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80" },
  { title: "ENCRYPTION PROTOCOL: ALPHA", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80" },
  { title: "GLOBAL DATASTREAM ACTIVE", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80" },
  { title: "SYSTEM OPTIMIZATION: 99.9%", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80" },
];

const CODE_FRAGMENTS = [
  "0x4F", "1A2B", "SYNC", "NULL", "VOID", "0010", "FF02", "PING",
  "HASH", "ROOT", "SUDO", "BLOB", "NODE", "DATA", "LINK", "HOST"
];

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  // Stages: 1 = Data Rain, 2 = Singularity (Zoom Out), 3 = Reveal
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // Stage 2: The Pull Back / Singularity
    const timer1 = setTimeout(() => setStage(2), 2500);
    // Stage 3: The Impact
    const timer2 = setTimeout(() => setStage(3), 3200);
    // Finish
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center font-mono"
    >
      {/* Cinematic Vignette & Scanlines */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[60] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      </div>

      <AnimatePresence mode="wait">
        {/* Stages 1 & 2: The Machine */}
        {stage < 3 && (
          <motion.div
            key="matrix-container"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: stage === 2 ? 0.05 : 1.2, // Massive zoom out
              filter: stage === 2 ? "blur(10px) brightness(200%)" : "blur(0px) brightness(100%)",
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: stage === 2 ? 0.8 : 0.5, 
              ease: stage === 2 ? [0.7, 0, 0.3, 1] : "linear" 
            }}
            className="absolute inset-0 flex flex-wrap content-start"
          >
            <DataGrid stage={stage} />
          </motion.div>
        )}

        {/* Stage 3: The Reveal */}
        {stage === 3 && (
          <div className="relative z-40 flex flex-col items-center justify-center w-full">
            {/* Impact Shockwave */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5, borderWidth: "0px" }}
              animate={{ scale: 2.5, opacity: 0, borderWidth: "2px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-cyan-500"
            />
            
            <motion.div
              initial={{ scale: 3, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                mass: 1.2 
              }}
              className="relative"
            >
              <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-900 tracking-tighter"
                  style={{ textShadow: "0px 0px 40px rgba(6,182,212,0.6)" }}>
                ENFOCO
              </h1>
              
              {/* Glitch Overlay for Logo */}
              <motion.div
                animate={{ 
                  x: [-2, 2, -1, 0],
                  opacity: [0.5, 0, 0.5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3 }}
                className="absolute inset-0 text-7xl md:text-9xl font-black text-cyan-500 mix-blend-screen opacity-50 tracking-tighter left-[2px]"
              >
                ENFOCO
              </motion.div>
              <motion.div
                animate={{ 
                  x: [2, -2, 1, 0],
                  opacity: [0.5, 0, 0.5, 0] 
                }}
                transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 2.5 }}
                className="absolute inset-0 text-7xl md:text-9xl font-black text-red-500 mix-blend-screen opacity-50 tracking-tighter -left-[2px]"
              >
                ENFOCO
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-6 md:mt-8 h-8 flex items-center justify-center overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "auto" }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center gap-3">
                 <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-cyan-500/50" />
                 <Typewriter text="GLOBAL INTELLIGENCE. NO FILTERS." speed={40} delay={800} />
                 <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-cyan-500/50" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Sub-components ---

const DataGrid: React.FC<{ stage: number }> = ({ stage }) => {
  // Use a constant number of cells to prevent hydration mismatches
  const cells = Array.from({ length: 100 }); 

  return (
    <div className="w-full h-full grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-1 p-2 md:p-4 opacity-80">
      {cells.map((_, i) => (
        <DataCell key={i} index={i} stage={stage} />
      ))}
    </div>
  );
};

const DataCell: React.FC<{ index: number; stage: number }> = ({ index, stage }) => {
  // CRITICAL FIX: Use useState to keep random values stable across re-renders
  const [isImage] = useState(() => Math.random() > 0.85); 
  const [content, setContent] = useState("");
  
  useEffect(() => {
    if (isImage) return;

    // Fast flickering text effect
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setContent(CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)]);
      } else {
         // Binary flicker
         setContent(Math.random() > 0.5 ? "1" : "0");
      }
    }, 50 + Math.random() * 150);

    return () => clearInterval(interval);
  }, [isImage]);

  if (isImage) {
    // Determine news item based on index deterministically
    const news = MOCK_NEWS[index % MOCK_NEWS.length];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          delay: (index % 5) * 0.5, // Deterministic delay
          repeatDelay: Math.random() * 2
        }}
        className="col-span-2 row-span-2 relative overflow-hidden rounded border border-cyan-500/30 bg-black"
      >
        <img src={news.url} alt="data" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all" />
        <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] text-cyan-400 p-1 truncate font-bold">
            {news.title}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="text-xs md:text-sm text-cyan-500/40 font-bold overflow-hidden flex items-center justify-center select-none"
      animate={{ opacity: [0.2, 0.8, 0.2] }}
      transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
    >
      {Math.random() > 0.9 ? (
        <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{content}</span>
      ) : (
        content
      )}
    </motion.div>
  );
};

const Typewriter: React.FC<{ text: string; speed?: number; delay?: number }> = ({ text, speed = 50, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, started]);

  return (
    <p className="text-sm md:text-lg text-cyan-200 tracking-[0.2em] uppercase font-light drop-shadow-lg">
      {displayedText}
      <span className="animate-pulse inline-block w-[2px] h-[1em] bg-cyan-400 ml-2 align-middle" />
    </p>
  );
};