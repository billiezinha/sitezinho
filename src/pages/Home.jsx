import { useState, useEffect } from 'react'
import { MapPin, Music, Heart, Smile, Frown, Ticket, Mail } from 'lucide-react'
import { db, auth } from '../lib/firebase'
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function Home() {
  const [mensagemAtiva, setMensagemAtiva] = useState(null)
  const [cuponsUsados, setCuponsUsados] = useState([])

  const mensagens = {
    saudade: "Quando a saudade apertar, lembre-se que estou a apenas uma mensagem de distância. Te amo muito! ❤️",
    estresse: "Respire fundo... conte até 10. Você é incrível e consegue resolver qualquer coisa. Estou orgulhoso de você! 🌟",
    rir: "Dizem que a gravidade é apenas uma teoria... até o dia em que aquela cadeira decidiu provar que a lei é implacável com você! 🪑"
  }

  const listaCupons = [
    { id: 1, text: "Vale uma Massagem 💆‍♂️" },
    { id: 2, text: "Vale escolher o filme 🎬" },
    { id: 3, text: "Jantar pago por mim 🍔" }
  ]

  useEffect(() => {
    const docRef = doc(db, "appData", "shared")
    const checkDoc = async () => {
      const snap = await getDoc(docRef)
      if (!snap.exists()) { await setDoc(docRef, { cuponsUsados: [] }) }
    }
    checkDoc()
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) { setCuponsUsados(doc.data().cuponsUsados || []) }
    })
    return () => unsubscribe()
  }, [])

  const enviarNotificacao = async (titulo, texto) => {
      try {
        await addDoc(collection(db, "notifications"), {
          title: titulo, text: texto, createdAt: serverTimestamp(), senderId: auth.currentUser?.uid, isSystem: true
        })
      } catch (error) { console.error("Erro ao notificar:", error) }
  }

  const usarCupom = async (id, text) => {
    if (!cuponsUsados.includes(id)) {
      if(window.confirm(`Usar o cupom "${text}"?`)) {
        const docRef = doc(db, "appData", "shared")
        await updateDoc(docRef, { cuponsUsados: arrayUnion(id) })
        await enviarNotificacao("🎟️ Cupom Usado!", `O cupom: ${text} foi resgatado!`)
      }
    }
  }

  const abrirCarta = (tipo, texto) => { setMensagemAtiva(texto) }

  return (
    <div className="min-h-screen flex items-center justify-center p-2">
      {/* Container de Papel Rasgado Único */}
      <div className="torn-container space-y-10">
        
        {/* Cabeçalho */}
        <div className="text-center relative">
          <Heart className="w-6 h-6 mx-auto mb-2 text-passion fill-current" />
          <h1 className="text-5xl font-serif italic font-bold text-passion">
            Para Wesley
          </h1>
          <div className="h-0.5 w-16 bg-passion/30 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Playlist */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold flex items-center gap-2 font-serif text-passion">
            <Music size={24} /> Nossa Trilha
          </h3>
          <iframe 
            style={{borderRadius: '4px'}} 
            src="https://open.spotify.com/embed/playlist/3lOVuBQtMtSee3LKsaE4FU?utm_source=generator" 
            width="100%" height="88" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" 
            className="shadow-sm border border-passion/10"
          ></iframe>
        </div>

        {/* Mapa */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold flex items-center gap-2 font-serif text-passion">
            <MapPin size={24} /> Onde tudo começou
          </h3>
          <div className="w-full h-48 bg-gray-200 border border-passion/10 p-1">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d253471.34838402295!2d-41.805579!3d-6.951402!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x79c11a9cb386921%3A0xa1b5d1d3ae190b21!2sPiau%C3%AD%20Shopping%20Center!5e0!3m2!1spt-BR!2sbr!4v1765649501130!5m2!1spt-BR!2sb" 
              width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy"
              className="sepia contrast-125"
            ></iframe>
          </div>
        </div>

        {/* Abra Quando - Botões Circulares Vermelhos */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold flex items-center gap-2 font-serif text-passion">
            <Mail size={24} /> Abra quando...
          </h3>
          <div className="flex justify-around gap-2 px-1">
            {[
              { id: 'Saudade', icon: Heart, msg: mensagens.saudade },
              { id: 'Estresse', icon: Frown, msg: mensagens.estresse },
              { id: 'Rir', icon: Smile, msg: mensagens.rir }
            ].map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <button onClick={() => abrirCarta(item.id, item.msg)} className="btn-seal">
                  <item.icon size={28} className="text-white fill-current" />
                </button>
                <span className="text-xs font-bold text-passion uppercase tracking-wider">{item.id}</span>
              </div>
            ))}
          </div>
          
          {mensagemAtiva && (
            <div className="mt-6 bg-red-50 p-6 rounded border border-passion/20 animate-fade-in text-center relative shadow-inner">
              <p className="text-passion text-lg font-serif italic leading-relaxed">"{mensagemAtiva}"</p>
              <button onClick={() => setMensagemAtiva(null)} className="mt-4 text-sm text-passion/70 font-bold underline">Fechar</button>
            </div>
          )}
        </div>

        {/* Cupons */}
        <div className="space-y-4 pb-4">
          <h3 className="text-2xl font-bold flex items-center gap-2 font-serif text-passion">
            <Ticket size={24} /> Cupons
          </h3>
          <div className="space-y-3">
            {listaCupons.map((cupom) => {
              const usado = cuponsUsados.includes(cupom.id);
              return (
                <div 
                  key={cupom.id}
                  onClick={() => !usado && usarCupom(cupom.id, cupom.text)}
                  className={`ticket-card ${usado ? "opacity-50 grayscale cursor-default bg-gray-400" : ""}`}
                >
                  <span className="relative z-10 font-bold text-sm tracking-wide">{cupom.text}</span>
                  <Heart size={20} className={`relative z-10 ${usado ? "fill-none" : "fill-white"}`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}