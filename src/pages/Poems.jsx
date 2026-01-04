import { useState, useEffect } from 'react'
import { Feather, PenTool, Trash2 } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

export default function Poems() {
  const [poems, setPoems] = useState([])
  // Voltamos a usar 'titulo' e 'texto' para bater com seu banco de dados antigo
  const [newPoem, setNewPoem] = useState({ titulo: '', texto: '' })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (auth.currentUser) setIsAdmin(true)
    const q = query(collection(db, "poems"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snap) => {
      // Mapeia os dados garantindo que pegamos tudo
      setPoems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

  const addPoem = async (e) => {
    e.preventDefault()
    if (!newPoem.texto) return

    // Salvando com os nomes originais: titulo e texto
    await addDoc(collection(db, "poems"), { 
      titulo: newPoem.titulo, 
      texto: newPoem.texto,
      data: new Date().toLocaleDateString('pt-BR'), // Mantendo o formato de data antigo também
      createdAt: serverTimestamp() 
    })
    setNewPoem({ titulo: '', texto: '' })
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="torn-container w-full max-w-md my-8 min-h-[80vh]">
        
        <div className="text-center mb-8">
          <Feather className="w-8 h-8 mx-auto text-passion mb-2" />
          <h2 className="text-4xl font-serif font-bold text-passion italic">Versos de Amor</h2>
          <p className="text-sm text-passion/60 mt-2 font-serif">"Palavras que o coração dita..."</p>
        </div>

        {isAdmin && (
          <form onSubmit={addPoem} className="mb-10 space-y-3 bg-red-50 p-4 rounded border border-passion/10">
            <input 
              placeholder="Título do Poema" 
              value={newPoem.titulo}
              onChange={e => setNewPoem({...newPoem, titulo: e.target.value})}
              className="w-full p-2 bg-transparent border-b border-passion/30 text-passion placeholder-passion/40 focus:outline-none focus:border-passion font-serif"
            />
            <textarea 
              placeholder="Escreva seus sentimentos..." 
              value={newPoem.texto}
              onChange={e => setNewPoem({...newPoem, texto: e.target.value})}
              className="w-full p-2 bg-transparent border border-passion/20 rounded h-32 text-passion placeholder-passion/40 focus:outline-none focus:border-passion font-serif italic text-sm"
            />
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-passion text-white py-2 rounded shadow hover:bg-red-900 transition font-serif">
              <PenTool size={16} /> Publicar Verso
            </button>
          </form>
        )}

        <div className="space-y-12 pb-10">
          {poems.map((poem) => (
            <div key={poem.id} className="relative text-center space-y-2 px-4">
              {/* Ornamento superior */}
              <div className="text-passion/20 mb-2">❦</div>
              
              {/* Aqui usamos poem.titulo e poem.texto para exibir os dados antigos corretamente */}
              {poem.titulo && <h3 className="text-xl font-bold text-passion font-serif">{poem.titulo}</h3>}
              
              <p className="text-gray-800 font-serif italic leading-loose whitespace-pre-wrap text-lg">
                {poem.texto}
              </p>
              
              {/* Assinatura/Data - Tenta usar a data salva ou formata o timestamp */}
              <div className="text-xs text-passion/40 mt-4 font-serif">
                — {poem.data || (poem.createdAt?.toDate ? poem.createdAt.toDate().toLocaleDateString() : '')} —
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => deleteDoc(doc(db, "poems", poem.id))}
                  className="absolute top-0 right-0 text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}