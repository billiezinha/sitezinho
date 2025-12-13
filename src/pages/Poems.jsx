import { useState, useEffect } from 'react'
import { Feather, Heart, Plus, X, Save } from 'lucide-react'
import { db, auth } from '../lib/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

export default function Poems() {
  const [poemas, setPoemas] = useState([])
  const [mostraForm, setMostraForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [dataExibicao, setDataExibicao] = useState('')

  useEffect(() => {
    const q = query(collection(db, "poems"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPoemas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  const salvarPoema = async (e) => {
    e.preventDefault()
    if (!titulo.trim() || !texto.trim()) return

    try {
      // Salva o poema
      await addDoc(collection(db, "poems"), {
        titulo,
        texto,
        data: dataExibicao || new Date().toLocaleDateString('pt-BR'),
        createdAt: serverTimestamp(),
        senderId: auth.currentUser?.uid,
        userName: auth.currentUser?.displayName
      })

      // AQUI: Envia Notificação para a Central
      await addDoc(collection(db, "notifications"), {
        title: `📜 Novo Poema: ${titulo}`,
        text: "Corre pra ler, escrevi pensando em você...",
        createdAt: serverTimestamp(),
        senderId: auth.currentUser?.uid,
        isSystem: true
      })
      
      setTitulo('')
      setTexto('')
      setDataExibicao('')
      setMostraForm(false)
    } catch (error) {
      console.error("Erro ao salvar poema:", error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-24 relative">
      <div className="text-center mb-10 mt-4">
        <div className="inline-block p-3 rounded-full bg-pink-500/10 mb-4 border border-pink-500/20">
          <Feather size={32} className="text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Nossos Versos</h1>
        <p className="text-slate-400 text-sm italic">
          "Palavras que meu coração sussurrou para você."
        </p>
      </div>

      <button onClick={() => setMostraForm(!mostraForm)} className="absolute top-6 right-6 text-pink-500 hover:text-pink-400 bg-pink-500/10 p-2 rounded-full">
        {mostraForm ? <X size={24} /> : <Plus size={24} />}
      </button>

      {mostraForm && (
        <form onSubmit={salvarPoema} className="bg-slate-900 p-4 rounded-xl border border-pink-500/30 mb-8 max-w-md mx-auto space-y-3 shadow-xl shadow-pink-900/20 animate-fade-in">
          <input type="text" placeholder="Título do Poema" value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-pink-500 outline-none" />
          <input type="text" placeholder="Data (ex: 12 Jun 2025)" value={dataExibicao} onChange={e => setDataExibicao(e.target.value)} className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-pink-500 outline-none text-sm" />
          <textarea placeholder="Escreva seus versos aqui..." value={texto} onChange={e => setTexto(e.target.value)} rows={4} className="w-full bg-slate-950 text-white p-3 rounded-lg border border-slate-800 focus:border-pink-500 outline-none resize-none font-serif" />
          <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-lg font-bold hover:bg-pink-500 flex items-center justify-center gap-2">
            <Save size={18} /> Publicar Verso
          </button>
        </form>
      )}

      <div className="space-y-8 max-w-md mx-auto">
        {poemas.length === 0 && !mostraForm && <p className="text-center text-slate-600">Nenhum poema escrito ainda...</p>}
        {poemas.map((poema) => (
          <div key={poema.id} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
            <div className="relative bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                <h2 className="text-xl font-bold text-slate-100 font-serif">{poema.titulo}</h2>
                <span className="text-xs text-pink-400 font-mono mt-1">{poema.data}</span>
              </div>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line font-serif text-lg italic opacity-90">{poema.texto}</p>
              <div className="mt-4 flex justify-end">
                <Heart size={16} className="text-pink-600/50" fill="currentColor" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}