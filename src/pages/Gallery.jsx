import { Heart } from 'lucide-react'

export default function Gallery() {
  const fotos = [
    { 
      id: 1, 
      url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600', 
      legenda: 'Nosso primeiro pôr do sol',
      rotacao: 'rotate-2'
    },
    { 
      id: 2, 
      url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600', 
      legenda: 'Aquele café da manhã...',
      rotacao: '-rotate-1'
    },
    { 
      id: 3, 
      url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=600', 
      legenda: 'Sorriso mais lindo',
      rotacao: 'rotate-3'
    },
    { 
      id: 4, 
      url: 'https://images.unsplash.com/photo-1621609764095-6b21aa5eb8c3?q=80&w=600', 
      legenda: 'Bagunça boa',
      rotacao: '-rotate-2'
    },
  ]

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-950 overflow-hidden">
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Nossas Fotos 📸</h1>
        <p className="text-slate-400 text-sm">Momentos revelados</p>
      </div>

      {/* Grid de Polaroids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto">
        {fotos.map((foto) => (
          <div 
            key={foto.id} 
            className={`relative group bg-white p-4 pb-12 shadow-2xl transition duration-500 hover:scale-105 hover:rotate-0 hover:z-10 ${foto.rotacao}`}
          >
            {/* O "Prendedor" ou Fita adesiva (detalhe visual) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-pink-500/20 backdrop-blur-sm rotate-1 shadow-sm border border-white/20"></div>

            {/* A Imagem */}
            <div className="aspect-square w-full overflow-hidden bg-gray-100 mb-4 border border-gray-100">
              <img 
                src={foto.url} 
                alt={foto.legenda} 
                className="w-full h-full object-cover filter sepia-[0.2] group-hover:sepia-0 transition duration-500"
              />
            </div>

            {/* Legenda Manuscrita */}
            <div className="absolute bottom-2 left-0 w-full text-center">
              <p className="text-gray-800 font-serif font-medium italic text-lg opacity-80">
                {foto.legenda}
              </p>
            </div>

            {/* Coraçãozinho no canto */}
            <div className="absolute bottom-4 right-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Heart size={20} fill="currentColor" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-16">
        <p className="text-slate-600 text-xs italic">
          "Guardando cada instante com você."
        </p>
      </div>
    </div>
  )
}