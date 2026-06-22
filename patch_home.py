import re
import sys

with open('src/pages/Home.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
states_hook = """  const [tempoNamoro, setTempoNamoro] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })

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

  const [recados, setRecados] = useState([])
  const [novoRecado, setNovoRecado] = useState("")"""

content = content.replace("  const [tempoNamoro, setTempoNamoro] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 })", states_hook)

# 2. Add fetching inside appData hook
appdata_hook_orig = """      const data = snap.data()
      const lastReset = data.lastReset ? data.lastReset.toDate() : null"""

appdata_hook_new = """      const data = snap.data()
      if (data.streak) setStreak(data.streak)
      if (data.humorDiario && data.humorDiario.date === dataHojeStr) {
        setMeuHumor(data.humorDiario.mood)
      }
      if (data.desafioConcluido && data.desafioConcluido.week === semanaIndex) {
        setDesafioConcluido(data.desafioConcluido.done)
      }
      const lastReset = data.lastReset ? data.lastReset.toDate() : null"""

content = content.replace(appdata_hook_orig, appdata_hook_new)

# 3. Add new useEffect and Handlers before return (
handlers_block = """  // Buscar Recados e Resposta da Pergunta
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Recados
    const qRecados = query(collection(db, "recados"), orderBy("createdAt", "desc"));
    const unsubRecados = onSnapshot(qRecados, (snap) => {
      setRecados(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Pergunta do Dia
    const perguntaRef = doc(db, "perguntasDia", dataHojeStr);
    const unsubPergunta = onSnapshot(perguntaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data[userId]) {
          setJaRespondi(true);
        }
        // Identificar resposta do parceiro (pegar a chave que NÃO é o userId atual)
        const keys = Object.keys(data);
        const partnerKey = keys.find(k => k !== userId && k !== 'createdAt');
        if (partnerKey) {
          setRespostaParceiro(data[partnerKey]);
        }
      }
    });

    return () => {
      unsubRecados();
      unsubPergunta();
    };
  }, [dataHojeStr]);

  // --- HANDLERS ---
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

  const adicionarRecado = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !novoRecado.trim()) return;
    await addDoc(collection(db, "recados"), {
      text: novoRecado,
      authorId: userId,
      createdAt: serverTimestamp()
    });
    setNovoRecado("");
    await enviarNotificacao("📝 Novo Recado", "Você tem um novo post-it surpresa no mural!");
  };

  const deletarRecado = async (id) => {
    await deleteDoc(doc(db, "recados", id));
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
"""
content = content.replace("  return (\n", handlers_block)


# 4. Add UI blocks right after the Header section in return()
ui_blocks = """
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
            ].map(h => (
              <button 
                key={h.id}
                onClick={() => salvarHumor(h.id)}
                className={`flex flex-col items-center gap-1 transition-transform p-2 rounded-lg ${meuHumor === h.id ? 'bg-passion/10 scale-110 shadow-inner' : 'hover:bg-passion/5'}`}
              >
                <h.icon size={28} className={meuHumor === h.id ? h.color : 'text-gray-400'} fill={meuHumor === h.id ? "currentColor" : "none"} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${meuHumor === h.id ? 'text-passion' : 'text-gray-400'}`}>{h.id}</span>
              </button>
            ))}
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

        {/* 4. Mural de Recados (Post-its) */}
        <div className="space-y-3">
          <SectionHeader icon={Mail} title="Mural de Recados" />
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={novoRecado}
              onChange={e => setNovoRecado(e.target.value)}
              placeholder="Deixe um bilhetinho surpresa..."
              className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
              onKeyPress={(e) => e.key === 'Enter' && adicionarRecado()}
            />
            <button onClick={adicionarRecado} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 p-2 rounded-lg shadow-sm">
              <Send size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {recados.map(recado => (
                <motion.div 
                  key={recado.id}
                  initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 10 - 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="post-it bg-yellow-200 text-yellow-900 p-3 rounded shadow-md relative"
                >
                  <p className="text-xs font-serif leading-relaxed mb-4">{recado.text}</p>
                  <button 
                    onClick={() => deletarRecado(recado.id)}
                    className="absolute bottom-1 right-1 p-1 text-yellow-700/50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {recados.length === 0 && (
              <div className="col-span-2 text-center py-6 text-passion/40 text-xs uppercase tracking-widest font-bold">
                Nenhum recadinho no mural.
              </div>
            )}
          </div>
        </div>
"""

old_header = """        {/* Cabeçalho */}
        <div className="text-center relative select-none">
          <div onClick={handleSecretTrigger} className="cursor-pointer active:scale-90 transition-transform inline-block">
             <Mail className="w-8 h-8 mx-auto mb-3 text-passion animate-bounce-slow" strokeWidth={1.5} /> 
          </div>
          <h1 className="text-5xl font-serif italic font-bold text-passion">
            Para Wesley
          </h1>
          <div className="h-0.5 w-16 bg-passion/30 mx-auto mt-4 rounded-full"></div>
        </div>"""

content = content.replace(old_header, ui_blocks)

# 5. Potinho swipe effect
potinho_old = """          <div className="bg-passion/5 p-6 rounded-lg border-2 border-dashed border-passion/20 text-center relative overflow-hidden">
            {!ideiaDate ? (
              <div className="space-y-4">
                <p className="text-passion/70 font-serif italic">Sem ideias para hoje? Deixe o destino decidir!</p>
                <button 
                  onClick={tirarPapelzinho}
                  disabled={animandoPotinho}
                  className="bg-passion text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-passion/90 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-70"
                >
                  <RefreshCw size={20} className={animandoPotinho ? "animate-spin" : ""} />
                  {animandoPotinho ? "Misturando..." : "Agitar o Potinho 🏺"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <span className="text-xs uppercase tracking-widest text-passion/50 font-bold">O destino escolheu:</span>
                <h4 className="text-2xl font-bold text-passion font-serif px-2 leading-relaxed">
                  ✨ {ideiaDate} ✨
                </h4>
                <button 
                  onClick={() => setIdeiaDate(null)}
                  className="text-sm text-passion/60 underline hover:text-passion mt-2"
                >
                  Tentar outro
                </button>
              </div>
            )}
          </div>"""

potinho_new = """          <div className="bg-passion/5 p-6 rounded-lg border-2 border-dashed border-passion/20 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[150px]">
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
          </div>"""

content = content.replace(potinho_old, potinho_new)

with open('src/pages/Home.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
