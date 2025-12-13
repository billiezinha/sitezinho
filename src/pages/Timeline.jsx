import { Heart, Plane, Star, Gift } from 'lucide-react'

export default function Timeline() {
  const eventos = [
    { 
      data: '10 Ago 2025', 
      titulo: 'O Primeiro Encontro', 
      descricao: 'O dia em que nos conhecemos e tudo começou.',
      icon: Heart,
      cor: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]'
    },
    { 
      data: '15 Set 2025', 
      titulo: 'Primeira Viagem', 
      descricao: 'Aquele final de semana na praia foi inesquecível.',
      icon: Plane,
      cor: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
    },
    { 
      data: '25 Dez 2025', 
      titulo: 'Nosso Primeiro Natal', 
      descricao: 'Trocando presentes e comendo muito!',
      icon: Gift,
      cor: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
    },
    { 
      data: 'Hoje', 
      titulo: 'Criando este App', 
      descricao: 'Um presente feito com código e amor.',
      icon: Star,
      cor: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
    },
  ]

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-950">
      <h1 className="text-3xl font-bold text-center text-white mb-8">Nossa Jornada 🚀</h1>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-12">
        {eventos.map((evento, index) => (
          <div key={index} className="relative pl-8">
            
            {/* Bolinha Brilhante */}
            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 border-slate-950 ${evento.cor}`}></div>

            {/* Cartão Escuro */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">
                  {evento.data}
                </span>
                <evento.icon size={20} className="text-slate-500" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-100">{evento.titulo}</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                {evento.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}