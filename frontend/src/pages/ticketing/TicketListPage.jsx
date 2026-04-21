import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketService } from '../../services/api';
import TicketCard from '../../components/ticketing/TicketCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
    Plus, 
    Search, 
    Filter, 
    Loader2, 
    AlertCircle, 
    ArrowLeft, 
    LayoutGrid,
    Inbox
} from 'lucide-react';

const TicketListPage = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState('DEFAULT');

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchTickets();
    }, [viewMode]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            let response;
            if (viewMode === 'PUBLIC') {
                response = await ticketService.getPublicTickets();
            } else if (storedUser?.role === 'ADMIN') {
                response = await ticketService.getAllTickets();
            } else if (storedUser?.role === 'TECHNICIAN') {
                response = await ticketService.getAssignedTickets();
            } else {
                response = await ticketService.getMyTickets();
            }
                
            // Wrapped in TicketingResponse
            setTickets(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            setError("Could not load tickets. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
        if (!ticket) return false;
        
        const description = (ticket.description || '').toLowerCase();
        const category = (ticket.category || '').toLowerCase();
        const query = (searchQuery || '').toLowerCase();
        
        const matchesSearch = description.includes(query) || category.includes(query);
        const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }) : [];

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col font-sans relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <Header />

            <main className="flex-1 overflow-y-auto z-10 flex flex-col">
                <div className="p-4 md:p-8 flex-1 flex flex-col max-w-6xl mx-auto w-full space-y-8">
                    {/* Header Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-indigo-300 hover:text-white transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back to Dashboard</span>
                            </button>
                            <h1 className="text-4xl font-bold tracking-tight text-white flex items-center">
                                <LayoutGrid className="mr-4 text-indigo-500 w-10 h-10" />
                                Support Hub
                            </h1>
                            <p className="text-indigo-300/60 font-medium text-lg">Manage and track your campus maintenance requests</p>
                        </div>

                        <div className="flex flex-col space-y-4 md:items-end">
                            <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
                                <button 
                                    onClick={() => setViewMode('DEFAULT')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        viewMode === 'DEFAULT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-indigo-300/50 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    My Workspace
                                </button>
                                <button 
                                    onClick={() => setViewMode('PUBLIC')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                        viewMode === 'PUBLIC' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-indigo-300/50 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    Campus Tickets
                                </button>
                            </div>

                            {user?.role === 'USER' && (
                                <Link 
                                    to="/tickets/create"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="uppercase tracking-widest text-sm">Create New Ticket</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-[#0a0f1c]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                        <div className="relative group flex-1 max-w-2xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/40 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Search by description or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0d1225] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest transition-all duration-300 ${
                                        statusFilter === status 
                                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-400/50 scale-105' 
                                            : 'bg-[#0d1225] text-indigo-300/50 hover:bg-white/5 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="text-indigo-300/60 font-medium animate-pulse">Synchronizing your tickets...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-[2.5rem] p-12">
                            <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
                                <AlertCircle className="text-rose-400 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                            <p className="text-indigo-200/60 max-w-md mb-8">{error}</p>
                            <button 
                                onClick={fetchTickets}
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredTickets.map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center bg-[#0a0f1c]/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative">
                                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                                <Inbox className="text-indigo-400 w-12 h-12 relative z-10 drop-shadow-lg" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-3">No Request Found</h2>
                            <p className="text-indigo-200/50 max-w-md mb-10 text-lg font-medium leading-relaxed">
                                {searchQuery || statusFilter !== 'ALL' 
                                    ? "We couldn't find any tickets matching your active filters. Try resetting them or adjusting your search parameters."
                                    : "You're all caught up! If you're experiencing any issues around campus, log a new ticket to get started."}
                            </p>
                            {!searchQuery && statusFilter === 'ALL' && (
                                <Link 
                                    to="/tickets/create"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1"
                                >
                                    Submit A Request
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Footer Section inside main scroller */}
                <div className="shrink-0 mt-auto pt-12 w-full max-w-6xl mx-auto px-4 md:px-8">
                    <Footer />
                </div>
            </main>
        </div>
    );
};

export default TicketListPage;
