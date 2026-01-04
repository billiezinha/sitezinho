import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { Heart, Key } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setError("Apenas corações autorizados...")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-passion">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
        
        {/* Detalhe de canto (triângulo) */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-passion transform -rotate-45 -translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-passion transform -rotate-45 translate-x-8 translate-y-8"></div>

        <div className="mb-6 relative z-10">
          <div className="bg-passion w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
            <Heart size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-passion">Acesso ao Coração</h1>
          <p className="text-passion/60 text-sm mt-2 italic font-serif">Digite a chave do nosso mundo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-b-2 border-passion/20 bg-transparent text-passion placeholder-passion/50 focus:outline-none focus:border-passion transition text-center font-serif"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha Secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-b-2 border-passion/20 bg-transparent text-passion placeholder-passion/50 focus:outline-none focus:border-passion transition text-center font-serif"
            />
          </div>
          
          {error && <p className="text-red-500 text-xs italic font-serif">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-passion text-white py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-4"
          >
            <Key size={18} /> Entrar
          </button>
        </form>
      </div>
    </div>
  )
}