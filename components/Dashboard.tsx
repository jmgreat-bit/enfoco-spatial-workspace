import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence, MotionValue } from 'framer-motion';
import { 
  Globe, Eye, Aperture, Radio, BookOpen, Database, 
  Cpu, Hash, ChevronLeft, ChevronRight, X, Play, 
  Pause, Maximize2, Share2, Download, Shield, Activity,
  FileText, FolderLock, HardDrive, Image as ImageIcon, Film,
  Mic, Lock, Signal, MapPin, AlertCircle, Search, Filter,
  SkipBack, SkipForward, Volume2, Cloud, Server, Save,
  MoreHorizontal, List, Grid as GridIcon, Clock, ShieldAlert,
  Wifi, Star, Zap, Heart, ArrowUpRight, Plus as PlusIcon,
  Flame, TrendingUp, Award
} from 'lucide-react';
import { GeminiService } from '../services/GeminiService';

// --- Types ---

type ItemType = 'article' | 'video' | 'image' | 'audio' | 'book' | 'vault';

interface Item {
  id: number;
  type: ItemType;
  title: string;
  subtitle: string;
  desc: string;
  stats: string[];
}

const ITEMS: Item[] = [
  { 
    id: 1, type: 'article', title: "DEEP INTEL", subtitle: "GLOBAL_NARRATIVES", 
    desc: "Aggregation of global news, local reports, and verified leaks. AI translates context instantly.",
    stats: ["Sources: 12k", "Latency: 20ms"]
  },
  { 
    id: 2, type: 'video', title: "LIVE FEEDS", subtitle: "REAL_TIME_ACCESS", 
    desc: "Unfiltered windows into reality. Access satellite feeds, traffic nodes, and raw broadcast signals.",
    stats: ["Streams: 450+", "Res: 4K"]
  },
  { 
    id: 3, type: 'image', title: "VISUAL DATABASE", subtitle: "HIGH_RES_ARCHIVE", 
    desc: "Full-spectrum imagery. From satellite topography to historical photo-journalism.",
    stats: ["Items: 2M+", "Type: RAW"]
  },
  { 
    id: 4, type: 'audio', title: "SPECTRUM", subtitle: "AUDIO_INTELLIGENCE", 
    desc: "Listen deeper. Podcasts, radio intercepts, academic lectures, and space telemetry.",
    stats: ["Freq: ALL", "Noise: -90dB"]
  },
  { 
    id: 5, type: 'book', title: "ACADEMIC CORE", subtitle: "UNIVERSAL_LIBRARY", 
    desc: "The world's papers, books, and journals. Cross-referenced and searchable.",
    stats: ["Vols: 500k", "Peer-Rev: YES"]
  },
  { 
    id: 6, type: 'vault', title: "MY ARCHIVE", subtitle: "ENCRYPTED_DRIVE", 
    desc: "Your secure workspace. Store terabytes of research, drafts, and datasets locally.",
    stats: ["Enc: AES-256", "Status: SECURE"]
  },
];

// --- Helper Components ---

const WidgetRenderer: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <div className="group relative transition-all duration-300 hover:scale-105 hover:z-50">
      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 rounded-lg blur-xl transition-all duration-300 -z-10 group-hover:blur-2xl" />
      {item.type === 'article' && <div className="w-80 h-96 bg-black/80 border border-cyan-500/30 p-4 flex flex-col group-hover:border-cyan-400 group-hover:shadow-[0_0_50px_rgba(0,243,255,0.3)]"><Globe className="mb-4 text-cyan-500"/> <div className="text-xs font-mono text-cyan-700 mb-2">LIVE FEED</div> <div className="h-2 w-full bg-cyan-900/30 rounded mb-2"/> <div className="h-2 w-3/4 bg-cyan-900/30 rounded"/></div>}
      {(item.type === 'video') && <div className="w-96 h-64 bg-black/90 border border-cyan-500/40 p-1 group-hover:border-red-500 group-hover:shadow-[0_0_80px_rgba(239,68,68,0.4)]"><div className="w-full h-full bg-gray-900 relative"><div className="absolute top-2 left-2 flex gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/> <span className="text-[8px] text-red-500 font-mono">REC</span></div></div></div>}
      {(item.type === 'image') && <div className="w-72 h-72 bg-black border border-cyan-500/40 p-2 group-hover:border-white group-hover:scale-105"><div className="w-full h-full bg-gray-800 flex items-center justify-center"><Aperture className="text-cyan-800 w-12 h-12"/></div></div>}
      {item.type === 'audio' && <div className="w-96 h-48 bg-black/80 border border-cyan-500/40 p-6 flex flex-col justify-between group-hover:border-white group-hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"><div className="flex justify-between"><Radio className="text-cyan-400"/><div className="w-2 h-2 bg-cyan-500 animate-ping"/></div><div className="flex gap-1 h-8 items-end">{[1,2,3,4,5].map(i=><div key={i} className="w-2 bg-cyan-600 h-full"/>)}</div></div>}
      {item.type === 'book' && <div className="w-72 h-96 bg-cyan-950/20 border-l-4 border-cyan-500 border border-cyan-500/20 p-6 group-hover:border-l-yellow-400 group-hover:border-yellow-500/30"><BookOpen className="w-12 h-12 text-cyan-800 mb-4 group-hover:text-yellow-500"/><div className="text-xl font-bold font-display text-white group-hover:text-yellow-100">CODEX</div></div>}
      {item.type === 'vault' && <div className="w-64 h-64 flex items-center justify-center border border-cyan-500/30 bg-black/50 group-hover:border-cyan-400 group-hover:scale-110"><Database className="w-16 h-16 text-cyan-500 group-hover:animate-pulse"/></div>}
    </div>
  );
};

const HelixItem: React.FC<{ 
  item: Item; 
  index: number; 
  rotateZ: MotionValue<number>;
  onSelect: () => void;
}> = ({ item, index, rotateZ, onSelect }) => {
  const startAngle = 270 - (index * 60);
  const triggerAngle = index * 60;

  // Counter-rotate to keep the widget upright
  const counterRotate = useTransform(rotateZ, (v) => -(v + startAngle));

  // --- Dynamic Positioning ---
  let scaleRange: number[], scaleOutput: number[];
  let radiusRange: number[], radiusOutput: number[];

  if (index === 0) {
    // Special wrap-around range for the first item
    scaleRange = [0, 60, 300, 360];
    scaleOutput = [1.5, 0.4, 0.4, 1.5]; // Max scale at 0 and 360

    radiusRange = [0, 60, 300, 360];
    radiusOutput = [0, 500, 500, 0]; // 0px (Center) at 0 and 360
  } else {
    // Standard range for other items
    scaleRange = [triggerAngle - 60, triggerAngle, triggerAngle + 60];
    scaleOutput = [0.4, 1.5, 0.4];

    radiusRange = [triggerAngle - 60, triggerAngle, triggerAngle + 60];
    radiusOutput = [500, 0, 500];
  }
  
  const scale = useTransform(rotateZ, scaleRange, scaleOutput);
  const x = useTransform(rotateZ, radiusRange, radiusOutput); // Moves item in/out from center
  const opacity = useTransform(scale, [0.4, 1.5], [0.3, 1]);
  const blur = useTransform(scale, [0.4, 1.5], ["blur(10px)", "blur(0px)"]);
  const zOffset = useTransform(scale, [0.4, 1.5], [-500, 100]); // Depth effect
  
  const [isInteractable, setIsInteractable] = useState(false);
  
  useMotionValueEvent(rotateZ, "change", (latest) => {
    const normalize = (val: number) => ((val % 360) + 360) % 360;
    const diff = Math.abs(normalize(latest) - normalize(triggerAngle));
    setIsInteractable(Math.min(diff, 360 - diff) < 40); 
  });

  return (
    <div
      className="absolute top-1/2 left-1/2 transform-style-3d"
      style={{
        width: 0, height: 0,
        // Only rotation applied to the wrapper. Translation is handled by the inner motion.div
        transform: `rotate(${startAngle}deg)` 
      }}
    >
      <motion.div
        onClick={onSelect}
        style={{ 
            rotate: counterRotate,
            scale,
            opacity,
            z: zOffset,
            x, // Dynamic radius: 0 = center, 500 = away
            filter: blur,
            pointerEvents: isInteractable ? 'auto' : 'none',
            cursor: isInteractable ? 'pointer' : 'default'
        }}
        className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform"
      >
        <WidgetRenderer item={item} />
      </motion.div>
    </div>
  );
};

