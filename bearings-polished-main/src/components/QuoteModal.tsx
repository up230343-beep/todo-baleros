import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Bearing } from "@/data/bearings";
import { toast } from "sonner";
import { X, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BearingDisassembly from "@/components/BearingDisassembly";

interface QuoteModalProps {
  bearings: Bearing[];
  open: boolean;
  onClose: () => void;
  /** Slug de categoría ("deep-groove") o string de BD ("DEEP GROOVE BALL BEARING") */
  categoryId?: string;
}

export default function QuoteModal({ bearings, open, onClose, categoryId }: QuoteModalProps) {
  const isMulti = bearings.length > 1;
  // Si es múltiple, saltamos directo al formulario. Si es uno, mostramos detalle primero.
  const [step, setStep] = useState<"detail" | "form">("detail");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  // Siempre abre directo al formulario (la ficha ya se vio antes)
  useEffect(() => {
    if (open) setStep("form");
  }, [open]);

  const handleClose = () => {
    setForm({ name: "", email: "", phone: "", message: "" });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    // Generar el cuerpo del correo de manera dinámica
    const skuList = bearings.map(b => `- ${b.sku}`).join('\n');
    const subjectTitle = isMulti ? `Cotización Múltiple: ${bearings.length} piezas` : `Cotización: ${bearings[0].sku}`;
    
    const waText = encodeURIComponent(
      `Hola TODO BALEROS, solicito cotización:\n\n${skuList}\n\nNombre: ${form.name}\nEmail: ${form.email}\nTeléfono: ${form.phone}${form.message ? `\n\n${form.message}` : ''}`
    );

    window.open(`https://wa.me/524493538160?text=${waText}`, "_blank");
    toast.success("Abriendo WhatsApp. ¡Gracias por confiar en TODO BALEROS!");
    handleClose();
  };

  if (bearings.length === 0) return null;

  // Categoría: usa la prop categoryId o la del primer bearing
  const resolvedCategory = categoryId ?? bearings[0]?.category ?? "";
  const singleBearing = bearings[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-0 overflow-y-auto max-h-[95vh] rounded-[2rem] border-none shadow-2xl bg-white gap-0">

        <DialogClose className="absolute right-6 top-6 z-50 rounded-full bg-black/5 p-2 text-gray-500 hover:bg-black/10 hover:text-black transition-colors focus:outline-none">
          <X size={20} />
        </DialogClose>

        <div className="flex flex-col md:flex-row w-full md:min-h-[600px]">

          {/* LADO IZQUIERDO: oculto en móvil */}
          <div className="relative hidden md:flex w-full md:w-1/2 bg-[#f5f5f7] p-8 md:p-12 flex-col items-center justify-center border-r border-gray-200/50">
             
             {isMulti ? (
               // --- VISTA MÚLTIPLE (Lista de Carrito) ---
               <div className="w-full h-full flex flex-col">
                 <div className="mb-6">
                   <span className="rounded-full border border-gray-300 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 backdrop-blur-md">
                     Lista de Cotización
                   </span>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter text-[#1d1d1f] mb-6">
                   {bearings.length} piezas seleccionadas
                 </h3>
                 
                 <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                   {bearings.map(b => (
                     <div key={b.sku} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="w-10 h-10 flex-shrink-0">
                         <BearingDisassembly categoryId={resolvedCategory} />
                       </div>
                       <div>
                         <div className="font-bold text-gray-900">{b.sku}</div>
                         <div className="text-xs text-gray-500">d: {b.d}mm | D: {b.D}mm</div>
                       </div>
                       <CheckCircle2 size={16} className="text-green-500 ml-auto" />
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               // --- VISTA ÚNICA (Ficha Técnica Gigante) ---
               <>
                 <div className="absolute top-8 left-8 z-10">
                   <span className="rounded-full border border-gray-300 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 backdrop-blur-md">
                     Ficha Técnica Oficial
                   </span>
                 </div>
                 <motion.div
                   key={singleBearing.sku}
                   initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                   className="w-full max-w-[320px] aspect-square z-10"
                 >
                   <BearingDisassembly
                     categoryId={resolvedCategory}
                     playing={true}
                     fps={200}
                   />
                 </motion.div>
                 <div className="absolute bottom-4 left-0 w-full text-center select-none pointer-events-none">
                   <span className="text-[100px] font-black text-gray-200/50 tracking-tighter leading-none">
                     {singleBearing.sku.substring(0, 4)}
                   </span>
                 </div>
               </>
             )}
          </div>

          {/* LADO DERECHO: Especificaciones o Formulario */}
          <div className="relative w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-between">
            
            <AnimatePresence mode="wait">
              
              {/* FORMULARIO DE CONTACTO */}
              {step === "form" && (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black tracking-tighter text-[#1d1d1f]">
                      Datos de Contacto
                    </h2>
                    <p className="text-sm text-[#86868b] mt-1">
                      Te enviaremos disponibilidad y precios en minutos.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nombre Completo / Empresa *</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-red-600 font-semibold" required />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Correo *</Label>
                          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-red-600 font-semibold" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Teléfono</Label>
                          <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:ring-red-600 font-semibold" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cantidades y Detalles Extras</Label>
                        <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="resize-none bg-gray-50 border-gray-200 focus:bg-white focus:ring-red-600 font-semibold" rows={3} placeholder="Ej. Necesito 10 piezas del primero y 5 del segundo..." />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full mt-6 rounded-full bg-black py-5 text-[13px] font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.02] hover:bg-gray-900 shadow-xl flex justify-center items-center gap-2"
                    >
                      Enviar Solicitud <Send size={16} />
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SpecItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col border-b border-gray-100 pb-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</span>
      <span className="text-lg font-semibold text-[#1d1d1f]">{value}</span>
    </div>
  );
}