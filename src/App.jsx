import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Heart, Calendar, Image, MessageCircle, LogOut, Bell } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { db, auth } from './lib/firebase'

import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Gallery from './pages/Gallery'
import Chat from './pages/Chat'
import Login from './pages/Login'

// --- Controlador de Notificações Inteligente ---
function NotificationController({ user }) {
  const [permission, setPermission] = useState(Notification.permission)
  
  // Função para pedir permissão com clique (obrigatório em celulares)
  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') {
      new Notification("🔔 Notificações Ativadas!", {
        body: "Agora você saberá quando o amor chamar.",
        icon: '/vite.svg'
      })
    }
  }

  useEffect(() => {
    // Monitorar chat
    const q = query(collection(db, "chats"), orderBy("createdAt", "desc"), limit(1))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data()
          if (!data.createdAt) return // Ignora msg sem data (ainda escrevendo)

          // Aumentei para 20 segundos (20000ms) para evitar atrasos de rede
          const isRecent = (Date.now() - data.createdAt.toMillis() < 20000)
          const isFromOthers = data.senderId !== user.uid

          if (isRecent && isFromOthers && Notification.permission === "granted") {
            let title = `💌 ${data.userName || 'Amor'} diz:`
            if (data.isSystem) title = "✨ Novidade no App!"

            // Tenta focar a janela se possível (apenas Desktop)
            try { window.focus() } catch(e){}

            new Notification(title, {
              body: data.text,
              icon: '/vite.svg',
              vibrate: [200, 100, 200],
              tag: 'chat-msg'
            })
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  // Se não tiver permissão, mostra um botão fixo discreto
  if (permission !== 'granted') {
    return (
      <button 
        onClick={requestPermission}
        className="fixed top-4 left-4 z-50 bg-pink-600 text-white p-2 rounded-full shadow-lg animate-bounce"
        title="Ativar Notificações"
      >
        <Bell size={20} />
      </button>
    )
  }

  return null
}

// --- Menu de Navegação ---
function Navigation() {
  const location = useLocation();
  const getClass = (path) => 
    `flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname === path ? "text-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" : "text-slate-600 hover:text-slate-400"}`;

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 h-16 z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <Link to="/" className={getClass("/")}>
          <Heart size={24} fill={location.pathname === "/" ? "currentColor" : "none"} />
          <span className="text-[10px] mt-1 font-medium">Início</span>
        </Link>
        <Link to="/timeline" className={getClass("/timeline")}>
          <Calendar size={24} />
          <span className="text-[10px] mt-1 font-medium">História</span>
        </Link>
        <Link to="/gallery" className={getClass("/gallery")}>
          <Image size={24} />
          <span className="text-[10px] mt-1 font-medium">Fotos</span>
        </Link>
        <Link to="/chat" className={getClass("/chat")}>
          <MessageCircle size={24} />
          <span className="text-[10px] mt-1 font-medium">Chat</span>
        </Link>
      </div>
    </nav>
  )
}

// --- App Principal ---
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-pink-500">Carregando...</div>

  if (!user) return <Login />

  return (
    <BrowserRouter>
      {/* Passamos o user para o controlador saber quem somos */}
      <NotificationController user={user} />
      
      <div className="max-w-md mx-auto min-h-screen bg-slate-950 relative">
        <button 
          onClick={() => signOut(auth)} 
          className="absolute top-4 right-4 z-40 text-slate-600 hover:text-red-500"
        >
          <LogOut size={20} />
        </button>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}