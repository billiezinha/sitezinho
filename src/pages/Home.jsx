import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Music, Ticket, Mail, Coffee, Leaf, Laugh, Sparkles, Clapperboard, Utensils, Gift, IceCream, Gamepad2, ChefHat, Film, Heart, Lightbulb, RefreshCw, Clock, Star, Flame, Lock, X, Dices, Bot, Smile, Frown, Angry, MessageSquareHeart, Trash2, Send, CheckCircle2, CalendarHeart, Plus, CalendarCheck, ExternalLink } from 'lucide-react'
import { db, auth } from '../lib/firebase'
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'

// --- LISTAS PARA FUNCIONALIDADES DIÁRIAS ---
const perguntasDiarias = [
  "Qual foi o momento exato em que você percebeu que me amava?",
  "Qual é a sua memória favorita da nossa primeira semana juntos?",
  "O que eu faço que te faz dar o sorriso mais sincero?",
  "Se pudéssemos fugir para qualquer lugar agora, para onde iríamos?",
  "Qual música toca na sua cabeça quando você pensa em mim?",
  "Qual mania minha você achava estranha mas aprendeu a amar?",
  "Se nosso amor fosse um filme, qual seria o gênero e o final?",
  "O que você mais admira em mim que eu raramente percebo?",
  "Qual foi a maior surpresa que eu já te fiz?",
  "Em que momento do seu dia você mais sente a minha falta?"
];

const desafiosSemanais = [
  "Tirem uma foto engraçada fazendo careta hoje!",
  "Faça uma massagem surpresa (pelo menos 5 minutinhos) no parceiro.",
  "Mande um áudio cantando a nossa música.",
  "Cozinhem o jantar juntos hoje sem usar celular.",
  "Deixe um bilhetinho escondido para o parceiro achar.",
  "Elogie algo no parceiro que você nunca elogiou antes."
];

