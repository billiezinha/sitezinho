import { useState, useEffect } from 'react'
// Adicionei o Heart de volta aos imports
import { MapPin, Music, Ticket, Mail, Coffee, Leaf, Laugh, Sparkles, Clapperboard, Utensils, Gift, IceCream, Gamepad2, ChefHat, Film, Heart } from 'lucide-react'
import { db, auth } from '../lib/firebase'
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Componente para padronizar os títulos das seções
const SectionHeader = ({ icon: Icon, title }) => (
  <h3 className="text-2xl font-bold flex items-center gap-3 font-serif text-passion mb-4">
    <div className="bg-passion/10 p-2 rounded-full flex items-center justify-center">
      <Icon size={20} className="text-passion" strokeWidth={2.5} />
    </div>
    {title}
  </h3>
)

export default function Home() {
  const [mensagemAtiva, setMensagemAtiva] = useState(null)
  const [cuponsUsados, setCuponsUsados] = useState([])

  const mensagens = {
    saudade: "Quando a saudade apertar, lembre-se que estou a apenas uma mensagem de distância. Te amo muito! ❤️",
    estresse: "Respire fundo... conte até 10. Você é incrível e consegue resolver qualquer coisa. Estou orgulhoso de você! 🌟",
    rir: "Dizem que a gravidade é apenas uma teoria... até o dia em que aquela cadeira decidiu provar que a lei é implacável com você! 🪑"
  }

  // Lista completa de cupons
  const listaCupons = [
    { id: 1, text: "Vale uma Massagem 💆‍♂️" },
    { id: 2, text: "Vale escolher o filme 🎬" },
    { id: 3, text: "Jantar pago por mim 🍔" },
    { id: 4, text: "Vale um Presente 🎁" },
    { id: 5, text: "Vale um Sorvete 🍦" },
    { id: 6, text: "Jogar Video Game 🎮" },
    { id: 7, text: "Cozinhar Juntos 👨‍🍳" },
    { id: 8, text: "Ir ao Cinema 🍿" },
    { id: 9, text: "Café na Cama ☕" }
  ]

  // Função para selecionar o ícone correto baseado no ID do cupom
  const getCouponIcon = (id) => {
    switch(id) {
      case 1: return Sparkles;      // Massagem
      case 2: return Clapperboard;  // Escolher filme (casa)
      case 3: return Utensils;      // Jantar
      case 4: return Gift;          // Presente
      case 5: return IceCream;      // Sorvete
      case 6: return Gamepad2;      // Video Game
      case 7: return ChefHat;       // Cozinhar
      case 8: return Film;          // Cinema (sair)
      case 9: return Coffee;        // Café na cama
      default: return Ticket;
    }
  }

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
      <div className="torn-container space-y-12">
        
        {/* Cabeçalho */}
        <div className="text-center relative">
          <Mail className="w-8 h-8 mx-auto mb-3 text-passion animate-bounce-slow" strokeWidth={1.5} /> 
          <h1 className="text-5xl font-serif italic font-bold text-passion">
            Para Wesley
          </h1>
          <div className="h-0.5 w-16 bg-passion/30 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Playlist */}
        <div className="space-y-3">
          <SectionHeader icon={Music} title="Nossa Trilha" />
          <iframe 
            style={{borderRadius: '4px'}} 
            src="https://open.spotify.com/embed/playlist/3lOVuBQtMtSee3LKsaE4FU?utm_source=generator" 
            width="100%" height="88" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" 
            className="shadow-sm border border-passion/10"
          ></iframe>
        </div>

        {/* Mapa */}
        <div className="space-y-3">
          <SectionHeader icon={MapPin} title="Onde tudo começou" />
          <div className="w-full h-48 bg-gray-200 border border-passion/10 p-1 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d253471.34838402295!2d-41.805579!3d-6.951402!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x79c11a9cb386921%3A0xa1b5d1d3ae190b21!2sPiau%C3%AD%20Shopping%20Center!5e0!3m2!1spt-BR!2sbr!4v1765649501130!5m2!1spt-BR!2sb" 
              width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy"
              className="sepia contrast-125 w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Abra Quando */}
        <div className="space-y-4">
          <SectionHeader icon={Mail} title="Abra quando..." />
          
          <div className="flex justify-around gap-4 px-1">
            {[
              // AQUI: Troquei Coffee por Heart
              { id: 'Saudade', icon: Heart, msg: mensagens.saudade }, 
              { id: 'Estresse', icon: Leaf, msg: mensagens.estresse }, // Folha = Calma/Respirar
              { id: 'Rir', icon: Laugh, msg: mensagens.rir }           // Riso = Alegria
            ].map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-2 group">
                <button onClick={() => abrirCarta(item.id, item.msg)} className="btn-seal group-hover:-translate-y-1 transition-transform">
                  <item.icon size={32} strokeWidth={2} className="text-white fill-current/30 drop-shadow-md" />
                </button>
                <span className="text-xs font-bold text-passion uppercase tracking-wider opacity-80 group-hover:opacity-100">{item.id}</span>
              </div>
            ))}
          </div>
          
          {mensagemAtiva && (
            <div className="mt-6 bg-red-50 p-6 rounded-lg border border-passion/20 animate-fade-in text-center relative shadow-inner mx-2">
              <p className="text-passion text-lg font-serif italic leading-relaxed">"{mensagemAtiva}"</p>
              <button onClick={() => setMensagemAtiva(null)} className="mt-4 text-xs text-passion/60 font-bold uppercase tracking-widest hover:text-passion">Fechar</button>
            </div>
          )}
        </div>

        {/* Cupons */}
        <div className="space-y-4 pb-4">
          <SectionHeader icon={Ticket} title="Cupons" />
          <div className="space-y-3">
            {listaCupons.map((cupom) => {
              const usado = cuponsUsados.includes(cupom.id);
              const IconeDoCupom = getCouponIcon(cupom.id); 

              return (
                <div 
                  key={cupom.id}
                  onClick={() => !usado && usarCupom(cupom.id, cupom.text)}
                  className={`ticket-card ${usado ? "opacity-50 grayscale cursor-default bg-gray-400" : ""}`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                     <span className={`w-2 h-2 rounded-full ${usado ? 'bg-gray-600' : 'bg-white'}`}></span>
                     <span className="font-bold text-sm tracking-wide">{cupom.text}</span>
                  </div>
                  <IconeDoCupom size={20} strokeWidth={2} className={`relative z-10 ${usado ? "text-gray-600" : "text-white"}`} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}