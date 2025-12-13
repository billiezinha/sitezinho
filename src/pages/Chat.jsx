import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Send, MessageCircle } from 'lucide-react'

export default function Chat() {
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const fimDoChat = useRef(null)
  
  // Pega o usuário logado atualmente
  const user = auth.currentUser

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMensagens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setTimeout(() => fimDoChat.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return () => unsubscribe()
  }, [])

  const enviarMensagem = async (e) => {
    e.preventDefault()
    if (!novaMensagem.trim()) return

    try {
      await addDoc(collection(db, "chats"), {
        text: novaMensagem,
        createdAt: serverTimestamp(),
        senderId: user.uid,        // ID Real do Google
        userName: user.displayName, // Nome Real
        userPhoto: user.photoURL,   // Foto Real
        isSystem: false
      })
      setNovaMensagem('')
    } catch (erro) { console.error(erro) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <div className="bg-pink-500/20 p-2 rounded-full">
            <MessageCircle className="text-pink-500" size={20} />
        </div>
        <div>
            <h1 className="font-bold text-slate-100 text-sm">Chat dos Namorados</h1>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-400">Online</span>
            </div>
        </div>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {mensagens.map((msg) => {
          const isMinha = msg.senderId === user.uid
          
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-[10px] bg-slate-800 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                  {msg.text}
                </span>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex gap-2 ${isMinha ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar (Foto) */}
              <div className="flex-shrink-0">
                {msg.userPhoto ? (
                  <img src={msg.userPhoto} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs">?</div>
                )}
              </div>

              {/* Balão */}
              <div className={`flex flex-col max-w-[75%] ${isMinha ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-slate-500 mb-1 px-1">
                  {msg.userName?.split(' ')[0] || 'Alguém'}
                </span>
                
                <div className={`
                  px-4 py-2 rounded-2xl shadow-md text-sm
                  ${isMinha 
                    ? 'bg-pink-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }
                `}>
                  <p>{msg.text}</p>
                </div>
                
                {msg.createdAt && (
                  <span className="text-[9px] text-slate-600 mt-1 px-1">
                    {new Date(msg.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

            </div>
          )
        })}
        <div ref={fimDoChat}></div>
      </div>

      {/* Input */}
      <form onSubmit={enviarMensagem} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite algo..."
          className="flex-1 p-3 bg-slate-800 text-white border border-slate-700 rounded-full focus:outline-none focus:border-pink-500 placeholder-slate-500 text-sm"
        />
        <button 
          type="submit" 
          disabled={!novaMensagem.trim()}
          className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-500 disabled:opacity-50 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}