const getDiaDoAno = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
const getSemanaDoAno = () => Math.floor(getDiaDoAno() / 7);

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
  const navigate = useNavigate()
  
  const [glitchClicks, setGlitchClicks] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  
  // Modal de Celebração de 5 meses
  const [showCelebration, setShowCelebration] = useState(() => !sessionStorage.getItem('celebration_seen_5'))
  const closeCelebration = () => {
    sessionStorage.setItem('celebration_seen_5', 'true')
    setShowCelebration(false)
  }
  
  // Estados do Potinho e Motivos
  const [ideiaDate, setIdeiaDate] = useState(null)
  const [animandoPotinho, setAnimandoPotinho] = useState(false)
  const [motivoAtual, setMotivoAtual] = useState("Clique para ver um motivo ❤️")
  
  // Estado do Cronômetro
  const [tempoJuntos, setTempoJuntos] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })
  const [tempoNamoro, setTempoNamoro] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })

  // --- NOVOS ESTADOS ---
  const [streak, setStreak] = useState(0)
  const [meuHumor, setMeuHumor] = useState(null)
  
  const diaIndex = getDiaDoAno() % perguntasDiarias.length;
  const perguntaHoje = perguntasDiarias[diaIndex];
  const dataHojeStr = new Date().toISOString().split('T')[0];
  const [minhaResposta, setMinhaResposta] = useState("")
  const [respostaParceiro, setRespostaParceiro] = useState(null)
  const [jaRespondi, setJaRespondi] = useState(false)

  const semanaIndex = getSemanaDoAno() % desafiosSemanais.length;
  const desafioSemana = desafiosSemanais[semanaIndex];
  const [desafioConcluido, setDesafioConcluido] = useState(false);

  const [lembretes, setLembretes] = useState([])
  const [novoLembrete, setNovoLembrete] = useState({ title: "", date: "", time: "" })

  // --- ESTADOS DA SESSÃO SECRETA ---
  const [secretClicks, setSecretClicks] = useState(0)
  const [showSecret, setShowSecret] = useState(false)
  const [password, setPassword] = useState("")
  const [unlocked, setUnlocked] = useState(false)
  const [desafioPicante, setDesafioPicante] = useState(null)

  const mensagens = {
    saudade: "Quando a saudade apertar, lembre-se que estou a apenas uma mensagem de distância. Te amo muito! ❤️",
    estresse: "Respire fundo... conte até 10. Você é incrível e consegue resolver qualquer coisa. Estou orgulhoso de você! 🌟",
    rir: "Dizem que a gravidade é apenas uma teoria... até o dia em que aquela cadeira decidiu provar que a lei é implacável com você! 🪑"
  }

  // --- LISTAS ---
  const ideiasEncontro = [
    "🍕 Noite de Pizza e Vinho em casa",
    "🍿 Maratona de filmes (Harry Potter?)",
    "🍳 Cozinhar uma receita nova juntos (Masterchef!)",
    "🧺 Piquenique na sala de estar",
    "🎮 Campeonato de Video Game valendo massagem",
    "🚶‍♂️ Caminhada no fim de tarde para ver o pôr do sol",
    "🍔 Ir naquela hamburgueria que a gente gosta",
    "🍦 Sair só para tomar uma sobremesa",
    "🛁 Banho relaxante ou Spa Day em casa",
    "🎤 Noite de Karaokê (vale cantar mal!)",
    "🍫 Noite de Fondue (queijo ou chocolate)",
    "🍹 Criar nossos próprios drinks",
    "🎨 Pintar ou desenhar algo juntos",
    "🔭 Deitar e ver as estrelas",
    "🥞 Café da manhã no jantar (Panquecas!)"
  ]

  const motivosAmor = [
    "Pelo seu sorriso que ilumina meu dia",
    "Pela forma como você me apoia nos meus sonhos",
    "Pelo seu abraço que é meu lugar seguro",
    "Por você ser meu melhor amigo",
    "Pelas nossas risadas aleatórias",
    "Por você me fazer querer ser alguém melhor",
    "Pelo jeito que você cuida de mim",
    "Por aguentar minhas loucuras",
    "Pela nossa conexão única",
    "Simplesmente por você existir!"
  ]

  // --- LISTA DE DESAFIOS PICANTES ---
  const desafiosQuentes = [
    "Faça uma massagem de 5 minutos (onde eu escolher)",
    "Sussurre no meu ouvido o que você quer fazer agora",
    "Tire uma peça de roupa",
    "Um beijo demorado no pescoço",
    "Venda nos olhos por 3 minutos (confie em mim)",
    "Use gelo... seja criativo",
    "Faça um pedido irrecusável",
    "Mordidinha...",
    "Toque sem usar as mãos por 1 minuto"
  ]

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

  const getCouponIcon = (id) => {
    switch(id) {
      case 1: return Sparkles;      
      case 2: return Clapperboard;  
      case 3: return Utensils;      
      case 4: return Gift;          
      case 5: return IceCream;      
      case 6: return Gamepad2;      
      case 7: return ChefHat;       
      case 8: return Film;          
      case 9: return Coffee;
      default: return Ticket;
    }
  }

  // --- FUNÇÕES ---
  const tirarPapelzinho = () => {
    if (animandoPotinho) return
    setAnimandoPotinho(true)
    setIdeiaDate(null) 
    setTimeout(() => {
      const aleatorio = ideiasEncontro[Math.floor(Math.random() * ideiasEncontro.length)]
      setIdeiaDate(aleatorio)
      setAnimandoPotinho(false)
    }, 1500)
  }

  const sortearDesafio = () => {
    const aleatorio = desafiosQuentes[Math.floor(Math.random() * desafiosQuentes.length)]
    setDesafioPicante(aleatorio)
  }

  const gerarMotivo = () => {
    const aleatorio = motivosAmor[Math.floor(Math.random() * motivosAmor.length)]
    setMotivoAtual(aleatorio)
  }

  const enviarNotificacao = async (titulo, texto) => {
    try {
      // 1. Salva no Firebase para histórico
      await addDoc(collection(db, "notifications"), {
        title: titulo, text: texto, createdAt: serverTimestamp(), senderId: auth.currentUser?.uid, isSystem: true
      })
      
      // 2. Busca todos os tokens (menos o meu) para enviar Push
      const tokensSnap = await getDocs(collection(db, "pushTokens"))
      const tokens = []
      tokensSnap.forEach(doc => {
        if (doc.id !== auth.currentUser?.uid) tokens.push(doc.data().token)
      })

      // 3. Aciona a API da Vercel
      if (tokens.length > 0) {
        await fetch('/api/sendPush', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titulo, body: texto, tokens })
        })
      }
    } catch (error) { console.error("Erro ao notificar:", error) }
  }


  // Notificação forçada para o celular dele!
  const dispararNotificacaoSurpresa = async () => {
    try {
      await addDoc(collection(db, "notifications"), {
        title: "❤️ Feliz 5 Meses, Amor!", 
        text: "Ei, abri o appzinho e o botão principal sumiu... o Wesley tá estranho no jogo também? Entra aqui rapidinho pra ver se aparece pra você? 👀", 
        createdAt: serverTimestamp(), 
        senderId: "notificacao_sistema_surpresa", 
        isSystem: true
      })
      alert("✅ Alerta de 5 Meses enviado pro celular do João!\nEle vai vibrar agorinha se ele estiver com o site vivo no fundo em qualquer aba do Google Chrome dele!")
    } catch (error) { alert("Erro ao notificar: " + error.message) }
  }

  // --- LÓGICA DO SEGREDO ---
  const handleSecretTrigger = () => {
    if (secretClicks + 1 >= 5) {
      setShowSecret(true)
      setSecretClicks(0)
      if (navigator.vibrate) navigator.vibrate([100, 50, 100])
    } else {
      setSecretClicks(prev => prev + 1)
    }
  }

  const checkPassword = () => {
    // Senha: dia e mês (1008), ano (2025) ou 1MES
    if (password === "1008" || password === "2025" || password === "1MES") {
      setUnlocked(true)
    } else {
      alert("Senha incorreta, espertinho! 🔒")
      setPassword("")
    }
  }

  // --- EFEITOS ---
  
  // Removido useEffect de Confetti

  // Cronômetro
  useEffect(() => {
    // 10 de Agosto de 2025 às 20:15
    const dataInicio = new Date("2025-08-10T20:15:00") 
    // Namoro: 13 de Dezembro de 2025
    const dataNamoro = new Date("2025-12-13T00:00:00")

    const timer = setInterval(() => {
      const agora = new Date()
      
      const calcTempo = (inicio) => {
        let anos = agora.getFullYear() - inicio.getFullYear()
        let meses = agora.getMonth() - inicio.getMonth()
        let dias = agora.getDate() - inicio.getDate()
        let horas = agora.getHours() - inicio.getHours()
        let minutos = agora.getMinutes() - inicio.getMinutes()
        let segundos = agora.getSeconds() - inicio.getSeconds()

        if (segundos < 0) { segundos += 60; minutos--; }
        if (minutos < 0) { minutos += 60; horas--; }
        if (horas < 0) { horas += 24; dias--; }
        
        if (dias < 0) {
          const mesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)
          dias += mesAnterior.getDate()
          meses--
        }
        
        if (meses < 0) { meses += 12; anos--; }
        return { anos, meses, dias, horas, minutos, segundos }
      }

      setTempoJuntos(calcTempo(dataInicio))
      setTempoNamoro(calcTempo(dataNamoro))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Cupons (Modificado para usar auth.currentUser.uid em vez de "shared")
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return; // Segurança caso o usuario não esteja carregado

    const docRef = doc(db, "appData", userId) // AGORA É INDIVIDUAL
    
    const checkAndResetCoupons = async () => {
      const snap = await getDoc(docRef)
      if (!snap.exists()) { 
        await setDoc(docRef, { cuponsUsados: [], lastReset: serverTimestamp() }) 
        return
      }
      const data = snap.data()
      if (data.streak) setStreak(data.streak)
      if (data.humorDiario && data.humorDiario.date === dataHojeStr) {
        setMeuHumor(data.humorDiario.mood)
      }
      if (data.desafioConcluido && data.desafioConcluido.week === semanaIndex) {
        setDesafioConcluido(data.desafioConcluido.done)
      }
      const lastReset = data.lastReset ? data.lastReset.toDate() : null
      const now = new Date()
      let cicloAtualInicio = new Date(now)
      
      if (now.getDate() < 13) { cicloAtualInicio.setMonth(cicloAtualInicio.getMonth() - 1) }
      cicloAtualInicio.setDate(13)
      cicloAtualInicio.setHours(0, 0, 0, 0)

      if (!lastReset || lastReset < cicloAtualInicio) {
        await updateDoc(docRef, { cuponsUsados: [], lastReset: serverTimestamp() })
        // A notificação de renovação agora é pessoal
        await enviarNotificacao("🔄 Cupons Renovados!", "Hoje é dia 13! Seus cupons mensais foram renovados. Aproveite! ❤️")
      }
    }
    checkAndResetCoupons()
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) { setCuponsUsados(doc.data().cuponsUsados || []) }
    })
    return () => unsubscribe()
  }, [])

  const usarCupom = async (id, text) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    if (!cuponsUsados.includes(id)) {
      if(window.confirm(`Usar o cupom "${text}"?`)) {
        const docRef = doc(db, "appData", userId) // Salva no doc individual
        await updateDoc(docRef, { cuponsUsados: arrayUnion(id) })
        // Notificação continua global para o outro ver que você usou
        await enviarNotificacao("🎟️ Cupom Usado!", `O cupom: ${text} foi resgatado!`)
      }
    }
  }

  const abrirCarta = (tipo, texto) => { setMensagemAtiva(texto) }

  // --- NOVOS HANDLERS E EFEITOS DIÁRIOS ---
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Lembretes
    const qLembretes = query(collection(db, "lembretes"), orderBy("date", "asc"));
    const unsubLembretes = onSnapshot(qLembretes, (snap) => {
      setLembretes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Pergunta do Dia
    const perguntaRef = doc(db, "perguntasDia", dataHojeStr);
    const unsubPergunta = onSnapshot(perguntaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[userId]) {
          setJaRespondi(true);
        }
        const keys = Object.keys(data);
        const partnerKey = keys.find(k => k !== userId && k !== 'createdAt');
        if (partnerKey) {
          setRespostaParceiro(data[partnerKey]);
        }
      }
    });

    return () => {
      unsubLembretes();
      unsubPergunta();
    };
  }, [dataHojeStr]);

  const salvarHumor = async (humor) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setMeuHumor(humor);
    await updateDoc(doc(db, "appData", userId), {
      humorDiario: { date: dataHojeStr, mood: humor }
    });
    if (humor === 'Triste' || humor === 'Estressado') {
      await enviarNotificacao("❤️ Amor precisando de carinho", `O seu amor marcou o humor como ${humor}. Vá lá dar um abraço!`);
    }
  };

  const enviarRespostaPergunta = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !minhaResposta.trim()) return;
    const ref = doc(db, "perguntasDia", dataHojeStr);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { [userId]: minhaResposta, createdAt: serverTimestamp() });
    } else {
      await updateDoc(ref, { [userId]: minhaResposta });
    }
    setJaRespondi(true);
    await enviarNotificacao("💭 Pergunta do Dia", "Seu amor respondeu a pergunta do dia. Responda para ver o que ele disse!");
  };

  const adicionarLembrete = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !novoLembrete.title.trim() || !novoLembrete.date) return;
    
    // 1. Salva no Firebase
    await addDoc(collection(db, "lembretes"), {
      ...novoLembrete,
      authorId: userId,
      createdAt: serverTimestamp()
    });
    
    // 2. Salva na Nuvem (Google Agenda) Automaticamente via API
    try {
      await fetch('/api/addCalendarEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: novoLembrete.title,
          date: novoLembrete.date,
          time: novoLembrete.time
        })
      });
    } catch(e) { 
      console.error('Erro na sincronização automática', e); 
    }

    setNovoLembrete({ title: "", date: "", time: "" });
    await enviarNotificacao("📅 Novo Lembrete", "Marcamos um novo compromisso na nossa agenda!");
  };

  const deletarLembrete = async (id) => {
    await deleteDoc(doc(db, "lembretes", id));
  };

  const marcarDesafio = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const newState = !desafioConcluido;
    setDesafioConcluido(newState);
    await updateDoc(doc(db, "appData", userId), {
      desafioConcluido: { week: semanaIndex, done: newState }
    });
    if (newState) {
      await enviarNotificacao("🏆 Desafio Concluído!", "Seu amor acabou de marcar o desafio semanal como concluído!");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-2 relative ${isGlitching ? 'animate-glitch' : ''}`}>
      
      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="torn-container space-y-12">
        
        {/* Cabeçalho */}
        <div className="text-center relative select-none flex flex-col items-center">
          {/* Streak Indicator */}
          <div className="absolute top-0 right-0 flex flex-col items-center mr-2 mt-2">
            <Flame size={28} className="text-orange-500 animate-pulse" fill="currentColor" />
            <span className="text-xs font-bold text-orange-600">{streak} dias</span>
          </div>

          <div onClick={handleSecretTrigger} className="cursor-pointer active:scale-90 transition-transform inline-block">
             <Mail className="w-8 h-8 mx-auto mb-3 text-passion animate-bounce-slow" strokeWidth={1.5} /> 
          </div>
          <h1 className="text-5xl font-serif italic font-bold text-passion">
            Para Wesley
          </h1>
          <div className="h-0.5 w-16 bg-passion/30 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* 1. Humor do Dia */}
        <div className="space-y-3 animate-fade-in">
          <SectionHeader icon={Smile} title="Como você está hoje?" />
          <div className="flex justify-around gap-2 bg-white/50 p-4 rounded-xl border border-passion/10 shadow-sm">
            {[
              { id: 'Feliz', icon: Smile, color: 'text-green-500' },
              { id: 'Carente', icon: Heart, color: 'text-pink-500' },
              { id: 'Triste', icon: Frown, color: 'text-blue-500' },
              { id: 'Estressado', icon: Angry, color: 'text-red-500' }
            ].map((h) => {
              const IconComp = h.icon;
              return (
              <button 
                key={h.id}
                onClick={() => salvarHumor(h.id)}
                className={`flex flex-col items-center gap-1 transition-transform p-2 rounded-lg ${meuHumor === h.id ? 'bg-passion/10 scale-110 shadow-inner' : 'hover:bg-passion/5'}`}
              >
                <IconComp size={28} className={meuHumor === h.id ? h.color : 'text-gray-400'} fill={meuHumor === h.id ? "currentColor" : "none"} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${meuHumor === h.id ? 'text-passion' : 'text-gray-400'}`}>{h.id}</span>
              </button>
            )})}
          </div>
        </div>

        {/* 2. Pergunta do Dia */}
        <div className="space-y-3">
          <SectionHeader icon={MessageSquareHeart} title="Pergunta do Dia" />
          <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-passion/20 shadow-md">
            <p className="text-lg font-serif italic text-passion mb-4 text-center">"{perguntaHoje}"</p>
            
            {!jaRespondi ? (
              <div className="space-y-3">
                <textarea 
                  value={minhaResposta}
                  onChange={e => setMinhaResposta(e.target.value)}
                  placeholder="Sua resposta secreta..."
                  className="w-full bg-white border border-passion/20 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-passion/50 h-20 resize-none"
                />
                <button 
                  onClick={enviarRespostaPergunta}
                  className="w-full bg-passion text-white font-bold py-2 rounded-lg shadow hover:bg-red-800 transition-colors"
                >
                  Enviar para descobrir a dele
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-passion/5 p-3 rounded-lg border border-passion/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-passion/60 block mb-1">Sua resposta:</span>
                  <p className="text-sm text-gray-800">{minhaResposta || "Respondido."}</p>
                </div>
                
                <div className="bg-passion/5 p-3 rounded-lg border border-passion/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-passion/60 block mb-1">Resposta dele:</span>
                  {respostaParceiro ? (
                    <p className="text-sm text-gray-800">{respostaParceiro}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Ele ainda não respondeu hoje... 👀</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Desafio Semanal */}
        <div className="space-y-3">
          <div className={`relative overflow-hidden p-5 rounded-xl border shadow-md transition-colors ${desafioConcluido ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
             {desafioConcluido && <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute -right-4 -top-4"><CheckCircle2 size={80} className="text-green-500/20" fill="currentColor"/></motion.div>}
             <div className="flex justify-between items-start mb-2 relative z-10">
               <span className="text-[10px] font-bold uppercase tracking-widest text-passion/60 flex items-center gap-1"><Star size={12}/> Desafio da Semana</span>
             </div>
             <p className="text-base font-serif italic text-passion mb-4 relative z-10">"{desafioSemana}"</p>
             <button 
                onClick={marcarDesafio}
                className={`relative z-10 flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${desafioConcluido ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-passion border border-passion/20 hover:bg-red-50'}`}
              >
                {desafioConcluido ? <><CheckCircle2 size={16}/> Missão Cumprida!</> : "Marcar como concluído"}
              </button>
          </div>
        </div>

        {/* 4. Calendário de Lembretes */}
        <div className="space-y-3">
          <SectionHeader icon={CalendarHeart} title="Nossa Agenda" />
          
          <div className="bg-white/60 p-4 rounded-xl border border-passion/20 shadow-sm space-y-4">
            {/* Formulário Novo Lembrete */}
            <div className="space-y-2 border-b border-passion/10 pb-4">
              <input 
                type="text" 
                value={novoLembrete.title}
                onChange={e => setNovoLembrete({...novoLembrete, title: e.target.value})}
                placeholder="O que vamos fazer?..."
                className="w-full bg-white border border-passion/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-passion"
              />
              <div className="flex gap-2">
                <input 
                  type="date" 
                  value={novoLembrete.date}
                  onChange={e => setNovoLembrete({...novoLembrete, date: e.target.value})}
                  className="flex-1 bg-white border border-passion/20 rounded-lg px-2 py-2 text-xs focus:outline-none text-gray-600"
                />
                <input 
                  type="time" 
                  value={novoLembrete.time}
                  onChange={e => setNovoLembrete({...novoLembrete, time: e.target.value})}
                  className="flex-1 bg-white border border-passion/20 rounded-lg px-2 py-2 text-xs focus:outline-none text-gray-600"
                />
                <button 
                  onClick={adicionarLembrete} 
                  disabled={!novoLembrete.title.trim() || !novoLembrete.date}
                  className="bg-passion hover:bg-red-800 disabled:opacity-50 text-white p-2 rounded-lg shadow-sm transition-colors flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Lista de Lembretes */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              <AnimatePresence>
                {lembretes.map(lembrete => {
                  const dataFormatada = new Date(lembrete.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  const dataPassou = new Date(lembrete.date + 'T23:59:59') < new Date()
                  
                  return (
                    <motion.div 
                      key={lembrete.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`flex flex-col gap-2 p-3 rounded-lg border relative ${dataPassou ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-red-50 border-red-100'}`}
                    >
                      <div className="flex justify-between items-start pr-6">
                        <div className="flex items-center gap-2">
                          <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-md text-white font-bold text-xs ${dataPassou ? 'bg-gray-400' : 'bg-passion'}`}>
                            <span className="text-[9px] uppercase">{dataFormatada.split(' ')[2]}</span>
                            <span>{dataFormatada.split(' ')[0]}</span>
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${dataPassou ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{lembrete.title}</p>
                            {lembrete.time && <p className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} /> {lembrete.time}</p>}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => deletarLembrete(lembrete.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {lembretes.length === 0 && (
                <div className="text-center py-6 flex flex-col items-center gap-2 text-passion/40">
                  <CalendarCheck size={32} strokeWidth={1.5} />
                  <span className="text-xs uppercase tracking-widest font-bold">Nenhum plano marcado.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* João.IA */}
        <div className="bg-gradient-to-br from-red-900 to-passion text-white p-6 rounded-lg shadow-[0_10px_30px_rgba(150,0,0,0.3)] relative overflow-hidden text-center group border border-red-800/50">
          <Sparkles className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform group-hover:scale-110 transition-transform" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center gap-2 items-center">
              <Bot size={28} className="animate-pulse" />
              <h3 className="text-2xl font-bold font-serif italic">João.IA</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Minha Inteligência Artificial programada exclusivamente para cuidar de você. Faça perguntas, peça conselhos ou só ouça o quanto você é incrível.
            </p>
            <Link to="/joao-ia" className="inline-block bg-white text-passion px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-neutral-100 active:scale-95 transition-transform">
              Falar com a IA 🤖
            </Link>
          </div>
        </div>

        {/* Cronômetros */}
        <div className="space-y-4">
          <div className="bg-passion text-white p-6 rounded-lg shadow-inner relative overflow-hidden">
            <div 
              className="absolute top-0 right-0 p-2 opacity-10 cursor-pointer z-20"
              onClick={() => {
                const newClicks = glitchClicks + 1;
                setGlitchClicks(newClicks);
                if (newClicks >= 5) {
                  setIsGlitching(true);
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
                  setTimeout(() => navigate('/joao-ia'), 1500);
                }
              }}
            >
              <Clock size={100} />
            </div>
            <h3 className="text-lg font-serif italic mb-4 flex items-center gap-2 relative z-10">
              <Clock size={18} /> Desde o primeiro "Oi"
            </h3>
            <p className="text-xs opacity-70 mb-2 font-light">10 de Agosto de 2025</p>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoJuntos.anos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Anos</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoJuntos.meses}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Meses</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoJuntos.dias}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Dias</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-xl font-bold">{tempoJuntos.horas}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Hrs</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-xl font-bold">{tempoJuntos.minutos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Min</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm animate-pulse">
                <span className="block text-xl font-bold">{tempoJuntos.segundos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Seg</span>
              </div>
            </div>
          </div>

          {/* Cronômetro Oficial do Namoro */}
          <div className="bg-gradient-to-r from-red-900 to-passion text-white p-6 rounded-lg shadow-[0_5px_15px_rgba(200,0,0,0.3)] relative overflow-hidden border border-red-800/50">
            <Heart className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
            <h3 className="text-lg font-serif italic mb-4 flex items-center gap-2 relative z-10">
              <Heart size={18} className="animate-pulse" fill="currentColor" /> Tempo de Namoro
            </h3>
            <p className="text-xs opacity-70 mb-2 font-light">13 de Dezembro de 2025</p>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoNamoro.anos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Anos</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoNamoro.meses}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Meses</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-2xl font-bold">{tempoNamoro.dias}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Dias</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-xl font-bold">{tempoNamoro.horas}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Hrs</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
                <span className="block text-xl font-bold">{tempoNamoro.minutos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Min</span>
              </div>
              <div className="bg-white/10 rounded p-2 backdrop-blur-sm animate-pulse">
                <span className="block text-xl font-bold">{tempoNamoro.segundos}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Seg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div className="space-y-3">
          <SectionHeader icon={Music} title="Nossa Trilha" />
          <iframe 
            style={{borderRadius: '12px', backgroundColor: 'transparent'}} 
            src="https://open.spotify.com/embed/playlist/3lOVuBQtMtSee3LKsaE4FU?utm_source=generator&theme=0" 
            width="100%" height="380" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" 
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

        {/* Motivos */}
        <div className="space-y-4">
          <SectionHeader icon={Star} title="Por que te amo?" />
          <div 
            onClick={gerarMotivo}
            className="cursor-pointer bg-white border-2 border-passion/20 p-6 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 group relative"
          >
            <Heart className="absolute top-4 right-4 text-passion/10 group-hover:text-passion/20 transition-colors" size={48} />
            <p className="text-xl text-passion font-serif italic text-center pr-2">
              "{motivoAtual}"
            </p>
            <p className="text-center text-xs text-gray-400 mt-4 uppercase tracking-widest font-bold">
              Clique para ver outro
            </p>
          </div>
        </div>

        {/* Abra Quando */}
        <div className="space-y-4">
          <SectionHeader icon={Mail} title="Abra quando..." />
          <div className="flex justify-around gap-4 px-1">
            {[
              { id: 'Saudade', icon: Heart, msg: mensagens.saudade }, 
              { id: 'Estresse', icon: Leaf, msg: mensagens.estresse }, 
              { id: 'Rir', icon: Laugh, msg: mensagens.rir }           
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

        {/* Potinho */}
        <div className="space-y-4">
          <SectionHeader icon={Lightbulb} title="O que vamos fazer?" />
          <div className="bg-passion/5 p-6 rounded-lg border-2 border-dashed border-passion/20 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[150px]">
            <AnimatePresence mode="wait">
              {!ideiaDate ? (
                <motion.div 
                  key="potinho-fechado"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -50 }}
                  className="space-y-4 flex flex-col items-center w-full"
                >
                  <p className="text-passion/70 font-serif italic mb-2">Sem ideias para hoje? Deslize o potinho!</p>
                  
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, info) => {
                      if (info.offset.x > 100 || info.offset.x < -100) {
                        tirarPapelzinho()
                      }
                    }}
                    whileTap={{ scale: 0.95, cursor: "grabbing" }}
                    whileDrag={{ opacity: 0.5 }}
                    className="bg-passion text-white p-4 rounded-xl shadow-lg cursor-grab mx-auto select-none touch-none w-3/4 flex justify-center items-center gap-2"
                  >
                    <RefreshCw size={20} className={animandoPotinho ? "animate-spin" : "animate-pulse"} />
                    <span className="font-bold">{animandoPotinho ? "Misturando..." : "Deslize >>"}</span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  key="potinho-aberto"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  className="space-y-4 w-full"
                >
                  <span className="text-xs uppercase tracking-widest text-passion/50 font-bold">O destino escolheu:</span>
                  <h4 className="text-2xl font-bold text-passion font-serif px-2 leading-relaxed">
                    ✨ {ideiaDate} ✨
                  </h4>
                  <button 
                    onClick={() => setIdeiaDate(null)}
                    className="text-sm text-passion/60 underline hover:text-passion mt-2"
                  >
                    Guardar no potinho
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Jogo Secreto */}
        <div className="space-y-4">
          <SectionHeader icon={Gamepad2} title="Desafio dos 4 Meses" />
          <div className="bg-gradient-to-r from-passion to-red-900 p-6 rounded-lg shadow-lg relative overflow-hidden text-center group">
            <Gamepad2 className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform group-hover:scale-110 transition-transform" />
            <div className="relative z-10 space-y-4">
              <h4 className="text-2xl font-bold font-serif text-white italic">A Jornada do Coração</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                Mostre suas habilidades de gamer, vença o nosso joguinho especial e destrave uma recompensa exclusiva na vida real hoje mesmo!
              </p>
              <Link to="/game" className="inline-block bg-white text-passion px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-neutral-100 active:scale-95 transition-transform">
                Pressione START 🎮
              </Link>
            </div>
          </div>
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
                  className={`ticket-card relative overflow-hidden transition-all duration-300
                    ${usado ? "opacity-50 grayscale cursor-default bg-gray-400" : ""}
                  `}
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

        {/* Assinatura */}
        <div className="mt-16 text-center space-y-2 pb-8 border-t border-passion/10 pt-8">
          <p className="text-passion/60 font-serif italic text-lg">Com amor,</p>
          <div className="relative inline-block">
            <h2 className="text-2xl text-passion font-serif font-bold italic transform -rotate-2">
              João Fernandes
            </h2>
            <Heart size={16} className="absolute -right-6 top-0 text-passion fill-current animate-pulse" />
          </div>
        </div>

        {/* --- MODAL DA SESSÃO SECRETA --- */}
        {showSecret && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-neutral-900 border border-red-900/50 p-8 rounded-xl max-w-sm w-full text-center relative shadow-2xl">
              <button 
                onClick={() => { setShowSecret(false); setUnlocked(false); setPassword(""); setDesafioPicante(null); }} 
                className="absolute top-3 right-3 text-neutral-600 hover:text-white"
              >
                <X size={24} />
              </button>
              
              {!unlocked ? (
                // TELA DE BLOQUEIO
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
                    <Lock className="text-red-600" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl text-red-500 font-serif font-bold mb-1">Área Restrita</h2>
                    <p className="text-neutral-400 text-sm">Digite a senha do nosso dia especial (Dia+Mes)</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      maxLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="****"
                      className="bg-neutral-800 border border-neutral-700 text-white text-center text-2xl tracking-[0.5em] rounded-lg w-full py-3 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                    />
                  </div>
                  <button 
                    onClick={checkPassword}
                    className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all active:scale-95"
                  >
                    Desbloquear
                  </button>
                </div>
              ) : (
                <div className="space-y-6 py-2 animate-fade-in max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-center gap-2 text-red-500 mb-2">
                    <Flame size={24} className="fill-current animate-pulse" />
                    <h2 className="text-2xl font-serif font-bold italic">Cantinho Picante</h2>
                    <Flame size={24} className="fill-current animate-pulse" />
                  </div>

                  {/* 1. DADO DO AMOR / SORTEIO */}
                  <div className="bg-neutral-800/40 p-5 rounded-lg border border-red-900/30">
                    {!desafioPicante ? (
                       <div className="space-y-3">
                         <Dices size={32} className="text-red-500 mx-auto mb-2" />
                         <p className="text-neutral-300 text-sm">Sem ideias? Deixe a sorte decidir o que vamos fazer agora.</p>
                         <button 
                            onClick={sortearDesafio}
                            className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg w-full active:scale-95 transition-all"
                         >
                            Sortear Desafio 🔥
                         </button>
                       </div>
                    ) : (
                       <div className="space-y-4 animate-fade-in">
                         <p className="text-xs uppercase tracking-widest text-neutral-500">O desafio é:</p>
                         <h3 className="text-xl text-white font-serif font-bold leading-relaxed px-2">
                           "{desafioPicante}"
                         </h3>
                         <button onClick={() => setDesafioPicante(null)} className="text-red-500 text-xs underline">
                            Tentar outro
                         </button>
                       </div>
                    )}
                  </div>

                  {/* 2. MENU DE SUGESTÕES (CUPONS) */}
                  <div className="space-y-3 mt-4 text-left">
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest text-center mb-2">Menu de Hoje</p>
                    
                    <div className="bg-neutral-800/50 p-3 rounded border border-red-900/30 flex items-center gap-3 hover:bg-neutral-800 transition-colors">
                      <span className="text-lg">💋</span>
                      <span className="text-neutral-300 text-sm font-medium">Vale uma massagem... sem pressa.</span>
                    </div>
                    
                    <div className="bg-neutral-800/50 p-3 rounded border border-red-900/30 flex items-center gap-3 hover:bg-neutral-800 transition-colors">
                      <span className="text-lg">🚿</span>
                      <span className="text-neutral-300 text-sm font-medium">Companhia no banho.</span>
                    </div>

                    <div className="bg-neutral-800/50 p-3 rounded border border-red-900/30 flex items-center gap-3 hover:bg-neutral-800 transition-colors">
                      <span className="text-lg">👀</span>
                      <span className="text-neutral-300 text-sm font-medium">Realizar uma fantasia.</span>
                    </div>
                  </div>

                  <p className="text-neutral-600 text-xs italic mt-4">"O que acontece aqui, fica aqui..."</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTÃO SECRETO PARA DISPARAR A NOTIFICAÇÃO PRO JOÃO */}
        <button 
          onClick={dispararNotificacaoSurpresa} 
          className="fixed bottom-4 right-4 bg-passion/80 backdrop-blur-md text-white font-bold text-xs px-3 py-2 rounded-full shadow-lg opacity-30 hover:opacity-100 transition-opacity z-50 flex items-center gap-2 border border-white/20"
        >
          <span>🔔</span> Disparar Surpresa
        </button>

      </div>
    </div>
  )
}