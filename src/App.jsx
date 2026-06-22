import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
// Removi o 'Image' dos imports pois não será mais usado
import { Heart, Calendar, Feather, LogOut, Bell } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { db, auth } from './lib/firebase'
import { LocalNotifications } from '@capacitor/local-notifications'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

import Home from './pages/Home'
import Timeline from './pages/Timeline'
// import Gallery from './pages/Gallery' -> REMOVIDO
import Poems from './pages/Poems'
import Login from './pages/Login'
import Game from './pages/Game'
import JoaoIA from './pages/JoaoIA'

// --- Controlador de Notificações (Web + Android Nativo) ---
function NotificationController({ user }) {
  const [permission, setPermission] = useState('prompt')

  const requestPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      // Pedir permissão Push Notification
      const res = await PushNotifications.requestPermissions()
      setPermission(res.receive === 'granted' ? 'granted' : 'denied')
      if (res.receive === 'granted') {
        PushNotifications.register()
      }
    } else {
      const result = await Notification.requestPermission()
      setPermission(result)
    }
  }

  // Verifica permissão atual nativamente e registra ouvintes
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.checkPermissions().then(res => {
        if (res.receive === 'granted') {
          setPermission('granted')
          PushNotifications.register()
        }
      })

      // Ouvir geração do token
      PushNotifications.addListener('registration', async (token) => {
        if (user) {
          try {
            await setDoc(doc(db, "pushTokens", user.uid), { token: token.value })
          } catch(e) {}
        }
      })

      // Ouvir notificação em primeiro plano
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        try { navigator.vibrate([200, 100, 200]); } catch(e){}
      })
    } else {
      setPermission(Notification.permission)
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners()
      }
    }
  }, [user])

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

          if (isRecent && isFromOthers) {
            try { navigator.vibrate([200, 100, 200]); } catch(e){}

            if (Capacitor.isNativePlatform() && permission === 'granted') {
              // Notificação Nativa do Android
              LocalNotifications.schedule({
                notifications: [{
                  title: data.title || "✨ Nova Notificação",
                  body: data.text,
                  id: Date.now(),
                  schedule: { at: new Date(Date.now() + 500) }
                }]
              })
            } else if (!Capacitor.isNativePlatform() && permission === 'granted') {
              // Notificação Web (Navegador)
              new Notification(data.title || "✨ Nova Notificação", { body: data.text, icon: '/vite.svg' })
            }
          }
        }
      })
    })

    return () => unsubscribe()
  }, [user, permission])

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

// --- Navegação Estilo Apple (iOS Floating Dock) ---
function Navigation() {
  const location = useLocation();
  if (location.pathname === '/game' || location.pathname === '/joao-ia') return null;
  
  const getTabStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      wrapperClass: `flex flex-col items-center justify-center w-20 h-[52px] rounded-full transition-all duration-500 ease-out ${isActive ? "bg-white/20 shadow-sm backdrop-blur-md" : "hover:bg-white/10"}`,
      iconClass: `transition-all duration-300 ${isActive ? "text-white scale-110 drop-shadow-md" : "text-white/60"}`,
      textClass: `text-[9px] mt-0.5 tracking-wider font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-white/60"}`,
      // Fill e stroke para Lucide
      fill: isActive ? "white" : "none",
      strokeWidth: isActive ? 0 : 2
    };
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-max px-2 h-16 z-50 bg-[#1a1a1a]/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 rounded-full overflow-hidden flex items-center justify-center" style={{ backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}>
      <div className="flex items-center gap-1">
        <Link to="/" className="group">
          <div className={getTabStyle("/").wrapperClass}>
            <Heart size={22} className={getTabStyle("/").iconClass} fill={getTabStyle("/").fill} strokeWidth={getTabStyle("/").strokeWidth} /> 
            <span className={getTabStyle("/").textClass}>Início</span>
          </div>
        </Link>
        <Link to="/timeline" className="group">
          <div className={getTabStyle("/timeline").wrapperClass}>
            <Calendar size={22} className={getTabStyle("/timeline").iconClass} fill={getTabStyle("/timeline").fill} strokeWidth={getTabStyle("/timeline").strokeWidth} />
            <span className={getTabStyle("/").textClass}>Nós</span>
          </div>
        </Link>
        <Link to="/poems" className="group">
          <div className={getTabStyle("/poems").wrapperClass}>
            <Feather size={22} className={getTabStyle("/poems").iconClass} fill={getTabStyle("/poems").fill} strokeWidth={getTabStyle("/poems").strokeWidth} />
            <span className={getTabStyle("/").textClass}>Versos</span>
          </div>
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Lógica do Streak
        try {
          const userDocRef = doc(db, "appData", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          // Tratamento de fuso horário local
          const now = new Date();
          const hojeStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const lastLogin = data.lastLoginDate;
            let newStreak = data.streak || 0;
            
            if (lastLogin) {
              const dateLast = new Date(lastLogin + 'T00:00:00');
              const dateHoje = new Date(hojeStr + 'T00:00:00');
              const diffTime = dateHoje.getTime() - dateLast.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
              
              if (diffDays === 1) {
                newStreak += 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            } else {
              newStreak = 1;
            }
            
            if (lastLogin !== hojeStr) {
              await updateDoc(userDocRef, { lastLoginDate: hojeStr, streak: newStreak });
            }
          } else {
            await setDoc(userDocRef, { lastLoginDate: hojeStr, streak: 1, cuponsUsados: [] });
          }
        } catch(e) { console.error("Erro no streak", e) }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-passion flex flex-col items-center justify-center text-[#d4af37] font-serif">
        <Heart size={48} className="animate-bounce mb-4 drop-shadow-lg" />
        <p className="text-xl animate-pulse tracking-wider">Carregando nosso amor...</p>
      </div>
    )
  }

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
          <Route path="/game" element={<Game />} />
          <Route path="/joao-ia" element={<JoaoIA />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}