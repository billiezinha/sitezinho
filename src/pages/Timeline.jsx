import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import { Calendar, Plus, Trash2, Heart } from 'lucide-react'

export default function Timeline() {
  const [events, setEvents] = useState([])
  const [newItem, setNewItem] = useState({ data: '', titulo: '', descricao: '' })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (auth.currentUser) setIsAdmin(true)
    // Trazemos tudo ordenado por createdAt para garantir a ordem de criação
    const q = query(collection(db, "timeline"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  const addEvent = async (e) => {
    e.preventDefault()
    if (!newItem.titulo || !newItem.data) return
    await addDoc(collection(db, "timeline"), { 
      data: newItem.data,          // Salva como 'data' (português)
      titulo: newItem.titulo,      // Salva como 'titulo'
      descricao: newItem.descricao, // Salva como 'descricao'
      createdAt: serverTimestamp() 
    })
    setNewItem({ data: '', titulo: '', descricao: '' })
  }

  const deleteEvent = async (id) => {
    if (window.confirm("Apagar essa memória?")) {
      await deleteDoc(doc(db, "timeline", id))
    }
  }

  // Função poderosa para formatar qualquer tipo de data
  const formatarData = (val, criacao) => {
    // 1. Tenta a data manual
    if (val) {
      if (val.toDate) return val.toDate().toLocaleDateString('pt-BR') // Se for timestamp
      // Se for texto YYYY-MM-DD
      try {
        const partes = val.split('-')
        if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`
      } catch(e) {}
      return val // Retorna o texto original se não conseguir formatar
    }
    // 2. Se não tiver data manual, usa a data de criação do sistema
    if (criacao && criacao.toDate) {
      return criacao.toDate().toLocaleDateString('pt-BR')
    }
    return "Data Especial"
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="torn-container w-full max-w-md min-h-[80vh]">
        
        <div className="text-center mb-8">
          <Calendar className="w-8 h-8 mx-auto text-passion mb-2" />
          <h2 className="text-4xl font-serif font-bold text-passion italic">Nossa História</h2>
          <p className="text-sm text-passion/60 mt-2 font-serif">"Cada segundo ao seu lado..."</p>
        </div>

        {isAdmin && (
          <form onSubmit={addEvent} className="mb-10 bg-red-50 p-4 rounded-lg border border-passion/10">
            <h3 className="text-passion font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Plus size={16} /> Nova Memória
            </h3>
            <div className="space-y-3">
              <input 
                type="date" 
                value={newItem.data} 
                onChange={e => setNewItem({...newItem, data: e.target.value})}
                className="w-full p-2 bg-white border border-passion/20 rounded text-passion focus:outline-none focus:border-passion"
              />
              <input 
                placeholder="Título (ex: O primeiro beijo)" 
                value={newItem.titulo} 
                onChange={e => setNewItem({...newItem, titulo: e.target.value})}
                className="w-full p-2 bg-white border border-passion/20 rounded text-passion placeholder-passion/40 focus:outline-none focus:border-passion"
              />
              <textarea 
                placeholder="Detalhes desse dia..." 
                value={newItem.descricao} 
                onChange={e => setNewItem({...newItem, descricao: e.target.value})}
                className="w-full p-2 bg-white border border-passion/20 rounded text-passion placeholder-passion/40 focus:outline-none focus:border-passion h-20"
              />
              <button type="submit" className="w-full bg-passion text-white py-2 rounded font-bold hover:bg-red-900 transition shadow-md">
                Gravar na Eternidade
              </button>
            </div>
          </form>
        )}

        <div className="relative pl-4 space-y-8">
          <div className="timeline-line"></div>

          {events.map((evt) => {
            // Lógica "Universal": Pega o primeiro que encontrar
            const dataFinal = evt.data || evt.date;
            const tituloFinal = evt.titulo || evt.title || "Sem título";
            const descFinal = evt.descricao || evt.desc || evt.description;

            return (
              <div key={evt.id} className="relative pl-8 group">
                <div className="absolute left-0 top-1 w-8 h-8 bg-white border-2 border-passion rounded-full flex items-center justify-center z-10 shadow-sm">
                  <Heart size={14} className="text-passion fill-passion" />
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                  <span className="text-xs font-bold text-passion/50 tracking-wider block mb-1">
                    {formatarData(dataFinal, evt.createdAt)}
                  </span>
                  
                  <h3 className="text-xl font-serif text-passion font-bold">{tituloFinal}</h3>
                  
                  {descFinal && (
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed font-serif">{descFinal}</p>
                  )}
                  
                  {isAdmin && (
                    <button onClick={() => deleteEvent(evt.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}