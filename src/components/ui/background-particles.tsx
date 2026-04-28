import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  gray: number;
  alpha: number;
  mouseFollowTime: number;
}

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.2 : 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initParticles();
    };

    const initParticles = () => {
      const isMobile = window.innerWidth < 768;
      const density = isMobile ? 40000 : 12000;
      const particleCount = Math.floor((window.innerWidth * window.innerHeight) / density);
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        particlesRef.current.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 0.5 + Math.random() * 1.2,
          gray: 160 + Math.random() * 40,
          alpha: 0.1 + Math.random() * 0.2,
          mouseFollowTime: 0
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let animationFrame: number;
    const animate = () => {
      if (!isVisibleRef.current) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const time = Date.now() * 0.001;

      const isMobile = window.innerWidth < 768;

      particlesRef.current.forEach(p => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const distSq = dx * dx + dy * dy;
        const radius = isMobile ? 80 : 150;
        const radiusSq = radius * radius;

        if (distSq < radiusSq && !isMobile) {
          p.mouseFollowTime = 180; // Follow for ~3 seconds at 60fps
        }

        if (p.mouseFollowTime > 0 && !isMobile) {
          // Follow mouse
          const dist = Math.sqrt(distSq);
          if (dist > 5) {
            p.vx += (dx / dist) * 0.5;
            p.vy += (dy / dist) * 0.5;
          }
          p.mouseFollowTime--;
        } else {
          // Return to base
          p.vx += (p.baseX - p.x) * 0.01;
          p.vy += (p.baseY - p.y) * 0.01;
        }

        // Murmuration / Idle movement - Bird-like random steering
        const jitter = isMobile ? 0.04 : 0.08;
        p.vx += (Math.random() - 0.5) * jitter;
        p.vy += (Math.random() - 0.5) * jitter;
        
        // Keep them moving
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq < 0.04) { // 0.2 * 0.2
          p.vx *= 1.1;
          p.vy *= 1.1;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen
        if (p.x < 0) p.x = window.innerWidth;
        else if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        else if (p.y > window.innerHeight) p.y = 0;
        
        ctx.fillStyle = `rgba(${p.gray}, ${p.gray}, ${p.gray}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
};
