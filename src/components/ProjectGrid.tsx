import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'motion/react';
import { GalleryItem } from './ui/circular-gallery';

interface ProjectGridProps {
  items: GalleryItem[];
}

const ProjectItem: React.FC<{ item: GalleryItem }> = ({ item }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center", "end start"]
  });

  // Scale effect: subtle peak in the center
  const scale = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.85, 1.02, 0.85]);
  const springScale = useSpring(scale, { stiffness: 150, damping: 25 });

  // Opacity effect: subtle fade at edges
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.7, 1, 0.7]);

  return (
    <motion.div
      ref={ref}
      style={{ 
        scale: springScale,
        opacity,
        willChange: 'transform, opacity'
      }}
      className={`relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-black/5 bg-white/50 backdrop-blur-sm group transition-[filter] duration-700 ${isInView ? 'grayscale-0' : 'grayscale hover:grayscale-0'}`}
    >
      <img
        src={item.photo.url}
        alt={item.photo.text}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        style={{ imageRendering: 'auto' }}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 transition-opacity duration-500 ${isInView ? 'opacity-100' : 'opacity-0 md:opacity-0 md:group-hover:opacity-100'}`}>
        <h3 className={`text-white text-xl font-display font-bold transition-transform duration-500 ${isInView ? 'translate-y-0' : 'translate-y-4 md:translate-y-4 md:group-hover:translate-y-0'}`}>
          {item.common}
        </h3>
        <p className={`text-white/70 text-sm italic font-sans transition-transform duration-500 delay-75 ${isInView ? 'translate-y-0' : 'translate-y-4 md:translate-y-4 md:group-hover:translate-y-0'}`}>
          {item.binomial}
        </p>
      </div>
    </motion.div>
  );
};

export const ProjectGrid: React.FC<ProjectGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 pb-12">
      {items.map((item, index) => (
        <ProjectItem key={item.photo.url + index} item={item} />
      ))}
    </div>
  );
};
