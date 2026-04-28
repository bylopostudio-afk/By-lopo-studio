import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone } from 'lucide-react';
import { BookingForm } from './BookingForm';

export const ContactInfo: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 md:p-12 rounded-[3rem] bg-white/40 backdrop-blur-2xl border border-white/20 shadow-xl space-y-8 text-center"
      >
        <div className="space-y-4">
          <h3 className="text-3xl font-bold tracking-tight text-black uppercase">Hablemos</h3>
          <p className="text-black/60 font-light leading-relaxed max-w-xl mx-auto">
            Estamos listos para transformar tu espacio. Cuéntanos tu visión y nosotros nos encargamos de la acústica y el diseño.
          </p>
        </div>

        {/* Booking Form Integration */}
        <BookingForm />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <a 
            href="mailto:proyectos@bylopo.es" 
            className="flex flex-col items-center gap-4 group p-8 rounded-3xl bg-white/50 hover:bg-white/80 transition-all duration-500 border border-black/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1">Email</p>
              <p className="text-lg font-medium text-black">proyectos@bylopo.es</p>
            </div>
          </a>

          <a 
            href="tel:+34630557425" 
            className="flex flex-col items-center gap-4 group p-8 rounded-3xl bg-white/50 hover:bg-white/80 transition-all duration-500 border border-black/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold mb-1">Teléfono</p>
              <p className="text-lg font-medium text-black">+34 630 557 425</p>
            </div>
          </a>
        </div>

        {/* Decorative Bubble */}
        <div className="pt-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-full bg-black/5 border border-black/5 inline-flex items-center gap-3 px-8"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/60">Disponibles para nuevos proyectos</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
