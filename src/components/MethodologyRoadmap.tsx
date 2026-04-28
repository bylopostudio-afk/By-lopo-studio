import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useInView } from 'motion/react';
import { MapPin, Hammer, CheckCircle, ArrowDown, Compass, Layers, PenTool, DraftingCompass } from 'lucide-react';

const stages = [
  {
    title: 'Visita de Obra',
    description: 'Toma de datos inicial, análisis del espacio y comprensión del entorno físico.',
    icon: MapPin,
    color: '#8B5CF6',
    image: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/P1.jpg'
  },
  {
    title: 'Concepto & Diseño',
    description: 'Desarrollo de la narrativa visual, moodboards y primeras propuestas espaciales.',
    icon: Compass,
    color: '#EC4899',
    image: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/P22.png'
  },
  {
    title: 'Proyecto Técnico',
    description: 'Planimetría detallada, especificaciones de materiales y soluciones constructivas.',
    icon: DraftingCompass,
    color: '#3B82F6',
    image: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/P3.jpg'
  },
  {
    title: 'Ejecución',
    description: 'Dirección de obra, gestión de gremios y materialización del diseño.',
    icon: Hammer,
    color: '#10B981',
    image: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/P4.jpg'
  },
  {
    title: 'Entrega Final',
    description: 'Revisión de detalles y entrega del espacio transformado.',
    icon: CheckCircle,
    color: '#F59E0B',
    image: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/P5.jpg'
  }
];

interface StageItemProps {
  stage: any;
  index: number;
  scrollYProgress: any;
}