const InfoPanel: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <div className="fixed top-0 left-0 h-full w-full md:w-[450px] flex flex-col justify-center px-8 md:px-12 z-40 pointer-events-none">
       <AnimatePresence mode="wait">
          <motion.div
             key={item.id}
             initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
             animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
             exit={{ opacity: 0, x: 50, filter: "blur(10px)", transition: { duration: 0.2 } }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="relative"
          >
             <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-cyan-900/50 hidden md:block">
                <motion.div 
                   className="w-[1px] h-20 bg-cyan-500 absolute top-0" 
                   animate={{ top: ["0%", "80%", "0%"] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
             </div>
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 border border-cyan-500/30 rounded bg-cyan-950/20 shadow-[0_0_15px_rgba(0,243,255,0.1)] backdrop-blur-sm">
                   {item.type === 'article' && <Globe className="w-5 h-5 text-cyan-400" />}
                   {item.type === 'video' && <Eye className="w-5 h-5 text-cyan-400" />}
                   {item.type === 'image' && <Aperture className="w-5 h-5 text-cyan-400" />}
                   {item.type === 'audio' && <Radio className="w-5 h-5 text-cyan-400" />}
                   {item.type === 'book' && <BookOpen className="w-5 h-5 text-cyan-400" />}
                   {item.type === 'vault' && <Database className="w-5 h-5 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-cyan-500 tracking-[0.2em] font-mono font-bold">
                   MODULE_{item.id.toString().padStart(2, '0')}
                </div>
             </div>
             <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-4 leading-[0.9] tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] uppercase">
                {item.title}
             </h2>
             <div className="flex items-center gap-4 mb-6">
                 <div className="text-xs text-cyan-500 font-mono bg-cyan-950/40 inline-block px-3 py-1.5 rounded border border-cyan-500/30">
                    {item.subtitle}
                 </div>
                 <div className="h-[1px] flex-1 bg-cyan-900/50" />
             </div>
             <p className="text-sm md:text-base text-cyan-100/80 leading-relaxed mb-8 border-l-2 border-cyan-500/40 pl-4 font-light font-sans">
                {item.desc}
             </p>
             <div className="grid grid-cols-2 gap-3">
                {item.stats.map((stat, i) => (
                   <div key={i} className="flex items-center gap-3 text-[10px] text-cyan-400 font-mono uppercase tracking-wider bg-black/60 p-3 rounded border border-cyan-900/40 backdrop-blur-sm">
                      <Hash className="w-3 h-3 text-cyan-600" />
                      {stat}
                   </div>
                ))}
             </div>
          </motion.div>
       </AnimatePresence>
    </div>
  );
};

const HUD: React.FC<{ 
    onNext: () => void; 
    onPrev: () => void; 
    activeIndex: number;
    total: number;
}> = ({ onNext, onPrev, activeIndex, total }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <div className="absolute top-8 right-8 flex flex-col items-end">
        <div className="flex items-center gap-3">
            <span className="text-3xl font-display font-black tracking-tighter text-white">ENFOCO</span>
            <Aperture className="w-8 h-8 text-cyan-500 animate-spin-slow" />
        </div>
        <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <div className="text-[10px] text-cyan-500 tracking-[0.4em] font-mono font-bold">GOD_MODE_ACTIVE</div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 pointer-events-auto">
          <button 
            onClick={onPrev}
            className="p-4 rounded-full border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all hover:scale-110 active:scale-95 bg-black/50 backdrop-blur group"
          >
              <ChevronLeft className="w-6 h-6 group-hover:scale-125 transition-transform" />
          </button>
          
          <div className="flex flex-col items-center gap-2">
             <div className="text-[9px] text-cyan-700 tracking-widest font-mono font-bold">
                 {activeIndex + 1} / {total}
             </div>
             <div className="flex gap-1">
                {Array.from({length: total}).map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === activeIndex ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' : 'bg-cyan-900/50'}`} 
                    />
                ))}
             </div>
          </div>

          <button 
            onClick={onNext}
            className="p-4 rounded-full border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all hover:scale-110 active:scale-95 bg-black/50 backdrop-blur group"
          >
              <ChevronRight className="w-6 h-6 group-hover:scale-125 transition-transform" />
          </button>
      </div>
    </div>
  )
}

// --- View Components ---

