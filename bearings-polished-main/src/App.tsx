import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 1. CREAMOS EL ENVOLTORIO DE TRANSICIÓN "ESTILO APPLE"
// Puedes envolver cualquier componente con esto para que entre y salga suavemente.
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} // Entra ligeramente desde abajo
      animate={{ opacity: 1, y: 0 }}  // Se estabiliza en su lugar
      exit={{ opacity: 0, y: -15 }}   // Sale suavemente hacia arriba
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Curva de aceleración fluida
    >
      {children}
    </motion.div>
  );
};

// 2. EXTRAEMOS LAS RUTAS PARA PODER LEER EL CAMBIO DE URL
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    // AnimatePresence "espera" (mode="wait") a que la página actual termine de salir 
    // antes de dejar entrar a la nueva, evitando que se empalmen.
    <AnimatePresence mode="wait">
      {/* La prop 'key' es obligatoria para que Framer detecte el cambio de ruta */}
      <Routes location={location} key={location.pathname}>
        <Route element={<Layout />}>
          
          <Route path="/" element={
            <PageTransition>
              <Index />
            </PageTransition>
          } />
          
          <Route path="/category/:categoryId" element={
            <PageTransition>
              <CategoryPage />
            </PageTransition>
          } />
          
          <Route path="/category/:categoryId/:subcategoryId" element={
            <PageTransition>
              <CategoryPage />
            </PageTransition>
          } />

        </Route>
        
        {/* El 404 también merece una entrada elegante */}
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
        
      </Routes>
    </AnimatePresence>
  );
};

// 3. TU COMPONENTE APP PRINCIPAL (Limpio y estructurado)
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;