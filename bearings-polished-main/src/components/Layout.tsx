import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Phone, Mail, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/data/bearings"; 
// 1. IMPORTAMOS TU AGENTE DE IA
import AIAgent from "@/components/AIAgent"; 

export default function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = isScrolled || !isHome || isMobileMenuOpen || isMegaMenuOpen;
  
  const navClasses = isSolid
    ? "bg-white/95 backdrop-blur-md border-b border-gray-200 text-[#1d1d1f]"
    : "bg-transparent border-transparent text-white";

  const logoColor = isSolid ? "text-[#1d1d1f]" : "text-white";
  // Cambiamos el hover a Azul Navy corporativo
  const linkColor = isSolid ? "text-gray-600 hover:text-[#1e2b4d]" : "text-gray-300 hover:text-white";

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      
      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClasses}`}>
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          
          {/* LOGO TODO BALEROS */}
          <Link to="/" className="flex items-center gap-2 relative z-50">
            <span className={`font-display text-2xl tracking-tighter transition-colors flex gap-1.5`}>
              <span className={`font-black ${isSolid ? 'text-[#1e2b4d]' : 'text-white'}`}>TODO</span>
              <span className={`font-bold ${isSolid ? 'text-gray-400' : 'text-gray-300'}`}>BALEROS</span>
            </span>
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <Link to="/" className={`text-sm font-semibold transition-colors ${linkColor}`}>
              Inicio
            </Link>
            
            {/* Mega Menú */}
            <div 
              className="h-full flex items-center"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className={`flex items-center gap-1 text-sm font-semibold transition-colors ${linkColor}`}>
                Catálogo <ChevronDown size={14} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl shadow-black/5 overflow-hidden"
                  >
                    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-4 gap-8">
                      {categories.map((cat) => (
                        <div key={cat.id} className="space-y-4">
                          <Link 
                            to={`/category/${cat.id}`}
                            className="block font-bold text-gray-900 hover:text-[#1e2b4d] transition-colors"
                          >
                            {cat.name}
                          </Link>
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                            {cat.series}
                          </div>
                          <ul className="space-y-3">
                            {cat.subcategories ? (
                              cat.subcategories.map(sub => (
                                <li key={sub.id}>
                                  <Link to={`/category/${cat.id}/${sub.id}`} className="text-sm text-gray-500 hover:text-[#1e2b4d] transition-colors block font-medium">
                                    {sub.name}
                                  </Link>
                                </li>
                              ))
                            ) : (
                              <li>
                                <Link to={`/category/${cat.id}`} className="text-sm text-gray-500 hover:text-[#1e2b4d] flex items-center gap-1 transition-colors font-medium">
                                  Ver especificaciones <ChevronRight size={14} />
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="mailto:juanorozco1208@gmail.com"
              className={`text-sm font-semibold transition-colors ${linkColor} hover:text-[#1e2b4d]`}
            >
              Contacto
            </a>
          </nav>

          <button 
            className={`md:hidden relative z-50 p-2 -mr-2 transition-colors ${logoColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* --- MENÚ MOBILE --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 text-2xl font-bold tracking-tight text-[#1d1d1f]">
              <Link to="/">Inicio</Link>
              <div>
                <button 
                  onClick={() => setMobileCatalogOpen(!mobileCatalogOpen)}
                  className="flex items-center justify-between w-full text-left"
                >
                  Catálogo
                  <ChevronDown size={24} className={`transition-transform duration-300 ${mobileCatalogOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {mobileCatalogOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pt-4 pb-2 space-y-4 pl-4 border-l-2 border-gray-100 ml-2">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <Link to={`/category/${cat.id}`} className="text-lg font-medium text-gray-600 hover:text-[#1e2b4d] block">
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <a href="mailto:juanorozco1208@gmail.com">Contacto</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT --- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-200 bg-white text-[#1d1d1f]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="font-display text-2xl tracking-tighter mb-4 flex gap-1.5">
                <span className="font-black text-[#1e2b4d]">TODO</span>
                <span className="font-bold text-gray-400">BALEROS</span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                Distribución de rodamientos industriales de precisión. Soluciones de alta ingeniería para el mercado B2B.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-gray-400">Familias de Producto</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-600">
                <li><Link to="/category/deep-groove" className="hover:text-[#1e2b4d] transition-colors">Rígidos de Bolas</Link></li>
                <li><Link to="/category/centering" className="hover:text-[#1e2b4d] transition-colors">Bolas Autocentrantes</Link></li>
                <li><Link to="/category/self-aligning" className="hover:text-[#1e2b4d] transition-colors">Bolas a Rótula</Link></li>
                <li><Link to="/category/cylindrical-roller" className="hover:text-[#1e2b4d] transition-colors">Rodillos Cilíndricos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-gray-400">Portal B2B</h4>
              <div className="space-y-4 text-sm font-medium text-gray-600">
                <a href="mailto:juanorozco1208@gmail.com" className="flex items-center gap-3 hover:text-[#1e2b4d] transition-colors">
                  <Mail className="h-5 w-5 text-gray-400" /> Ventas Industriales
                </a>
                <a href="https://wa.me/524493538160" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#1e2b4d] transition-colors">
                  <Phone className="h-5 w-5 text-gray-400" /> WhatsApp +52 449 353 8160
                </a>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-100 pt-8 text-center flex flex-col md:flex-row justify-between items-center text-xs font-semibold text-gray-400">
            <span>© {new Date().getFullYear()} TODO BALEROS.</span>
            <span className="mt-2 md:mt-0">Precisión en movimiento.</span>
          </div>
        </div>
      </footer>

      {/* --- 2. EL AGENTE DE IA (Aparecerá en todas las páginas) --- */}
      <AIAgent />

    </div>
  );
}