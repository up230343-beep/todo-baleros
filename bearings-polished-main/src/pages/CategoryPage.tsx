import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Settings2, Loader2, PackageOpen, X } from "lucide-react";
import BearingDisassembly from "@/components/BearingDisassembly";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { getCategoryById, type Bearing } from "@/data/bearings";
import QuoteModal from "@/components/QuoteModal";
import { useSEO } from "@/hooks/useSEO";

const PAGE_SIZE = 50;

const appleEase = [0.22, 1, 0.36, 1];

export default function CategoryPage() {
  const { categoryId, subcategoryId } = useParams();
  const category = getCategoryById(categoryId || "");

  useSEO({
    title: category ? `${category.name} — Rodamientos` : "Catálogo",
    description: category
      ? `Catálogo técnico de ${category.name}. Consulta dimensiones, velocidades y especificaciones. Cotiza por WhatsApp.`
      : "Catálogo de rodamientos industriales.",
    keywords: category ? `${category.name}, ${category.series || ""}, baleros, rodamientos` : "",
  });

  // --- ESTADOS ---
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dRange, setDRange] = useState<[number, number]>([0, 500]);
  const [baleroParaFicha, setBaleroParaFicha] = useState<Bearing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // =========================================================
  // PAGINACIÓN INFINITA
  // =========================================================
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['balerosCategoria', categoryId, dRange],
    queryFn: async ({ pageParam = 1 }) => {
      if (!category) return [];
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_SIZE),
        d_min: String(dRange[0]),
        d_max: String(dRange[1]),
      });
      const res = await fetch(
        `/api/baleros/categoria/${encodeURIComponent(category.dbCategory)}?${params}`
      );
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!category,
  });

  const allBearings: any[] = useMemo(
    () => data?.pages.flat() ?? [],
    [data]
  );

  const filtered = useMemo(() => {
    return allBearings.filter((b: any) =>
      b.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [allBearings, search]);

  // Auto-carga la siguiente página cuando el sentinel entra en pantalla
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  // --- LÓGICA DE INTERFAZ ---
  const handleOpenFicha = (bearing: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setBaleroParaFicha(bearing);
    setIsModalOpen(true);
  };

  if (!category) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb Profesional */}
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-10">
          <Link to="/" className="hover:text-[#1e2b4d] transition-colors">Catálogo</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900">{category.shortName}</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#1d1d1f]">
            {category.name}
          </h1>
          <p className="mt-4 text-lg text-[#86868b] max-w-2xl font-medium">
            {category.description}
          </p>
        </motion.div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-visible relative z-10">
          
          {/* Barra de Herramientas Estilo Industrial */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder={`Buscar SKU en ${category.shortName}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1e2b4d] transition-all"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border ${showFilters ? 'bg-[#1e2b4d] text-white border-[#1e2b4d]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              <Settings2 size={16} /> Filtros Técnicos
            </button>
          </div>

          {/* Panel de Filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50 border-b border-gray-100">
                <div className="p-8 max-w-xl">
                  <label className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                    <span>Diámetro Interior (d)</span>
                    <span className="text-[#1e2b4d] font-bold bg-white px-2 py-1 rounded border border-gray-200">{dRange[0]}mm – {dRange[1]}mm</span>
                  </label>
                  <Slider min={0} max={500} step={1} value={dRange} onValueChange={(v) => setDRange(v as [number, number])} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabla de Datos Técnicos */}
          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-[#1e2b4d] animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando con Base de Datos...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                  <span className="text-2xl">⚠</span>
                </div>
                <div>
                  <p className="text-sm font-black text-gray-700 uppercase tracking-widest mb-1">No se pudo conectar al servidor</p>
                  <p className="text-xs text-gray-400 font-medium">Verifica la conexión con el servidor</p>
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* Vista desktop: tabla */}
                <table className="hidden md:table w-full text-sm text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Modelo SKU</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">d (int)</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">D (ext)</th>
                      <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">B (ancho)</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((bearing: any) => (
                      <tr key={bearing.sku} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 font-black text-[#1d1d1f] text-base group-hover:text-[#1e2b4d]">{bearing.sku}</td>
                        <td className="px-6 py-5 text-right font-bold text-gray-600">{bearing.d}mm</td>
                        <td className="px-6 py-5 text-right font-bold text-gray-600">{bearing.D}mm</td>
                        <td className="px-6 py-5 text-right font-bold text-gray-600">{bearing.B}mm</td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={(e) => handleOpenFicha(bearing, e)}
                            className="px-5 py-2 bg-white border border-gray-200 text-[#1e2b4d] text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-[#1e2b4d] hover:text-white transition-all"
                          >
                            Ver Ficha Técnica
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Vista móvil: cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filtered.map((bearing: any) => (
                    <div key={bearing.sku} className="flex items-center justify-between px-4 py-4 bg-white hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-black text-[#1d1d1f] text-base leading-none mb-1">{bearing.sku}</p>
                        <p className="text-xs text-gray-500 font-medium">
                          d {bearing.d}mm &middot; D {bearing.D}mm &middot; B {bearing.B}mm
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleOpenFicha(bearing, e)}
                        className="ml-3 flex-shrink-0 px-4 py-2.5 bg-[#1e2b4d] text-white text-[10px] font-black uppercase tracking-widest rounded-sm"
                      >
                        Ver Ficha
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">No se encontraron registros en esta serie</p>
              </div>
            )}

            {/* Sentinel para scroll infinito */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loader de página siguiente */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-50">
                <Loader2 className="w-4 h-4 text-[#1e2b4d] animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cargando más...</p>
              </div>
            )}

            {/* Fin de resultados */}
            {!hasNextPage && allBearings.length > 0 && !isLoading && (
              <div className="flex items-center justify-center py-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {allBearings.length} registros en total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUOTE MODAL */}
      {baleroParaFicha && (
        <QuoteModal
          bearings={[baleroParaFicha]}
          open={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          categoryId={category.id}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL DE FICHA TÉCNICA (Diseño de Ingeniería)             */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isModalOpen && baleroParaFicha && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0b]/90 backdrop-blur-sm px-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: appleEase }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 text-gray-400 hover:text-[#1e2b4d] transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="grid md:grid-cols-[1.5fr,2fr] divide-x divide-gray-100">
                
                {/* Columna Izquierda: ANIMACIÓN */}
                <div className="p-10 flex flex-col items-center justify-center bg-gray-50/50 relative overflow-hidden">
                  <div className="absolute top-10 left-10 px-3 py-1 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 z-10">
                    Vista Técnica
                  </div>

                  {/* Animación de des-ensamble */}
                  <div className="w-full aspect-square max-w-[280px]">
                    <BearingDisassembly
                      categoryId={category.id}
                      playing={true}
                    />
                  </div>

                  {/* SKU + categoría */}
                  <div className="mt-6 text-center space-y-1">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">
                      {baleroParaFicha.sku}
                    </p>
                    <p className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">
                      {category.shortName}
                    </p>
                  </div>

                  {/* Dimensiones d / D / B como mini-diagrama de texto */}
                  <div className="mt-6 w-full grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "d", value: `${baleroParaFicha.d}`, unit: "mm" },
                      { label: "D", value: `${baleroParaFicha.D}`, unit: "mm" },
                      { label: "B", value: `${baleroParaFicha.B}`, unit: "mm" },
                    ].map(({ label, value, unit }) => (
                      <div key={label} className="bg-white border border-gray-100 rounded-sm py-3 px-2 shadow-sm">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                        <p className="text-xl font-black text-[#1e2b4d] leading-none mt-1">{value}</p>
                        <p className="text-[9px] text-gray-300 font-bold">{unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna Derecha: DATOS */}
                <div className="p-0">
                  <div className="bg-[#1e2b4d] p-10 text-white">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/80">Rodamiento de Precisión</span>
                    <h2 className="text-6xl font-black tracking-tighter leading-none mt-2">{baleroParaFicha.sku}</h2>
                    <p className="text-sm font-medium text-white/70 mt-4 uppercase tracking-wider italic">{category.name}</p>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                    <div className="p-8">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#1e2b4d]"></div> Dimensiones Nominales
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Interior (d)</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.d} mm</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Exterior (D)</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.D} mm</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Ancho (B)</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.B} mm</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-gray-50/50">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#1e2b4d]"></div> Límites Operativos
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Vel. Grasa</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.velocity_grease?.toLocaleString() || 'N/A'} RPM</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Vel. Aceite</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.velocity_oil?.toLocaleString() || 'N/A'} RPM</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                          <span className="text-sm text-gray-500 font-medium">Masa (Peso)</span>
                          <span className="text-sm font-bold text-gray-900">{baleroParaFicha.weight || 'N/A'} kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-white border-t border-gray-100 flex items-center justify-end">
                    <button 
                      onClick={() => { setIsModalOpen(false); setIsQuoteOpen(true); }}
                      className="w-full sm:w-auto bg-[#1e2b4d] hover:bg-[#151f38] text-white px-10 py-5 font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
                    >
                      Iniciar Cotización Técnica <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}