import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Heart, Calendar, Image, MessageCircle } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from './lib/firebase'

import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Gallery from './pages/Gallery'
import Chat from './pages/Chat'

// --- Controlador de Notificações Inteligente ---
function NotificationController() {
  useEffect(() => {
    // 1. Pedir permissão
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    // Recupera o MEU ID para não me notificar das minhas próprias ações
    const myId = localStorage.getItem('chat_device_id')

    // 2. Monitorar últimas mensagens
    const q = query(collection(db, "chats"), orderBy("createdAt", "desc"), limit(1))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data()
          
          // Verifica se é recente (menos de 5s atrás)
          const isRecent = data.createdAt && (Date.now() - data.createdAt.toMillis() < 5000)
          
          // Verifica se NÃO fui eu quem mandou
          const isFromOthers = data.senderId !== myId

          if (isRecent && isFromOthers && Notification.permission === "granted") {
            
            // Personaliza o título e ícone
            let title = "💌 Nova Mensagem!"
            let body = data.text
            let icon = "/vite.svg"

            if (data.isSystem) {
              title = "✨ Novidade no App!" // Para Cupons, Quiz, etc.
            }

            // Dispara a notificação do sistema/celular
            new Notification(title, {
              body: body,
              icon: icon,
              vibrate: [200, 100, 200],
              tag: 'chat-msg' // Evita spam de notificações acumuladas
            })
          }
        }
      })
    })

    return () => unsubscribe()
  }, [])

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
  return (
    <BrowserRouter>
      <NotificationController />
      <div className="max-w-md mx-auto min-h-screen bg-slate-950">
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