// A. IMAGE VIEW (Now with AI)
const ImageView = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const MOCK_IMAGES = [
    { id: 1, title: "Neo-Tokyo Skyline", date: "2099.12.31", source: "Drone Swarm Alpha", photographer: "AI_Unit_7734", location: "Sector 4, Japan", desc: "Aerial view of the upper atmosphere habitation rings during the Centennial Light Festival.", url: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=800&q=80", height: "h-64" },
    { id: 2, title: "Cyber-Organic Interface", date: "2102.04.15", source: "Lab Cam 4B", photographer: "Dr. Aris Thorne", location: "Zurich Bio-Vault", desc: "First successful graft of silicon circuitry onto living plant tissue, enabling photosynthesis-based computing.", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", height: "h-96" },
    { id: 3, title: "The Void Walker", date: "2098.08.22", source: "Helmet Cam", photographer: "Exo-Scout J. Doe", location: "Mars Basin", desc: "Rare capture of a nomadic explorer traversing the dust storms of the Cydonia region.", url: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80", height: "h-72" },
    { id: 4, title: "Quantum Server Core", date: "2105.01.01", source: "Security Feed", photographer: "Auto-Sys", location: "Antarctic Data Haven", desc: "The glowing core of the world's first stable quantum internet node, cooled by liquid helium.", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", height: "h-64" },
    { id: 5, title: "Neon Rain", date: "2101.11.05", source: "Street Cam 99", photographer: "Unknown", location: "New Kowloon", desc: "Acid rain reflecting the neon signage of the lower levels. Chemical composition analysis attached.", url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80", height: "h-80" },
    { id: 6, title: "Synthetic Flora", date: "2103.06.30", source: "Macro Lens", photographer: "Botanist X", location: "Orbital Garden", desc: "Genetically modified orchids capable of surviving in vacuum for up to 4 hours.", url: "https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=800&q=80", height: "h-64" },
    { id: 7, title: "Mech Assembly", date: "2100.02.14", source: "Factory Cam", photographer: "Indus-Bot", location: "Detroit Prime", desc: "Automated assembly line producing the Series-9 peacekeeper units.", url: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&q=80", height: "h-96" },
    { id: 8, title: "Sub-Oceanic Transport", date: "2104.09.10", source: "Sonar Vis", photographer: "Capt. Nemo II", location: "Pacific Trench", desc: "Hyperloop tunnel suspended 4km beneath the ocean surface.", url: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=800&q=80", height: "h-72" },
    { id: 9, title: "Neural Link Visualization", date: "2105.03.20", source: "Mind Map", photographer: "Cortex Scan", location: "Virtual Space", desc: "Visual representation of a human consciousness uploading to the cloud.", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", height: "h-80" },
    { id: 10, title: "Abandoned Surface", date: "2088.10.10", source: "Drone 404", photographer: "Wanderer", location: "Old Paris", desc: "The ruins of the Eiffel Tower protruding from the rising sea levels.", url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80", height: "h-64" },
  ];

  // AI STATE
  const [displayImages, setDisplayImages] = useState(MOCK_IMAGES);
  const [isSearching, setIsSearching] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  const handleSearch = async () => {
    if (!searchQuery) {
        setDisplayImages(MOCK_IMAGES);
        setAiInsight("");
        return;
    }

    setIsSearching(true);
    setAiInsight("Analyzing visual data...");

    const response = await GeminiService.universalSearch(searchQuery, MOCK_IMAGES, "Visual Archive");

    setDisplayImages(response.results);
    setAiInsight(response.insight);
    setIsSearching(false);
  };

  return (
    <div className="h-full bg-[#050505] relative flex flex-col font-sans overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* 1. Omni-Search Header */}
        <div className="p-8 z-10 shrink-0">
            <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto items-stretch">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-16 flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl backdrop-blur-xl hover:bg-white/5 transition-colors shadow-2xl overflow-hidden">
                        <Search className={`ml-6 w-6 h-6 ${isSearching ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={isSearching ? "Processing..." : "Search the Visual Archive..."} 
                            className="w-full bg-transparent h-full px-4 text-white placeholder-gray-500 focus:outline-none font-display text-lg tracking-wide" 
                        />
                        <div className="mr-4 flex items-center gap-2">
                             <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-xs font-mono text-gray-400">CMD+K</div>
                        </div>
                    </div>
                    {/* --- AI INSIGHT BUBBLE --- */}
                    {aiInsight && (
                        <div className="absolute top-full left-0 mt-3 flex">
                            <div className="px-4 py-1.5 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono tracking-widest flex items-center gap-2 backdrop-blur-md">
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                AI: "{aiInsight}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Drop Zone */}
                <div className="w-full md:w-80 h-16 rounded-2xl border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-400/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative z-10 p-2 bg-cyan-500/20 rounded-full group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="relative z-10 text-sm font-bold font-display text-cyan-100 group-hover:text-white tracking-wide">
                        DROP IMAGE TO SEARCH
                    </span>
                </div>
            </div>
        </div>

        {/* 2. Masonry Grid */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-8 custom-scrollbar">
             <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 max-w-7xl mx-auto">
                 {displayImages.map((img) => (
                     <motion.div 
                        key={img.id}
                        layoutId={`image-${img.id}`}
                        onClick={() => setSelectedImage(img)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="relative group break-inside-avoid rounded-2xl overflow-hidden bg-gray-900 border border-white/5 cursor-pointer shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300"
                     >
                         <img 
                            src={img.url} 
                            alt={img.title} 
                            className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105" 
                         />
                         
                         {/* Gradient Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                             <h3 className="text-xl font-bold font-display text-white">{img.title}</h3>
                             <p className="text-xs font-mono text-cyan-400 mt-1">{img.date}</p>
                         </div>

                         {/* Center Review Button */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                             <div className="bg-black/50 backdrop-blur-md border border-white/20 p-4 rounded-full text-white transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                 <Eye className="w-6 h-6" />
                             </div>
                         </div>
                     </motion.div>
                 ))}
             </div>
        </div>

        {/* 3. Review Modal */}
        <AnimatePresence>
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        layoutId={`image-${selectedImage.id}`}
                        className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0a] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.15)] flex flex-col md:flex-row"
                    >
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 rounded-full border border-white/10 text-white hover:bg-red-500 hover:border-red-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left: Full Image */}
                        <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-black">
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.title} 
                                className="w-full h-full object-contain"
                            />
                            {/* Grid Overlay Effect */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                        </div>

                        {/* Right: Metadata Panel */}
                        <div className="w-full md:w-1/3 h-1/2 md:h-full bg-[#080808] border-l border-white/5 p-8 flex flex-col overflow-y-auto custom-scrollbar">
                             <div className="mb-8">
                                 <div className="text-[10px] font-mono text-cyan-500 tracking-widest mb-2">CLASSIFIED ARCHIVE</div>
                                 <h2 className="text-4xl font-black font-display text-white leading-none mb-4">{selectedImage.title}</h2>
                                 <p className="text-gray-400 font-light leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                                     {selectedImage.desc}
                                 </p>
                             </div>

                             <div className="space-y-6 mb-8 flex-1">
                                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                     <div className="text-xs text-gray-500 font-mono mb-1">SOURCE</div>
                                     <div className="text-sm font-bold text-white flex items-center gap-2">
                                         <Database className="w-4 h-4 text-cyan-500" /> {selectedImage.source}
                                     </div>
                                 </div>
                                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                     <div className="text-xs text-gray-500 font-mono mb-1">PHOTOGRAPHER</div>
                                     <div className="text-sm font-bold text-white flex items-center gap-2">
                                         <Aperture className="w-4 h-4 text-cyan-500" /> {selectedImage.photographer}
                                     </div>
                                 </div>
                                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                     <div className="text-xs text-gray-500 font-mono mb-1">LOCATION</div>
                                     <div className="text-sm font-bold text-white flex items-center gap-2">
                                         <MapPin className="w-4 h-4 text-cyan-500" /> {selectedImage.location}
                                     </div>
                                 </div>
                                 <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                     <div className="text-xs text-gray-500 font-mono mb-1">TIMESTAMP</div>
                                     <div className="text-sm font-bold text-white flex items-center gap-2">
                                         <Clock className="w-4 h-4 text-cyan-500" /> {selectedImage.date}
                                     </div>
                                 </div>
                             </div>

                             <div className="flex gap-4 mt-auto">
                                 <button className="flex-1 bg-white text-black py-4 font-bold font-display rounded hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                                     <Download className="w-4 h-4" /> DOWNLOAD
                                 </button>
                                 <button className="flex-1 bg-white/5 text-white py-4 font-bold font-display rounded border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                                     <Shield className="w-4 h-4" /> VAULT
                                 </button>
                             </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  )
}

const VaultView = () => {
    const [searchQuery, setSearchQuery] = useState("");
    
    // AI STATE
    const [securityLog, setSecurityLog] = useState("");
    const [displayedFiles, setDisplayedFiles] = useState<any[]>([]); 

    // MOCK DATA
    const FILES = [
        { id: 1, name: "Thesis_Final_Draft_v2.pdf", size: "2.4 MB", type: "doc", drive: "CORE", date: "2025-12-01" },
        { id: 2, name: "Project_Blue_Bridge.cad", size: "850 MB", type: "data", drive: "CLOUD", date: "2025-12-10" },
        { id: 3, name: "Interview_Dr_Vance.wav", size: "45 MB", type: "audio", drive: "MOBILE", date: "2025-11-30" },
        { id: 4, name: "Raw_Satellite_Data_Sector_7.csv", size: "1.2 GB", type: "data", drive: "EXT", date: "2025-12-05" },
        { id: 5, name: "Kigali_Terrain_Map_HighRes.img", size: "4.5 GB", type: "image", drive: "CORE", date: "2025-11-28" },
        { id: 6, name: "Lecture_Notes_Physics_101.docx", size: "125 KB", type: "doc", drive: "CLOUD", date: "2025-12-11" },
        { id: 7, name: "Budget_Allocation_2026.xlsx", size: "2 MB", type: "doc", drive: "NET", date: "2025-12-01" },
        { id: 8, name: "Mars_Colony_Manifest.pdf", size: "45 MB", type: "doc", drive: "NET", date: "2025-11-30" },
        { id: 9, name: "Neural_Net_Training_Data.bin", size: "14 TB", type: "data", drive: "EXT", date: "2025-02-01" },
        { id: 10, name: "Evidence_Log_9901.img", size: "1.2 GB", type: "image", drive: "CLOUD", date: "2025-10-12" },
        { id: 11, name: "System_Kernel_Backup.iso", size: "8 GB", type: "data", drive: "CORE", date: "2025-02-02" },
        { id: 12, name: "Surveillance_Feed_04.vid", size: "12 GB", type: "video", drive: "NET", date: "2025-02-03" },
        { id: 13, name: "Contract_V2_Final.doc", size: "2 MB", type: "doc", drive: "CLOUD", date: "2025-01-05" },
        { id: 14, name: "Encrypted_Payload_X.dat", size: "Unknown", type: "encrypted", drive: "EXT", date: "2025-01-01" },
        { id: 15, name: "Holo_Map_Sector_4.map", size: "4.5 GB", type: "image", drive: "CORE", date: "2025-01-28" },
        { id: 16, name: "Voice_Note_Commander.wav", size: "15 MB", type: "audio", drive: "MOBILE", date: "2025-02-04" },
        { id: 17, name: "Lunar_Base_Schematics.dwg", size: "560 MB", type: "data", drive: "CORE", date: "2025-12-15" },
        { id: 18, name: "Deep_Sea_Scan_Results.tiff", size: "1.8 GB", type: "image", drive: "EXT", date: "2025-12-18" },
    ];
    
    // Init files on load
    useEffect(() => { setDisplayedFiles(FILES); }, []);

    const handleVaultSearch = async () => {
        if(!searchQuery) { setDisplayedFiles(FILES); setSecurityLog(""); return; }
        
        setSecurityLog("INITIATING LEVEL 9 SECURITY SCAN...");
        
        // CALL THE BRAIN
        const result = await GeminiService.deepVaultSearch(searchQuery, FILES);
        
        setDisplayedFiles(result.results);
        setSecurityLog(result.comment); // Show "Clearance Granted" style message
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'video': return <Film className="w-8 h-8 text-purple-400" />;
            case 'image': return <ImageIcon className="w-8 h-8 text-pink-400" />;
            case 'doc': return <FileText className="w-8 h-8 text-blue-400" />;
            case 'encrypted': return <FolderLock className="w-8 h-8 text-emerald-400" />;
            case 'audio': return <Volume2 className="w-8 h-8 text-yellow-400" />;
            default: return <Database className="w-8 h-8 text-gray-400" />;
        }
    };

    return (
        <div className="h-full bg-[#050505] flex flex-col font-sans overflow-hidden relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 border-b border-emerald-500/10 bg-black/40 backdrop-blur-xl z-20 shrink-0">
                <div className="flex-1 w-full max-w-2xl relative group">
                      <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden group-focus-within:border-emerald-500/50 transition-colors">
                          <div className="pl-4 pr-3 text-emerald-500/50"><Database size={18} /></div>
                          <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVaultSearch()}
                            placeholder="Search encrypted drive..." 
                            className="flex-1 bg-transparent py-3 text-sm text-white placeholder-gray-600 focus:outline-none font-mono"
                          />
                      </div>
                      
                      {/* --- SECURITY LOG DISPLAY --- */}
                      {securityLog && (
                          <div className="absolute top-full left-0 mt-2 text-[10px] font-mono text-emerald-500 flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"/>
                              {securityLog}
                          </div>
                      )}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 pt-8 custom-scrollbar">
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                     {displayedFiles.map((file, i) => (
                         <div key={i} className="group relative aspect-[3/4] rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden hover:border-emerald-500/50 transition-all">
                             <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                 <div className="mb-4 p-4 rounded-full bg-white/5 border border-white/5 text-emerald-400">
                                     {getIcon(file.type)}
                                 </div>
                                 <h3 className="text-sm font-bold text-gray-200 truncate w-full">{file.name}</h3>
                                 <p className="text-[10px] font-mono text-gray-500">{file.size}</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    )
}

// B. BOOK VIEW (REPLACED WITH AI TUTOR)
const BookView = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<any>(null);
  
  // AI STATE
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const CATEGORIES = [
    { 
      id: "science",
      title: "Science & Future", 
      books: [
        { id: 101, title: "The Quantum Mind", author: "Dr. Aris Thorne", year: "2098", cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80", desc: "Exploring the intersection of consciousness and quantum mechanics in synthetic lifeforms." },
        { id: 102, title: "Terraforming Mars", author: "Elon X. Musk", year: "2085", cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", desc: "The definitive guide to atmospheric processing and soil regeneration on the Red Planet." },
        { id: 103, title: "Synthetic Biology", author: "LifeGen Corp", year: "2102", cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80", desc: "Designing new life: From molecular assembly to full-scale ecosystem engineering." },
        { id: 104, title: "Stellar Cartography", author: "NASA Deep Field", year: "2099", cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80", desc: "Mapping the local group: A visual atlas of the nearest 1000 star systems." },
      ]
    },
    { 
      id: "history",
      title: "Ancient History", 
      books: [
        { id: 201, title: "The Silicon Age", author: "Historian AI-7", year: "2150", cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", desc: "A retrospective on the 21st century and the birth of true artificial intelligence." },
        { id: 202, title: "Lost Cities of Earth", author: "Sarah Connor", year: "2077", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", desc: "Documenting the submerged metropolises of the pre-flood era." },
        { id: 203, title: "The Great Reset", author: "Global Archive", year: "2030", cover: "https://images.unsplash.com/photo-1614730341194-75c60740a87f?w=800&q=80", desc: "Economic and social shifts following the energy crisis of the late 2020s." },
      ]
    },
    { 
      id: "philosophy",
      title: "Digital Philosophy", 
      books: [
        { id: 301, title: "Ghost in the Machine", author: "Unit 734", year: "2110", cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", desc: "Can code possess a soul? A treatise on the rights of digital entities." },
        { id: 302, title: "Beyond Good & Evil", author: "Nietzsche (Sim)", year: "2090", cover: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&q=80", desc: "Reinterpreting moral philosophy for a post-human society." },
        { id: 303, title: "The Infinite Loop", author: "Logic Core", year: "2105", cover: "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800&q=80", desc: "Paradoxes of time travel and simulation theory explained." },
      ]
    }
  ];

  const handleAiDiscuss = async () => {
      if(!selectedBook) return;
      setAiLoading(true);
      setAiResponse(""); 
      
      // CALL THE BRAIN
      const answer = await GeminiService.chatWithContext(selectedBook.desc, "Explain the core theme of this book and why it matters to humanity.");
      
      setAiResponse(answer);
      setAiLoading(false);
  };

  // Filtering Logic
  const filteredShelves = CATEGORIES.filter(cat => {
    if (activeTab !== "All" && !cat.title.toLowerCase().includes(activeTab.toLowerCase()) && cat.id !== activeTab.toLowerCase()) return false;
    // Simple search implementation checking books inside
    if (searchQuery) {
        return cat.books.some(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return true;
  }).map(cat => ({
      ...cat,
      books: cat.books.filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))
  }));

  return (
    <div className="h-full w-full bg-[#050505] relative flex flex-col font-sans overflow-hidden">
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]" />
             <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[100px]" />
        </div>

        {/* 1. Omni-Search Header */}
        <div className="relative z-20 flex flex-col items-center pt-8 pb-4 px-6 shrink-0 space-y-6">
            <div className="w-full max-w-4xl h-16 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl flex items-center px-4 shadow-2xl group focus-within:border-cyan-500/50 transition-colors">
                <Search className="w-5 h-5 text-cyan-400 mr-4" />
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find knowledge across the archives..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none font-display tracking-wide"
                />
                <div className="flex gap-2">
                    {["All", "Science", "History", "Philosophy"].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                                activeTab === tab 
                                ? "bg-cyan-500 text-black shadow-[0_0_15px_cyan]" 
                                : "text-gray-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 2. Shelves */}
        <div className="flex-1 overflow-y-auto pb-20 px-8 custom-scrollbar relative z-10">
            {filteredShelves.map((shelf) => (
                <div key={shelf.id} className="mb-12">
                    <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-cyan-500 rounded-full" />
                        {shelf.title}
                    </h3>
                    
                    {/* Horizontal Scroll Container */}
                    <div className="flex gap-6 overflow-x-auto pb-8 -mx-8 px-8 scrollbar-hide">
                        {shelf.books.map((book) => (
                            <motion.div
                                key={book.id}
                                className="relative flex-shrink-0 w-[200px] aspect-[2/3] rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-[#0a0a0a]"
                                whileHover={{ y: -10, zIndex: 10 }}
                                onClick={() => { setSelectedBook(book); setAiResponse(""); }}
                            >
                                {/* Cover Image */}
                                <img src={book.cover} alt={book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-all duration-500" />
                                
                                {/* Dark Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                {/* Title (Visible always at bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-full transition-transform duration-300">
                                    <h4 className="text-sm font-bold text-white leading-tight font-display">{book.title}</h4>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{book.author}</p>
                                </div>

                                {/* Hover Actions (Float Up) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                    <button 
                                        className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-wider hover:bg-white hover:text-black transition-all hover:scale-105"
                                    >
                                        <Eye className="w-4 h-4" /> REVIEW
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* 3. Smart Modal */}
        <AnimatePresence>
            {selectedBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBook(null)}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        layoutId={`book-${selectedBook.id}`}
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="relative w-full max-w-5xl h-[70vh] bg-[#0a0a0a] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col md:flex-row"
                    >
                        <button 
                            onClick={() => setSelectedBook(null)}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left: Cover */}
                        <div className="w-full md:w-1/3 h-64 md:h-full relative overflow-hidden">
                             <img src={selectedBook.cover} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] mix-blend-multiply" />
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
                             <div className="flex items-center gap-3 mb-4">
                                 <span className="px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">{selectedBook.year}</span>
                                 <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-gray-400 text-xs font-mono font-bold">EPUB • PDF • NEURAL</span>
                             </div>
                             
                             <h2 className="text-4xl md:text-5xl font-black font-display text-white mb-2 leading-none">{selectedBook.title}</h2>
                             <p className="text-xl text-cyan-500 font-display mb-8">{selectedBook.author}</p>
                             
                             <div className="prose prose-invert max-w-none mb-8">
                                 <p className="text-gray-300 leading-relaxed font-light text-lg">{selectedBook.desc}</p>
                                 <p className="text-gray-400 leading-relaxed mt-4">
                                     Additional metadata extracted from the archive indicates this volume is essential for understanding the transition to the post-scarcity era. Neural link compatibility is rated at 98%.
                                 </p>
                             </div>

                             {/* --- AI RESPONSE AREA --- */}
                             {aiResponse && (
                                <div className="mb-8 p-6 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                                    <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2 text-xs tracking-widest"><Zap className="w-4 h-4"/> AI ANALYSIS</div>
                                    <p className="text-cyan-100 leading-relaxed">{aiResponse}</p>
                                </div>
                             )}

                             <div className="mt-auto flex flex-col md:flex-row gap-4">
                                 <button className="flex-1 py-4 bg-white text-black font-bold font-display tracking-widest rounded hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                                     <BookOpen className="w-5 h-5" /> READ NOW
                                 </button>
                                 <button onClick={handleAiDiscuss} disabled={aiLoading} className="flex-1 py-4 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 font-bold font-display tracking-widest rounded hover:bg-cyan-500/20 hover:border-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                     {aiLoading ? "ANALYZING..." : <><Zap className="w-5 h-5" /> DISCUSS WITH AI</>}
                                 </button>
                             </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  );
}

// C. AUDIO VIEW (New Universal Sonic Archive)
const AudioView = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const FILTERS = ["All", "Lectures", "Space Comms", "News", "Nature Data"];

  const AUDIO_DATABASE = [
    {
      id: 101,
      title: "Applied Quantum Computing",
      artist: "MIT OpenCourseWare",
      type: "Lectures",
      duration: "45:15",
      cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      color: "from-blue-600 to-indigo-600",
      guest: "Prof. S. Lloyd"
    },
    {
      id: 102,
      title: "ISS Docking Procedure: Live",
      artist: "NASA Mission Control",
      type: "Space Comms",
      duration: "LIVE",
      cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      color: "from-gray-800 to-black"
    },
    {
      id: 103,
      title: "Global Markets Update",
      artist: "BBC World Service",
      type: "News",
      duration: "12:00",
      cover: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80",
      color: "from-red-600 to-orange-600"
    },
    {
      id: 104,
      title: "Pacific Whale Song Patterns",
      artist: "NOAA Marine Research",
      type: "Nature Data",
      duration: "20:00",
      cover: "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=800&q=80",
      color: "from-cyan-600 to-blue-800"
    },
    {
      id: 105,
      title: "Mars Rover Telemetry",
      artist: "JPL Data Link",
      type: "Space Comms",
      duration: "08:45",
      cover: "https://images.unsplash.com/photo-1614730341194-75c60740a87f?w=800&q=80",
      color: "from-orange-600 to-red-800"
    },
    {
      id: 106,
      title: "History of the Internet",
      artist: "Stanford Archives",
      type: "Lectures",
      duration: "55:00",
      cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
      color: "from-green-600 to-teal-600"
    },
    {
      id: 107,
      title: "Deep Ocean Hydrophones",
      artist: "Mariana Research",
      type: "Nature Data",
      duration: "LIVE",
      cover: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
      color: "from-blue-900 to-black"
    },
    {
      id: 108,
      title: "Tech Weekly Round-Up",
      artist: "Vergecast",
      type: "News",
      duration: "35:00",
      cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
      color: "from-purple-600 to-pink-600"
    },
    {
      id: 109,
      title: "Pulsar Rhythm Analysis",
      artist: "SETI Institute",
      type: "Space Comms",
      duration: "15:30",
      cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
      color: "from-indigo-900 to-purple-900"
    },
    {
      id: 110,
      title: "Cognitive Science 101",
      artist: "Oxford University",
      type: "Lectures",
      duration: "1:15:00",
      cover: "https://images.unsplash.com/photo-1555449373-67851d7c365c?w=800&q=80",
      color: "from-yellow-600 to-orange-600"
    }
  ];

  // AI STATE
  const [displayItems, setDisplayItems] = useState(AUDIO_DATABASE);
  const [isSearching, setIsSearching] = useState(false);
  const [aiInsight, setAiInsight] = useState("");

  const handleSearch = async () => {
     if (!searchQuery) { 
         setDisplayItems(AUDIO_DATABASE); 
         setAiInsight(""); 
         return; 
     }
     
     setIsSearching(true);
     setAiInsight("Scanning frequencies...");

     // Call API
     const response = await GeminiService.universalSearch(searchQuery, AUDIO_DATABASE, "Sonic Archive");
     
     setDisplayItems(response.results);
     setAiInsight(response.insight);
     setIsSearching(false);
  }

  const handlePlay = (track: any) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] relative flex flex-col font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      {/* 1. Omni-Search Header */}
      <div className="relative z-20 flex flex-col items-center pt-8 pb-4 px-6 shrink-0 space-y-6">
        {/* Floating Glass Bar */}
        <div className="relative w-full max-w-4xl">
            <div className="w-full h-16 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl flex items-center px-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] group hover:border-cyan-500/30 transition-colors">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-cyan-400">
                    <Search className={`w-5 h-5 ${isSearching ? 'animate-pulse text-yellow-400' : ''}`} />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={isSearching ? "Neural Network Processing..." : "Search the sonic frequency..."} 
                  className="flex-1 bg-transparent px-4 text-white placeholder-gray-400 focus:outline-none font-display text-lg tracking-wide"
                />
                <button className="h-10 px-6 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center gap-2 border border-cyan-500/30 transition-all hover:scale-105 active:scale-95">
                    <Mic className="w-4 h-4" />
                    <span className="hidden md:inline font-bold text-xs tracking-wider">SPEAK</span>
                </button>
            </div>
            {/* --- AI INSIGHT BUBBLE --- */}
            {aiInsight && (
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 flex">
                  <div className="px-4 py-1.5 rounded-full bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono tracking-widest flex items-center gap-2 backdrop-blur-md">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                      AI: "{aiInsight}"
                  </div>
               </div>
            )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 md:gap-4 overflow-x-auto max-w-full pb-2 scrollbar-hide">
            {FILTERS.map(filter => (
                <button 
                   key={filter}
                   onClick={() => setActiveFilter(filter)}
                   className={`px-5 py-2 rounded-full text-xs font-bold font-display tracking-widest uppercase transition-all whitespace-nowrap border ${
                      activeFilter === filter 
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                      : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                   }`}
                >
                   {filter}
                </button>
            ))}
        </div>
      </div>

      {/* 2. Content Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6 custom-scrollbar">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
             {displayItems.map((item) => (
                 <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-[#0a0a0a] shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 ${
                        item.type === 'Lectures' ? 'md:col-span-2' : ''
                    }`}
                 >
                    {/* Visual Content */}
                    <div className={`relative ${item.type === 'Lectures' ? 'h-48 flex' : 'aspect-square'}`}>
                        {item.type === 'Lectures' ? (
                            <>
                              <div className="w-1/3 h-full relative">
                                  <img src={item.cover} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]" />
                              </div>
                              <div className="flex-1 h-full p-4 flex flex-col justify-center relative overflow-hidden">
                                  {/* Simulated Waveform */}
                                  <div className="absolute inset-0 opacity-20 flex items-center gap-1 justify-center">
                                      {[...Array(40)].map((_, i) => (
                                          <motion.div 
                                              key={i}
                                              className="w-1 bg-cyan-500"
                                              animate={{ height: [10, 30 + Math.random() * 50, 10] }}
                                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                                          />
                                      ))}
                                  </div>
                                  <div className="relative z-10">
                                      <div className="text-[10px] font-mono text-cyan-400 mb-1">PODCAST_EPISODE</div>
                                      <h3 className="text-xl font-bold font-display text-white mb-1 leading-tight">{item.title}</h3>
                                      <div className="text-sm text-gray-400">{item.guest}</div>
                                  </div>
                              </div>
                            </>
                        ) : (
                            <>
                              <img src={item.cover} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" />
                              <div className={`absolute inset-0 bg-gradient-to-t ${item.color.split(' ')[0]} via-transparent to-transparent opacity-20 group-hover:opacity-60 transition-all`} />
                              
                              {/* Overlay Data for Space/Nature */}
                              {(item.type === 'Space Comms' || item.type === 'Nature Data') && (
                                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                              )}
                              
                              {/* Play Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-black/20">
                                  <button 
                                      onClick={() => handlePlay(item)}
                                      className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-110 transition-transform"
                                  >
                                      {currentTrack?.id === item.id && isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                                  </button>
                              </div>
                            </>
                        )}
                    </div>

                    {/* Bottom Meta */}
                    <div className="p-4 relative bg-[#0a0a0a]">
                        <div className="flex justify-between items-start">
                             <div>
                                 <div className="text-[10px] font-mono text-cyan-500/70 tracking-widest uppercase mb-1">{item.type}</div>
                                 <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors truncate pr-4">{item.title}</h3>
                                 <p className="text-sm text-gray-500">{item.artist}</p>
                             </div>
                             <div className="text-xs font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">{item.duration}</div>
                        </div>
                    </div>
                 </motion.div>
             ))}
         </div>
      </div>

      {/* 3. Floating Glass Player */}
      <AnimatePresence>
          {currentTrack && (
              <motion.div 
                 initial={{ y: 100, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: 100, opacity: 0 }}
                 transition={{ type: "spring", damping: 20, stiffness: 300 }}
                 className="absolute bottom-6 left-6 right-6 h-24 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center px-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
              >
                  {/* Progress Bar Background */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <motion.div 
                         className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]"
                         initial={{ width: "0%" }}
                         animate={{ width: isPlaying ? "100%" : "30%" }}
                         transition={{ duration: 100, ease: "linear" }}
                      />
                  </div>

                  {/* Track Info */}
                  <div className="flex items-center gap-4 w-[30%]">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 relative group">
                          <img src={currentTrack.cover} className="w-full h-full object-cover animate-spin-slow" style={{ animationDuration: '20s' }} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                      </div>
                      <div>
                          <h4 className="text-sm font-bold font-display text-white">{currentTrack.title}</h4>
                          <p className="text-xs text-gray-400 font-mono">{currentTrack.artist}</p>
                      </div>
                  </div>

                  {/* Controls */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-6 mb-1">
                          <button className="text-gray-400 hover:text-white transition-colors hover:scale-110"><SkipBack className="w-5 h-5" /></button>
                          <button 
                             onClick={() => setIsPlaying(!isPlaying)}
                             className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-cyan-400 hover:scale-110 transition-all shadow-lg"
                          >
                              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                          </button>
                          <button className="text-gray-400 hover:text-white transition-colors hover:scale-110"><SkipForward className="w-5 h-5" /></button>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-500 tracking-widest">
                          LIVE_STREAM_ACTIVE
                      </div>
                  </div>

                  {/* Volume/Extras */}
                  <div className="w-[30%] flex justify-end items-center gap-4">
                      <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-cyan-400 transition-colors">
                          <Heart className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 group">
                          <Volume2 className="w-5 h-5 text-gray-400" />
                          <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="w-[70%] h-full bg-cyan-500 rounded-full group-hover:bg-cyan-400" />
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}

// D. VIDEO VIEW (REPLACED WITH SMART SEARCH + INSIGHT BUBBLE)
const VideoView = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI STATE
  const [isSearching, setIsSearching] = useState(false);
  const [aiInsight, setAiInsight] = useState(""); 
  
  // HARDCODED DATA
  const MEDIA_ITEMS = [
    { id: 1, title: "The Neo-Tokyo Drift", type: "Movie", duration: "2h 14m", thumbnail: "https://images.unsplash.com/photo-1542259681-dadcd23f2588?w=800&q=80", category: "Historical Archives" },
    { id: 2, title: "Sector 7 Traffic Cam", type: "Live Feed", duration: "LIVE", thumbnail: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80", category: "Live Feeds" },
    { id: 3, title: "Symphony of Light", type: "Visualizer", duration: "4:20", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", category: "Music Visions" },
    { id: 4, title: "The Last Glaciers", type: "Documentary", duration: "1h 30m", thumbnail: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=80", category: "Documentaries" },
    { id: 5, title: "Cyber-Flora Growth", type: "Time-Lapse", duration: "10h 00m", thumbnail: "https://images.unsplash.com/photo-1518531933037-9a82bf55ab1d?w=800&q=80", category: "Documentaries" },
    { id: 6, title: "Orbital Station Alpha", type: "Live Feed", duration: "LIVE", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", category: "Live Feeds" },
    { id: 7, title: "Midnight Protocol", type: "Movie", duration: "1h 45m", thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80", category: "Historical Archives" },
    { id: 8, title: "Neural Link Beta", type: "Guide", duration: "15m 30s", thumbnail: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80", category: "Historical Archives" },
    { id: 9, title: "Underwater Cities", type: "Documentary", duration: "2h 00m", thumbnail: "https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80", category: "Documentaries" },
    { id: 10, title: "Aurora Borealis Live", type: "Live Feed", duration: "LIVE", thumbnail: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80", category: "Live Feeds" },
    { id: 11, title: "Synthwave Vibes 24/7", type: "Music Visions", duration: "LIVE", thumbnail: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80", category: "Music Visions" },
    { id: 12, title: "The Martian Chronicles", type: "Historical Archives", duration: "3h 10m", thumbnail: "https://images.unsplash.com/photo-1614728853975-6663335d1b5f?w=800&q=80", category: "Historical Archives" }
  ];

  const [displayItems, setDisplayItems] = useState(MEDIA_ITEMS); // Start with all

  const handleSearch = async () => {
    if (!searchQuery) { setDisplayItems(MEDIA_ITEMS); setAiInsight(""); return; }
    
    setIsSearching(true);
    setAiInsight("Analyzing Neural Archives..."); // Loading state
    
    // CALL THE BRAIN
    const response = await GeminiService.universalSearch(searchQuery, MEDIA_ITEMS, "Video Archive");
    
    setDisplayItems(response.results);
    setAiInsight(response.insight); // DISPLAY THE AI ANSWER
    setIsSearching(false);
  };

  const CATEGORIES = ["All", "Live Feeds", "Historical Archives", "Music Visions", "Documentaries"];

  return (
    <div className="h-full w-full bg-[#050505] flex flex-col font-sans relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="p-8 pb-2 z-10 flex flex-col gap-8">
            <div className="w-full max-w-3xl mx-auto relative group">
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full backdrop-blur-xl hover:bg-white/10 transition-colors shadow-2xl">
                    <Search className={`ml-6 w-5 h-5 ${isSearching ? 'text-yellow-400 animate-pulse' : 'text-cyan-400'}`} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                        placeholder={isSearching ? "Neural Network Processing..." : "Search the Universal Archive..."} 
                        className="w-full bg-transparent py-4 px-4 text-white placeholder-gray-400 focus:outline-none font-sans text-lg" 
                    />
                </div>
                
                {/* --- THE AI INSIGHT DISPLAY --- */}
                {aiInsight && (
                   <div className="mt-4 flex justify-center">
                      <div className="px-6 py-2 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-300 text-xs font-mono tracking-widest flex items-center gap-2">
                         <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                         AI_INSIGHT: "{aiInsight}"
                      </div>
                   </div>
                )}
            </div>
            
            <div className="flex gap-3 justify-center flex-wrap">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeCategory === cat ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>{cat}</button>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 max-w-[1600px] mx-auto">
                  {displayItems.map((item) => (
                      <div key={item.id} className="group relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer bg-gray-900 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/20">
                          <img src={item.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                          <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{item.type}</span></div>
                          <div className="absolute bottom-0 left-0 right-0 p-5"><h3 className="text-xl font-display font-bold text-white mb-1 leading-tight group-hover:text-cyan-200 transition-colors">{item.title}</h3><div className="flex items-center justify-between text-xs text-gray-400 font-sans"><span>{item.category}</span><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.duration}</span></div></div>
                      </div>
                  ))}
             </div>
        </div>
    </div>
  );
}

// E. ARTICLE VIEW (Redesigned: Year 3000 Global Magazine)
const ArticleView = () => {
  const [activeTab, setActiveTab] = useState("DEVELOPMENT");
  const [readingArticle, setReadingArticle] = useState<any | null>(null);
  
  const CATEGORIES = ["DEVELOPMENT", "ECONOMY", "SCIENCE", "GEOPOLITICS", "ALL"];

  const COUNTRY_NEWS = [
    {
      country: "RWANDA",
      image: "https://images.unsplash.com/photo-1547638375-ebf04735d792?w=800&q=80",
      articles: [
        { 
            title: "Kigali Smart Grid Expansion: Phase 4", 
            category: "DEVELOPMENT", 
            time: "2h ago", 
            tag: "INFRASTRUCTURE",
            author: "City Planning Bureau",
            body: "The expansion of the smart electrical grid has reached the peri-urban districts. New sensor nodes allow for real-time load balancing, reducing outages by 40% compared to last year's metrics."
        },
        { 
            title: "Q4 Coffee Export Yields Beat Expectations", 
            category: "ECONOMY", 
            time: "5h ago", 
            tag: "TRADE",
            author: "Agri-Tech Daily",
            body: "Thanks to new predictive weather modeling used by local cooperatives, coffee yields have surged. International demand in European markets remains high for specialty Arabica blends."
        }
      ]
    },
    {
      country: "JAPAN",
      image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
      articles: [
        { 
            title: "Semiconductor Partnership Announced", 
            category: "ECONOMY", 
            time: "30m ago", 
            tag: "TECH",
            author: "Nikkei Asian Review",
            body: "Major agreements signed today to boost domestic production of 2nm chips. This move is seen as a strategic buffer against global supply chain volatility."
        },
        { 
            title: "New Bullet Train 'Alpha' Breaks Records", 
            category: "SCIENCE", 
            time: "3h ago", 
            tag: "TRANSPORT",
            author: "Rail Tech",
            body: "The magnetic levitation tests in Yamanashi have successfully hit 650km/h stable speeds, paving the way for the Tokyo-Osaka corridor update."
        }
      ]
    },
    {
      country: "USA",
      image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
      articles: [
        { 
            title: "James Webb Telescope: New Exoplanet Data", 
            category: "SCIENCE", 
            time: "1h ago", 
            tag: "SPACE",
            author: "NASA Press",
            body: "Spectroscopic analysis of K2-18b confirms the presence of carbon-bearing molecules. The data suggests a high probability of a water ocean beneath a hydrogen-rich atmosphere."
        },
        { 
            title: "Fed Interest Rate Decision Analysis", 
            category: "ECONOMY", 
            time: "4h ago", 
            tag: "FINANCE",
            author: "Bloomberg Terminal",
            body: "Markets are reacting to the Federal Reserve's decision to hold rates steady. Inflation metrics show signs of cooling in the housing sector."
        }
      ]
    },
    {
      country: "BRAZIL",
      image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
      articles: [
        { 
            title: "Amazon Bio-Diversity Scan Complete", 
            category: "SCIENCE", 
            time: "20m ago", 
            tag: "CLIMATE",
            author: "EcoWatch",
            body: "A comprehensive drone scan of the western basin has identified three plant species previously thought extinct. Pharmaceutical companies are petitioning for study rights."
        }
      ]
    },
    {
      country: "EUROPE",
      image: "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?w=800&q=80",
      articles: [
        { 
            title: "Fusion Energy Prototype Online in France", 
            category: "SCIENCE", 
            time: "30m ago", 
            tag: "ENERGY",
            author: "ITER Press",
            body: "Scientists at ITER have successfully sustained a plasma reaction for over 20 minutes, breaking all previous records and bringing commercial fusion one step closer."
        },
        {
            title: "Digital Euro Rollout Phase 2",
            category: "ECONOMY",
            time: "6h ago",
            tag: "FINANCE",
            author: "ECB News",
            body: "The European Central Bank has initiated phase 2 of the Digital Euro project, allowing for cross-border offline transactions between member states."
        }
      ]
    },
    {
      country: "CHINA",
      image: "https://images.unsplash.com/photo-1548232979-6c557ee14752?w=800&q=80",
      articles: [
        { 
            title: "Shenzhen Automated Port Expansion", 
            category: "DEVELOPMENT", 
            time: "1h ago", 
            tag: "LOGISTICS",
            author: "Trade Weekly",
            body: "The fully autonomous terminal at Shenzhen port has increased throughput by 15% in its first month of operation, setting a new standard for global shipping logistics."
        }
      ]
    }
  ];

  const filteredCountries = COUNTRY_NEWS.map(country => {
      let articles = country.articles.filter(a => activeTab === 'ALL' || a.category === activeTab);
      // Fallback: duplicate content if list is short to ensure scroll feel
      const displayArticles = articles.length > 0 
          ? [...articles, ...articles, ...articles].slice(0, 10) 
          : []; 
          
      return { 
          ...country, 
          displayArticles, 
          hasRelevant: articles.length > 0 
      };
  });

  return (
    <div className="h-full bg-[#050505] relative overflow-hidden flex flex-col font-sans">
       {/* Background Ambience */}
       <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
       
       {/* Header */}
       <div className="pt-10 pb-6 px-8 z-10 flex flex-col items-center shrink-0">
            <h1 className="text-5xl md:text-7xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-600 tracking-tighter mb-8 drop-shadow-2xl text-center">
                GLOBAL CHRONICLE
            </h1>
            
            {/* Pill Navigation */}
            <div className="flex flex-wrap justify-center gap-2 bg-white/5 p-2 rounded-full backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-8 py-3 rounded-full text-sm font-bold font-display tracking-widest transition-all duration-500 ${
                            activeTab === cat 
                            ? 'bg-cyan-500 text-black shadow-[0_0_25px_rgba(6,182,212,0.6)] scale-105' 
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
       </div>

       {/* Country Stacks Grid */}
       <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[2000px] mx-auto">
                {filteredCountries.map((country, idx) => (
                    <div 
                        key={country.country}
                        className="group relative h-[600px] bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:-translate-y-2 flex flex-col"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={country.image} 
                                alt={country.country} 
                                className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700 scale-105 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/80 to-[#050505] mix-blend-multiply" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />
                        </div>

                        {/* Header Content */}
                        <div className="relative z-10 p-8 pb-4 shrink-0 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black font-display text-white tracking-tighter uppercase mb-1 drop-shadow-md">{country.country}</h2>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${country.hasRelevant ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500'} animate-pulse`} />
                                    <span className="text-[10px] font-mono text-cyan-500 tracking-widest uppercase">
                                        {country.hasRelevant ? 'LIVE FEED' : 'ARCHIVE MODE'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 transition-all duration-300">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent shrink-0 mb-2" />

                        {/* Evaporating Scroll List */}
                        <div 
                            className="relative flex-1 overflow-hidden"
                            style={{ 
                                maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                            }}
                        >
                            <div className="absolute inset-0 overflow-y-auto scrollbar-hide py-12 px-6 flex flex-col gap-4">
                                {country.displayArticles.length > 0 ? country.displayArticles.map((article, i) => (
                                    <motion.div 
                                        key={i}
                                        onClick={() => setReadingArticle({...article, image: country.image})}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer group/card relative"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[9px] font-bold font-mono px-2 py-1 rounded border ${
                                                article.tag === 'LIVE' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                                article.tag === 'BREAKING' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                                                'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                                            }`}>
                                                {article.tag}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-500">{article.time}</span>
                                        </div>
                                        <h3 className="text-lg font-bold font-display text-gray-200 group-hover/card:text-white leading-tight transition-colors pr-6">
                                            {article.title}
                                        </h3>
                                        
                                        {/* Hover Eye Icon */}
                                        <div className="absolute right-4 bottom-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 text-cyan-400">
                                            <Eye className="w-5 h-5" />
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center text-gray-600 font-mono text-xs mt-10">NO DATA SIGNALS DETECTED</div>
                                )}
                            </div>
                        </div>
                        
                        {/* Bottom Gradient overlay for safety */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-20" />
                    </div>
                ))}
            </div>
       </div>

       {/* QUICK READ MODAL OVERLAY */}
       <AnimatePresence>
         {readingArticle && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                {/* Dark Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setReadingArticle(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Card Modal */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl h-[85vh] bg-[#0a0a0a] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] flex flex-col"
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setReadingArticle(null)}
                        className="absolute top-6 right-6 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-red-500 hover:border-red-500 transition-all duration-300 group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>

                    {/* Top Image Section */}
                    <div className="h-[45%] relative shrink-0">
                        <img 
                            src={readingArticle.image} 
                            alt="Cover" 
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                        
                        <div className="absolute bottom-6 left-8 right-8">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold rounded tracking-wider">
                                    {readingArticle.category}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-mono text-cyan-100/70 bg-black/40 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" /> {readingArticle.time}
                                </span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black font-display text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                                {readingArticle.title}
                            </h2>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
                         <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                             <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center border border-cyan-500/20">
                                 <Globe className="w-6 h-6 text-cyan-400" />
                             </div>
                             <div>
                                 <div className="text-sm text-gray-400 font-mono">AUTHOR</div>
                                 <div className="text-lg font-bold text-white">{readingArticle.author}</div>
                             </div>
                             <div className="h-8 w-[1px] bg-white/10 mx-4" />
                             <div>
                                 <div className="text-sm text-gray-400 font-mono">TAG</div>
                                 <div className="text-lg font-bold text-cyan-400">#{readingArticle.tag}</div>
                             </div>
                         </div>

                         <div className="prose prose-invert prose-lg max-w-none">
                             <p className="text-xl text-gray-300 leading-relaxed font-light">
                                 {readingArticle.body}
                             </p>
                             <p className="text-gray-400 leading-relaxed mt-6">
                                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                             </p>
                             <p className="text-gray-400 leading-relaxed mt-6">
                                 Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                             </p>
                         </div>

                         <div className="mt-12 p-6 bg-cyan-900/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                             <div className="text-sm font-mono text-cyan-600">
                                 END OF TRANSMISSION
                             </div>
                             <div className="flex gap-2">
                                 <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Share2 className="w-5 h-5 text-gray-400" /></button>
                                 <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Save className="w-5 h-5 text-gray-400" /></button>
                             </div>
                         </div>
                    </div>
                </motion.div>
            </div>
         )}
       </AnimatePresence>
    </div>
  );
}

// --- 2. Detail View Container ---

const DetailViewContainer: React.FC<{ type: ItemType; onBack: () => void }> = ({ type, onBack }) => {
  return (
    <motion.div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden flex flex-col"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%", transition: { duration: 0.5, ease: "easeInOut" } }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Navigation Bar */}
      <div className="w-full h-16 border-b border-cyan-900/30 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md z-50 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-cyan-500 hover:text-white transition-colors group">
             <div className="p-2 border border-cyan-500/30 rounded-full group-hover:bg-cyan-500/20 group-hover:border-cyan-400 bg-black">
                <ChevronLeft className="w-4 h-4" />
             </div>
             <span className="text-sm font-bold font-display tracking-widest group-hover:tracking-[0.2em] transition-all">BACK TO HELIX</span>
          </button>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 text-xs font-mono text-cyan-700">
                 <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> US-EAST-1</span>
                 <span className="flex items-center gap-2"><Cpu className="w-3 h-3" /> 12ms</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-cyan-700 tracking-[0.3em] font-mono font-bold">SYSTEM_STATUS</span>
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]" />
                   <span className="text-xs font-bold font-mono text-cyan-400">CONNECTED</span>
                </div>
             </div>
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-[#080808]">
         {type === 'book' && <BookView />}
         {type === 'audio' && <AudioView />}
         {type === 'video' && <VideoView />}
         {type === 'article' && <ArticleView />}
         {type === 'image' && <ImageView />}
         {type === 'vault' && <VaultView />}
      </div>
    </motion.div>
  );
}

const FastRewindIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/></svg>
)

const FastForwardIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/></svg>
)

export const Dashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailView, setDetailView] = useState<ItemType | null>(null);
  const scrollTimeout = useRef<any>(null); 
  
  // Spring for smooth rotation - ADJUSTED FOR SLOWER FEEL
  const rotateZ = useSpring(0, { stiffness: 60, damping: 20, mass: 1.5 });

  useEffect(() => {
    // 60 degrees per item (360 / 6)
    rotateZ.set(activeIndex * 60);
  }, [activeIndex, rotateZ]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % ITEMS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + ITEMS.length) % ITEMS.length);
  };

  const handleSelect = (item: Item) => {
    // If active, open detail. If not, rotate to it.
    if (ITEMS[activeIndex].id === item.id) {
        setDetailView(item.type);
    } else {
        const index = ITEMS.findIndex(i => i.id === item.id);
        setActiveIndex(index);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // If a detail view is open, don't hijack scroll
    if (detailView) return;

    // Debounce to prevent scrolling through everything at once
    if (scrollTimeout.current) return;

    // Threshold to ignore small trackpad jitters
    if (Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) {
            handleNext();
        } else {
            handlePrev();
        }
        
        // Cooldown period - INCREASED TO 1000ms
        scrollTimeout.current = setTimeout(() => {
            scrollTimeout.current = null;
        }, 1000); 
    }
  };

  return (
    <div 
        className="relative w-screen h-screen bg-[#050505] overflow-hidden flex items-center justify-center font-sans select-none"
        onWheel={handleWheel}
    >
       {/* Global Ambience */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />

       <AnimatePresence>
          {detailView && (
             <DetailViewContainer type={detailView} onBack={() => setDetailView(null)} />
          )}
       </AnimatePresence>
       
       {/* 3D Scene Wrapper */}
       <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
          <motion.div 
              style={{ rotateZ }} 
              className="relative w-0 h-0 flex items-center justify-center transform-style-3d"
          >
              {ITEMS.map((item, index) => (
                  <HelixItem 
                     key={item.id} 
                     item={item} 
                     index={index} 
                     rotateZ={rotateZ}
                     onSelect={() => handleSelect(item)}
                  />
              ))}
          </motion.div>
       </div>

       <InfoPanel item={ITEMS[activeIndex]} />
       
       <HUD 
           activeIndex={activeIndex} 
           total={ITEMS.length} 
           onNext={handleNext} 
           onPrev={handlePrev}
       />
    </div>
  );
};
