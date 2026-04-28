import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { GalleryItem } from './components/ui/circular-gallery';
import { ProjectGrid } from './components/ProjectGrid';
import { ParticleTitle } from './components/ui/particle-title';
import { MethodologyRoadmap } from './components/MethodologyRoadmap';
import { ContactInfo } from './components/ContactInfo';

import { BackgroundParticles } from './components/ui/background-particles';

// --- Assets ---
const ASSETS = {
  loading: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/defanimlogoprev-ezgif.com-video-to-webp-converter.webp",
  heroInitial: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/bylopo%20techo-reescaled-standard-scale-2_00x.png",
  heroAnim: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/kling_20260331__cinematic__1691_0-ezgif.com-video-to-webp-converter.webp",
  heroFinal: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/2UPS.0SOLO%20TECHO%20PNG-reescaled-standard-scale-2_00x.png",
  logos: {
    quien: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/2.0DEF%20logo%20LOPO.png",
    que: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/T1t.png",
    como: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/T2.png",
    cuando: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/T3.png",
    queMax: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/MAX%20T1t.png",
    comoMax: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/MAX%20T2.png",
    cuandoMax: "https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/MAX3.png"
  }
};

// --- Components ---

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [logoIndex, setLogoIndex] = useState(0);
  const logos = [
    ASSETS.logos.quien,
    ASSETS.logos.que,
    ASSETS.logos.como,
    ASSETS.logos.cuando
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => {
        if (prev === logos.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={logoIndex}
            initial={{ scale: 0.9, opacity: 0, filter: 'blur(4px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.05, opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            src={logos[logoIndex]}
            alt="Loading..."
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-black/5 overflow-hidden">
        <motion.div 
          className="h-full bg-black/20"
          initial={{ width: "0%" }}
          animate={{ width: `${((logoIndex + 1) / logos.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

const useIntersectionReset = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
};

const Cursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button, a, [role="button"], .cursor-pointer');
      setIsHoveringClickable(!!isClickable);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      <motion.div 
        className="cursor-halo"
        animate={{ x: pos.x, y: pos.y, scale: isHoveringClickable ? 1.5 : 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.5 }}
      />
      <motion.div 
        className="cursor-dot"
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', damping: 40, stiffness: 400, mass: 0.1 }}
      >
        {isHoveringClickable && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-black/20"
          />
        )}
      </motion.div>
    </>
  );
};

const Header = ({ setAnimStage }: { setAnimStage: React.Dispatch<React.SetStateAction<'initial' | 'playing' | 'finished'>> }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'QUÉ', id: 'que', logo: ASSETS.logos.que },
    { label: 'CÓMO', id: 'como', logo: ASSETS.logos.como },
    { label: 'CUÁNDO', id: 'cuando', logo: ASSETS.logos.cuando },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 78 + (id === 'cuando' ? -20 : 0);
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'glass-blur py-4 shadow-sm' : 'py-4 sm:py-8'}`}
      style={{ height: '78px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-end -translate-y-4 sm:-translate-y-8 mt-[14px]">
        <motion.div 
          className="flex flex-row items-center cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setAnimStage('initial');
          }}
        >
          <img 
            src={ASSETS.logos.quien} 
            alt="byLOPO" 
            className="w-auto object-contain h-[50px] sm:h-[75px] ml-[-15px] sm:ml-[-22px]" 
            referrerPolicy="no-referrer" 
          />
          <span className="text-lg sm:text-2xl font-light opacity-50 text-black ml-[-6px] sm:ml-[-12px] mt-[10px] sm:mt-[15px]">
             studio
          </span>
        </motion.div>
        
        <nav className="flex gap-4 sm:gap-12 font-bold mb-[15px] sm:mb-[25px] mr-[-4px]">
          {navItems.map((item) => (
            <div 
              key={item.id}
              className="relative flex items-center justify-center cursor-pointer"
              onMouseEnter={() => setHoveredNav(item.id)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <button 
                onClick={() => scrollTo(item.id)}
                className={`text-xs tracking-widest transition-all duration-300 text-black whitespace-nowrap ${hoveredNav === item.id ? 'opacity-0 scale-90' : 'opacity-70 hover:opacity-100'}`}
              >
                {item.label}
              </button>
              
              <AnimatePresence>
                {hoveredNav === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 9 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                  >
                    <img src={item.logo} alt="" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
};

const Hero = ({ animStage, setAnimStage }: { 
  animStage: 'initial' | 'playing' | 'finished', 
  setAnimStage: React.Dispatch<React.SetStateAction<'initial' | 'playing' | 'finished'>> 
}) => {
  const containerRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = [
    { text: "VER", gradient: "linear-gradient(to right, #ff9a9e, #fad0c4)" },
    { text: "ESCUCHAR", gradient: "linear-gradient(to right, #a18cd1, #fbc2eb)" },
    { text: "SENTIR", gradient: "linear-gradient(to right, #84fab0, #8fd3f4)" },
    { text: "CONVERSAR", gradient: "linear-gradient(to right, #a6c0fe, #f68084)" },
    { text: "REIR", gradient: "linear-gradient(to right, #e0c3fc, #8ec5fc)" },
    { text: "CELEBRAR", gradient: "linear-gradient(to right, #43e97b, #38f9d7)" },
    { text: "GRITAR", gradient: "linear-gradient(to right, #ff0844, #ffb199)" },
    { text: "TI", gradient: "linear-gradient(to right, #ffffff, #e0e0e0)" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Handle scroll-triggered animation
  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > 0 && animStage === 'initial') {
        setAnimStage('playing');
        // Set a timer to finish the animation after its duration (approx 2.5s for single play)
        setTimeout(() => {
          setAnimStage(current => current === 'playing' ? 'finished' : current);
        }, 2500);
      }
    });
  }, [scrollY, animStage, setAnimStage]);

  // Image Layer Transitions
  const initialOpacity = animStage === 'initial' ? 1 : 0;
  const animOpacity = animStage === 'playing' ? 1 : 0;
  const finalOpacity = animStage === 'finished' ? 1 : 0;
  
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.05]), {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const taglineColor = animStage === 'initial' ? '#252323' : '#FFFFFF';

  return (
    <section ref={containerRef} id="quien" className="relative h-screen bg-plaster overflow-hidden">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        
        {/* Layer 1: Initial Static Image (bylopo techo) */}
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: initialOpacity }}
          transition={{ duration: 0.8 }}
          style={{ scale }} 
          className="absolute inset-0 z-0"
        >
          <img 
            src={ASSETS.heroInitial} 
            alt="" 
            className="w-full h-full object-cover object-top opacity-90" 
            style={{ imageRendering: 'auto' }}
            decoding="async"
            referrerPolicy="no-referrer" 
          />
        </motion.div>

        {/* Layer 2: WebP Animation (Binary visibility - Unmounts to restart from 0:00) */}
        <AnimatePresence>
          {animStage === 'playing' && (
            <motion.div 
              key="hero-anim-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-1"
            >
              <img 
                src={ASSETS.heroAnim} 
                alt="" 
                className="w-full h-full object-cover object-top" 
                style={{ imageRendering: 'high-quality' }}
                decoding="sync"
                referrerPolicy="no-referrer" 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer 3: Final Static Image (2.0SOLO TECHO PNG) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: finalOpacity }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-2"
        >
          <img 
            src={ASSETS.heroFinal} 
            alt="" 
            className="w-full h-full object-cover object-top" 
            style={{ imageRendering: 'high-quality' }}
            decoding="async"
            referrerPolicy="no-referrer" 
          />
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 h-full pt-32 pb-32 flex flex-col justify-end">
          
          {/* Main Sentence (Removed) */}
          <div className="flex-1" />

          {/* Bottom Branding (Anchored to bottom) */}
          <div className="flex justify-center items-end w-full">
            <motion.div
              className="uppercase flex flex-col items-center justify-center cursor-default group relative w-full text-[clamp(18px,4vw,28px)]"
              style={{
                fontWeight: '700',
                letterSpacing: '0.45em',
                color: taglineColor,
                // Pixar-style realistic shadow: multiple layers for depth and soft contact
                textShadow: animStage === 'initial' 
                  ? "0 4px 6px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.05)" 
                  : "0 10px 15px rgba(0,0,0,0.3), 0 20px 30px rgba(0,0,0,0.2), 0 40px 60px rgba(0,0,0,0.15)"
              }}
              animate={{ 
                color: taglineColor,
                textShadow: animStage === 'initial' 
                  ? "0 4px 6px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.05)" 
                  : "0 10px 15px rgba(0,0,0,0.3), 0 20px 30px rgba(0,0,0,0.2), 0 40px 60px rgba(0,0,0,0.15)"
              }}
              transition={{ duration: 0.5 }}
            >
              <span 
                className="whitespace-nowrap font-normal absolute left-1/2 -translate-x-1/2 -mt-[60px] sm:-mt-[81px] pl-[1px] -mb-[80px]"
              >
                DISEÑAMOS PARA
              </span>
              <div className="relative h-[40px] sm:h-[60px] flex items-center justify-center w-full">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={words[wordIndex].text}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 1.2, 
                      ease: [0.23, 1, 0.32, 1] 
                    }}
                    className="absolute flex flex-col items-center justify-center mb-[20px] sm:mt-[40px]"
                  >
                    {/* Lateral Shadow (Grey Line) effect via multiple text-shadows */}
                    <span
                      className="font-bold whitespace-nowrap bg-clip-text text-transparent text-center tracking-[0.3em] sm:tracking-[0.5em] pl-[0.3em] sm:pl-[0.5em] -mb-[100px] sm:-mb-[150px]"
                      style={{ 
                        backgroundImage: words[wordIndex].gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(2px 0px 1px rgba(128,128,128,0.4))'
                      }}
                    >
                      {words[wordIndex].text}
                    </span>
                    
                    {/* Ground Shadow */}
                    <motion.div 
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 0.3 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      className="h-[4px] bg-black/40 blur-[6px] rounded-[100%] mt-2 w-[120%]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Projects = () => {
  const { ref, isVisible } = useIntersectionReset();

  const galleryData: GalleryItem[] = [
    {
      common: 'Oficinas Global',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'mira de cerca',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short5global-ezgif.com-video-to-webp-converter.webp',
        text: 'Teatro moderno',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Oficinas Grupotec',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'echa un vistazo',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short6grupotec-ezgif.com-video-to-webp-converter.webp',
        text: 'Vivienda con diseño acústico',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Restuarante Umániko',
      binomial: 'Prototipado + Dirección de obra',
      buttonText: 'escucha su sonido',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short7ilunion-ezgif.com-video-to-webp-converter.webp',
        text: 'Pabellón de cristal y sonido',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Restuarante MAX',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'vive el diseño',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short9max-1-ezgif.com-video-to-webp-converter.webp',
        text: 'Espacio experimental',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Beton Brut',
      binomial: 'Asesoría al diseño + Dirección de obra',
      buttonText: 'echa un ojo',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short2beton-ezgif.com-video-to-webp-converter.webp',
        text: 'Estudio de grabación minimalista',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'IES COTES BAIXES',
      binomial: 'Asesoría al diseño + Dirección de obra',
      buttonText: 'adéntrate en él',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short3cotes-ezgif.com-video-to-webp-converter.webp',
        text: 'Espacio de trabajo acústico',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Tanatorio Hnos Femenía',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'escucha su sonido',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short10tanat-ezgif.com-video-to-webp-converter.webp',
        text: 'Tanatorio con diseño acústico',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Marmarela',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'vive el diseño',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/cortomarma2-ezgif.com-video-to-webp-converter.webp',
        text: 'Auditorio de vanguardia',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'ccc. El Vaticano',
      binomial: 'Asesoría al diseño + Dirección de obra',
      buttonText: 'pon la oreja',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/3.cortoVATICANO-ezgif.com-video-to-webp-converter.webp',
        text: 'Espacio espiritual y sonoro',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Heladería Masiá',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'pon la oreja',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/short8masi-ezgif.com-video-to-webp-converter.webp',
        text: 'Sala de conciertos moderna',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Hoteles Poseidón',
      binomial: 'Diseño + Dirección de obra',
      buttonText: 'atrevete a mirar',
      photo: {
        url: 'https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/00.POEIDONCORTO2-ezgif.com-video-to-webp-converter.webp',
        text: 'Restaurante con tratamiento acústico',
        by: 'byLOPO Studio'
      }
    },
    {
      common: 'Este podría ser tu próximo proyecto',
      binomial: 'Contáctanos para empezar',
      buttonText: 'Hablemos',
      photo: {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        text: 'Tu próximo proyecto',
        by: 'byLOPO Studio'
      }
    },
  ];

  return (
    <section ref={ref} className="pt-0 pb-0 bg-plaster relative z-30 mt-0 overflow-hidden min-h-[400px]">
      <div id="que" className="w-full relative">
        <div className="w-full flex justify-center min-h-[160px] mb-0">
          <ParticleTitle text="QUÉ" logoUrl={ASSETS.logos.queMax} className="w-full" />
        </div>

        <div className="max-w-7xl mx-auto px-8 sm:px-16 lg:px-24 -mt-4">
          <div className="w-full">
            <ProjectGrid items={galleryData} />
          </div>
        </div>
      </div>
    </section>
  );
};

const Methodology = () => {
  const { ref, isVisible } = useIntersectionReset();

  return (
    <section ref={ref} className="pt-0 pb-0 bg-plaster relative z-20 mt-0 min-h-[400px]">
      <div id="como" className="w-full relative">
        <div className="w-full flex justify-center min-h-[160px] mb-0">
          <ParticleTitle text="CÓMO" logoUrl={ASSETS.logos.comoMax} className="w-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 pb-16">
          <MethodologyRoadmap />
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { ref, isVisible } = useIntersectionReset();
  return (
    <section ref={ref} className="pt-0 pb-0 bg-plaster relative z-10 mt-0 min-h-[600px]">
      <div id="cuando" className="w-full relative">
        <div className="w-full flex justify-center min-h-[160px] mb-0">
          <ParticleTitle 
            text="CUÁNDO" 
            logoUrl={ASSETS.logos.cuandoMax} 
            className="w-full" 
            customTransitionDuration={600} // Faster transition for "CUÁNDO"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4 pb-16">
          <ContactInfo />
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-8 bg-plaster border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <div className="text-sm opacity-30 text-black">
          © 2026 byLOPO Design Studio. All rights reserved.
        </div>
        <div className="flex items-center gap-8">
          <p className="text-xs tracking-widest opacity-40 uppercase text-black">Material acústico certificado ECOcero</p>
          <img src="https://pub-5ba5a235cecc496ab6d70a15c509691a.r2.dev/Logo-ECOcero-negro.png" alt="ECOcero" className="h-6 opacity-50 grayscale" referrerPolicy="no-referrer" />
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [animStage, setAnimStage] = useState<'initial' | 'playing' | 'finished'>('initial');

  return (
    <main className="relative bg-plaster selection:bg-pastel-violet selection:text-black">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <BackgroundParticles />
          <Cursor />
          <Header setAnimStage={setAnimStage} />
          <Hero animStage={animStage} setAnimStage={setAnimStage} />
          <div className="w-full h-[2px] bg-black/70 relative z-40" />
          <Projects />
          <Methodology />
          <Contact />
          <Footer />
        </motion.div>
      )}
    </main>
  );
}
