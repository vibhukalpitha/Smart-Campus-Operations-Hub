import { useState, useRef, useEffect } from 'react';
import { aiService } from '../services/api';
import { MessageSquare, X, Send, User, Bot, MinusSquare, Maximize2 } from 'lucide-react';

const AiChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your Smart Campus AI Assistant. How can I help you navigate the hub today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', checkAuth);
        // Also check periodically or on mount
        checkAuth();
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const response = await aiService.chat(userMsg);
            setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to my brain. Please try again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center overflow-hidden hover:scale-110 transition-all z-[9999] group border border-white/10"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                    src="/assets/ai-assistant.png" 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-500"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0a0f1c] rounded-full animate-pulse z-20"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 flex flex-col bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl z-[9999] overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[550px]'}`}>
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/10 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-blue-500/30">
                        <img src="/assets/ai-assistant.png" alt="AI Agent" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-none">Campus AI</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-medium text-emerald-500/80 uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <MinusSquare className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden border ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 flex items-center justify-center' 
                                            : 'border-blue-500/20'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <img src="/assets/ai-assistant.png" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="flex gap-2 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/20">
                                        <img src="/assets/ai-assistant.png" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
                        <div className="relative group">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me about bookings, tickets..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-white/20"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-white/20 mt-3 uppercase tracking-tighter">Powered by Smart Campus AI Engine</p>
                    </form>
                </>
            )}
        </div>
    );
};

export default AiChatBot;
