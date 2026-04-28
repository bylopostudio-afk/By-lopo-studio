import React, { useEffect, useRef, useState } from 'react';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  gray: number;
  color: string | null;
  size: number;
  vx: number;
  vy: number;
  friction: number;
  ease: number;
  jitterOffset: { x: number, y: number };
}

const PASTEL_COLORS = [
  '#DDD6FE', // softest violet
  '#D1FAE5', // softest mint
  '#FFEDD5', // softest orange
  '#FEF9C3', // softest yellow
  '#DBEAFE', // softest blue
  '#FCE7F3', // softest pink
];

interface ParticleTitleProps {
  text: string;
  logoUrl: string;
  className?: string;
  customTransitionDuration?: number;
}

/**
 * ParticleTitle Component
 * Mechanics: Morphing particles between text and logo on hover.
 * Always centered, no horizontal sliding.
 */
export const ParticleTitle: React.FC<ParticleTitleProps> = ({ text, logoUrl, className, customTransitionDuration }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showLogo, setShowLogo] = useState(true);
  const [textWidth, setTextWidth] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 160 });
  const [currentColor, setCurrentColor] = useState(PASTEL_COLORS[0]);
  
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isMouseInRef = useRef(false);
  const lastSwitchTimeRef = useRef(Date.now() - 2000);
  const particlesRef = useRef<Particle[]>([]);
  const textPointsRef = useRef<{x: number, y: number}[]>([]);
  const logoPointsRef = useRef<{x: number, y: number}[]>([]);
  const animationFrameRef = useRef<number>();
  const isVisibleRef = useRef(true);

  // Refs for smooth color interpolation
  const targetRGB = useRef({ r: 221, g: 214, b: 254 }); // Initial softest violet
  const currentRGB = useRef({ r: 221, g: 214, b: 254 });

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Rotate colors every 3 seconds to sync with header
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor(prev => {
        const idx = PASTEL_COLORS.indexOf(prev);
        const nextColor = PASTEL_COLORS[(idx + 1) % PASTEL_COLORS.length];
        targetRGB.current = hexToRgb(nextColor);
        return nextColor;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 1. Handle Visibility
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Handle Resizing and Zoom
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: 160 });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // 3. Generate Points (Text and Logo)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const width = Math.floor(dimensions.width);
    const height = Math.floor(dimensions.height);
    
    // Temporary canvas for point generation
    const tempCanvas = document.createElement('canvas');
    const canvasW = Math.floor(width * dpr);
    const canvasH = Math.floor(height * dpr);
    tempCanvas.width = canvasW;
    tempCanvas.height = canvasH;
    const tCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tCtx) return;
    tCtx.scale(dpr, dpr);

    const gap = isMobile ? 1.4 : 1.2; 

    // Get Text Points
    tCtx.clearRect(0, 0, width, height);
    tCtx.fillStyle = 'black';
    tCtx.font = `400 ${Math.min(80, width / 9)}px "Comfortaa", sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(text, width / 2, height / 2);

    const metrics = tCtx.measureText(text);
    setTextWidth(metrics.width);

    const textData = tCtx.getImageData(0, 0, canvasW, canvasH).data;
    const newTextPoints: {x: number, y: number}[] = [];
    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
        const index = (Math.floor(y * dpr) * canvasW + Math.floor(x * dpr)) * 4;
        if (textData[index + 3] > 128) {
          newTextPoints.push({ x, y });
        }
      }
    }
    textPointsRef.current = newTextPoints;

    // Initialize particles with text points immediately if they don't exist
    if (particlesRef.current.length === 0 && newTextPoints.length > 0) {
      const initParticles: Particle[] = [];
      for (let i = 0; i < newTextPoints.length; i++) {
        const pt = newTextPoints[i];
        const isColored = Math.random() < 0.4;
        initParticles.push({
          x: pt.x + (Math.random() - 0.5) * 100,
          y: pt.y + (Math.random() - 0.5) * 100,
          originX: pt.x,
          originY: pt.y,
          gray: 20 + Math.random() * 40,
          color: isColored ? PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)] : null,
          size: 1.0 + Math.random() * 1.0,
          vx: 0,
          vy: 0,
          friction: 0.95,
          ease: 0.02 + Math.random() * 0.03,
          jitterOffset: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
        });
      }
      particlesRef.current = initParticles;
    }

    // Get Logo Points
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;
    img.onload = () => {
      tCtx.clearRect(0, 0, width, height);
      const aspectRatio = img.width / img.height;
      let logoW = height * 0.8 * aspectRatio;
      let logoH = height * 0.8;
      if (logoW > width / 3.5) {
        logoW = width / 3.5;
        logoH = logoW / aspectRatio;
      }
      const logoX = (width - logoW) / 2;
      const logoY = (height - logoH) / 2;
      tCtx.drawImage(img, logoX, logoY, logoW, logoH);
      
      const logoData = tCtx.getImageData(0, 0, canvasW, canvasH).data;
      const newLogoPoints: {x: number, y: number}[] = [];
      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          const index = (Math.floor(y * dpr) * canvasW + Math.floor(x * dpr)) * 4;
          if (logoData[index + 3] > 128) {
            newLogoPoints.push({ x, y });
          }
        }
      }
      logoPointsRef.current = newLogoPoints;

      // Adjust Particles
      const maxPoints = Math.max(newTextPoints.length, newLogoPoints.length);
      if (maxPoints === 0) return;

      const currentParticles = particlesRef.current;
      const newParticles: Particle[] = [];

      for (let i = 0; i < maxPoints; i++) {
        const textP = newTextPoints.length > 0 ? newTextPoints[i % newTextPoints.length] : { x: width / 2, y: height / 2 };
        
        if (i < currentParticles.length) {
          const p = currentParticles[i];
          p.originX = textP.x;
          p.originY = textP.y;
          newParticles.push(p);
        } else {
          const isColored = Math.random() < 0.4;
          newParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            originX: textP.x,
            originY: textP.y,
            gray: 20 + Math.random() * 40, 
            color: isColored ? PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)] : null,
            size: 1.0 + Math.random() * 1.0, 
            vx: 0,
            vy: 0,
            friction: 0.95,
            ease: 0.02 + Math.random() * 0.03,
            jitterOffset: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 }
          });
        }
      }
      particlesRef.current = newParticles;
    };
  }, [text, logoUrl, dimensions]);

  // 4. Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const width = Math.floor(dimensions.width);
    const height = Math.floor(dimensions.height);
    
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const animate = () => {
      if (!isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      
      const now = Date.now();
      const timeSinceSwitch = now - lastSwitchTimeRef.current;
      const transitionDuration = customTransitionDuration || 1200; 
      const progress = Math.min(timeSinceSwitch / transitionDuration, 1);
      const transitionIntensity = Math.sin(progress * Math.PI);
      
      const textLen = textPointsRef.current.length;
      const logoLen = logoPointsRef.current.length;

      // Smoothly interpolate current RGB towards target RGB
      currentRGB.current.r += (targetRGB.current.r - currentRGB.current.r) * 0.02;
      currentRGB.current.g += (targetRGB.current.g - currentRGB.current.g) * 0.02;
      currentRGB.current.b += (targetRGB.current.b - currentRGB.current.b) * 0.02;

      particlesRef.current.forEach((p, i) => {
        const pProgress = Math.max(0, Math.min((timeSinceSwitch / transitionDuration) - (i % 80) / 80 * 0.15, 1));
        const easeProgress = pProgress < 0.5 ? 2 * pProgress * pProgress : 1 - Math.pow(-2 * pProgress + 2, 2) / 2;

        let currentTarget;
        let prevTarget;

        if (showLogo) {
          currentTarget = logoLen > 0 ? logoPointsRef.current[i % logoLen] : null;
          prevTarget = textLen > 0 ? textPointsRef.current[i % textLen] : null;
        } else {
          currentTarget = textLen > 0 ? textPointsRef.current[i % textLen] : null;
          prevTarget = logoLen > 0 ? logoPointsRef.current[i % logoLen] : null;
        }

        if (!currentTarget && !prevTarget) return;
        
        const tX = currentTarget ? currentTarget.x : (prevTarget ? prevTarget.x : width / 2);
        const tY = currentTarget ? currentTarget.y : (prevTarget ? prevTarget.y : height / 2);
        const pX = prevTarget ? prevTarget.x : (currentTarget ? currentTarget.x : width / 2);
        const pY = prevTarget ? prevTarget.y : (currentTarget ? currentTarget.y : height / 2);

        // Add organic idle movement (combination of sine waves)
        // Simplified jitter for mobile
        const jitterX = isMobile 
          ? Math.sin(now * 0.0015 + i * 0.5) * 1.5
          : Math.sin(now * 0.0015 + i * 0.5) * 1.2 + Math.sin(now * 0.003 + i) * 0.6;
        const jitterY = isMobile
          ? Math.cos(now * 0.0012 + i * 0.7) * 1.5
          : Math.cos(now * 0.0012 + i * 0.7) * 1.2 + Math.cos(now * 0.0025 + i) * 0.6;

        const targetX = pX + (tX - pX) * easeProgress + jitterX;
        const targetY = pY + (tY - pY) * easeProgress + jitterY;

        const dx = targetX - p.x;
        const dy = targetY - p.y;

        let fleeX = 0;
        let fleeY = 0;
        if (isMouseInRef.current && !isMobile) {
          const mdx = p.x - mousePosRef.current.x;
          const mdy = p.y - mousePosRef.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 80) {
            const force = (80 - mdist) * 0.15;
            fleeX = (mdx / (mdist || 1)) * force;
            fleeY = (mdy / (mdist || 1)) * force;
          }
        }

        p.vx += dx * p.ease + fleeX;
        p.vy += dy * p.ease + fleeY;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = 0.8 - transitionIntensity * 0.4;
        
        if (p.color) {
          // Boost opacity for colored particles to make them more visible
          const coloredAlpha = Math.min(1, alpha + 0.2);
          ctx.fillStyle = `rgba(${Math.round(currentRGB.current.r)}, ${Math.round(currentRGB.current.g)}, ${Math.round(currentRGB.current.b)}, ${coloredAlpha})`;
          // Slightly larger size for colored particles to make them pop
          const coloredSize = p.size * 1.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, coloredSize / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${p.gray}, ${p.gray}, ${p.gray}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [dimensions, showLogo]); 

  const handleMouseEnter = () => {
    isMouseInRef.current = true;
    setShowLogo(!showLogo);
    lastSwitchTimeRef.current = Date.now();
  };

  const handleMouseLeave = () => {
    isMouseInRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;
    const newX = (e.clientX - rect.left) * scaleX;
    const newY = (e.clientY - rect.top) * scaleY;
    mousePosRef.current = { x: newX, y: newY };
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-visible flex justify-center w-full", className)}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto pointer-events-none"
        style={{ filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.08))' }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
        style={{ 
          width: `${Math.max(200, textWidth + 40)}px`, 
          height: '100px', 
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};
