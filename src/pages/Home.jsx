import { useState, useEffect } from 'react'
import { MapPin, Music, Heart, Smile, Frown, HelpCircle, Ticket } from 'lucide-react'
import { db } from '../lib/firebase'
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function Home() {
  const [mensagemAtiva, setMensagemAtiva] = useState(null)
  
  // Quiz
  const [respostaQuiz, setRespostaQuiz] = useState('')
  const [resultadoQuiz, setResultadoQuiz] = useState(null)

  // Cupons vindos do Firebase
  const [cuponsUsados, setCuponsUsados] = useState([])

  // Cartas disponíveis
  const mensagens = {
    saudade: "Quando a saudade apertar, lembre-se que estou a apenas uma mensagem de distância. Te amo muito! ❤️",
    estresse: "Respire fundo... conte até 10. Você é incrível e consegue resolver qualquer coisa. Estou orgulhoso de você! 🌟",
    rir: "Por que o esqueleto não brigou com ninguém? Porque ele não tem estômago para isso! 😂 (Sim, piada ruim pra te fazer rir!)"
  }

  // Lista de Cupons
  const listaCupons = [
    { id: 1, text: "Vale uma Massagem 💆‍♂️" },
    { id: 2, text: "Vale escolher o filme 🎬" },
    { id: 3, text: "Jantar pago por mim 🍔" }
  ]

  // 1. EFEITO: Sincronizar dados do Firebase (Cupons)
  useEffect(() => {
    const docRef = doc(db, "appData", "shared")
    
    // Criar o documento se não existir
    const checkDoc = async () => {
      const snap = await getDoc(docRef)
      if (!snap.exists()) {
        await setDoc(docRef, { cuponsUsados: [] })
      }
    }
    checkDoc()

    // Ouvir mudanças em tempo real
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setCuponsUsados(doc.data().cuponsUsados || [])
      }
    })

    return () => unsubscribe()
  }, [])

  // 2. FUNÇÃO: Enviar Notificação para o Chat
  const notificarNoChat = async (texto) => {
      try {
        await addDoc(collection(db, "chats"), {
          text: texto,
          createdAt: serverTimestamp(),
          user: 'sistema',
          senderId: meuId, // <--- ADICIONE ISTO: Envia seu ID para não se auto-notificar
          isSystem: true
        })
      } catch (error) {
        console.error("Erro ao notificar:", error)
      }
    }

  // 3. AÇÃO: Usar Cupom
  const usarCupom = async (id, text) => {
    if (!cuponsUsados.includes(id)) {
      if(window.confirm(`Tem certeza que quer gastar o "${text}" agora?`)) {
        try {
          const docRef = doc(db, "appData", "shared")
          // Salva no banco
          await updateDoc(docRef, {
            cuponsUsados: arrayUnion(id)
          })
          // Notifica o outro
          await notificarNoChat(`🎟️ Amor! Acabei de usar o cupom: ${text}`)
        } catch (error) {
          console.error("Erro ao usar cupom:", error)
        }
      }
    }
  }

  // 4. AÇÃO: Quiz
  const verificarQuiz = () => {
    if (respostaQuiz.toLowerCase().includes("pizza")) { // Mude "pizza" para a resposta certa
      setResultadoQuiz("Acertou! 🍕 Eu sabia que você me conhecia!")
      notificarNoChat("🧠 Acertei o Quiz sobre sua comida favorita! 🍕")
    } else {
      setResultadoQuiz("Errado! 😱 Tente de novo!")
    }
  }

  // 5. AÇÃO: Abrir Carta (Opcional notificar)
  const abrirCarta = (tipo, texto) => {
    setMensagemAtiva(texto)
    // Descomente a linha abaixo se quiser notificar quando abrir a carta também
    // notificarNoChat(`💌 Abri a carta de '${tipo}' para me sentir melhor.`)
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 pb-24 bg-slate-950 space-y-10">
      
      {/* Título */}
      <div className="text-center mt-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
          Para Billiezinha
        </h1>
        <p className="text-slate-400 text-sm mt-2">Bem-vindo ao seu mundo ❤️</p>
      </div>

      {/* Playlist */}
      <div className="w-full max-w-sm bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-slate-300">
          <Music size={18} className="text-green-400" />
          <span className="font-bold text-sm">Nossa Trilha Sonora</span>
        </div>
        <iframe 
          style={{borderRadius: '12px'}} 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator" 
          width="100%" 
          height="80" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy" 
          className="border-none"
        ></iframe>
      </div>

      {/* Mapa */}
      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin size={18} className="text-red-500" />
          <span className="font-bold text-sm">Onde tudo aconteceu</span>
        </div>
        <div className="w-full h-48 bg-slate-800 rounded-xl overflow-hiddenHJ border border-slate-700 shadow-lg relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975778877!2d-46.6520!3d-23.5620!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzQzLjIiUyA0NsKwMzknMDcuMiJX!5e0!3m2!1sen!2sbr!4v1600000000000!5m2!1sen!2sbr" 
            width="100%" 
            height="100%" 
            style={{border:0}} 
            allowFullScreen="" 
            loading="lazy"
            className="filter grayscale-[50%] hover:grayscale-0 transition duration-500"
          ></iframe>
          <div className="absolute bottom-2 left-2 bg-slate-900/80 px-3 py-1 rounded text-xs text-white backdrop-blur-sm border border-slate-700">
            📍 Nosso lugar especial
          </div>
        </div>
      </div>

      {/* Abra Quando... */}
      <div className="w-full max-w-sm">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Heart size={18} className="text-pink-500" /> Abra quando...
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => abrirCarta('Saudade', mensagens.saudade)} className="flex flex-col items-center justify-center bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-pink-500 hover:bg-slate-800 transition">
            <Heart size={24} className="text-pink-400 mb-1" />
            <span className="text-[10px] text-slate-300">Saudade</span>
          </button>
          
          <button onClick={() => abrirCarta('Estresse', mensagens.estresse)} className="flex flex-col items-center justify-center bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-purple-500 hover:bg-slate-800 transition">
            <Frown size={24} className="text-purple-400 mb-1" />
            <span className="text-[10px] text-slate-300">Estresse</span>
          </button>

          <button onClick={() => abrirCarta('Rir', mensagens.rir)} className="flex flex-col items-center justify-center bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-yellow-500 hover:bg-slate-800 transition">
            <Smile size={24} className="text-yellow-400 mb-1" />
            <span className="text-[10px] text-slate-300">Rir</span>
          </button>
        </div>

        {mensagemAtiva && (
          <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl text-center animate-pulse">
            <p className="text-slate-200 text-sm">{mensagemAtiva}</p>
            <button onClick={() => setMensagemAtiva(null)} className="mt-2 text-xs text-pink-400 underline">Fechar</button>
          </div>
        )}
      </div>

      {/* Cupons do Amor */}
      <div className="w-full max-w-sm">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Ticket size={18} className="text-yellow-500" /> Cupons do Amor
        </h3>
        <div className="space-y-3">
          {listaCupons.map((cupom) => (
            <div 
              key={cupom.id}
              onClick={() => usarCupom(cupom.id, cupom.text)}
              className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition ${
                cuponsUsados.includes(cupom.id) 
                  ? "bg-slate-900 border-slate-800 opacity-50 grayscale cursor-default" 
                  : "bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10"
              }`}
            >
              <span className={`text-sm ${cuponsUsados.includes(cupom.id) ? "line-through text-slate-600" : "text-slate-200"}`}>
                {cupom.text}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                cuponsUsados.includes(cupom.id) ? "bg-slate-800 text-slate-600" : "bg-yellow-500/20 text-yellow-500"
              }`}>
                {cuponsUsados.includes(cupom.id) ? "USADO" : "USAR"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Quiz */}
      <div className="w-full max-w-sm bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={18} className="text-blue-400" />
          <h3 className="text-white font-bold">Quiz Rápido</h3>
        </div>
        <p className="text-slate-400 text-sm mb-3">Qual é a minha comida favorita?</p>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Sua resposta..."
            value={respostaQuiz}
            onChange={(e) => setRespostaQuiz(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
          />
          <button 
            onClick={verificarQuiz}
            className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
          >
            ?
          </button>
        </div>
        {resultadoQuiz && (
          <p className="mt-3 text-sm text-center font-bold text-slate-200 animate-bounce">
            {resultadoQuiz}
          </p>
        )}
      </div>

    </div>
  )
}