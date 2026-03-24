export interface Bearing {
  _id: string;
  sku: string;
  aliases: string[];
  d: number;
  D: number;
  B: number;
  Cr: number;
  C0r: number;
  velocity_grease: number;
  velocity_oil: number;
  weight: number;
  available_seals: string[];
  category: string;
  desc: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  series: string;
  description: string;
  imageUrl: string;
  dbCategory: string; 
  subcategories?: SubCategory[];
}

export const categories: Category[] = [
  {
    id: "deep-groove",
    name: "Rodamientos Rígidos de Bolas",
    shortName: "Rígidos de Bolas",
    series: "Serie 6000 / 16000",
    description: "El estándar de la industria. Soportan cargas radiales y axiales a altas velocidades.",
    imageUrl: "/images/deep-groove.png",
    dbCategory: "DEEP GROOVE BALL BEARING"
  },
  {
    id: "centering",
    name: "Rodamientos de Bolas de Centrado",
    shortName: "Centrado",
    series: "Serie de Alineación",
    description: "Diseñados para compensar ligeras desalineaciones del eje durante el trabajo.",
    imageUrl: "/images/centering.png",
    dbCategory: "CENTERING BALL BEARING"
  },
  {
    id: "self-aligning",
    name: "Rodamientos de Bolas a Rótula",
    shortName: "Rótula (Bolas)",
    series: "Serie 1200 / 2200",
    description: "Estructura que tolera desalineaciones angulares severas sin perder capacidad.",
    imageUrl: "/images/self-aligning.png",
    dbCategory: "SELF ALIGNING BALL BEARING"
  },
  {
    id: "cylindrical-roller",
    name: "Rodamientos de Rodillos Cilíndricos",
    shortName: "Rodillos Cilíndricos",
    series: "Serie NU / NJ / NUP",
    description: "Máxima capacidad para carga radial pesada. Alta rigidez industrial.",
    imageUrl: "/images/cylindrical.png",
    dbCategory: "CYLINDRICAL ROLLER BEARING"
  },
  {
    id: "spherical-roller",
    name: "Rodamientos de Rodillos a Rótula",
    shortName: "Rótula (Rodillos)",
    series: "Serie 22000 / 23000",
    description: "Para las aplicaciones más severas. Soportan desalineación y cargas extremas.",
    imageUrl: "/images/spherical-roller.png",
    dbCategory: "SPHERICAL ROLLER BEARINGS"
  },
  {
    id: "angular-contact",
    name: "Rodamientos de Bolas de Contacto Angular",
    shortName: "Contacto Angular",
    series: "Serie 7000 / 3000",
    description: "Ideales para cargas combinadas (radiales y axiales) simultáneas.",
    imageUrl: "/images/angular-contact.png",
    dbCategory: "ANGULAR CONTACT BALL BEARING"
  },
  {
    id: "four-point",
    name: "Rodamientos de Cuatro Puntos",
    shortName: "Cuatro Puntos",
    series: "Serie QJ",
    description: "Rodamientos de bolas de contacto angular de una hilera para espacio reducido.",
    imageUrl: "/images/four-point.png",
    dbCategory: "FOUR POINT CONTACT BALL BEARING"
  },
  {
    id: "tapered-roller",
    name: "Rodamientos de Rodillos Cónicos",
    shortName: "Rodillos Cónicos",
    series: "Serie 30000 / 32000",
    description: "Esenciales en transmisiones. Gestionan cargas radiales y axiales pesadas.",
    imageUrl: "/images/tapered-roller.png",
    dbCategory: "TAPERED ROLLER BEARING"
  },
  {
    id: "thrust-roller",
    name: "Rodamientos Axiales de Rodillos",
    shortName: "Axiales (Rodillos)",
    series: "Serie 81000",
    description: "Soportan cargas axiales muy pesadas. Insensibles a las cargas de choque.",
    imageUrl: "/images/thrust-roller.png",
    dbCategory: "THRUST ROLLER BEARING"
  },
  {
    id: "thrust-ball",
    name: "Rodamientos Axiales de Bolas",
    shortName: "Axiales (Bolas)",
    series: "Serie 51000",
    description: "Soportan cargas axiales puras en una dirección. Alta precisión.",
    imageUrl: "/images/thrust-ball.png",
    dbCategory: "THRUST BALL BEARING"
  },
  {
    id: "micro-thrust",
    name: "Rodamientos Micro Axiales",
    shortName: "Micro Axiales",
    series: "Serie Miniatura",
    description: "Soluciones axiales para aplicaciones de precisión en espacios mínimos.",
    imageUrl: "/images/micro-thrust.png",
    dbCategory: "MICRO THRUST BALL BEARING"
  },
  {
    id: "outer-spherical",
    name: "Rodamientos Insertos",
    shortName: "Insertos",
    series: "Serie UC / YAR",
    description: "Listos para montar en chumaceras. Fáciles de instalar y alinear.",
    imageUrl: "/images/outer-spherical.png",
    dbCategory: "OUTER SPHERICAL BEARING"
  },
  {
    id: "wheel-bearing",
    name: "Rodamientos de Maza (DAC)",
    shortName: "Mazas DAC",
    series: "Serie Automotriz",
    description: "Rodamientos de doble hilera sellados para cubos de rueda de alto desempeño.",
    imageUrl: "/images/wheel-bearing.png",
    dbCategory: "WHEEL BEARING"
  }
];

export const getCategoryById = (id: string) => categories.find(cat => cat.id === id);