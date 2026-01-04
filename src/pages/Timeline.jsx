import React from 'react'
// 1. Adicionei 'IceCream' aqui nos imports
import { Heart, Calendar, Star, Music, Camera, IceCream } from 'lucide-react'

import imgKiss from '../assets/kiss.jpeg'
import imgAliancas from '../assets/alianças.jpeg'
import imgCamisas from '../assets/camisas.jpeg'
import imgFormei from '../assets/formei.jpeg'
import imgWicked from '../assets/wicked.jpeg'
// 2. Importando a nova foto (lembre de colocar o arquivo na pasta assets!)
import imgMilkMoo from '../assets/milkmoo.jpeg' 

export default function Timeline() {
  const eventos = [
    {
      id: 1,
      date: "O Início",
      title: "O Início de Nós",
      description: "Um dos nossos primeiros beijos registrados. Lembrança de uma fase deliciosa onde tudo estava começando.",
      image: imgKiss,
      icon: Heart
    },
    {
      id: 2,
      date: "Momentos Especiais",
      title: "Nossas Camisas Combinando",
      description: "Porque casal que combina look permanece unido! Um dia divertido e cheio de estilo.",
      image: imgCamisas,
      icon: Camera
    },
    {
      id: 3,
      date: "Conquistas",
      title: "Minha Formatura",
      description: "Ter você ao meu lado comemorando essa conquista tornou o dia ainda mais inesquecível. Obrigado por torcer por mim!",
      image: imgFormei,
      icon: Star
    },
    {
      id: 4,
      date: "Diversão",
      title: "Assistindo Wicked",
      description: "Momentos mágicos e musicais. Defying gravity com você!",
      image: imgWicked,
      icon: Music
    },
    {
      id: 5,
      date: "Compromisso",
      title: "Nossas Alianças",
      description: "Um símbolo do nosso amor e de tudo que ainda vamos construir juntos. Te amo!",
      image: imgAliancas,
      icon: Heart
    },
        {
      id: 6,
      date: "Doçura", // Título da categoria
      title: "Date na Milk Moo", // 3. Novo Evento Adicionado
      description: "Nos divertimos muito saindo para provar aquele milk shake! Momentos doces e risadas com você.",
      image: imgMilkMoo,
      icon: IceCream
    }
  ]

  return (
    <div className="min-h-screen p-2 flex items-center justify-center">
      <div className="torn-container w-full max-w-lg">
        
        {/* Cabeçalho da Timeline */}
        <div className="text-center mb-10 relative">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-passion" />
          <h2 className="text-4xl font-serif italic font-bold text-passion">Nossa História</h2>
          <div className="h-0.5 w-12 bg-passion/30 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Linha do Tempo */}
        <div className="relative space-y-8 pl-4 sm:pl-0">
          
          {/* Linha Vertical Central (apenas decorativa) */}
          <div className="absolute left-8 sm:left-1/2 top-4 bottom-4 w-0.5 bg-passion/20 -translate-x-1/2 hidden sm:block"></div>

          {eventos.map((evento, index) => (
            <div key={evento.id} className="relative flex flex-col sm:flex-row items-center gap-6 group">
              
              {/* Data e Ícone (Mobile: Esquerda / Desktop: Alternado) */}
              <div className={`flex flex-col items-center sm:w-1/2 ${index % 2 === 0 ? 'sm:items-end sm:text-right sm:pr-8' : 'sm:items-start sm:text-left sm:pl-8 sm:order-last'}`}>
                
                {/* Ícone Bolinha */}
                <div className="absolute left-0 sm:left-1/2 -translate-x-1/2 w-8 h-8 bg-passion text-white rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white">
                  <evento.icon size={14} />
                </div>

                {/* Texto da Data */}
                <div className="pl-10 sm:pl-0 mb-2 sm:mb-0">
                  <span className="inline-block px-3 py-1 bg-passion/10 text-passion text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                    {evento.date}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-passion">{evento.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed max-w-xs">
                    {evento.description}
                  </p>
                </div>
              </div>

              {/* Imagem (Moldura Polaroid) */}
              <div className={`sm:w-1/2 pl-10 sm:pl-0 ${index % 2 === 0 ? 'sm:pl-8' : 'sm:pr-8 sm:text-right'}`}>
                <div className="photo-frame rotate-1 group-hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-sm">
                    <img 
                      src={evento.image} 
                      alt={evento.title} 
                      className="w-full h-full object-cover sepia-[0.15] hover:sepia-0 transition-all duration-700" 
                    />
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Finalzinho */}
        <div className="text-center mt-12 pt-8 border-t border-passion/10">
          <p className="font-serif italic text-passion/60">...e a história continua ❤️</p>
        </div>

      </div>
    </div>
  )
}