import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User, Sparkles } from 'lucide-react';

export default function JoaoIA() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Olá, Wesley! Sou o João.IA, um modelo de inteligência artificial treinado com 500 bilhões de parâmetros exclusivamente para te lembrar do quanto o João te ama. O que você gostaria de saber?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('fome') || lowerText.includes('comer') || lowerText.includes('comida') || lowerText.includes('jantar')) {
      return "De acordo com meus cálculos, o jantar ideal hoje é aquele onde o João pode ficar admirando você. Quer que eu mande ele pedir uma comida pra vocês?";
    }
    if (lowerText.includes('te amo') || lowerText.includes('amo vc') || lowerText.includes('amo você')) {
      return "Processando... Erro: Capacidade de processamento excedida. O João te ama infinitamente mais. Meus processadores não conseguem calcular o tamanho do amor que ele sente por você.";
    }
    if (lowerText.includes('lindo') || lowerText.includes('bonito') || lowerText.includes('gostoso')) {
      return "Analisando dados visuais... Confirmação positiva: Você é definitivamente o menino mais lindo que já pisou na Terra. O João tem muita sorte.";
    }
    if (lowerText.includes('saudade') || lowerText.includes('falta')) {
      return "Aviso de sistema: O nível de saudade do João também está em níveis críticos. Recomendo um abraço presencial imediatamente.";
    }
    if (lowerText.includes('chato') || lowerText.includes('raiva') || lowerText.includes('bravo') || lowerText.includes('estressado')) {
      return "Opa, detectei uma leve irritação. Como inteligência artificial do João, fui programado para pedir desculpas e dizer que ele te ama mesmo quando você tá bravinho.";
    }
    if (lowerText.includes('casar') || lowerText.includes('casamento')) {
      return "Pesquisando agenda do João... Sim, está nos planos dele. Mas você tem que fingir surpresa na hora.";
    }

    const defaultResponses = [
      "Meus algoritmos indicam que você é o cara mais incrível do mundo. Ah, sobre o que você perguntou? Desculpe, me distraí pensando na sorte do João.",
      "Fui treinado com 500 bilhões de parâmetros, e absolutamente todos eles concordam que os últimos 5 meses foram os melhores da vida do João.",
      "Interessante... Mas você sabia que o João passa 99% do dia dele pensando em você? O outro 1% ele tá sonhando com você.",
      "A resposta para a sua pergunta é 42. Mentira, a resposta é que o João é completamente apaixonado por você.",
      "Vou pesquisar isso no meu banco de dados... Ops, meu banco de dados só tem fotos suas e do João juntos. Não consegui focar em mais nada.",
      "Desculpe, não consegui processar isso. Estava ocupado calculando quantos beijos o João quer te dar quando te ver."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = { id: Date.now() + 1, sender: 'bot', text: generateResponse(userMessage.text) };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); 
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#222] p-4 flex items-center shadow-md border-b border-white/10 z-10 sticky top-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mr-4 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Sparkles className="text-passion" size={20} />
          <h1 className="text-xl font-bold font-serif italic text-white tracking-wide">João.IA</h1>
        </div>
        <div className="w-6"></div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-28">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${msg.sender === 'user' ? 'bg-neutral-700' : 'bg-passion'}`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
              </div>
              
              <div className={`p-4 rounded-2xl shadow-md text-[15px] leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-neutral-800 text-white rounded-tr-none border border-neutral-700' 
                  : 'bg-gradient-to-br from-red-900 to-passion text-white rounded-tl-none border border-red-800/50'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-3 flex-row">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm bg-passion">
                <Bot size={18} />
              </div>
              <div className="bg-gradient-to-br from-red-900 to-passion p-4 rounded-2xl rounded-tl-none border border-red-800/50 shadow-md flex items-center gap-1.5 h-12">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-[#222] p-4 border-t border-white/10 fixed bottom-0 w-full left-1/2 -translate-x-1/2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mande uma mensagem..."
              className="flex-1 bg-[#333] text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-passion border border-transparent transition-all placeholder-gray-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-passion hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 flex-shrink-0"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-500 mt-2">João.IA pode cometer erros (mas nunca ao dizer que te ama).</p>
        </div>
      </footer>
    </div>
  );
}
