import { useState, useEffect } from 'react'
import { Heart, Plane, Star, GraduationCap, Clock } from 'lucide-react'

export default function Timeline() {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0 })
  const dataInicio = new Date(2025, 7, 10) 

  useEffect(() => {
    const calcularTempo = () => {
      const agora = new Date()
      const diferenca = agora - dataInicio
      if (diferenca < 0) {
        setTempo({ anos: 0, meses: 0, dias: 0 })
        return
      }
      const diasTotais = Math.floor(diferenca / (1000 * 60 * 60 * 24))
      const anos = Math.floor(diasTotais / 365)
      const meses = Math.floor((diasTotais % 365) / 30)
      const dias = (diasTotais % 365) % 30
      setTempo({ anos, meses, dias })
    }
    calcularTempo()
    const timer = setInterval(calcularTempo, 1000)
    return () => clearInterval(timer)
  }, [])

  const eventos = [
    { 
      data: '10 Ago 2025', 
      titulo: 'O Primeiro Encontro', 
      descricao: 'O dia em que nos conhecemos e tudo começou.',
      icon: Heart,
      cor: 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]'
    },
    { 
      data: '25 Out 2025', 
      titulo: 'Primeira ida à Dom Expedito', 
      descricao: 'Aquele final de semana na praia foi inesquecível.',
      icon: Plane,
      cor: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
    },
    { 
      data: '31 Out 2025', 
      titulo: 'Minha Formatura', 
      descricao: 'Um momento especial em que você esteve ao meu lado.',
      icon: GraduationCap,
      cor: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
    },
    { 
      data: '13 Dez 2025', 
      titulo: 'O Pedido de Namoro 💍', 
      descricao: 'O dia oficial do nosso "Sim". O início do nosso pra sempre!',
      icon: Heart,
      cor: 'bg-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.8)] animate-pulse' // Destaque extra
    },
    { 
      data: 'Hoje', 
      titulo: 'Criando este App', 
      descricao: 'Um presente feito com código e amor para celebrar nossa história.',
      icon: Star,
      cor: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
    },
  ]

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-950">
      
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Nossa História ⏳</h1>
        
        <div className="flex gap-4 mb-4">
          <div className="bg-slate-900 p-3 rounded-xl border border-pink-500/30 min-w-[70px] text-center">
            <span className="block text-2xl font-bold text-white">{tempo.anos}</span>
            <span className="text-[10px] text-pink-400 uppercase">Anos</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-pink-500/30 min-w-[70px] text-center">
            <span className="block text-2xl font-bold text-white">{tempo.meses}</span>
            <span className="text-[10px] text-pink-400 uppercase">Meses</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-pink-500/30 min-w-[70px] text-center">
            <span className="block text-2xl font-bold text-white">{tempo.dias}</span>
            <span className="text-[10px] text-pink-400 uppercase">Dias</span>
          </div>
        </div>
        <p className="text-slate-500 text-xs">Juntos desde 10/08/2025</p>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-12">
        {eventos.map((evento, index) => (
          <div key={index} className="relative pl-8">
            <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 border-slate-950 ${evento.cor}`}></div>
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