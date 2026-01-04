import { useState, useEffect } from 'react'
import { Image as ImageIcon, Upload, Trash2, X } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'

export default function Gallery() {
  const [photos, setPhotos] = useState([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    if (auth.currentUser) setIsAdmin(true)
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snap) => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

  const addPhoto = async (e) => {
    e.preventDefault()
    if (!newPhotoUrl) return
    // Salva sempre como 'url' para padronizar daqui pra frente
    await addDoc(collection(db, "gallery"), { url: newPhotoUrl, createdAt: serverTimestamp() })
    setNewPhotoUrl('')
  }

  const deletePhoto = async (id) => {
    if (window.confirm("Remover esta foto?")) await deleteDoc(doc(db, "gallery", id))
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="torn-container w-full max-w-md min-h-[80vh]">
        
        <div className="text-center mb-8">
          <ImageIcon className="w-8 h-8 mx-auto text-passion mb-2" />
          <h2 className="text-4xl font-serif font-bold text-passion italic">Nossas Fotos</h2>
          <p className="text-sm text-passion/60 mt-2 font-serif">"Retratos do nosso amor"</p>
        </div>

        {isAdmin && (
          <form onSubmit={addPhoto} className="mb-8 flex gap-2">
            <input 
              type="text" 
              placeholder="Cole o link da imagem aqui..." 
              value={newPhotoUrl}
              onChange={e => setNewPhotoUrl(e.target.value)}
              className="flex-1 p-2 bg-red-50 border border-passion/20 rounded-l text-passion text-sm focus:outline-none"
            />
            <button type="submit" className="bg-passion text-white px-4 rounded-r hover:bg-red-900 transition">
              <Upload size={18} />
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 gap-4 pb-20">
          {photos.map((photo, index) => {
            // CHECKLIST UNIVERSAL DE IMAGENS
            // Verifica se a imagem está em 'url', 'image', 'imagem', 'link' ou 'src'
            const imgSrc = photo.url || photo.image || photo.imagem || photo.link || photo.src;
            
            // Se não encontrar imagem nenhuma, pula este item
            if (!imgSrc) return null;

            return (
              <div 
                key={photo.id} 
                className="photo-frame cursor-pointer relative group"
                style={{ transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})` }}
                onClick={() => setSelectedPhoto(imgSrc)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={imgSrc} alt="Nós" className="w-full h-full object-cover sepia-[20%]" />
                </div>
                {/* Fita adesiva visual */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-yellow-100/80 shadow-sm rotate-1"></div>
                
                {isAdmin && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Mensagem se não houver fotos */}
        {photos.length === 0 && (
          <div className="text-center text-passion/50 py-10 italic">
            Nenhuma foto no álbum ainda...
          </div>
        )}

        {selectedPhoto && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
            <button className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X size={32} />
            </button>
            <img src={selectedPhoto} alt="Zoom" className="max-w-full max-h-[85vh] rounded shadow-2xl border-4 border-white" />
          </div>
        )}
      </div>
    </div>
  )
}