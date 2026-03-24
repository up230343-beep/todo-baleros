import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Category } from "@/data/bearings";
import BearingDisassembly from "@/components/BearingDisassembly";

interface CategoryCardProps {
  category: Category;
  index: number;
}

export default function CategoryCard({ category, index }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/category/${category.id}`}
        className="group relative block h-[420px] w-full overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col"
      >
        {/* TEXTO SUPERIOR */}
        <div className="relative z-10 flex-shrink-0">
          <span className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-gray-400">
            {category.series || "Categoría Industrial"}
          </span>

          <h3 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-[#1d1d1f] max-w-[250px] group-hover:text-red-600 transition-colors">
            {category.name}
          </h3>

          <p className="text-[15px] leading-relaxed text-[#86868b] max-w-[280px]">
            {category.description}
          </p>
        </div>

        {/* ÁREA DE IMAGEN / ANIMACIÓN */}
        <div className="absolute -bottom-12 -right-12 h-[65%] w-[85%] rounded-tl-[3rem] bg-gray-50 flex items-center justify-center transition-transform duration-700 group-hover:-translate-y-4 group-hover:-translate-x-4 border-t border-l border-gray-100/50">
          <div className="w-full h-full p-6">
            <BearingDisassembly
              categoryId={category.id}
              playing={hovered}
              fps={140}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
