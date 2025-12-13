import { useState, useEffect } from 'react'

export default function Home() {
  const [tempo, setTempo] = useState({ anos: 0, meses: 0, dias: 0 })

  // DATA: 10 de Agosto de 2025
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 text-center space-y-12 bg-slate-950">
      
      {/* Coração Neon */}
      <div className="relative">
        <div className="absolute inset-0 bg-pink-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl border border-pink-500/30">
          <span className="text-6xl drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">❤️</span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-2">
          Nossa História
        </h1>
        <p className="text-slate-400 text-sm">Começou em 10 de Agosto de 2025</p>
      </div>

      {/* Cards Escuros */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center hover:border-pink-500/50 transition duration-300">
          <span className="text-3xl font-bold text-white">{tempo.anos}</span>
          <span className="text-[10px] text-pink-500 uppercase tracking-widest mt-1">Anos</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center hover:border-pink-500/50 transition duration-300">
          <span className="text-3xl font-bold text-white">{tempo.meses}</span>
          <span className="text-[10px] text-pink-500 uppercase tracking-widest mt-1">Meses</span>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center hover:border-pink-500/50 transition duration-300">
          <span className="text-3xl font-bold text-white">{tempo.dias}</span>
          <span className="text-[10px] text-pink-500 uppercase tracking-widest mt-1">Dias</span>
        </div>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
        <p className="text-slate-300 italic font-light">
          "No escuro do mundo, você é a minha luz neon."
        </p>
      </div>
    </div>
  )
}