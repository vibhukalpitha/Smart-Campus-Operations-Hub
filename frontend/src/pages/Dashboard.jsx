import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Search, Bell, ArrowRight, Package, Clock, Shield, Sparkles, Zap } from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (!token || !storedUser) {
                navigate('/login');
            } else {
                setUser(JSON.parse(storedUser));
            }
        };

        loadUser();

        window.addEventListener('storage', loadUser);
        return () => window.removeEventListener('storage', loadUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300 mt-4 font-medium tracking-widest uppercase">Initializing Hub...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col overflow-hidden font-sans relative">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>

            <Header 
                showMenuButton={true} 
                onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                isSidebarOpen={sidebarOpen}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 z-10 transition-all duration-300 overflow-hidden shrink-0`}>
                    <div className="w-64 flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                            <p className="px-4 text-xs font-semibold text-indigo-300/50 uppercase tracking-wider mb-2">Main Menu</p>
                            
                            <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all">
                                <LayoutDashboard className="w-5 h-5" />
                                <span className="font-medium">Overview</span>
                            </Link>
                            
                            <Link to="/community" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                                <Users className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium">Community</span>
                            </Link>
                            
                            <Link to="/schedules" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-indigo-200/70 hover:bg-white/5 hover:text-white transition-all group">
                                <Calendar className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium">Schedules</span>
                            </Link>
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all group"
                            >
                                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden z-10">

                {/* Dashboard Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Decorative Mesh Gradient Blur */}
                    <div className="fixed top-[20%] left-[30%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="fixed bottom-[10%] right-[10%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000"></div>

                    <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                        {/* Hero Header Section */}
                        <div className="relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden group">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em] mb-4">
                                        <Sparkles className="w-3 h-3 mr-2" /> Campus Intelligence Hub
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 leading-tight">
                                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{user.firstName}</span>!
                                    </h2>
                                    <p className="text-indigo-200/60 max-w-2xl text-sm leading-relaxed">
                                        Your personal gateway to campus resources, real-time analytics, and operational tools is fully active.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Strategic Overview Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Role Card */}
                            <div className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/10 shadow-lg">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
                                    <Users className="w-16 h-16 text-white" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <Users className="text-indigo-400 w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                                        <span className="text-xs font-bold text-emerald-400">Active</span>
                                    </div>
                                </div>
                                <h3 className="text-indigo-200/40 text-[10px] font-black uppercase tracking-widest">Access Tier</h3>
                                <p className="text-2xl font-black mt-1 text-white capitalize tracking-tight">{user.role}</p>
                            </div>
                            
                            {/* Events Card */}
                            <div className="group relative bg-white/5 border border-white/10 p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:bg-white/10 shadow-lg">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                                    <Calendar className="w-16 h-16 text-white" />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Calendar className="text-blue-400 w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="text-blue-200/40 text-[10px] font-black uppercase tracking-widest">Pending Items</h3>
                                <p className="text-2xl font-black mt-1 text-white tracking-tight">0 Modules</p>
                            </div>

                            {/* Analytics Card */}
                            <div className="group relative bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/20 p-6 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30">
                                        <Zap className="text-white w-5 h-5 animate-pulse" />
                                    </div>
                                    <span className="text-xs font-bold text-white/90">24ms</span>
                                </div>
                                <h3 className="text-white/60 text-[10px] font-black uppercase tracking-widest">Health Status</h3>
                                <p className="text-2xl font-black mt-1 text-white tracking-tight">Operational</p>
                            </div>
                        </div>

                        {/* Quick Access Modules Navigation */}
                        <div className="space-y-8">
                            <div className="flex items-center space-x-4">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <h3 className="text-sm font-black text-indigo-300/50 uppercase tracking-[0.3em]">Core Operations</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Resource Hub Card */}
                                <div 
                                    onClick={() => navigate('/resources/catalog')}
                                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-blue-500/40 shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <Package className="text-blue-400 w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-blue-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Resource Hub</h3>
                                    <p className="text-indigo-200/50 text-xs leading-relaxed font-medium">
                                        Unlock access to laboratories, lecture halls, and premium equipment for your academic needs.
                                    </p>
                                </div>

                                {/* My Bookings Card */}
                                <div 
                                    onClick={() => navigate('/my-bookings')}
                                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-purple-500/40 shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <Clock className="text-purple-400 w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-purple-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">My Agenda</h3>
                                    <p className="text-indigo-200/50 text-xs leading-relaxed font-medium">
                                        Monitor your active reservations, verify approvals, and manage your personal schedule in one place.
                                    </p>
                                </div>

                                {/* Service Hub Card */}
                                <div 
                                    onClick={() => navigate('/tickets')}
                                    className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-indigo-500/40 shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                            <Shield className="text-indigo-400 w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Service Hub</h3>
                                    <p className="text-indigo-200/50 text-xs leading-relaxed font-medium">
                                        {user?.role === 'USER' ? 'Resolve technical hurdles and report maintenance issues directly to our operations team.' : 'Orchestrate and resolve all incoming campus service requests and maintenance tickets.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 mt-8">
                        <Footer />
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
};

export default Dashboard;
