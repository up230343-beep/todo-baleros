import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, Package, Loader2, X, Settings2, Ruler, ChevronRight } from "lucide-react"; 
import { categories } from "@/data/bearings";
import CategoryCard from "@/components/CategoryCard";
import QuoteModal from "@/components/QuoteModal";
import { useSEO } from "@/hooks/useSEO";

const appleEase = [0.22, 1, 0.36, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: appleEase } },
};

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useSEO({
    title: "TODO BALEROS — Catálogo de Rodamientos Industriales",
    description: "Distribuidora de rodamientos y baleros de precisión. Más de 2,000 SKUs: rígidos de bolas, rodillos cilíndricos, cónicos, autoalineables. Cotiza por WhatsApp.",
    keywords: "baleros, rodamientos, rodamientos industriales, bearings México, distribuidor rodamientos",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [baleroSeleccionado, setBaleroSeleccionado] = useState<any>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteBalero, setQuoteBalero] = useState<any>(null);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['buscarBaleros', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const res = await fetch(`/api/baleros/buscar?q=${searchTerm}`);
      if (!res.ok) throw new Error('Error en la red');
      return res.json();
    },
    enabled: searchTerm.length >= 2,
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      
      {/* 1. SECCIÓN HERO (Fondo oscuro con degradado Navy) */}
      <section ref={heroRef} className="relative z-30 pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-[#0a0a0b] min-h-[85vh] flex flex-col justify-center">
        {/* Destello sutil azul marino en el fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-[1000px] h-[300px] sm:h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e2b4d]/40 via-[#0a0a0b] to-transparent pointer-events-none"></div>

        <motion.div
          style={{ opacity, scale, y }}
          className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10 origin-top"
        >
          {/* BARRA DE BÚSQUEDA — ARRIBA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: appleEase }}
            className="w-full max-w-2xl relative mb-14"
          >
            <div className="relative flex items-center bg-[#1d1d1f] border border-white/20 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1e2b4d] focus-within:border-transparent transition-all">
              <Search className="absolute left-5 w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                placeholder="Busca un SKU (Ej. 6204) o medida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // TEXTO BLANCO PURO PARA MÁXIMO CONTRASTE
                className="w-full pl-14 pr-12 py-5 bg-transparent text-white placeholder:text-gray-400 text-lg font-medium focus:outline-none"
              />
              {isLoading && <Loader2 className="absolute right-5 w-6 h-6 text-[#1e2b4d] animate-spin" />}
            </div>

            {/* CAJA DE RESULTADOS ESTILO INDUSTRIAL */}
            <AnimatePresence>
              {searchTerm.length >= 2 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-3 bg-[#1d1d1f] border border-white/10 rounded-2xl py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 max-h-[400px] overflow-y-auto scrollbar-thin text-left"
                >
                  {searchResults && searchResults.length > 0 ? (
                    <>
                      <div className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">
                        Resultados en Inventario ({searchResults.length})
                      </div>
                      {searchResults.map((balero: any) => (
                        <div
                          key={balero._id}
                          onClick={() => {
                            setBaleroSeleccionado(balero);
                            setSearchTerm("");
                          }}
                          className="flex items-center justify-between px-5 py-4 hover:bg-[#1e2b4d]/40 cursor-pointer transition-colors border-l-4 border-transparent hover:border-[#4a63a8] group"
                        >
                          <div className="flex flex-col">
                            <span className="text-white font-black text-xl leading-none mb-1 group-hover:text-white transition-colors">
                              {balero.sku}
                            </span>
                            <span className="text-gray-400 text-sm font-medium">
                              d: {balero.d}mm | D: {balero.D}mm | B: {balero.B}mm
                            </span>
                          </div>
                          <span className="px-3 py-1.5 rounded-md bg-white/10 text-[10px] font-bold tracking-widest text-gray-300 uppercase">
                            {balero.category}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Sin resultados</p>
                      <p className="text-xs text-gray-600">No encontramos "{searchTerm}" en el inventario</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* BADGE + TÍTULO + SUBTÍTULO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: appleEase }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-300 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-[#1e2b4d] animate-pulse"></span>
            Catálogo TODO BALEROS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25, ease: appleEase }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05]"
          >
            Precisión que <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
              mueve la industria.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease: appleEase }}
            className="mt-6 max-w-2xl text-xl md:text-2xl font-medium tracking-tight text-gray-400"
          >
            Distribución de rodamientos de la más alta exigencia para operaciones críticas.
          </motion.p>

          {/* CTA WHATSAPP */}
          <motion.a
            href="https://wa.me/524493538160?text=Hola%20TODO%20BALEROS%2C%20me%20interesa%20cotizar%20rodamientos."
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: appleEase }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-10 inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.3)] transition-colors text-sm uppercase tracking-widest"
          >
            {/* WhatsApp SVG icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Cotizar por WhatsApp
          </motion.a>

        </motion.div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </section>

{/* 2. SECCIÓN DE CATEGORÍAS (Multi-Carrusel con Estilo Premium) */}
<section className="px-6 py-24 relative z-20 bg-[#f5f5f7] overflow-hidden">
  
  {/* CSS Personalizado para la barra (Ponlo dentro del componente o en tu index.css) */}
  <style>{`
    .custom-scrollbar::-webkit-scrollbar {
      height: 4px; /* Súper delgada */
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #e5e7eb; /* Gris muy claro */
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #1e2b4d; /* Tu Azul Navy */
      border-radius: 10px;
      transition: all 0.3s;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }
    /* Ocultar flechas predeterminadas de scroll en algunos navegadores */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `}</style>

  <div className="max-w-7xl mx-auto">
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="mb-16 px-2 flex flex-col md:flex-row md:items-end justify-between gap-6"
    >
      <div>
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1d1d1f]">Catálogo Industrial.</h2>
        <p className="text-lg md:text-xl font-medium text-[#86868b] mt-4">Navega por familias de productos especializadas.</p>
      </div>
    </motion.div>

    <div className="space-y-24"> 

      {/* --- BLOQUE GENERADOR DE FILAS --- */}
      {[
        { title: "Tecnología de Bolas", data: categories.slice(0, 5) },
        { title: "Alta Carga y Rodillos", data: categories.slice(5, 8) },
        { title: "Especialidades y Soportes", data: categories.slice(8, 13) }
      ].map((row, idx) => (
        <div key={idx} className="group relative">
          
          {/* Etiqueta de Fila */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-5 w-1.5 bg-[#1e2b4d]"></div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
              {row.title}
            </h3>
          </div>

          {/* CONTENEDOR DEL CARRUSEL */}
          <div className="relative">
            <div 
              className="flex overflow-x-auto gap-8 pb-10 custom-scrollbar snap-x snap-mandatory"
            >
              {row.data.map((cat, i) => (
                <div key={cat.id} className="min-w-[260px] sm:min-w-[320px] md:min-w-[480px] snap-start first:ml-2 last:mr-10">
                  <CategoryCard category={cat} index={i} />
                </div>
              ))}
            </div>

            {/* Sombra de desvanecimiento para indicar que hay más (Solo Desktop) */}
            <div className="absolute top-0 right-0 h-[calc(100%-40px)] w-32 bg-gradient-to-l from-[#f5f5f7] to-transparent pointer-events-none z-10 hidden md:block"></div>
          </div>
        </div>
      ))}

    </div>
  </div>
</section>
{/* ========================================================= */}
{/* ========================================================= */}
<AnimatePresence>
  {baleroSeleccionado && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0b]/90 backdrop-blur-sm px-4"
      onClick={() => setBaleroSeleccionado(null)}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: appleEase }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-sm shadow-2xl overflow-hidden relative" // Esquinas casi rectas (estilo industrial)
      >
        {/* Cabecera Técnica */}
        <div className="bg-[#1e2b4d] p-8 text-white relative">
          <button 
            onClick={() => setBaleroSeleccionado(null)} 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/80">Especificación Técnica</span>
            <h2 className="text-5xl font-black tracking-tighter leading-none">
              {baleroSeleccionado.sku}
            </h2>
            <p className="text-sm font-medium text-white/70 mt-2 uppercase tracking-wider italic">
              {baleroSeleccionado.category}
            </p>
          </div>
        </div>

        {/* Cuerpo de la Ficha (Estilo Tabla Industrial) */}
        <div className="p-0"> 
          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-gray-100">
            
            {/* Bloque Dimensiones */}
            <div className="p-8">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#1e2b4d]"></div> Dimensiones Nominales
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Interior (d)</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.d} mm</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Exterior (D)</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.D} mm</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Ancho (B)</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.B} mm</span>
                </div>
              </div>
            </div>

            {/* Bloque Desempeño */}
            <div className="p-8 bg-gray-50/50">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#1e2b4d]"></div> Límites Operativos
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Vel. Grasa</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.velocity_grease?.toLocaleString() || 'N/A'} RPM</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Vel. Aceite</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.velocity_oil?.toLocaleString() || 'N/A'} RPM</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500 font-medium">Masa (Peso)</span>
                  <span className="text-sm font-bold text-gray-900">{baleroSeleccionado.weight || 'N/A'} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de Acción */}
        <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Status</p>
            <p className="text-green-600 text-xs font-bold mt-1">✓ Disponible en Stock</p>
          </div>
          <button 
            onClick={() => {
                setQuoteBalero(baleroSeleccionado);
                setBaleroSeleccionado(null);
                setIsQuoteOpen(true);
              }}
            className="w-full sm:w-auto bg-[#1e2b4d] hover:bg-[#151f38] text-white px-10 py-4 font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Solicitar Cotización <ChevronRight size={14} />
          </button>
        </div>

      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {quoteBalero && (
        <QuoteModal
          bearings={[quoteBalero]}
          open={isQuoteOpen}
          onClose={() => { setIsQuoteOpen(false); setQuoteBalero(null); }}
          categoryId={quoteBalero.category}
        />
      )}
    </div>
  );
}