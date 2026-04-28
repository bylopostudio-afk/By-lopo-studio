import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue } from 'motion/react';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

// Define the type for a single gallery item
export interface GalleryItem {
  common: string;
  binomial: string;
  buttonText?: string;
  photo: {
    url: string; 
    text: string;
    pos?: string;
    by: string;
  };
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius: customRadius, autoRotateSpeed = 0.02, ...props }, ref) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const radius = customRadius || (isMobile ? 350 : 600);
    
    const [rotation, setRotation] = useState(0);
    const rotationMotion = useMotionValue(0);
    const smoothRotation = useSpring(rotationMotion, {
      stiffness: 50,
      damping: 20,
      mass: 0.5
    });

    const [isScrolling, setIsScrolling] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSnapping, setIsSnapping] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startRotation, setStartRotation] = useState(0);
    
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const isVisibleRef = useRef(true);
    const lastScrollY = useRef(0);

    // Update motion value whenever state rotation changes
    useEffect(() => {
      rotationMotion.set(rotation);
    }, [rotation, rotationMotion]);

    useEffect(() => {
      lastScrollY.current = window.scrollY;
    }, []);

    useEffect(() => {
      const el = ref && 'current' in ref ? ref.current : null;
      if (!el) return;
      const observer = new IntersectionObserver(([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      }, { threshold: 0 });
      observer.observe(el);
      return () => observer.disconnect();
    }, [ref]);

    const anglePerItem = 360 / items.length;

    // Function to snap to the nearest item
    const snapToNearestItem = () => {
      if (isDragging) return;
      
      const nearestItemIndex = Math.round(-rotation / anglePerItem);
      const targetRotation = -nearestItemIndex * anglePerItem;
      
      const startRot = rotation;
      const diff = targetRotation - startRot;
      const duration = 600; // Slightly longer for smoothness
      const startTime = performance.now();

      const animateSnap = (currentTime: number) => {
        if (isDragging) {
          setIsSnapping(false);
          return;
        }
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quint for very smooth finish
        const easeProgress = 1 - Math.pow(1 - progress, 5);
        
        const currentRot = startRot + diff * easeProgress;
        setRotation(currentRot);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateSnap);
        } else {
          setIsSnapping(false);
        }
      };

      setIsSnapping(true);
      animationFrameRef.current = requestAnimationFrame(animateSnap);
    };

    // Effect to handle scroll-based rotation: continuous delta-based movement
    useEffect(() => {
      const handleScroll = () => {
        if (isDragging) return;
        
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY.current;
        lastScrollY.current = currentScrollY;

        if (Math.abs(delta) < 1) return;

        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Sensitivity factor for scroll
        const sensitivity = isMobile ? 0.05 : 0.07; 
        setRotation(prev => prev + delta * sensitivity);

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          snapToNearestItem();
        }, 100);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [isDragging, isMobile]);

    // Effect for auto-rotation when not scrolling or dragging
    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && !isDragging && !isSnapping && isVisibleRef.current) {
          setRotation(prev => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isScrolling, isDragging, isSnapping, autoRotateSpeed]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setStartX(clientX);
      setStartRotation(rotation);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startX;
      const sensitivity = isMobile ? 0.15 : 0.2;
      setRotation(startRotation + deltaX * sensitivity);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      snapToNearestItem();
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove);
        window.addEventListener('touchend', handleMouseUp);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }, [isDragging, startX, startRotation]);

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none", className)}
        style={{ perspective: '2000px' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        {...props}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            rotateY: smoothRotation,
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            
            // Optimization: Don't render items that are far behind on mobile
            if (isMobile && normalizedAngle > 120) return null;

            const isCentered = normalizedAngle <= anglePerItem / 2;
            
            const opacity = isCentered ? 1 : Math.max(0.2, 1 - (normalizedAngle / 90));
            const scale = isCentered 
              ? 1.30 
              : Math.max(0.45, 1 - (normalizedAngle / 100));

            const itemWidth = isMobile ? 140 : 190;
            const itemHeight = isMobile ? 180 : 250; 
            return (
              <div
                key={item.photo.url} 
                role="group"
                aria-label={item.common}
                className="absolute transition-all duration-700 ease-out"
                style={{
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${itemWidth / 2}px`,
                  marginTop: `-${itemHeight / 2}px`,
                  opacity: opacity,
                  zIndex: isCentered ? 100 : Math.floor(100 - normalizedAngle),
                  willChange: 'transform, opacity'
                }}
              >
                <div className={cn(
                  "relative w-full h-full rounded-lg shadow-xl overflow-hidden group border border-black/5 bg-[#f2f0eb]/70 backdrop-blur-lg transition-all duration-700",
                  isCentered ? "ring-2 ring-black/10" : "grayscale blur-[1px]"
                )}>
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      style={{ 
                        objectPosition: item.photo.pos || 'center',
                        imageRendering: 'auto'
                      }}
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={cn(
                    "absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white transition-opacity duration-500",
                    isCentered ? "opacity-100" : "opacity-0"
                  )}>
                    <h2 className="text-xl font-display font-bold">{item.common}</h2>
                    <em className="text-sm italic opacity-60 font-sans">{item.binomial}</em>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