const StageItem: React.FC<StageItemProps> = React.memo(({ stage, index, scrollYProgress }) => {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  const start = index / stages.length;
  const end = (index + 1) / stages.length;
  
  const grayscale = useTransform(
    scrollYProgress,
    [start - 0.05, start, end, end + 0.05],
    [100, 0, 0, 100]
  );

  const isActive = useTransform(
    scrollYProgress,
    [start - 0.05, start, end, end + 0.05],
    [0, 1, 1, 0]
  );

  const opacity = useTransform(
    scrollYProgress,
    [start - 0.05, start, end, end + 0.05],
    [0.2, 1, 1, 0.2]
  );

  const textColor = useTransform(
    scrollYProgress,
    [start - 0.05, start, end, end + 0.05],
    ["rgba(0,0,0,0.3)", "rgba(0,0,0,1)", "rgba(0,0,0,1)", "rgba(0,0,0,0.3)"]
  );

  return (
    <div 
      ref={ref}
      className="relative flex items-center justify-center md:justify-between min-h-[60vh] py-12"
    >
      {/* Desktop Layout */}
      <div className={`hidden md:flex items-center w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Content Side */}
        <motion.div 
          style={{ opacity }}
          className={`w-5/12 ${isEven ? 'text-right pr-12' : 'text-left pl-12'}`}
        >
          <motion.h3 
            style={{ color: textColor }}
            className="text-2xl font-bold tracking-tight mb-2 uppercase"
          >
            {stage.title}
          </motion.h3>
          <motion.p 
            style={{ color: textColor }}
            className="text-base leading-relaxed font-light"
          >
            {stage.description}
          </motion.p>
        </motion.div>

        {/* Center Icon */}
        <div className="relative z-10 flex items-center justify-center w-20 h-20">
          <motion.div
            style={{ 
              backgroundColor: useTransform(isActive, [0, 1], ["#ffffff", "#000000"]),
              scale: useTransform(isActive, [0, 1], [1, 1.2]),
              willChange: 'transform, background-color'
            }}
            className="w-14 h-14 rounded-2xl shadow-xl border border-black/5 flex items-center justify-center group transition-all duration-500 relative"
          >
            <motion.div
              style={{ 
                color: useTransform(isActive, [0, 1], ["#000000", "#ffffff"]),
              }}
            >
              <stage.icon className="w-6 h-6 transition-colors duration-500" />
            </motion.div>
            
            {/* Step Number */}
            <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-black text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-plaster">
              {String(index + 1).padStart(2, '0')}
            </span>
          </motion.div>
          
          {/* Pulse Effect */}
          <motion.div 
            style={{ opacity: useTransform(isActive, [0, 1], [0, 0.2]) }}
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.2, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-black/5 pointer-events-none"
          />
        </div>

        {/* Image Side */}
        <div className={`w-5/12 flex ${isEven ? 'justify-start pl-12' : 'justify-end pr-12'}`}>
          <motion.div
            style={{ 
              filter: useTransform(grayscale, (v) => `grayscale(${v}%)`),
              opacity: opacity,
              scale: useTransform(isActive, [0, 1], [0.9, 1.1]),
              willChange: 'transform, opacity, filter'
            }}
            className="w-64 h-44 rounded-2xl overflow-hidden shadow-2xl border border-black/5 bg-white/50 backdrop-blur-sm transition-all duration-500"
          >
            <img 
              src={stage.image} 
              alt={stage.title}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'high-quality' }}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col items-center text-center space-y-8">
        <motion.div 
          style={{ 
            backgroundColor: useTransform(isActive, [0, 1], ["#ffffff", "#000000"]),
            scale: useTransform(isActive, [0, 1], [1, 1.2]),
          }}
          className="w-16 h-16 rounded-2xl shadow-lg border border-black/5 flex items-center justify-center relative"
        >
          <motion.div
            style={{ 
              color: useTransform(isActive, [0, 1], ["#000000", "#ffffff"]),
            }}
          >
            <stage.icon className="w-7 h-7" />
          </motion.div>
          <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-black text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-plaster">
            {String(index + 1).padStart(2, '0')}
          </span>
        </motion.div>
        
        <motion.div
          style={{ 
            filter: useTransform(grayscale, (v) => `grayscale(${v}%)`),
            opacity: opacity,
            scale: useTransform(isActive, [0, 1], [0.9, 1.1])
          }}
          className="w-56 h-40 rounded-xl overflow-hidden shadow-md border border-black/5"
        >
          <img 
            src={stage.image} 
            alt={stage.title}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'high-quality' }}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div style={{ opacity }}>
          <motion.h3 
            style={{ color: textColor }}
            className="text-xl font-bold tracking-tight mb-2 uppercase"
          >
            {stage.title}
          </motion.h3>
          <motion.p 
            style={{ color: textColor }}
            className="text-sm leading-relaxed px-4"
          >
            {stage.description}
          </motion.p>
        </motion.div>
        {index < stages.length - 1 && (
          <ArrowDown className="w-4 h-4 text-black/20 animate-bounce pt-4" />
        )}
      </div>
    </div>
  );
});

export const MethodologyRoadmap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div 
      ref={containerRef} 
      className="relative max-w-5xl mx-auto py-12 px-4 overflow-hidden"
    >
      {/* Decorative Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 opacity-10"
        >
          <PenTool className="w-12 h-12" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 opacity-10"
        >
          <Layers className="w-16 h-16" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5"
        >
          <div className="w-32 h-32 border border-black rounded-full" />
        </motion.div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-0 opacity-5"
        >
          <div className="w-24 h-24 border border-dashed border-black rounded-lg" />
        </motion.div>
      </div>

      {/* Vertical Path Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5 -translate-x-1/2 hidden md:block" />
      
      {/* Animated Path Line */}
      <motion.div 
        className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-violet-500 via-pink-500 to-amber-500 -translate-x-1/2 origin-top hidden md:block"
        style={{ scaleY, height: '100%' }}
      />

      {/* Scroll Follower Dot */}
      <motion.div
        className="absolute left-1/2 w-3 h-3 bg-black rounded-full -translate-x-1/2 z-20 hidden md:block"
        style={{ 
          top: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
          boxShadow: '0 0 15px rgba(0,0,0,0.2)'
        }}
      />

      <div className="space-y-12 relative">
        {stages.map((stage, index) => (
          <StageItem 
            key={index} 
            stage={stage} 
            index={index} 
            scrollYProgress={scrollYProgress} 
          />
        ))}
      </div>
    </div>
  );
};
