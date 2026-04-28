import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';

export const BookingForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    if (!formData.get('name')) newErrors.name = 'Introduce tu nombre';
    if (!formData.get('phone')) newErrors.phone = 'Teléfono necesario';
    if (!formData.get('email')) {
      newErrors.email = 'Email necesario';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('email') as string)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.get('business_name')) newErrors.business_name = 'Nombre necesario';
    if (!selectedTime) newErrors.contact_preference = 'Selecciona horario';
    if (!formData.get('activity')) newErrors.activity = 'Cuéntanos tu actividad';
    return newErrors;
  };

  const ErrorMessage = ({ message }: { message: string }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-1.5 mt-1 ml-1"
    >
      <div className="w-1 h-1 rounded-full bg-red-500" />
      <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest leading-none">{message}</p>
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('contact_preference', selectedTime);
    
    const newErrors = validate(formData);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus('submitting');
    
    try {
      const response = await fetch('https://formspree.io/f/xeevykoo', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok || data.ok) {
        setStatus('success');
        e.currentTarget.reset();
        setSelectedTime('');
      } else {
        console.error('Formspree error:', data);
        setStatus('error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
    }
  };

  const timeOptions = ["8:00 a 14:00", "14:00 a 20:00"];

  return (
    <div className="w-full mb-8">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="open-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="w-full py-6 rounded-3xl bg-black text-white font-bold tracking-[0.2em] uppercase text-sm shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Asesoría acústica gratuita
          </motion.button>
        ) : (
          <motion.div
            key="form-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="relative p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-2xl space-y-6 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 rounded-bl-[5rem] -mr-8 -mt-8 pointer-events-none" />

            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 opacity-40" />
            </button>

            <div className="space-y-1 relative z-10">
              <h4 className="text-xl font-bold uppercase tracking-tight">Asesoría acústica gratuita</h4>
              <p className="text-xs text-black/40 font-medium uppercase tracking-widest text-[10px]">Compártenos los detalles de tu espacio</p>
            </div>

            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-xl font-bold uppercase tracking-tight">¡Solicitud enviada!</p>
                <p className="text-sm text-black/50 max-w-[280px]">Hemos recibido tus datos correctamente. Nos pondremos en contacto contigo pronto.</p>
                <button 
                  onClick={() => { setIsOpen(false); setStatus('idle'); }}
                  className="mt-4 px-10 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95"
                >
                  Cerrar
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Nombre</label>
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                      className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm outline-none ${errors.name ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                      onChange={() => setErrors(prev => ({...prev, name: ''}))}
                    />
                    {errors.name && <ErrorMessage message={errors.name} />}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Teléfono</label>
                    <input 
                      name="phone" 
                      type="tel" 
                      placeholder="Tu número de contacto"
                      autoComplete="tel"
                      className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm outline-none ${errors.phone ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                      onChange={() => setErrors(prev => ({...prev, phone: ''}))}
                    />
                    {errors.phone && <ErrorMessage message={errors.phone} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm outline-none ${errors.email ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                    onChange={() => setErrors(prev => ({...prev, email: ''}))}
                  />
                  {errors.email && <ErrorMessage message={errors.email} />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">Nombre de tu local</label>
                    <input 
                      name="business_name" 
                      type="text" 
                      placeholder="¿Cómo se llama tu espacio?"
                      className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm outline-none ${errors.business_name ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                      onChange={() => setErrors(prev => ({...prev, business_name: ''}))}
                    />
                    {errors.business_name && <ErrorMessage message={errors.business_name} />}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">¿Cuándo contactamos?</label>
                    <div className="relative" ref={selectRef}>
                      <button
                        type="button"
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm flex items-center justify-between text-left outline-none ${errors.contact_preference ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                      >
                        <span className={selectedTime ? 'text-black font-medium' : 'text-black/30'}>
                          {selectedTime || 'Horario'}
                        </span>
                        <ChevronDown className={`w-4 h-4 opacity-40 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isSelectOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute left-0 right-0 top-full z-[100] bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden py-1"
                          >
                            {timeOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(option);
                                  setIsSelectOpen(false);
                                  setErrors(prev => ({...prev, contact_preference: ''}));
                                }}
                                className="w-full px-5 py-3 text-left text-sm hover:bg-black/5 transition-colors font-medium text-black/70 hover:text-black"
                              >
                                {option}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {errors.contact_preference && <ErrorMessage message={errors.contact_preference} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 ml-1">¿A qué os dedicáis?</label>
                  <textarea 
                    name="activity" 
                    rows={3}
                    placeholder="Describe brevemente vuestra actividad..."
                    className={`w-full px-5 py-3 rounded-2xl bg-black/5 border transition-all text-sm outline-none resize-none ${errors.activity ? 'border-red-500/50 bg-red-50/30' : 'border-transparent focus:border-black/10 focus:bg-white'}`}
                    onChange={() => setErrors(prev => ({...prev, activity: ''}))}
                  />
                  {errors.activity && <ErrorMessage message={errors.activity} />}
                </div>

                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 font-medium">Hubo un error al enviar. Por favor, revisa los campos o inténtalo de nuevo.</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: status === 'submitting' ? 1 : 1.02 }}
                  whileTap={{ scale: status === 'submitting' ? 1 : 0.98 }}
                  disabled={status === 'submitting'}
                  className="w-full py-5 rounded-2xl bg-black text-white font-bold tracking-[0.2em] uppercase text-[10px] flex items-center justify-center gap-3 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                  {status === 'submitting' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando solicitud...</span>
                    </div>
                  ) : (
                    <>
                      <span>Enviar solicitud</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
