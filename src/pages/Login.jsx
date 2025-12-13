import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { Heart } from 'lucide-react'

export default function Login() {
  
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Erro ao fazer login:", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Decoração Neon */}
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-pink-600 blur-3xl opacity-20 animate-pulse"></div>
        <Heart size={80} className="text-pink-500 relative z-10 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" fill="currentColor" />
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo(a)</h1>
      <p className="text-slate-400 mb-8 max-w-xs">
        Faça login para acessar nosso cantinho especial. ❤️
      </p>

      <button 
        onClick={handleLogin}
        className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition shadow-lg shadow-white/10"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Entrar com Google
      </button>

      <p className="mt-12 text-slate-600 text-xs">
        Feito com amor e código.
      </p>
    </div>
  )
}