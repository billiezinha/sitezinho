import { useState, useEffect, useRef } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { Send, MessageCircle } from 'lucide-react'

export default function Chat() {
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const fimDoChat = useRef(null)

  // Identificador único deste dispositivo (para saber se a msg é minha ou dela)
  const [meuId, setMeuId] = useState('')

  useEffect(() => {
    // 1. Gerar ou recuperar ID único do dispositivo
    let id = localStorage.getItem('chat_device_id')
    if (!id) {
      id = Math.random().toString(36).substring(7)
      localStorage.setItem('chat_device_id', id)
    }
    setMeuId(id)

    // 2. Escutar mensagens
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
        user: 'usuario', 
        senderId: meuId, // Importante para a notificação saber quem enviou
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
            <h1 className="font-bold text-slate-100 text-sm">Chat Privado</h1>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-400">Online</span>
            </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((msg) => {
          // Verifica se a mensagem é minha baseada no ID salvo
          const isMinha = msg.senderId === meuId
          
          return (
            <div key={msg.id} className={`flex ${isMinha ? 'justify-end' : 'justify-start'}`}>
              
              {/* Balão de Mensagem */}
              <div className={`
                px-4 py-2 rounded-2xl max-w-[85%] shadow-md text-sm
                ${isMinha 
                  ? 'bg-pink-600 text-white rounded-tr-none shadow-pink-900/20' 
                  : msg.isSystem 
                    ? 'bg-slate-800 text-yellow-300 border border-yellow-500/30 w-full text-center italic' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }
              `}>
                <p>{msg.text}</p>
                {msg.createdAt && !msg.isSystem && (
                  <p className={`text-[10px] mt-1 text-right opacity-70 ${isMinha ? 'text-pink-200' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
          placeholder="Digite sua mensagem..."
          className="flex-1 p-3 bg-slate-800 text-white border border-slate-700 rounded-full focus:outline-none focus:border-pink-500 placeholder-slate-500 text-sm"
        />
        <button 
          type="submit" 
          disabled={!novaMensagem.trim()}
          className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-500 disabled:opacity-50 transition shadow-lg shadow-pink-900/30"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}