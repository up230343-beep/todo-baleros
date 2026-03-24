import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";

// Definimos el tipo de mensaje para que TypeScript sea feliz
interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'ai', text: "¡Hola! Soy el asistente técnico de JOESTORE. ¿Buscas algún SKU específico o necesitas ayuda con una carga técnica?" }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { role: 'user', text: message };
    setChat(prev => [...prev, userMessage]);
    const currentInput = message;
    setMessage("");

    try {
      const response = await fetch("http://localhost:5678/webhook/joestore-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) throw new Error("Error en la comunicación con n8n");

      const data = await response.json();
      console.log("Datos COMPLETOS recibidos de n8n:", data); // ← AQUÍ VE QUÉ LLEGA
      console.log("Tipo de data:", typeof data);
      console.log("data.output:", data.output);

      let aiText = data.output || "Sin texto";



      // Si data.output tiene contenido, úsalo
      if (data.output && typeof data.output === 'string') {
        aiText = data.output;
      }
      // Si viene en array, extrae del array
      else if (Array.isArray(data) && data[0]?.output) {
        aiText = data[0].output;
      }
      // Si viene como estructura anidada
      else if (data[0]?.json?.output) {
        aiText = data[0].json.output;
      }

      // Si nada funcionó, respuesta por defecto
      if (!aiText) {
        aiText = "Recibí tu mensaje pero la respuesta no llegó correctamente. Intenta de nuevo.";
      }

      const aiResponse: ChatMessage = {
        role: 'ai',
        text: aiText || "Recibí la confirmación del servidor, pero el texto de la IA no llegó correctamente."
      };

      setChat(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error en el chat:", error);
      setChat(prev => [...prev, {
        role: 'ai',
        text: "No pude conectar con el servidor de JOESTORE. ¿Está n8n encendido?"
      }]);
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] h-[500px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header del Agente - Estilo JOESTORE Industrial */}
            <div className="bg-[#1d1d1f] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight uppercase">Agente JOE</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Asistente Técnico</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Ventana de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium ${msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-tr-none shadow-md shadow-red-600/20'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input de Mensaje */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consulta técnica o SKU..."
                className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-red-600 outline-none font-semibold text-gray-700 placeholder:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="bg-[#1d1d1f] text-white p-2 rounded-full hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante con branding JOESTORE */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1d1d1f] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-4 border-white relative"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}