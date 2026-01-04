import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
// Removi o 'Image' dos imports pois não será mais usado
import { Heart, Calendar, Feather, LogOut, Bell } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { db, auth } from './lib/firebase'

import Home from './pages/Home'
import Timeline from './pages/Timeline'
// import Gallery from './pages/Gallery' -> REMOVIDO
import Poems from './pages/Poems'
import Login from './pages/Login'

// --- Controlador de Notificações ---
function NotificationController({ user }) {
  const [permission, setPermission] = useState(Notification.permission)

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    
    if (result === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("🔔 Notificações Ativas", {
          body: "O sistema de alertas está pronto!",
          icon: '/vite.svg'
        })
      })
    }
  }

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(1))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data()
          if (!data.createdAt) return 

          // Só notifica se for recente (menos de 1 minuto)
          const isRecent = (Date.now() - data.createdAt.toMillis() < 60000)
          const isFromOthers = data.senderId !== user.uid

          if (isRecent && isFromOthers && Notification.permission === "granted") {
            try { navigator.vibrate([200, 100, 200]); } catch(e){}

            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(data.title || "✨ Nova Notificação", {
                  body: data.text,
                  icon: '/vite.svg',
                  badge: '/vite.svg',
                  tag: 'system-notif-' + change.doc.id,
                  renotify: true
                })
              })
            } else {
              new Notification(data.title, { body: data.text, icon: '/vite.svg' })
            }
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  if (permission !== 'granted') {
    return (
      <button 
        onClick={requestPermission}
        className="fixed top-4 left-4 z-50 bg-passion text-white p-3 rounded-full shadow-lg animate-bounce border-2 border-[#d4af37]"
        title="Ativar Notificações"
      >
        <Bell size={24} fill="currentColor" />
      </button>
    )
  }

  return null
}

// --- Navegação Vermelha Sólida (Com Ícones) ---
function Navigation() {
  const location = useLocation();
  
  const getIconStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: "white",
      // Se ativo, preenche com branco. Se inativo, transparente.
      fill: isActive ? "white" : "none", 
      // Aumentei strokeWidth para 2.5 (mais grosso e visível)
      strokeWidth: isActive ? 0 : 2.5, 
      className: `transition-all duration-300 ${isActive ? "scale-110 drop-shadow-md" : "opacity-70 hover:opacity-100"}`
    };
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 z-50 bg-passion shadow-[0_-4px_10px_rgba(0,0,0,0.3)] border-t border-white/10">
      <div className="flex justify-around items-center h-full max-w-md mx-auto pb-2">
        <Link to="/" className="flex flex-col items-center justify-center w-full group">
          <Heart size={30} {...getIconStyle("/")} /> 
          <span className="text-[10px] text-white mt-1 tracking-widest font-bold opacity-90">Início</span>
        </Link>
        <Link to="/timeline" className="flex flex-col items-center justify-center w-full group">
          <Calendar size={30} {...getIconStyle("/timeline")} />
          <span className="text-[10px] text-white mt-1 tracking-widest font-bold opacity-90">Nós</span>
        </Link>
        {/* Link da Galeria REMOVIDO aqui */}
        <Link to="/poems" className="flex flex-col items-center justify-center w-full group">
          <Feather size={30} {...getIconStyle("/poems")} />
          <span className="text-[10px] text-white mt-1 tracking-widest font-bold opacity-90">Versos</span>
        </Link>
      </div>
    </nav>
  )
}

// --- Componente Principal ---
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

  if (loading) return <div className="min-h-screen bg-passion flex items-center justify-center text-[#d4af37] font-serif text-xl">Carregando nosso amor...</div>

  if (!user) return <Login />

  return (
    <BrowserRouter>
      <NotificationController user={user} />
      
      <div className="max-w-md mx-auto min-h-screen relative">
        <button 
          onClick={() => signOut(auth)} 
          className="absolute top-4 right-4 z-40 text-white/50 hover:text-white"
        >
          <LogOut size={20} />
        </button>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          {/* Rota da Galeria REMOVIDA aqui */}
          <Route path="/poems" element={<Poems />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}